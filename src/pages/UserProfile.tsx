import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, Loader2 } from "lucide-react";
import { User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  created_at?: string;
  updated_at?: string;
}

const profileSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required").max(50, "First name must be less than 50 characters"),
  last_name: z.string().trim().min(1, "Last name is required").max(50, "Last name must be less than 50 characters"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const UserProfile = () => {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
    }
  });

  useEffect(() => {
    fetchUserAndProfile();
  }, []);

  const fetchUserAndProfile = async () => {
    try {
      setIsLoading(true);
      
      // Fetch current user
      const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      if (!authUser) throw new Error("No user found");
      
      setUser(authUser);
      
      // Fetch profile
      const { data: profileData, error: profileError } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();
      
      if (profileError) throw profileError;
      
      setProfile(profileData);
      
      // Update form with profile data if exists
      if (profileData) {
        reset({
          first_name: profileData.first_name || "",
          last_name: profileData.last_name || "",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = () => {
    if (profile?.first_name || profile?.last_name) {
      return `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;
    
    try {
      setIsSaving(true);
      
      if (profile) {
        // Update existing profile
        const { error } = await (supabase as any)
          .from('profiles')
          .update({
            first_name: data.first_name.trim(),
            last_name: data.last_name.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);
        
        if (error) throw error;
        
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        });
      } else {
        // Create new profile
        const { error } = await (supabase as any)
          .from('profiles')
          .insert({
            id: user.id,
            first_name: data.first_name.trim(),
            last_name: data.last_name.trim(),
          });
        
        if (error) throw error;
        
        toast({
          title: "Profile created",
          description: "Your profile has been created successfully.",
        });
      }
      
      // Refresh profile data
      await fetchUserAndProfile();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You've been successfully signed out.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account, profile, and subscription
        </p>
      </div>

      {/* Mobile-first responsive grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content - takes 2 columns on desktop */}
        <div className="space-y-6 lg:col-span-2">
          {/* Profile not found alert */}
          {!profile && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Complete your profile</strong> - Add your name to personalize your Homestead Architect experience.
              </AlertDescription>
            </Alert>
          )}

          {/* Profile Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Your basic account information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {profile?.first_name && profile?.last_name
                        ? `${profile.first_name} ${profile.last_name}`
                        : 'Homestead User'}
                    </h3>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      {...register("first_name")}
                      placeholder="Enter your first name"
                    />
                    {errors.first_name && (
                      <p className="text-sm text-destructive">{errors.first_name.message}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      {...register("last_name")}
                      placeholder="Enter your last name"
                    />
                    {errors.last_name && (
                      <p className="text-sm text-destructive">{errors.last_name.message}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>
                </div>

                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    profile ? 'Update Profile' : 'Create Profile'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Account Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Account Status</p>
                  <p className="text-sm text-muted-foreground">
                    Your account is active
                  </p>
                </div>
                <div className="h-3 w-3 rounded-full bg-green-500" />
              </div>
              <div className="pt-4 border-t">
                <Button
                  variant="destructive"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - takes 1 column on desktop */}
        <div className="space-y-6">
          {/* Subscription Card */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>
                Manage your plan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Plan</p>
                <p className="text-2xl font-bold">Free</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Access to all basic homestead management features
              </p>
              <Button className="w-full" variant="outline" disabled>
                Upgrade Plan
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Member Since</span>
                <span className="text-sm font-medium">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'Recently'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Last Login</span>
                <span className="text-sm font-medium">Today</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
