"use client";

import React, { useEffect, useState } from "react";
import { StepSwap } from "@/components/shared/Motion";
import { useForm, Controller, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  dietPlanSchema,
  type DietPlanFormData,
} from "@/lib/validation/dietPlanSchema";
import FormInput from "@/components/shared/FormInput";
import FormSelect from "@/components/shared/FormSelect";
import FormNavigation from "@/components/shared/FormNavigation";
import FormStepHeader from "@/components/shared/FormStepHeader";
import GenderSelectCard, { FemaleImage, MaleImage } from "../ui/form/genderSelectCard";
import SectionGrid from "../ui/form/sectionGrid";
import { RefactoredMultiStepFormProps } from "@/lib/types";
import {
  activityOptions,
  dietaryOptions,
  steps,
  workoutOptions,
} from "@/lib/constant";
import FormTwoColumnLayout from "@/components/shared/FormTwoColumnLayout";
import PlanFormHeader from "@/components/shared/PlanFormHeader";
import PlanPairingCard from "@/components/shared/PlanPairingCard";
import OptionChipGrid from "@/components/shared/OptionChipGrid";
import { PROGRAM_GOAL_OPTIONS, coerceProgramGoal, dietActivityFromWorkoutDays, dietFrequencyFromWorkoutDays } from "@/shared/lib/program-goals";
import { readLastWorkoutForm } from "@frontend/features/plan-pairing";
import { hydratePlanCache } from "@frontend/features/plan-cache";
import { getUserProfile } from "@/lib/service/progress-database";
import { FormPageSkeleton } from "@/components/ui/Skeleton";

const DIET_STEP_FIELDS = [
  ["age", "gender"],
  ["weight", "weightUnit", "height", "heightUnit", "feet", "inches", "activityLevel"],
  ["dietaryPreference", "goal", "workoutFrequency", "mealsPerDay"],
  ["allergies", "medicalConditions", "favoriteFoods"],
] as const satisfies ReadonlyArray<ReadonlyArray<keyof DietPlanFormData>>;

function firstStepWithErrors(formErrors: FieldErrors<DietPlanFormData>) {
  return DIET_STEP_FIELDS.findIndex((fields) => fields.some((field) => formErrors[field]));
}

