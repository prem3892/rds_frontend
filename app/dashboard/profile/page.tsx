"use client";
import { useCurrentUser } from "@/stores/auth";
import { 
  useGetMyAgentProfile, 
  useUpdateMyAgentProfileMutation,
  useUploadProfilePictureMutation,
  UpdateMyAgentProfileDto
} from "@/lib/agent.api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { NotificationSettings } from "@/components/ui/notification-settings";
import { motion } from "framer-motion";
import { 
  User, 
  Mail, 
  Building2, 
  Shield, 
  Globe, 
  Users, 
  Clock, 
  CircleDot,
  Key,
  MapPin,
  Edit,
  Upload,
  Camera
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

// Common timezones
const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago", 
  "America/Denver",
  "America/Los_Angeles",
  "America/Santiago",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Kolkata",
  "Australia/Sydney"
];

export default function ProfilePage() {
  const currentUser = useCurrentUser();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Edit states
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);

  // Form states
  const [personalForm, setPersonalForm] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [settingsForm, setSettingsForm] = useState({
    maxConcurrentChats: 0,
    timezone: 'UTC'
  });

  const { 
    data: agentProfile, 
    isLoading, 
    error 
  } = useGetMyAgentProfile();

  // API Mutations
  const updateProfileMutation = useUpdateMyAgentProfileMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["agents", "me"] });
      setIsEditingPersonal(false);
      setIsEditingSettings(false);
    },
    onError: (error) => {
      toast.error("Failed to update profile", {
        description: error.message
      });
    }
  });

  const uploadPictureMutation = useUploadProfilePictureMutation({
    onError: (error) => {
      toast.error("Failed to upload profile picture", {
        description: error.message
      });
      setIsUploadingPicture(false);
    }
  });

  // Handle profile picture upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Invalid file type", {
          description: "Please upload a JPG, JPEG, PNG, or GIF image."
        });
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size too large", {
          description: "Please select a file smaller than 5MB"
        });
        return;
      }

      try {
        setIsUploadingPicture(true);
        
        // Upload the file first
        const uploadResult = await uploadPictureMutation.mutateAsync(file);
        
        // Then update the profile with the new picture URL
        const updateData: UpdateMyAgentProfileDto = {
          profilePicture: uploadResult.profilePictureUrl
        };
        
        await updateProfileMutation.mutateAsync(updateData);
        
        toast.success("Profile picture updated successfully!");
        queryClient.invalidateQueries({ queryKey: ["agents", "me"] });
        
      } catch (error) {
        console.error("Error updating profile picture:", error);
        // Error handling is done in the mutation onError callbacks
      } finally {
        setIsUploadingPicture(false);
      }
    }
  };

  // Handle personal info update
  const handlePersonalUpdate = () => {
    const updateData: UpdateMyAgentProfileDto = {
      firstName: personalForm.firstName,
      lastName: personalForm.lastName,
      email: personalForm.email
    };
    updateProfileMutation.mutate(updateData);
  };

  // Handle settings update
  const handleSettingsUpdate = () => {
    const updateData: UpdateMyAgentProfileDto = {
      maxConcurrentChats: settingsForm.maxConcurrentChats,
      timezone: settingsForm.timezone
    };
    updateProfileMutation.mutate(updateData);
  };

  // Get initials for avatar fallback
  const getInitials = () => {
    if (agentProfile?.user) {
      return `${agentProfile.user.firstName.charAt(0)}${agentProfile.user.lastName.charAt(0)}`;
    }
    return "?";
  };

  // Get profile picture URL with API base
  const getProfilePictureUrl = () => {
    if (agentProfile?.profilePicture) {
      // If it's already a full URL, return as is
      if (agentProfile.profilePicture.startsWith('http')) {
        return agentProfile.profilePicture;
      }
      
      // Profile picture paths are relative to server root (e.g., /uploads/...), not API root
      // So we need to use the server base URL, not the API base URL
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
      const SERVER_BASE_URL = API_BASE_URL.replace('/api/v1', '');
      return `${SERVER_BASE_URL}${agentProfile.profilePicture}`;
    }
    return null;
  };

  // Initialize form data when profile loads
  useEffect(() => {
    if (agentProfile) {
      setPersonalForm({
        firstName: agentProfile.user.firstName,
        lastName: agentProfile.user.lastName,
        email: agentProfile.user.email
      });
      setSettingsForm({
        maxConcurrentChats: agentProfile.maxConcurrentChats,
        timezone: agentProfile.timezone || 'UTC'
      });
    }
  }, [agentProfile]);

  if (!currentUser) return <p>Loading...</p>;

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-2xl text-red-600">Error Loading Profile</CardTitle>
            <CardDescription className="text-red-500">
              {error.message || "Failed to load profile information"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto p-2 md:p-4 lg:p-6 xl:p-8 space-y-3 sm:space-y-4 md:space-y-6 bg-[#f2f4f8] rounded-3xl min-h-full mobile-no-overflow"
    >
      <div className="bg-white rounded-3xl p-2 md:p-4 overflow-hidden">
        <div className="flex justify-between items-center mx-1 sm:mx-2 md:mx-4 mt-2 sm:mt-4 mb-4 sm:mb-6">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold flex items-center">
              <span className="p-1 sm:p-2 bg-blue-500 text-white mr-1 rounded-md">
                <User className="text-lg sm:text-xl md:text-2xl" />
              </span>
              <span className="truncate">My Profile</span>
            </h1>
          </div>
        </div>

        <div className="mx-1 sm:mx-2 md:mx-4 space-y-6">
          {/* Personal Information Card */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Your basic profile information and account details.
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEditingPersonal(true)}
                  disabled={isLoading}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-20 w-20 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-4 w-64" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-5 w-48" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  {/* Profile Picture Section */}
                  <div className="flex items-center space-x-6 pb-6 border-b">
                    <div className="relative">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={getProfilePictureUrl() || undefined} alt="Profile" />
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-lg font-semibold">
                          {getInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full shadow-lg"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingPicture}
                      >
                        {isUploadingPicture ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
                        ) : (
                          <Camera className="h-4 w-4" />
                        )}
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">
                        {agentProfile?.user.firstName} {agentProfile?.user.lastName}
                      </h3>
                      <p className="text-muted-foreground">{agentProfile?.user.email}</p>
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 mt-2">
                        {currentUser.role}
                      </Badge>
                    </div>
                  </div>

                  {/* Profile Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Full Name
                        </p>
                        <p className="text-lg font-medium">
                          {agentProfile?.user.firstName} {agentProfile?.user.lastName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          Email Address
                        </p>
                        <p className="text-lg">{agentProfile?.user.email}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                          <CircleDot className="h-3 w-3" />
                          Status
                        </p>
                        <Badge 
                          variant={agentProfile?.isOnline ? "default" : "secondary"}
                          className={agentProfile?.isOnline ? "bg-green-500 hover:bg-green-600" : "bg-gray-400"}
                        >
                          {agentProfile?.isOnline ? "Online" : "Offline"}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          Role
                        </p>
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                          {currentUser.role}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Settings Card */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Agent Settings
                  </CardTitle>
                  <CardDescription>
                    Configure your agent-specific settings and preferences.
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEditingSettings(true)}
                  disabled={isLoading}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      Max Concurrent Chats
                    </p>
                    <p className="text-lg font-medium">{agentProfile?.maxConcurrentChats || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Timezone
                    </p>
                    <p className="text-lg">{agentProfile?.timezone || "UTC"}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Department Access Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Department Access
              </CardTitle>
              <CardDescription>
                Departments you have access to manage and support.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-8 w-28" />
                  <Skeleton className="h-8 w-36" />
                </div>
              ) : (
                <div>
                  {agentProfile?.departmentIds && agentProfile.departmentIds.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {agentProfile.departmentIds.map((dept: any) => (
                        <Badge 
                          key={dept._id} 
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                        >
                          <Building2 className="h-3 w-3 mr-1" />
                          {dept.name}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">No departments assigned</p>
                  )}
                  
                  {agentProfile?.departmentIds && agentProfile.departmentIds.length > 0 && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-900 mb-1">Department Details:</h4>
                      <div className="space-y-2">
                        {agentProfile.departmentIds.map((dept: any) => (
                          <div key={dept._id} className="text-sm">
                            <p className="font-medium text-blue-800">{dept.name}</p>
                            <p className="text-blue-600">{dept.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Domain Access Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Domain Access
              </CardTitle>
              <CardDescription>
                Domains you are authorized to provide support for.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {agentProfile?.domainAccess?.map((domain, index) => (
                    <Badge 
                      key={index} 
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                    >
                      <Globe className="h-3 w-3 mr-1" />
                      {domain === "*" ? "All Domains" : domain}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Activity Card */}
          {agentProfile?.lastSeen && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Account Activity
                </CardTitle>
                <CardDescription>
                  Recent account activity and session information.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Seen</p>
                  <p className="text-lg">{new Date(agentProfile.lastSeen).toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Password & Security Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Password & Security
              </CardTitle>
              <CardDescription>
                Manage your account password and security settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Password</p>
                    <p className="text-sm text-muted-foreground">
                      Change your account password for better security
                    </p>
                  </div>
                  <Button variant="outline" disabled>
                    <Key className="h-4 w-4 mr-2" />
                    Reset Password
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Password reset functionality will be available soon
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-3xl p-2 md:p-4">
        <div className="mx-1 sm:mx-2 md:mx-4">
          <NotificationSettings />
        </div>
      </div>

      {/* Edit Personal Information Dialog */}
      <Dialog open={isEditingPersonal} onOpenChange={setIsEditingPersonal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Personal Information</DialogTitle>
            <DialogDescription>
              Update your name and email address. Changes will be reflected across the system.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="firstName" className="text-right">
                First Name
              </Label>
              <Input
                id="firstName"
                value={personalForm.firstName}
                onChange={(e) => setPersonalForm({...personalForm, firstName: e.target.value})}
                className="col-span-3"
                placeholder="Enter first name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lastName" className="text-right">
                Last Name
              </Label>
              <Input
                id="lastName"
                value={personalForm.lastName}
                onChange={(e) => setPersonalForm({...personalForm, lastName: e.target.value})}
                className="col-span-3"
                placeholder="Enter last name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={personalForm.email}
                onChange={(e) => setPersonalForm({...personalForm, email: e.target.value})}
                className="col-span-3"
                placeholder="Enter email address"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingPersonal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handlePersonalUpdate} 
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900 mr-2" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Settings Dialog */}
      <Dialog open={isEditingSettings} onOpenChange={setIsEditingSettings}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Agent Settings</DialogTitle>
            <DialogDescription>
              Configure your agent-specific settings and working preferences.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="maxChats" className="text-right">
                Max Chats
              </Label>
              <Input
                id="maxChats"
                type="number"
                min="1"
                max="10"
                value={settingsForm.maxConcurrentChats}
                onChange={(e) => setSettingsForm({...settingsForm, maxConcurrentChats: parseInt(e.target.value) || 0})}
                className="col-span-3"
                placeholder="Enter max concurrent chats"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="timezone" className="text-right">
                Timezone
              </Label>
              <Select 
                value={settingsForm.timezone} 
                onValueChange={(value) => setSettingsForm({...settingsForm, timezone: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingSettings(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSettingsUpdate} 
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900 mr-2" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
