"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Activity, Target, Save, X, Mail } from "lucide-react";


import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import PageLoader from "@/components/ui/PageLoader";
// ------------------------------------------------------------------

// --- Assuming these imports exist in your project ---
import { useUser } from "@/lib/hooks/use-user";
import { databaseService, UserProfile } from "@/lib/service/progress-database";
import { UnifiedFooter, UnifiedNavbar } from "@/components";
import StepTitle from "@/components/ui/form/stepTitle";
import FormCardWrapper from "@/components/ui/form/formCardWrapper";
// -----------------------------------------------------

// Define a type for the data used in the form state
type ProfileFormState = Omit<UserProfile, 'id' | 'email' | 'created_at' | 'updated_at'> & {
    goals: string; // Simplifies goals array into a comma-separated string for form input
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, isSignedIn, isLoading: userLoading } = useUser();
  const userId = user?.id || '';

  // Data States
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [formState, setFormState] = useState<ProfileFormState | null>(null);

  // UI States
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // --- Data Fetching Logic (Replaces React Query) ---
  const fetchUserProfile = async (id: string) => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await databaseService.getUserProfile(id);
      setProfileData(data);
      if (data) {
        // Initialize form state
        const goalsString = Array.isArray(data.goals) ? data.goals.join(', ') : '';
        setFormState({
            ...data,
            goals: goalsString,
        });
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      // Fallback for missing profile: direct user to setup if needed
      if (!profileData) {
          router.push('/setup-profile'); // Assuming a dedicated setup path
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId && !profileData && !userLoading) {
      fetchUserProfile(userId);
    }
  }, [userId, userLoading, profileData]); // Only re-run if userId changes or initial load is done

  // --- Handlers ---

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormState(prev => {
        if (!prev) return null;
        
        let newValue: string | number | null = value;

        // Convert number inputs to actual numbers
        if (type === 'number') {
            newValue = value ? parseFloat(value) : null;
        }

        return {
            ...prev,
            [name]: newValue,
        } as ProfileFormState;
    });
  };

  const handleCancel = () => {
    // Reset form state to the currently saved profileData
    if (profileData) {
        const goalsString = Array.isArray(profileData.goals) ? profileData.goals.join(', ') : '';
        setFormState({
            ...profileData,
            goals: goalsString as any,
        });
    }
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState || !userId) return;
    
    setIsSaving(true);
    
    try {
        // 1. Prepare data for Supabase (convert goals string back to array)
        const updates: Partial<UserProfile> = {
            ...formState,
            // Convert goals string to array, filtering out empty strings
            goals: formState.goals ? formState.goals.split(',').map(g => g.trim()).filter(g => g) : null,
            // Explicitly map properties to avoid sending the 'goals' string field
            full_name: formState.full_name,
            age: formState.age,
            gender: formState.gender,
            height: formState.height,
            initial_weight: formState.initial_weight,
            fitness_level: formState.fitness_level,
            // Omit other unnecessary fields from the update payload
        };

        // 2. Perform the update
        await databaseService.updateUserProfile(userId, updates);
        
        // 3. Refetch to get the latest data and update profileData state
        await fetchUserProfile(userId); 
        
        setIsEditing(false);
        alert('Profile updated successfully!');
    } catch (error) {
        console.error("Profile update error:", error);
        alert('Failed to update profile. Please try again.');
    } finally {
        setIsSaving(false);
    }
  };


  // --- Render Guards ---

  // 1. Authentication Check
  if (!isSignedIn && !userLoading) {
    router.push('/sign-in');
    return null;
  }
  
  // 2. Loading Check
  if (isLoading || userLoading || !formState) {
    return (
      <div className="min-h-screen pt-20">
        <PageLoader title="Loading your profile data..." />
      </div>
    );
  }

  // 3. Edge Case: No profile data after loading
  if (!profileData && !isLoading) {
    return (
      <div className="min-h-screen pt-28 max-w-xl mx-auto p-6 text-center">
        <StepTitle title="Profile Setup Required" subtitle="It looks like you haven't set up your profile yet. Please complete the initial setup to proceed." />
        <Button onClick={() => router.push('/setup-profile')} className="mt-6">Go to Setup</Button>
      </div>
    );
  }

  // --- Component Rendering ---
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Assuming Navbar exists */}
      <UnifiedNavbar /> 
      <div className="pt-32 p-4 md:p-8">
        <FormCardWrapper className="w-full">
          
          <div className="flex justify-between items-start mb-8">
             <StepTitle 
                title="Account & Profile Settings" 
                subtitle="Review and update your personal information, fitness details, and goals." 
                className="max-w-md"
            />
            
            {!isEditing ? (
                <Button 
                    variant="primary" 
                    onClick={() => setIsEditing(true)} 
                    icon={<Save size={20} />}
                    className="h-12 px-6"
                >
                    Edit Profile
                </Button>
            ) : (
                <div className="flex gap-3">
                    <Button 
                        variant="secondary" 
                        onClick={handleCancel} 
                        icon={<X size={20} />}
                        className="h-12 px-6"
                        disabled={isSaving}
                    >
                        Cancel
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={handleSubmit} 
                        loading={isSaving}
                        icon={<Save size={20} />}
                        className="h-12 px-6"
                    >
                        Save Changes
                    </Button>
                </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* 1. Basic Info Section */}
            <div className="border-b border-gray-200 pb-8">
              <h3 className="text-xl font-bold text-[#162a41] mb-5 flex items-center gap-2"><User size={20} /> Personal Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input 
                  label="Full Name"
                  name="full_name"
                  type="text"
                  value={formState.full_name || ''}
                  onChange={handleChange}
                  disabled={!isEditing || isSaving}
                  icon={<User size={18} />}
                />
                <Input 
                  label="Email (Read-Only)"
                  name="email"
                  type="email"
                  value={profileData?.email || ''}
                  disabled={true} // Email is generally non-editable
                  icon={<Mail size={18} />}
                  className="bg-gray-100 cursor-not-allowed"
                />
                <Input 
                  label="Age"
                  name="age"
                  type="number"
                  value={formState.age || ''}
                  onChange={handleChange}
                  disabled={!isEditing || isSaving}
                />
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-[#162a41]">Gender</label>
                    <select
                        name="gender"
                        value={formState.gender || ''}
                        onChange={handleChange}
                        disabled={!isEditing || isSaving}
                        className="w-full rounded-xl py-3 px-4 border text-base border-gray-300 focus:ring-2 focus:ring-[#162a411A] focus:outline-none transition"
                    >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>
              </div>
            </div>

            {/* 2. Fitness & Health Section */}
            <div className="border-b border-gray-200 pb-8">
              <h3 className="text-xl font-bold text-[#162a41] mb-5 flex items-center gap-2"><Activity size={20} /> Health Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input 
                  label="Height (cm)"
                  name="height"
                  type="number"
                  step="0.1"
                  value={formState.height || ''}
                  onChange={handleChange}
                  disabled={!isEditing || isSaving}
                />
                <Input 
                  label="Initial Weight (kg)"
                  name="initial_weight"
                  type="number"
                  step="0.1"
                  value={formState.initial_weight || ''}
                  onChange={handleChange}
                  disabled={!isEditing || isSaving}
                />
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-[#162a41]">Fitness Level</label>
                    <select
                        name="fitness_level"
                        value={formState.fitness_level || ''}
                        onChange={handleChange}
                        disabled={!isEditing || isSaving}
                        className="w-full rounded-xl py-3 px-4 border text-base border-gray-300 focus:ring-2 focus:ring-[#162a411A] focus:outline-none transition"
                    >
                        <option value="">Select Level</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                    </select>
                </div>
              </div>
            </div>

            {/* 3. Goals Section */}
            <div className="pb-8">
              <h3 className="text-xl font-bold text-[#162a41] mb-5 flex items-center gap-2"><Target size={20} /> Goals</h3>
                <Input 
                    label="Goals (e.g., Lose 5kg, Run a 5k, Build Muscle)"
                    name="goals"
                    type="text"
                    placeholder="Enter goals separated by commas"
                    value={formState.goals || ''}
                    onChange={handleChange}
                    disabled={!isEditing || isSaving}
                />
                <p className="text-xs text-gray-500 mt-2">Separate multiple goals with commas (e.g., Goal 1, Goal 2, Goal 3).</p>
            </div>
            
            {/* Save Buttons (only shown in editing mode, but can be part of the form) */}
            {isEditing && (
                <div className="flex justify-end gap-4 pt-4">
                    <Button 
                        variant="secondary" 
                        onClick={handleCancel} 
                        type="button" 
                        disabled={isSaving}
                    >
                        Cancel
                    </Button>
                    <Button 
                        variant="primary" 
                        loading={isSaving}
                        type="submit" 
                    >
                        {isSaving ? 'Saving...' : 'Confirm & Save'}
                    </Button>
                </div>
            )}
          </form>
        </FormCardWrapper>
      </div>
      {/* Assuming Footer exists */}
      <UnifiedFooter />
    </div>
  );
}