export default function RefactoredMultiStepForm({
  onSubmit,
  loading,
}: RefactoredMultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [ready, setReady] = useState(false);
  const [workoutForm, setWorkoutForm] = useState<ReturnType<typeof readLastWorkoutForm>>(null);

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
      planType: "single",
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
        const workout = readLastWorkoutForm();
        setWorkoutForm(workout);
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

    if (ok && currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const submitPlan = handleSubmit(onSubmit, (formErrors) => {
    const step = firstStepWithErrors(formErrors);
    if (step >= 0) setCurrentStep(step);
  });

  if (!ready) {
    return <FormPageSkeleton />;
  }

  return (
    <FormTwoColumnLayout
      currentStep={currentStep}
      heading="Personalized AI Diet Plan"
      steps={steps}
      header={
        <>
          <PlanFormHeader
            currentLabel="Diet Plan"
            currentPlanHref="/diet/plan"
            currentPlanText="View Diet Plan"
          />
          <PlanPairingCard context="diet-form" otherExists={Boolean(workoutForm)} goal={watched.goal} />
        </>
      }
    >
      <FormStepHeader
        currentStep={currentStep}
        totalSteps={steps.length}
        title={steps[currentStep].title}
        description={steps[currentStep].description}
      />

      {/* Step Content */}
      <StepSwap id={currentStep}>
          {renderStep()}
      </StepSwap>

      {/* Navigation */}
      <div className="mt-10 flex justify-end">
        <FormNavigation
          currentStep={currentStep}
          totalSteps={steps.length}
          onPrevious={prevStep}
          onNext={nextStep}
          onSubmit={submitPlan}
          loading={loading}
          isLastStep={currentStep === steps.length - 1}
          submitLabel="Make my meal plan"
          loadingLabel="Making your meal plan..."
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
                  onBlur={field.onBlur}
                  error={errors.age?.message}
                  required
                />
              )}
            />

            <div>
              <label className="mb-3 block text-sm font-semibold text-slate-900">
                Select Your Gender <span className="text-[#282828]">*</span>
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
                    onChange={(value) => {
                      field.onChange(value);
                      void trigger("gender");
                    }}
                  />
                )}
              />

              {errors.gender?.message ? (
                <p className="mt-2 text-sm font-medium text-red-600" role="alert">
                  {errors.gender.message}
                </p>
              ) : null}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-8">
            <SectionGrid cols={2}>
              <Controller
                name="weightUnit"
                control={control}
                render={({ field }) => (
                  <FormSelect
                    label="Weight Unit"
                    value={field.value}
                    onChange={(v) => setValue("weightUnit", v as any)}
                    options={[
                      { value: "kg", label: "Kilograms" },
                      { value: "lbs", label: "Pounds" },
                    ]}
                  />
                )}
              />
              <Controller
                name="weight"
                control={control}
                render={({ field }) => (
                  <FormInput
                    label="Weight"
                    type="number"
                    placeholder="Enter weight"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={errors.weight?.message}
                    required
                  />
                )}
              />
            </SectionGrid>

            <SectionGrid cols={2}>
              <Controller
                name="heightUnit"
                control={control}
                render={({ field }) => (
                  <FormSelect
                    label="Height Unit"
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
                      void trigger(["height", "feet", "inches"]);
                    }}
                    options={[
                      { value: "cm", label: "Centimeters" },
                      { value: "ftin", label: "Feet + Inches" },
                    ]}
                  />
                )}
              />

              {watched.heightUnit === "ftin" ? (
                <div className="grid grid-cols-2 gap-4">
                  <Controller
                    name="feet"
                    control={control}
                    render={({ field }) => (
                      <FormInput
                        label="Feet"
                        type="number"
                        placeholder="e.g. 5"
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
                        placeholder="e.g. 10"
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
                      placeholder="Enter height in cm"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={errors.height?.message}
                      required
                    />
                  )}
                />
              )}
            </SectionGrid>

            <Controller
              name="activityLevel"
              control={control}
              render={({ field }) => (
                <FormSelect
                  label={workoutForm ? "Activity level (from your workout)" : "Activity Level"}
                  value={field.value}
                  onChange={(v) => field.onChange(v)}
                  options={activityOptions}
                  error={errors.activityLevel?.message}
                  required
                  variant="dropdown"
                />
              )}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <SectionGrid cols={2}>
              <Controller
                name="dietaryPreference"
                control={control}
                render={({ field }) => (
                  <FormSelect
                    label="Dietary Preference"
                    value={field.value}
                    onChange={(v) => field.onChange(v)}
                    options={dietaryOptions}
                    error={errors.dietaryPreference?.message}
                    required
                    variant="dropdown"
                  />
                )}
              />
            </SectionGrid>

            <OptionChipGrid
              label="Training goal"
              hint="Use the same goal as your workout so food matches Hyrox, Ironman, bodybuilding, or fat loss."
              options={PROGRAM_GOAL_OPTIONS}
              selected={watched.goal ? [watched.goal] : []}
              onToggle={(value) => setValue("goal", value as DietPlanFormData["goal"], { shouldValidate: true })}
              error={errors.goal?.message}
              required
            />

            <SectionGrid cols={2}>
              <Controller
                name="mealsPerDay"
                control={control}
                render={({ field }) => (
                  <FormSelect
                    label="Meals Per Day"
                    value={field.value}
                    onChange={(v) => field.onChange(v)}
                    options={[
                      { value: "3", label: "3 Meals" },
                      { value: "4", label: "4 Meals" },
                      { value: "5", label: "5 Meals" },
                      { value: "6", label: "6 Meals" },
                    ]}
                    error={errors.mealsPerDay?.message}
                    required
                  />
                )}
              />
              <Controller
                name="workoutFrequency"
                control={control}
                render={({ field }) => (
                  <FormSelect
                    label={workoutForm ? "Workout frequency (from your workout)" : "Workout Frequency"}
                    value={field.value}
                    onChange={(v) => field.onChange(v)}
                    options={workoutOptions}
                    error={errors.workoutFrequency?.message}
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
            <Controller
              name="allergies"
              control={control}
              render={({ field }) => (
                <FormInput
                  label="Allergies (Optional)"
                  placeholder="e.g., nuts, dairy"
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
                  label="Medical Conditions (Optional)"
                  placeholder="e.g., diabetes"
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
                  label="Favorite Foods (Optional)"
                  placeholder="e.g., avocado, paneer"
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
