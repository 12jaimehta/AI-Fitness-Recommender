"use client";

import React, { useEffect, useState } from "react";
import { StepSwap } from "@/components/shared/Motion";
import { useForm, Controller, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { workoutPlanSchema, type WorkoutPlanFormData } from "@/lib/validation/workoutPlanSchema";
import FormInput from "@/components/shared/FormInput";
import FormSelect from "@/components/shared/FormSelect";
import FormNavigation from "@/components/shared/FormNavigation";
import OptionChipGrid from "@/components/shared/OptionChipGrid";
import PlanFormShell from "@/components/shared/PlanFormShell";
import SectionGrid from "@/components/ui/form/sectionGrid";
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
import { readGeneratedWorkoutPlan } from "@frontend/features/workout-plan/generated-session";
import { hydratePlanCache } from "@frontend/features/plan-cache";
import { getUserProfile } from "@/lib/service/progress-database";
import { FormPageSkeleton } from "@/components/ui/Skeleton";

const WORKOUT_STEP_FIELDS = [
  ["age", "gender", "fitnessLevel"],
  ["goal", "workoutDuration", "workoutFrequency", "availableEquipment"],
  ["preferredWorkoutTime", "targetMuscles", "injuries", "medicalConditions"],
] as const satisfies ReadonlyArray<ReadonlyArray<keyof WorkoutPlanFormData>>;

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

function firstStepWithErrors(formErrors: FieldErrors<WorkoutPlanFormData>) {
  return WORKOUT_STEP_FIELDS.findIndex((fields) => fields.some((field) => formErrors[field]));
}

interface WorkoutMultiStepFormProps {
  onSubmit: (data: WorkoutPlanFormData) => void;
  loading: boolean;
}

export default function WorkoutMultiStepForm({ onSubmit, loading }: WorkoutMultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [ready, setReady] = useState(false);
  const [hasPlan, setHasPlan] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<WorkoutPlanFormData>({
    resolver: zodResolver(workoutPlanSchema) as never,
    mode: "onTouched",
    reValidateMode: "onChange",
    shouldFocusError: true,
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
    let cancelled = false;
    void (async () => {
      try {
        const [profile] = await Promise.all([getUserProfile().catch(() => null), hydratePlanCache()]);
        if (cancelled) return;
        setHasPlan(Boolean(readGeneratedWorkoutPlan()));
        const diet = readLastDietForm();
        if (diet?.goal) setValue("goal", coerceProgramGoal(diet.goal) || (diet.goal as WorkoutPlanFormData["goal"]));
        if (diet?.medicalConditions) setValue("medicalConditions", diet.medicalConditions);
        if (profile) {
          if (profile.age) setValue("age", String(profile.age));
          if (profile.gender === "male" || profile.gender === "female") setValue("gender", profile.gender);
          if (
            profile.fitness_level === "beginner" ||
            profile.fitness_level === "intermediate" ||
            profile.fitness_level === "advanced"
          ) {
            setValue("fitnessLevel", profile.fitness_level);
          }
          const profileGoal = (profile.goals || []).map(coerceProgramGoal).find(Boolean);
          if (profileGoal && !diet?.goal) setValue("goal", profileGoal);
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setValue]);

  const nextStep = async () => {
    const fields = [...(WORKOUT_STEP_FIELDS[currentStep] ?? WORKOUT_STEP_FIELDS[0])];
    const ok = await trigger(fields, { shouldFocus: true });
    if (ok && currentStep < workoutSteps.length - 1) setCurrentStep((s) => s + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const submitPlan = handleSubmit(onSubmit, (formErrors) => {
    const step = firstStepWithErrors(formErrors);
    if (step >= 0) setCurrentStep(step);
  });

  const toggleMuscleGroup = (muscle: string) => {
    const current = watched.targetMuscles || [];
    setValue(
      "targetMuscles",
      current.includes(muscle) ? current.filter((item) => item !== muscle) : [...current, muscle]
    );
  };

  if (!ready) return <FormPageSkeleton />;

  return (
    <PlanFormShell
      kicker="Workout plan"
      photo="workout"
      currentStep={currentStep}
      steps={workoutSteps}
      planHref={hasPlan ? "/workout/plan" : undefined}
      planLabel={hasPlan ? "Current workout" : undefined}
    >
      <StepSwap id={currentStep}>{renderStep()}</StepSwap>
      <FormNavigation
        currentStep={currentStep}
        totalSteps={workoutSteps.length}
        onPrevious={prevStep}
        onNext={nextStep}
        onSubmit={submitPlan}
        loading={loading}
        isLastStep={currentStep === workoutSteps.length - 1}
        submitLabel="Make my workout"
        loadingLabel="Making your workout…"
      />
    </PlanFormShell>
  );

  function renderStep() {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-7">
            <SectionGrid cols={2}>
              <Controller
                name="age"
                control={control}
                render={({ field }) => (
                  <FormInput
                    label="Age"
                    type="number"
                    placeholder="28"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={errors.age?.message}
                    required
                  />
                )}
              />
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <FormSelect
                    label="Sex"
                    required
                    compact
                    value={field.value}
                    onChange={(v) => {
                      field.onChange(v);
                      void trigger("gender");
                    }}
                    options={GENDER_OPTIONS}
                    error={errors.gender?.message}
                  />
                )}
              />
            </SectionGrid>
            <Controller
              name="fitnessLevel"
              control={control}
              render={({ field }) => (
                <FormSelect
                  label="Training experience"
                  required
                  columns={3}
                  compact
                  value={field.value}
                  onChange={(value) => field.onChange(value)}
                  options={fitnessLevelOptions}
                  error={errors.fitnessLevel?.message}
                />
              )}
            />
          </div>
        );

      case 1:
        return (
          <div className="space-y-7">
            <FormSelect
              label="Training goal"
              required
              value={watched.goal}
              onChange={(value) => setValue("goal", value as WorkoutPlanFormData["goal"], { shouldValidate: true })}
              options={PROGRAM_GOAL_OPTIONS}
              error={errors.goal?.message}
            />
            <SectionGrid cols={2}>
              <Controller
                name="workoutDuration"
                control={control}
                render={({ field }) => (
                  <FormSelect
                    label="Minutes per session"
                    required
                    compact
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    options={workoutDurationOptions}
                    error={errors.workoutDuration?.message}
                  />
                )}
              />
              <Controller
                name="workoutFrequency"
                control={control}
                render={({ field }) => (
                  <FormSelect
                    label="Days a week"
                    required
                    compact
                    columns={3}
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    options={workoutFrequencyDaysOptions.map((option) => ({
                      value: option.value,
                      label: option.value ? option.value : option.label,
                    }))}
                    error={errors.workoutFrequency?.message}
                  />
                )}
              />
            </SectionGrid>
            <Controller
              name="availableEquipment"
              control={control}
              render={({ field }) => (
                <FormSelect
                  label="What you have"
                  required
                  columns={3}
                  compact
                  value={field.value}
                  onChange={(value) => field.onChange(value)}
                  options={equipmentOptions}
                  error={errors.availableEquipment?.message}
                />
              )}
            />
          </div>
        );

      default:
        return (
          <div className="space-y-7">
            <Controller
              name="preferredWorkoutTime"
              control={control}
              render={({ field }) => (
                <FormSelect
                  label="When you usually train"
                  columns={3}
                  compact
                  value={field.value || ""}
                  onChange={(value) => field.onChange(value || undefined)}
                  options={preferredTimeOptions}
                />
              )}
            />
            <OptionChipGrid
              label="Muscles you want extra work on"
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
                  label="Injuries or pain"
                  placeholder="left knee, lower back"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
            <Controller
              name="medicalConditions"
              control={control}
              render={({ field }) => (
                <FormInput
                  label="Medical conditions"
                  placeholder="asthma, hypertension"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
          </div>
        );
    }
  }
}
