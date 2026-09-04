"use client";

import React, { useEffect, useState } from "react";
import { StepSwap } from "@/components/shared/Motion";
import { useForm, Controller, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { dietPlanSchema, type DietPlanFormData } from "@/lib/validation/dietPlanSchema";
import FormInput from "@/components/shared/FormInput";
import FormSelect from "@/components/shared/FormSelect";
import FormNavigation from "@/components/shared/FormNavigation";
import PlanFormShell from "@/components/shared/PlanFormShell";
import SectionGrid from "../ui/form/sectionGrid";
import { RefactoredMultiStepFormProps } from "@/lib/types";
import { activityOptions, dietaryOptions, steps, workoutOptions } from "@/lib/constant";
import {
  PROGRAM_GOAL_OPTIONS,
  coerceProgramGoal,
  dietActivityFromWorkoutDays,
  dietFrequencyFromWorkoutDays,
} from "@/shared/lib/program-goals";
import { readLastWorkoutForm } from "@frontend/features/plan-pairing";
import { readGeneratedDietPlan } from "@frontend/features/diet-plan";
import { hydratePlanCache } from "@frontend/features/plan-cache";
import { getUserProfile } from "@/lib/service/progress-database";
import { FormPageSkeleton } from "@/components/ui/Skeleton";

const DIET_STEP_FIELDS = [
  ["age", "gender", "weight", "weightUnit", "height", "heightUnit", "feet", "inches"],
  ["goal", "dietaryPreference", "mealsPerDay", "workoutFrequency", "activityLevel"],
  ["allergies", "medicalConditions", "favoriteFoods"],
] as const satisfies ReadonlyArray<ReadonlyArray<keyof DietPlanFormData>>;

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

const MEALS_OPTIONS = [
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5" },
  { value: "6", label: "6" },
];

function firstStepWithErrors(formErrors: FieldErrors<DietPlanFormData>) {
  return DIET_STEP_FIELDS.findIndex((fields) => fields.some((field) => formErrors[field]));
}

export default function RefactoredMultiStepForm({ onSubmit, loading }: RefactoredMultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [ready, setReady] = useState(false);
  const [hasPlan, setHasPlan] = useState(false);
  const [pairedWorkout, setPairedWorkout] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<DietPlanFormData>({
    resolver: zodResolver(dietPlanSchema) as never,
    mode: "onTouched",
    reValidateMode: "onChange",
    shouldFocusError: true,
    defaultValues: {
      weight: "",
      weightUnit: "kg",
      height: "",
      heightUnit: "cm",
      feet: "",
      inches: "",
      age: "",
      gender: undefined,
      workoutFrequency: undefined,
      dietaryPreference: undefined,
      goal: undefined,
      activityLevel: undefined,
      allergies: "",
      medicalConditions: "",
      favoriteFoods: "",
      planType: "weekly",
      mealsPerDay: "4",
    },
  });

  const watched = watch();

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [profile] = await Promise.all([getUserProfile().catch(() => null), hydratePlanCache()]);
        if (cancelled) return;
        setHasPlan(Boolean(readGeneratedDietPlan()));
        const workout = readLastWorkoutForm();
        setPairedWorkout(Boolean(workout));
        if (workout?.goal) {
          setValue("goal", coerceProgramGoal(workout.goal) || (workout.goal as DietPlanFormData["goal"]));
        }
        if (workout?.workoutFrequency) {
          setValue("workoutFrequency", dietFrequencyFromWorkoutDays(workout.workoutFrequency));
          setValue("activityLevel", dietActivityFromWorkoutDays(workout.workoutFrequency));
        }
        if (workout?.medicalConditions) setValue("medicalConditions", workout.medicalConditions);

        if (profile) {
          if (profile.age) setValue("age", String(profile.age));
          if (profile.gender === "male" || profile.gender === "female") setValue("gender", profile.gender);
          if (profile.height) setValue("height", String(profile.height));
          if (profile.initial_weight) setValue("weight", String(profile.initial_weight));
          const profileGoal = (profile.goals || []).map(coerceProgramGoal).find(Boolean);
          if (profileGoal && !workout?.goal) setValue("goal", profileGoal);
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
    const fields = [...(DIET_STEP_FIELDS[currentStep] ?? DIET_STEP_FIELDS[0])];
    const ok = await trigger(fields, { shouldFocus: true });
    if (ok && currentStep < steps.length - 1) setCurrentStep((s) => s + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const submitPlan = handleSubmit(onSubmit, (formErrors) => {
    const step = firstStepWithErrors(formErrors);
    if (step >= 0) setCurrentStep(step);
  });

  if (!ready) return <FormPageSkeleton />;

  return (
    <PlanFormShell
      kicker="Diet plan"
      photo="diet"
      currentStep={currentStep}
      steps={steps}
      planHref={hasPlan ? "/diet/plan" : undefined}
      planLabel={hasPlan ? "Current diet" : undefined}
    >
      <StepSwap id={currentStep}>{renderStep()}</StepSwap>
      <FormNavigation
        currentStep={currentStep}
        totalSteps={steps.length}
        onPrevious={prevStep}
        onNext={nextStep}
        onSubmit={submitPlan}
        loading={loading}
        isLastStep={currentStep === steps.length - 1}
        submitLabel="Make my diet"
        loadingLabel="Making your diet…"
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

            <SectionGrid cols={2}>
              <Controller
                name="weight"
                control={control}
                render={({ field }) => (
                  <FormInput
                    label={`Weight (${watched.weightUnit})`}
                    type="number"
                    placeholder={watched.weightUnit === "kg" ? "72" : "160"}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={errors.weight?.message}
                    required
                  />
                )}
              />
              <Controller
                name="weightUnit"
                control={control}
                render={({ field }) => (
                  <FormSelect
                    label="Unit"
                    compact
                    required
                    value={field.value}
                    onChange={(v) => setValue("weightUnit", v as DietPlanFormData["weightUnit"])}
                    options={[
                      { value: "kg", label: "kg" },
                      { value: "lbs", label: "lb" },
                    ]}
                  />
                )}
              />
            </SectionGrid>

            <SectionGrid cols={2}>
              {watched.heightUnit === "ftin" ? (
                <div className="grid grid-cols-2 gap-3">
                  <Controller
                    name="feet"
                    control={control}
                    render={({ field }) => (
                      <FormInput
                        label="Feet"
                        type="number"
                        placeholder="5"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        error={errors.feet?.message}
                        required
                      />
                    )}
                  />
                  <Controller
                    name="inches"
                    control={control}
                    render={({ field }) => (
                      <FormInput
                        label="Inches"
                        type="number"
                        placeholder="9"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        error={errors.inches?.message}
                        required
                      />
                    )}
                  />
                </div>
              ) : (
                <Controller
                  name="height"
                  control={control}
                  render={({ field }) => (
                    <FormInput
                      label="Height (cm)"
                      type="number"
                      placeholder="175"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={errors.height?.message}
                      required
                    />
                  )}
                />
              )}
              <Controller
                name="heightUnit"
                control={control}
                render={({ field }) => (
                  <FormSelect
                    label="Unit"
                    compact
                    required
                    value={field.value}
                    onChange={(v: string) => {
                      const unit = v as DietPlanFormData["heightUnit"];
                      setValue("heightUnit", unit, { shouldValidate: true, shouldTouch: true });
                      if (unit === "cm") {
                        setValue("feet", "");
                        setValue("inches", "");
                      } else {
                        setValue("height", "");
                      }
                      field.onChange(unit);
                    }}
                    options={[
                      { value: "cm", label: "cm" },
                      { value: "ftin", label: "ft / in" },
                    ]}
                  />
                )}
              />
            </SectionGrid>
          </div>
        );

      case 1:
        return (
          <div className="space-y-7">
            <FormSelect
              label="Training goal"
              required
              value={watched.goal}
              onChange={(v) => setValue("goal", v as DietPlanFormData["goal"], { shouldValidate: true })}
              options={PROGRAM_GOAL_OPTIONS}
              error={errors.goal?.message}
            />

            <Controller
              name="dietaryPreference"
              control={control}
              render={({ field }) => (
                <FormSelect
                  label="How you eat"
                  required
                  columns={3}
                  compact
                  value={field.value}
                  onChange={(v) => field.onChange(v)}
                  options={dietaryOptions}
                  error={errors.dietaryPreference?.message}
                />
              )}
            />

            <SectionGrid cols={2}>
              <Controller
                name="mealsPerDay"
                control={control}
                render={({ field }) => (
                  <FormSelect
                    label="Meals a day"
                    required
                    compact
                    value={field.value}
                    onChange={(v) => field.onChange(v)}
                    options={MEALS_OPTIONS}
                    error={errors.mealsPerDay?.message}
                  />
                )}
              />
              <Controller
                name="workoutFrequency"
                control={control}
                render={({ field }) => (
                  <FormSelect
                    label={pairedWorkout ? "Training days (from your workout)" : "Training days a week"}
                    required
                    compact
                    variant="dropdown"
                    value={field.value}
                    onChange={(v) => field.onChange(v)}
                    options={workoutOptions}
                    error={errors.workoutFrequency?.message}
                  />
                )}
              />
            </SectionGrid>

            <Controller
              name="activityLevel"
              control={control}
              render={({ field }) => (
                <FormSelect
                  label="Rest of your day"
                  required
                  compact
                  columns={3}
                  value={field.value}
                  onChange={(v) => field.onChange(v)}
                  options={activityOptions}
                  error={errors.activityLevel?.message}
                />
              )}
            />
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <Controller
              name="allergies"
              control={control}
              render={({ field }) => (
                <FormInput
                  label="Allergies"
                  placeholder="nuts, dairy"
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
                  placeholder="diabetes, thyroid"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
            <Controller
              name="favoriteFoods"
              control={control}
              render={({ field }) => (
                <FormInput
                  label="Foods you already eat and like"
                  placeholder="paneer, eggs, poha"
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
