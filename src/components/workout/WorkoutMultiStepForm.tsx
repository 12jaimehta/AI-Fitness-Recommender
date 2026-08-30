"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { workoutPlanSchema, type WorkoutPlanFormData } from "@/lib/validation/workoutPlanSchema";
import FormInput from "@/components/shared/FormInput";
import FormSelect from "@/components/shared/FormSelect";
import FormNavigation from "@/components/shared/FormNavigation";
import FormStepHeader from "@/components/shared/FormStepHeader";
import OptionChipGrid from "@/components/shared/OptionChipGrid";
import GenderSelectCard, { FemaleImage, MaleImage } from "@/components/ui/form/genderSelectCard";
import SectionGrid from "@/components/ui/form/sectionGrid";
import FormTwoColumnLayout from "@/components/shared/FormTwoColumnLayout";
import PlanFormHeader from "@/components/shared/PlanFormHeader";
import PlanPairingCard from "@/components/shared/PlanPairingCard";
import {
  equipmentOptions,
  fitnessLevelOptions,
  muscleGroupOptions,
  preferredTimeOptions,
  workoutDurationOptions,
  workoutFrequencyDaysOptions,
  workoutSteps,
} from "@/lib/constant";
import { PROGRAM_GOAL_OPTIONS, coerceProgramGoal } from "@/shared/lib/program-goals";
import { readLastDietForm } from "@frontend/features/plan-pairing";
import { getUserProfile } from "@/lib/service/progress-database";

interface WorkoutMultiStepFormProps {
  onSubmit: (data: WorkoutPlanFormData) => void;
  loading: boolean;
}

