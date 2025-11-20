// app/(components)/RefactoredMultiStepForm.tsx
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { dietPlanSchema, type DietPlanFormData } from "@/lib/validation";

import FormInput from "@/components/shared/FormInput";
import FormSelect from "@/components/shared/FormSelect";
import ProgressBar from "@/components/shared/ProgressBar";
import FormNavigation from "@/components/shared/FormNavigation";

import FormCardWrapper from "../ui/form/formCardWrapper";
import StepTitle from "../ui/form/stepTitle";
import GenderSelectCard from "../ui/form/genderSelectCard";
import SectionGrid from "../ui/form/sectionGrid";
import { RefactoredMultiStepFormProps } from "@/lib/types";
import { activityOptions, dietaryOptions, goalOptions, steps, workoutOptions } from "@/lib/constant";



export default function RefactoredMultiStepForm({ onSubmit, loading }: RefactoredMultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedGender, setSelectedGender] = useState<string>("");

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<DietPlanFormData>({
    resolver: zodResolver(dietPlanSchema) as any,
    mode: "onChange",
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

  const watchedValues = watch();

  const nextStep = async () => {
    const fields = getFieldsForStep(currentStep);
    const isStepValid = await trigger(fields as any);
    if (isStepValid) {
      if (currentStep < steps.length - 1) setCurrentStep((s) => s + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const getFieldsForStep = (step: number) => {
    switch (step) {
      case 0:
        return ["age", "gender"];
      case 1:
        return ["weight", "weightUnit", "height", "heightUnit", "feet", "inches", "activityLevel"];
      case 2:
        return ["dietaryPreference", "goal", "workoutFrequency", "mealsPerDay"];
      case 3:
        return ["allergies", "medicalConditions", "favoriteFoods"];
      default:
        return [];
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div>
            <StepTitle title={steps[0].title} subtitle={steps[0].description} />
            <div className="grid gap-6">
              <Controller
                name="age"
                control={control}
                render={({ field }) => (
                  <FormInput label="Your Age" type="number" placeholder="Enter your age" value={field.value} onChange={field.onChange} error={errors.age?.message} required />
                )}
              />

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">Select Your Gender</label>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <GenderSelectCard
                      options={[
                        { value: "male", icon: "👨", label: "Male", description: "Male physiology and metabolism" },
                        { value: "female", icon: "👩", label: "Female", description: "Female physiology and metabolism" },
                      ]}
                      value={field.value}
                      onChange={(v) => {
                        field.onChange(v);
                        setSelectedGender(v);
                      }}
                    />
                  )}
                />
                {errors.gender?.message && <p className="mt-2 text-sm text-red-500">{errors.gender.message}</p>}
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div>
            <StepTitle title={steps[1].title} subtitle={steps[1].description} />
            <div className="space-y-6">
              <SectionGrid cols={2} gap="gap-4">
                <Controller
                  name="weightUnit"
                  control={control}
                  render={({ field }) => (
                    <FormSelect
                      label="Weight Unit"
                      value={field.value}
                      onChange={(val: string) => {
                        const value = val as DietPlanFormData["weightUnit"];
                        setValue("weightUnit", value);
                        field.onChange(value);
                      }}
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
                    <FormInput label="Weight" type="number" placeholder="Enter weight" value={field.value} onChange={field.onChange} error={errors.weight?.message} required />
                  )}
                />
              </SectionGrid>

              <SectionGrid cols={2} gap="gap-4">
                <Controller
                  name="heightUnit"
                  control={control}
                  render={({ field }) => (
                    <FormSelect
                      label="Height Unit"
                      value={field.value}
                      onChange={(val: string) => {
                        const unit = val as DietPlanFormData["heightUnit"];
                        // clear irrelevant fields
                        if (unit === "cm") {
                          setValue("feet", "");
                          setValue("inches", "");
                        } else {
                          setValue("height", "");
                        }
                        setValue("heightUnit", unit);
                        field.onChange(unit);
                      }}
                      options={[
                        { value: "cm", label: "Centimeters" },
                        { value: "ftin", label: "Feet & Inches" },
                      ]}
                    />
                  )}
                />

                {watchedValues.heightUnit === "ftin" ? (
                  <div className="grid grid-cols-2 gap-4">
                    <Controller
                      name="feet"
                      control={control}
                      render={({ field }) => <FormInput label="Feet" type="number" placeholder="Feet" value={field.value} onChange={field.onChange} error={errors.feet?.message} />}
                    />
                    <Controller
                      name="inches"
                      control={control}
                      render={({ field }) => <FormInput label="Inches" type="number" placeholder="Inches" value={field.value} onChange={field.onChange} error={errors.inches?.message} />}
                    />
                  </div>
                ) : (
                  <Controller
                    name="height"
                    control={control}
                    render={({ field }) => <FormInput label="Height (cm)" type="number" placeholder="Height in cm" value={field.value} onChange={field.onChange} error={errors.height?.message} required />}
                  />
                )}
              </SectionGrid>

              <Controller
                name="activityLevel"
                control={control}
                render={({ field }) => (
                  <FormSelect
                    label="Activity Level"
                    value={field.value}
                    onChange={(v: string) => {
                      const value = v as DietPlanFormData["activityLevel"];
                      setValue("activityLevel", value);
                      field.onChange(value);
                    }}
                    options={activityOptions}
                    error={errors.activityLevel?.message}
                    required
                  />
                )}
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            <StepTitle title={steps[2].title} subtitle={steps[2].description} />
            <div className="space-y-6">
              <SectionGrid cols={2} gap="gap-4">
                <Controller
                  name="dietaryPreference"
                  control={control}
                  render={({ field }) => (
                    <FormSelect
                      label="Dietary Preference"
                      value={field.value}
                      onChange={(v: string) => {
                        const value = v as DietPlanFormData["dietaryPreference"];
                        setValue("dietaryPreference", value);
                        field.onChange(value);
                      }}
                      options={dietaryOptions}
                      error={errors.dietaryPreference?.message}
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
                      onChange={(v: string) => {
                        const value = v as DietPlanFormData["goal"];
                        setValue("goal", value);
                        field.onChange(value);
                      }}
                      options={goalOptions}
                      error={errors.goal?.message}
                      required
                    />
                  )}
                />
              </SectionGrid>

              <SectionGrid cols={2} gap="gap-4">
                <Controller
                  name="mealsPerDay"
                  control={control}
                  render={({ field }) => (
                    <FormSelect
                      label="Meals Per Day"
                      value={field.value}
                      onChange={(v: string) => {
                        const value = v as DietPlanFormData["mealsPerDay"];
                        setValue("mealsPerDay", value);
                        field.onChange(value);
                      }}
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
                      label="Workout Frequency"
                      value={field.value}
                      onChange={(v: string) => {
                        const value = v as DietPlanFormData["workoutFrequency"];
                        setValue("workoutFrequency", value);
                        field.onChange(value);
                      }}
                      options={workoutOptions}
                      error={errors.workoutFrequency?.message}
                      required
                    />
                  )}
                />
              </SectionGrid>
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <StepTitle title={steps[3].title} subtitle={steps[3].description} />
            <div className="grid gap-4">
              <Controller name="allergies" control={control} render={({ field }) => <FormInput label="Allergies (Optional)" placeholder="e.g., nuts, dairy" value={field.value} onChange={field.onChange} />} />
              <Controller name="medicalConditions" control={control} render={({ field }) => <FormInput label="Medical Conditions (Optional)" placeholder="e.g., diabetes" value={field.value} onChange={field.onChange} />} />
              <Controller name="favoriteFoods" control={control} render={({ field }) => <FormInput label="Favorite Foods (Optional)" placeholder="e.g., avocado, salmon" value={field.value} onChange={field.onChange} />} />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <FormCardWrapper>
      <ProgressBar steps={steps} currentStep={currentStep} />

      <AnimatePresence mode="wait">
        <motion.div key={currentStep} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.28 }}>
          <div className="mt-6">{renderStep()}</div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-8">

        <FormNavigation
          currentStep={currentStep}
          totalSteps={steps.length}
          onPrevious={prevStep}
          onNext={nextStep}
          onSubmit={handleSubmit(onSubmit)}
          loading={loading}
          isLastStep={currentStep === steps.length - 1}
        />
      </div>
    </FormCardWrapper>
  );
}
