"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useImportCannedMessagesMutation, CANNED_MESSAGES_QUERY_KEY } from "@/lib/canned.api";
import { cn } from "@/lib/utils";
import { Upload, X, FileSpreadsheet, CheckCircle, AlertCircle, Download, Info } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface ImportMessagesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ImportMessagesModal({
  open,
  onOpenChange,
}: ImportMessagesModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [importResult, setImportResult] = useState<{
    totalProcessed: number;
    successCount: number;
    failureCount: number;
    errors: string[];
    createdMessageIds: string[];
    importedAt: string;
    failedResultsDownloadUrl?: string;
  } | null>(null);

  const queryClient = useQueryClient();

  const importMutation = useImportCannedMessagesMutation({
    onSuccess: (data) => {
      setImportResult(data);
      setIsUploading(false);
      setUploadProgress(100);
      
      // Invalidate and refetch the canned messages query to update the table
      queryClient.invalidateQueries({ queryKey: [CANNED_MESSAGES_QUERY_KEY] });
      
      if (data.successCount > 0) {
        toast.success(`Import completed! ${data.successCount} messages imported successfully.`);
      }
      
      if (data.failureCount > 0) {
        toast.warning(`${data.failureCount} messages failed to import. Check the results below.`);
      }
    },
    onError: (error) => {
      console.error("Import error:", error);
      const errorMessage = error.statusCode === 413 
        ? "File is too large. Please try with a smaller file or contact support."
        : error.message || "Failed to import messages";
      toast.error(errorMessage);
      setIsUploading(false);
      setUploadProgress(0);
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      // Validate file type
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
      ];
      
      if (!validTypes.includes(file.type)) {
        toast.error("Please select a valid Excel file (.xlsx or .xls)");
        return;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast.error("File size must be less than 10MB");
        return;
      }

      setSelectedFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    multiple: false,
    disabled: isUploading,
  });

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    try {
      await importMutation.mutateAsync(selectedFile);
      setUploadProgress(100);
      clearInterval(progressInterval);
    } catch (error) {
      clearInterval(progressInterval);
      setUploadProgress(0);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setIsUploading(false);
    setImportResult(null);
    onOpenChange(false);
  };

  const handleDownloadFailedResults = () => {
    if (importResult?.failedResultsDownloadUrl) {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
      const downloadUrl = importResult.failedResultsDownloadUrl.startsWith('http') 
        ? importResult.failedResultsDownloadUrl 
        : `${apiBaseUrl}${importResult.failedResultsDownloadUrl}`;
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'failed-import-results.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Failed results file downloaded!");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Canned Messages
          </DialogTitle>
          <DialogDescription>
            Upload an Excel file containing canned messages. The file should have &quot;Title&quot; and &quot;Content&quot; columns.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Drop Zone */}
          {!selectedFile && (
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                isDragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400",
                isUploading && "opacity-50 cursor-not-allowed"
              )}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-4">
                <div className="p-3 bg-gray-100 rounded-full">
                  <FileSpreadsheet className="h-8 w-8 text-gray-600" />
                </div>
                <div>
                  <p className="text-lg font-medium">
                    {isDragActive ? "Drop the file here" : "Drag & drop your Excel file"}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    or click to browse files
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Supports .xlsx and .xls files (max 10MB)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Selected File Preview */}
          {selectedFile && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="font-medium text-sm">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                {!isUploading && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {/* Import Results */}
          {importResult && (
            <div className="space-y-4">
              <div className="bg-gray-50 border rounded-lg p-4">
                <h3 className="font-medium text-lg mb-3 flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Import Results
                </h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{importResult.successCount}</div>
                    <div className="text-sm text-gray-600">Successfully Imported</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{importResult.failureCount}</div>
                    <div className="text-sm text-gray-600">Failed</div>
                  </div>
                </div>

                {importResult.failureCount > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-700">
                        {importResult.failureCount} messages failed to import due to duplicate titles.
                      </p>
                      {importResult.failedResultsDownloadUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDownloadFailedResults}
                          className="flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download Failed Results
                        </Button>
                      )}
                    </div>
                    
                    <div className="max-h-32 overflow-y-auto bg-white border rounded p-2">
                      <p className="text-xs text-gray-500 mb-2">Error details:</p>
                      {importResult.errors.slice(0, 5).map((error, index) => (
                        <p key={index} className="text-xs text-red-600 mb-1">{error}</p>
                      ))}
                      {importResult.errors.length > 5 && (
                        <p className="text-xs text-gray-500">
                          ... and {importResult.errors.length - 5} more errors
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Instructions */}
          {!importResult && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">File Format Requirements:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Excel file (.xlsx or .xls format)</li>
                    <li>Must contain &quot;Title&quot; and &quot;Content&quot; columns</li>
                    <li>Maximum file size: 10MB</li>
                    <li>Each row represents one canned message</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {importResult ? (
            <Button onClick={handleClose} className="bg-[#1B76FF] hover:bg-blue-600">
              Close
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose} disabled={isUploading}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!selectedFile || isUploading}
                className="bg-[#1B76FF] hover:bg-blue-600"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Import Messages
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
