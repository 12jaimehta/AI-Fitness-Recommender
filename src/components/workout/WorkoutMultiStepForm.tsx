"use client";

import React, { useState } from "react";
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
import {
  equipmentOptions,
  fitnessLevelOptions,
  muscleGroupOptions,
  preferredTimeOptions,
  workoutDurationOptions,
  workoutFrequencyDaysOptions,
  workoutGoalOptions,
  workoutSteps,
} from "@/lib/constant";

interface WorkoutMultiStepFormProps {
  onSubmit: (data: WorkoutPlanFormData) => void;
  loading: boolean;
}

export default function WorkoutMultiStepForm({
  onSubmit,
  loading,
}: WorkoutMultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<WorkoutPlanFormData>({
    resolver: zodResolver(workoutPlanSchema) as any,
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

  const nextStep = async () => {
    const fields = getFields(currentStep);
    const ok = await trigger(fields as any);

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
        return [
          "workoutDuration",
          "workoutFrequency",
          "availableEquipment",
          "preferredWorkoutTime",
        ];
      case 3:
        return ["targetMuscles"];
      default:
        return [];
    }
  };

  const toggleMuscleGroup = (muscle: string) => {
    const currentMuscles = watched.targetMuscles || [];
    if (currentMuscles.includes(muscle)) {
      setValue("targetMuscles", currentMuscles.filter((m) => m !== muscle), {
        shouldValidate: true,
      });
    } else {
      setValue("targetMuscles", [...currentMuscles, muscle], {
        shouldValidate: true,
      });
    }
  };

  return (
    <FormTwoColumnLayout
      currentStep={currentStep}
      heading="Personalized AI Workout Plan"
      steps={workoutSteps}
      header={
        <PlanFormHeader
          currentLabel="Workout Plan"
          currentPlanHref="/diet/plan"
          currentPlanText="See your current workout plan"
        />
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
                      {
                        value: "male",
                        icon: <MaleImage className="w-16 h-16" />,
                        label: "Male",
                      },
                      {
                        value: "female",
                        icon: <FemaleImage className="w-16 h-16" />,
                        label: "Female",
                      },
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />

              {errors.gender?.message && (
                <p className="mt-2 text-sm text-red-500">
                  {errors.gender.message}
                </p>
              )}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-8">
            <SectionGrid cols={2}>
              <Controller
                name="fitnessLevel"
                control={control}
                render={({ field }) => (
                  <FormSelect
                    label="Fitness Level"
                    value={field.value}
                    onChange={(v) => field.onChange(v)}
                    options={fitnessLevelOptions}
                    error={errors.fitnessLevel?.message}
                    required
                  />
                )}
              />
              <Controller
                name="goal"
                control={control}
                render={({ field }) => (
                  <FormSelect
                    label="Fitness Goal"
                    value={field.value}
                    onChange={(v) => field.onChange(v)}
                    options={workoutGoalOptions}
                    error={errors.goal?.message}
                    required
                  />
                )}
              />
            </SectionGrid>
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
                    onChange={(v) => field.onChange(v)}
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
                    onChange={(v) => field.onChange(v)}
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
                    onChange={(v) => field.onChange(v)}
                    options={equipmentOptions}
                    error={errors.availableEquipment?.message}
                    required
                  />
                )}
              />
              <Controller
                name="preferredWorkoutTime"
                control={control}
                render={({ field }) => (
                  <FormSelect
                    label="Preferred Workout Time"
                    value={field.value}
                    onChange={(v) => field.onChange(v)}
                    options={preferredTimeOptions}
                    error={errors.preferredWorkoutTime?.message}
                    required
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
              label="Target Muscle Groups"
              options={muscleGroupOptions}
              selected={watched.targetMuscles || []}
              onToggle={toggleMuscleGroup}
              error={errors.targetMuscles?.message}
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
