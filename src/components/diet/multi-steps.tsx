"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
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
import { getUserProfile } from "@/lib/service/progress-database";

export default function RefactoredMultiStepForm({
  onSubmit,
  loading,
}: RefactoredMultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const workoutForm = typeof window === "undefined" ? null : readLastWorkoutForm();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<DietPlanFormData>({
    resolver: zodResolver(dietPlanSchema) as never,
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
    const workout = readLastWorkoutForm();
    if (workout?.goal) {
      setValue("goal", coerceProgramGoal(workout.goal) || (workout.goal as DietPlanFormData["goal"]));
    }
    if (workout?.workoutFrequency) {
      setValue("workoutFrequency", dietFrequencyFromWorkoutDays(workout.workoutFrequency));
      setValue("activityLevel", dietActivityFromWorkoutDays(workout.workoutFrequency));
    }
    if (workout?.medicalConditions) setValue("medicalConditions", workout.medicalConditions);

    getUserProfile()
      .then((profile) => {
        if (!profile) return;
        if (profile.age) setValue("age", String(profile.age));
        if (profile.gender === "male" || profile.gender === "female") setValue("gender", profile.gender);
        if (profile.height) setValue("height", String(profile.height));
        if (profile.initial_weight) setValue("weight", String(profile.initial_weight));
        const profileGoal = (profile.goals || []).map(coerceProgramGoal).find(Boolean);
        if (profileGoal && !workout?.goal) setValue("goal", profileGoal);
      })
      .catch(() => {});
  }, [setValue]);

  const nextStep = async () => {
    const fields = getFields(currentStep);
    const ok = await trigger(fields as any);

    if (ok && currentStep < steps.length - 1) {
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
        return [
          "weight",
          "weightUnit",
          "height",
          "heightUnit",
          "feet",
          "inches",
          "activityLevel",
        ];
      case 2:
        return [
          "dietaryPreference",
          "goal",
          "workoutFrequency",
          "mealsPerDay",
        ];
      case 3:
        return ["allergies", "medicalConditions", "favoriteFoods"];
      default:
        return [];
    }
  };

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
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25 }}
        >
          {/* Render step */}
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="mt-10 flex justify-end">
        <FormNavigation
          currentStep={currentStep}
          totalSteps={steps.length}
          onPrevious={prevStep}
          onNext={nextStep}
          onSubmit={handleSubmit(onSubmit)}
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
                      setValue("heightUnit", unit);

                      if (unit === "cm") {
                        setValue("feet", "");
                        setValue("inches", "");
                      } else {
                        setValue("height", "");
                      }

                      field.onChange(unit);
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
                      <FormInput label="Feet" type="number" {...field} />
                    )}
                  />
                  <Controller
                    name="inches"
                    control={control}
                    render={({ field }) => (
                      <FormInput label="Inches" type="number" {...field} />
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
                      error={errors.height?.message}
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
                  placeholder="e.g., diabetes"
                  {...field}
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
                  {...field}
                />
              )}
            />
          </div>
        );
    }
  }
}
