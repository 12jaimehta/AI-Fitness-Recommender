"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { databaseService, UserProfile } from "@/lib/service/database";

interface UserProfileSetupProps {
  user: any;
  onComplete: () => void;
}

export default function UserProfileSetup({ user, onComplete }: UserProfileSetupProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [profile, setProfile] = useState({
    full_name: '',
    age: '',
    gender: '',
    height: '',
    initial_weight: '',
    fitness_level: '',
    goals: [] as string[]
  });

  const fitnessLevels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  const goalOptions = [
    'Weight Loss',
    'Muscle Gain',
    'Improved Endurance',
    'Better Health',
    'Stress Relief',
    'Sports Performance'
  ];

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      const profileData: Omit<UserProfile, 'created_at' | 'updated_at'> = {
        id: user.id,
        email: user.email!,
        full_name: profile.full_name,
        age: profile.age ? parseInt(profile.age) : null,
        gender: profile.gender || null,
        height: profile.height ? parseFloat(profile.height) : null,
        initial_weight: profile.initial_weight ? parseFloat(profile.initial_weight) : null,
        fitness_level: profile.fitness_level || null,
        goals: profile.goals
      };

      const result = await databaseService.createUserProfile(profileData);
      
      if (result) {
        // Also create initial weight entry
        if (profile.initial_weight) {
          await databaseService.addWeightEntry({
            user_id: user.id,
            weight: parseFloat(profile.initial_weight),
            date: new Date().toISOString().split('T')[0],
            notes: 'Initial weight'
          });
        }

        onComplete();
        router.refresh();
      }
    } catch (error) {
      console.error('Error creating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = (field: string, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const toggleGoal = (goal: string) => {
    setProfile(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '40px',
          width: '100%',
          maxWidth: '500px',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '28px',
            fontWeight: '800',
            color: '#162a41',
            margin: '0 0 8px'
          }}>
            Welcome to fyteAI!
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#6b7280',
            margin: 0
          }}>
            Let's set up your profile to get started
          </p>
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h3 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#162a41',
              marginBottom: '24px'
            }}>
              Basic Information
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#162a41',
                  marginBottom: '8px'
                }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={profile.full_name}
                  onChange={(e) => updateProfile('full_name', e.target.value)}
                  placeholder="Enter your full name"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(22, 42, 65, 0.2)',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#162a41',
                    marginBottom: '8px'
                  }}>
                    Age
                  </label>
                  <input
                    type="number"
                    value={profile.age}
                    onChange={(e) => updateProfile('age', e.target.value)}
                    placeholder="Age"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid rgba(22, 42, 65, 0.2)',
                      fontSize: '16px'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#162a41',
                    marginBottom: '8px'
                  }}>
                    Gender
                  </label>
                  <select
                    value={profile.gender}
                    onChange={(e) => updateProfile('gender', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid rgba(22, 42, 65, 0.2)',
                      fontSize: '16px',
                      background: '#ffffff'
                    }}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#162a41',
                    marginBottom: '8px'
                  }}>
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={profile.height}
                    onChange={(e) => updateProfile('height', e.target.value)}
                    placeholder="Height"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid rgba(22, 42, 65, 0.2)',
                      fontSize: '16px'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#162a41',
                    marginBottom: '8px'
                  }}>
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={profile.initial_weight}
                    onChange={(e) => updateProfile('initial_weight', e.target.value)}
                    placeholder="Current weight"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid rgba(22, 42, 65, 0.2)',
                      fontSize: '16px'
                    }}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!profile.full_name || !profile.initial_weight}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '12px',
                border: 'none',
                background: '#162a41',
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                marginTop: '32px',
                opacity: (!profile.full_name || !profile.initial_weight) ? 0.6 : 1
              }}
            >
              Continue
            </button>
          </motion.div>
        )}

        {/* Step 2: Fitness Level & Goals */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h3 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#162a41',
              marginBottom: '24px'
            }}>
              Fitness & Goals
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#162a41',
                  marginBottom: '12px'
                }}>
                  Fitness Level
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {fitnessLevels.map(level => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => updateProfile('fitness_level', level.value)}
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        border: `2px solid ${
                          profile.fitness_level === level.value ? '#162a41' : 'rgba(22, 42, 65, 0.2)'
                        }`,
                        background: profile.fitness_level === level.value ? 'rgba(22, 42, 65, 0.1)' : 'transparent',
                        color: '#162a41',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#162a41',
                  marginBottom: '12px'
                }}>
                  Your Goals (Select all that apply)
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {goalOptions.map(goal => (
                    <label
                      key={goal}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: `1px solid ${
                          profile.goals.includes(goal) ? '#162a41' : 'rgba(22, 42, 65, 0.2)'
                        }`,
                        background: profile.goals.includes(goal) ? 'rgba(22, 42, 65, 0.1)' : 'transparent',
                        cursor: 'pointer'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={profile.goals.includes(goal)}
                        onChange={() => toggleGoal(goal)}
                        style={{ display: 'none' }}
                      />
                      <span style={{
                        color: '#162a41',
                        fontWeight: '500'
                      }}>
                        {goal}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
              <button
                onClick={() => setStep(1)}
                style={{
                  flex: 1,
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid rgba(22, 42, 65, 0.2)',
                  background: 'transparent',
                  color: '#162a41',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !profile.fitness_level || profile.goals.length === 0}
                style={{
                  flex: 1,
                  padding: '16px',
                  borderRadius: '12px',
                  border: 'none',
                  background: '#162a41',
                  color: '#ffffff',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  opacity: (loading || !profile.fitness_level || profile.goals.length === 0) ? 0.6 : 1
                }}
              >
                {loading ? 'Setting up...' : 'Complete Setup'}
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}