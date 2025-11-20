"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Activity, Target, Dumbbell, Clock } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { workoutPlanSchema, type WorkoutPlanFormData } from "@/lib/validation";

// Import smaller components
import FormInput from "../shared/FormInput";
import FormSelect from "../shared/FormSelect";
import ProgressBar from "../shared/ProgressBar";
import FormNavigation from "../shared/FormNavigation";

const steps = [
  {
    id: 'personal',
    title: 'Personal Information',
    icon: User,
    description: 'Tell us about yourself'
  },
  {
    id: 'fitness',
    title: 'Fitness Profile',
    icon: Activity,
    description: 'Your fitness level and goals'
  },
  {
    id: 'workout',
    title: 'Workout Preferences',
    icon: Dumbbell,
    description: 'Your workout schedule and equipment'
  },
  {
    id: 'health',
    title: 'Health Information',
    icon: Target,
    description: 'Health considerations and target areas'
  }
];

const fitnessLevelOptions = [
  { value: "", label: "Select fitness level" },
  { value: "beginner", label: "🌱 Beginner (Just starting)" },
  { value: "intermediate", label: "💪 Intermediate (6-12 months)" },
  { value: "advanced", label: "🔥 Advanced (1+ years)" }
];

const goalOptions = [
  { value: "", label: "Select your goal" },
  { value: "muscle_gain", label: "💪 Muscle Gain" },
  { value: "fat_loss", label: "🔥 Fat Loss" },
  { value: "strength", label: "🎯 Strength" },
  { value: "endurance", label: "🏃 Endurance" },
  { value: "general_fitness", label: "⚡ General Fitness" },
  { value: "athletic_performance", label: "🏆 Athletic Performance" }
];

const durationOptions = [
  { value: "", label: "Select duration" },
  { value: "30", label: "⏱️ 30 minutes" },
  { value: "45", label: "⏱️ 45 minutes" },
  { value: "60", label: "⏱️ 60 minutes" },
  { value: "90", label: "⏱️ 90 minutes" }
];

const frequencyOptions = [
  { value: "", label: "Select frequency" },
  { value: "2", label: "📅 2 days per week" },
  { value: "3", label: "📅 3 days per week" },
  { value: "4", label: "📅 4 days per week" },
  { value: "5", label: "📅 5 days per week" },
  { value: "6", label: "📅 6 days per week" }
];

const equipmentOptions = [
  { value: "", label: "Select available equipment" },
  { value: "none", label: "🏠 No equipment (bodyweight only)" },
  { value: "basic", label: "🏋️ Basic equipment (dumbbells, resistance bands)" },
  { value: "full_gym", label: "🏢 Full gym access" }
];

const timeOptions = [
  { value: "", label: "Select preferred time" },
  { value: "morning", label: "🌅 Morning" },
  { value: "afternoon", label: "☀️ Afternoon" },
  { value: "evening", label: "🌙 Evening" }
];

const muscleGroupOptions = [
  { value: "chest", label: "💪 Chest" },
  { value: "back", label: "🔙 Back" },
  { value: "shoulders", label: "🤸 Shoulders" },
  { value: "biceps", label: "💪 Biceps" },
  { value: "triceps", label: "💪 Triceps" },
  { value: "legs", label: "🦵 Legs" },
  { value: "glutes", label: "🍑 Glutes" },
  { value: "core", label: "🎯 Core" },
  { value: "abs", label: "🏋️ Abs" },
  { value: "calves", label: "🦶 Calves" },
  { value: "forearms", label: "💪 Forearms" },
  { value: "traps", label: "� traps" }
];

interface WorkoutMultiStepFormProps {
  onSubmit: (data: WorkoutPlanFormData) => void;
  loading: boolean;
}