export default function WorkoutMultiStepForm({
  onSubmit,
  loading,
}: WorkoutMultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const dietForm = typeof window === "undefined" ? null : readLastDietForm();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<WorkoutPlanFormData>({
    resolver: zodResolver(workoutPlanSchema) as never,
    defaultValues: {
      age: "",
      gender: undefined,
      fitnessLevel: undefined,
      goal: undefined,
      workoutDuration: undefined,
      workoutFrequency: undefined,
      availableEquipment: undefined,
      preferredWorkoutTime: undefined,
      targetMuscles: [],
      injuries: "",
      medicalConditions: "",
      planType: "weekly",
    },
  });

  const watched = watch();

  useEffect(() => {
    const diet = readLastDietForm();
    if (diet?.goal) setValue("goal", coerceProgramGoal(diet.goal) || (diet.goal as WorkoutPlanFormData["goal"]));
    if (diet?.medicalConditions) setValue("medicalConditions", diet.medicalConditions);
    getUserProfile()
      .then((profile) => {
        if (!profile) return;
        if (profile.age) setValue("age", String(profile.age));
        if (profile.gender === "male" || profile.gender === "female") setValue("gender", profile.gender);
        if (profile.fitness_level === "beginner" || profile.fitness_level === "intermediate" || profile.fitness_level === "advanced") {
          setValue("fitnessLevel", profile.fitness_level);
        }
        const profileGoal = (profile.goals || []).map(coerceProgramGoal).find(Boolean);
        if (profileGoal && !diet?.goal) setValue("goal", profileGoal);
      })
      .catch(() => {});
  }, [setValue]);

  const nextStep = async () => {
    const fields = getFields(currentStep);
    const ok = await trigger(fields as never);
    if (ok && currentStep < workoutSteps.length - 1) {
      setCurrentStep((s) => s + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const getFields = (step: number) => {
    switch (step) {
      case 0:
        return ["age", "gender"];
      case 1:
        return ["fitnessLevel", "goal"];
      case 2:
        return ["workoutDuration", "workoutFrequency", "availableEquipment"];
      default:
        return [];
    }
  };

  const toggleMuscleGroup = (muscle: string) => {
    const currentMuscles = watched.targetMuscles || [];
    if (currentMuscles.includes(muscle)) {
      setValue("targetMuscles", currentMuscles.filter((item) => item !== muscle));
    } else {
      setValue("targetMuscles", [...currentMuscles, muscle]);
    }
  };

  return (
    <FormTwoColumnLayout
      currentStep={currentStep}
      heading="Personalized AI Workout Plan"
      steps={workoutSteps}
      header={
        <>
          <PlanFormHeader
            currentLabel="Workout Plan"
            currentPlanHref="/workout/plan"
            currentPlanText="View Workout Plan"
          />
          <PlanPairingCard context="workout-form" otherExists={Boolean(dietForm)} goal={watched.goal} />
        </>
      }
    >
      <FormStepHeader
        currentStep={currentStep}
        totalSteps={workoutSteps.length}
        title={workoutSteps[currentStep].title}
        description={workoutSteps[currentStep].description}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25 }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      <div className="mt-10 flex justify-end">
        <FormNavigation
          currentStep={currentStep}
          totalSteps={workoutSteps.length}
          onPrevious={prevStep}
          onNext={nextStep}
          onSubmit={handleSubmit(onSubmit)}
          loading={loading}
          isLastStep={currentStep === workoutSteps.length - 1}
          submitLabel="Generate AI Workout Plan"
        />
      </div>
    </FormTwoColumnLayout>
  );

  function renderStep() {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <Controller
              name="age"
              control={control}
              render={({ field }) => (
                <FormInput
                  label="Your Age"
                  type="number"
                  placeholder="Enter your age"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.age?.message}
                  required
                />
              )}
            />

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                Select Your Gender
              </label>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <GenderSelectCard
                    options={[
                      { value: "male", icon: <MaleImage className="w-16 h-16" />, label: "Male" },
                      { value: "female", icon: <FemaleImage className="w-16 h-16" />, label: "Female" },
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.gender?.message ? <p className="mt-2 text-sm text-red-500">{errors.gender.message}</p> : null}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-8">
            <Controller
              name="fitnessLevel"
              control={control}
              render={({ field }) => (
                <FormSelect
                  label="Fitness Level"
                  value={field.value}
                  onChange={(value) => field.onChange(value)}
                  options={fitnessLevelOptions}
                  error={errors.fitnessLevel?.message}
                  required
                />
              )}
            />
            <OptionChipGrid
              label="Training goal"
              hint="Required. This drives the plan: Hyrox, Ironman, bodybuilding, and so on."
              options={PROGRAM_GOAL_OPTIONS}
              selected={watched.goal ? [watched.goal] : []}
              onToggle={(value) => setValue("goal", value as WorkoutPlanFormData["goal"], { shouldValidate: true })}
              error={errors.goal?.message}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <SectionGrid cols={2}>
              <Controller
                name="workoutDuration"
                control={control}
                render={({ field }) => (
                  <FormSelect
                    label="Workout Duration"
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    options={workoutDurationOptions}
                    error={errors.workoutDuration?.message}
                    required
                  />
                )}
              />
              <Controller
                name="workoutFrequency"
                control={control}
                render={({ field }) => (
                  <FormSelect
                    label="Workout Frequency"
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    options={workoutFrequencyDaysOptions}
                    error={errors.workoutFrequency?.message}
                    required
                  />
                )}
              />
            </SectionGrid>
            <SectionGrid cols={2}>
              <Controller
                name="availableEquipment"
                control={control}
                render={({ field }) => (
                  <FormSelect
                    label="Available Equipment"
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    options={equipmentOptions}
                    error={errors.availableEquipment?.message}
                    required
                    variant="dropdown"
                  />
                )}
              />
              <Controller
                name="preferredWorkoutTime"
                control={control}
                render={({ field }) => (
                  <FormSelect
                    label="Preferred time (optional)"
                    value={field.value || ""}
                    onChange={(value) => field.onChange(value || undefined)}
                    options={preferredTimeOptions}
                  />
                )}
              />
            </SectionGrid>
          </div>
        );

      case 3:
        return (
          <div className="grid gap-4">
            <OptionChipGrid
              label="Target muscle groups"
              hint="Optional. Leave blank and we will program the full goal (Hyrox, Ironman, bodybuilding, and so on)."
              options={muscleGroupOptions}
              selected={watched.targetMuscles || []}
              onToggle={toggleMuscleGroup}
              variant="dropdown"
            />
            <Controller
              name="injuries"
              control={control}
              render={({ field }) => (
                <FormInput
                  label="Current Injuries (Optional)"
                  placeholder="List any current injuries or physical limitations"
                  {...field}
                />
              )}
            />
            <Controller
              name="medicalConditions"
              control={control}
              render={({ field }) => (
                <FormInput
                  label="Medical Conditions (Optional)"
                  placeholder="e.g., asthma, hypertension"
                  {...field}
                />
              )}
            />
          </div>
        );
    }
  }
}
