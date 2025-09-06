"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Upload, User, Image as ImageIcon } from "lucide-react";
import { useCallback, useState, useEffect } from "react";
import { toast } from "sonner";

interface ProfilePictureUploadProps {
  value?: string;
  onChange: (file: File | null, previewUrl?: string) => void;
  disabled?: boolean;
}

export function ProfilePictureUpload({ value, onChange, disabled }: ProfilePictureUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);

  // Function to get the full image URL (only for API paths, not blob URLs)
  const getFullImageUrl = (imagePath: string) => {
    if (!imagePath) return null;
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // If it's a blob URL (local file preview), return as is
    if (imagePath.startsWith('blob:')) {
      return imagePath;
    }
    
    // If it's a relative path from API, prepend the API base URL
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
    return `${API_BASE_URL}${imagePath}`;
  };

  // Update preview URL when value prop changes
  useEffect(() => {
    if (value && value !== previewUrl) {
      setPreviewUrl(value);
    }
  }, [value, previewUrl]);

  const handleFileSelect = useCallback((file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type", {
        description: "Please upload a JPG, JPEG, PNG, or GIF image."
      });
      return;
    }

    // Validate file size (5MB = 5 * 1024 * 1024 bytes)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File too large", {
        description: "Please upload an image smaller than 5MB."
      });
      return;
    }

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onChange(file, url);
  }, [onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect, disabled]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemove = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    onChange(null);
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Profile Picture</h3>
        {previewUrl && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={disabled}
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4 mr-2" />
            Remove
          </Button>
        )}
      </div>

      {previewUrl ? (
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={getFullImageUrl(previewUrl) || previewUrl} alt="Profile preview" />
            <AvatarFallback>
              <User className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Profile picture uploaded successfully
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('profile-picture-input')?.click()}
              disabled={disabled}
            >
              <Upload className="h-4 w-4 mr-2" />
              Change Picture
            </Button>
          </div>
        </div>
      ) : (
        <Card
          className={`border-2 border-dashed transition-colors ${
            isDragOver 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && document.getElementById('profile-picture-input')?.click()}
        >
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="rounded-full bg-muted p-4">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm font-medium">
                  {isDragOver ? 'Drop your image here' : 'Upload profile picture'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Drag and drop an image, or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports JPG, JPEG, PNG, GIF • Max 5MB
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  document.getElementById('profile-picture-input')?.click();
                }}
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose File
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <input
        id="profile-picture-input"
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
}