export default function WorkoutMultiStepForm({ onSubmit, loading }: WorkoutMultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  
  const { control, handleSubmit, watch, setValue, formState: { errors, isValid } } = useForm<WorkoutPlanFormData>({
    resolver: zodResolver(workoutPlanSchema),
    mode: 'onChange',
    defaultValues: {
      age: '',
      gender: 'male',
      fitnessLevel: 'beginner',
      goal: 'general_fitness',
      workoutDuration: '45',
      workoutFrequency: '3',
      availableEquipment: 'basic',
      preferredWorkoutTime: 'morning',
      targetMuscles: [],
      injuries: '',
      medicalConditions: '',
      planType: 'weekly'
    }
  });

  const watchedValues = watch();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFormSubmit = (data: WorkoutPlanFormData) => {
    onSubmit(data);
  };

  const toggleMuscleGroup = (muscle: string) => {
    const currentMuscles = watchedValues.targetMuscles || [];
    if (currentMuscles.includes(muscle)) {
      setValue('targetMuscles', currentMuscles.filter(m => m !== muscle));
    } else {
      setValue('targetMuscles', [...currentMuscles, muscle]);
    }
  };

  // Add a hidden field for targetMuscles to ensure it's controlled
  const renderTargetMusclesField = () => (
    <Controller
      name="targetMuscles"
      control={control}
      render={({ field }) => (
        <input
          type="hidden"
          value={field.value || []}
          onChange={(e) => field.onChange(e.target.value ? e.target.value.split(',') : [])}
        />
      )}
    />
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Personal Information
        return (
          <motion.div
            key="personal"
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div style={{ marginBottom: '40px' }}>
              <Controller
                name="age"
                control={control}
                render={({ field }) => (
                  <FormInput
                    label="Age"
                    type="number"
                    placeholder="Enter your age"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.age?.message}
                    required
                  />
                )}
              />
            </div>

            <div style={{ marginBottom: '40px' }}>
              <label style={{
                display: 'block',
                fontSize: '16px',
                fontWeight: '600',
                color: '#1a1a1a',
                marginBottom: '12px'
              }}>
                Gender
              </label>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    flexWrap: 'wrap'
                  }}>
                    {[
                      { value: 'male', label: '👨 Male' },
                      { value: 'female', label: '👩 Female' }
                    ].map((option) => (
                      <motion.button
                        key={option.value}
                        type="button"
                        onClick={() => field.onChange(option.value)}
                        style={{
                          flex: '1',
                          minWidth: '120px',
                          padding: '16px 20px',
                          border: field.value === option.value ? '2px solid #162a41' : '2px solid #e5e7eb',
                          borderRadius: '16px',
                          background: field.value === option.value ? '#162a41' : '#ffffff',
                          color: field.value === option.value ? '#ffffff' : '#1a1a1a',
                          fontSize: '16px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          textAlign: 'center'
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {option.label}
                      </motion.button>
                    ))}
                  </div>
                )}
              />
              {errors.gender && (
                <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '8px' }}>
                  {errors.gender.message}
                </p>
              )}
            </div>
          </motion.div>
        );

      case 1: // Fitness Profile
        return (
          <motion.div
            key="fitness"
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div style={{ marginBottom: '40px' }}>
              <Controller
                name="fitnessLevel"
                control={control}
                render={({ field }) => (
                  <FormSelect
                    label="Fitness Level"
                    options={fitnessLevelOptions}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.fitnessLevel?.message}
                    required
                  />
                )}
              />
            </div>

            <div style={{ marginBottom: '40px' }}>
              <Controller
                name="goal"
                control={control}
                render={({ field }) => (
                  <FormSelect
                    label="Fitness Goal"
                    options={goalOptions}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.goal?.message}
                    required
                  />
                )}
              />
            </div>
          </motion.div>
        );

      case 2: // Workout Preferences
        return (
          <motion.div
            key="workout"
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div style={{ marginBottom: '40px' }}>
              <Controller
                name="workoutDuration"
                control={control}
                render={({ field }) => (
                  <FormSelect
                    label="Workout Duration"
                    options={durationOptions}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.workoutDuration?.message}
                    required
                  />
                )}
              />
            </div>

            <div style={{ marginBottom: '40px' }}>
              <Controller
                name="workoutFrequency"
                control={control}
                render={({ field }) => (
                  <FormSelect
                    label="Workout Frequency"
                    options={frequencyOptions}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.workoutFrequency?.message}
                    required
                  />
                )}
              />
            </div>

            <div style={{ marginBottom: '40px' }}>
              <Controller
                name="availableEquipment"
                control={control}
                render={({ field }) => (
                  <FormSelect
                    label="Available Equipment"
                    options={equipmentOptions}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.availableEquipment?.message}
                    required
                  />
                )}
              />
            </div>

            <div style={{ marginBottom: '40px' }}>
              <Controller
                name="preferredWorkoutTime"
                control={control}
                render={({ field }) => (
                  <FormSelect
                    label="Preferred Workout Time"
                    options={timeOptions}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.preferredWorkoutTime?.message}
                    required
                  />
                )}
              />
            </div>
          </motion.div>
        );

      case 3: // Health Information
        return (
          <motion.div
            key="health"
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div style={{ marginBottom: '40px' }}>
              <label style={{
                display: 'block',
                fontSize: '16px',
                fontWeight: '600',
                color: '#1a1a1a',
                marginBottom: '12px'
              }}>
                Target Muscle Groups (Select at least one)
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '12px'
              }}>
                {(muscleGroupOptions || []).map((option) => (
                  <motion.button
                    key={option.value}
                    type="button"
                    onClick={() => toggleMuscleGroup(option.value)}
                    style={{
                      padding: '12px 16px',
                      border: watchedValues.targetMuscles?.includes(option.value) ? '2px solid #162a41' : '2px solid #e5e7eb',
                      borderRadius: '12px',
                      background: watchedValues.targetMuscles?.includes(option.value) ? '#162a41' : '#ffffff',
                      color: watchedValues.targetMuscles?.includes(option.value) ? '#ffffff' : '#1a1a1a',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      textAlign: 'center'
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {option.label}
                  </motion.button>
                ))}
              </div>
              {errors.targetMuscles && (
                <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '8px' }}>
                  {errors.targetMuscles.message}
                </p>
              )}
            </div>

            {/* Hidden field for targetMuscles */}
            {renderTargetMusclesField()}

            <div style={{ marginBottom: '40px' }}>
              <Controller
                name="injuries"
                control={control}
                render={({ field }) => (
                  <FormInput
                    label="Current Injuries (Optional)"
                    type="text"
                    placeholder="List any current injuries or physical limitations"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.injuries?.message}
                  />
                )}
              />
            </div>

            <div style={{ marginBottom: '40px' }}>
              <Controller
                name="medicalConditions"
                control={control}
                render={({ field }) => (
                  <FormInput
                    label="Medical Conditions (Optional)"
                    type="text"
                    placeholder="List any relevant medical conditions"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.medicalConditions?.message}
                  />
                )}
              />
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '32px',
        boxShadow: '0 32px 64px -12px rgba(102, 126, 234, 0.25)',
        border: '2px solid rgba(102, 126, 234, 0.2)',
        padding: '60px',
        position: 'relative',
        zIndex: 1,
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto'
      }}
    >
      {/* Progress Bar */}
      <ProgressBar steps={steps} currentStep={currentStep} />

      {/* Step Header */}
      <motion.div
        key={steps[currentStep].id}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ textAlign: 'center', marginBottom: '50px' }}
      >
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '20px',
          background: '#162a41',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          color: '#ffffff',
          boxShadow: '0 10px 30px -5px rgba(22, 42, 65, 0.3)'
        }}>
          {(() => {
            const CurrentIcon = steps[currentStep].icon;
            return <CurrentIcon size={36} />;
          })()}
        </div>
        <h2 style={{
          fontSize: '32px',
          fontWeight: '700',
          color: '#1a1a1a',
          marginBottom: '12px'
        }}>
          {steps[currentStep].title}
        </h2>
        <p style={{ color: '#6b7280', fontSize: '18px', margin: 0 }}>
          {steps[currentStep].description}
        </p>
      </motion.div>

      {/* Form Content */}
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <div style={{ minHeight: '300px', marginBottom: '40px' }}>
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <FormNavigation
          currentStep={currentStep}
          totalSteps={steps.length}
          isLastStep={currentStep === steps.length - 1}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onSubmit={handleSubmit(handleFormSubmit)}
          loading={loading}
        />
      </form>
    </motion.div>
  );
}
