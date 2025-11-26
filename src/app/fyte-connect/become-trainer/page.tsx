"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/supabase-client";
import { useCurrentUser } from "@/lib/hooks/use-current-user";

import { UnifiedFooter, UnifiedNavbar } from "@/components";
import Input from "@/components/ui/input";
import MotionButton from "@/components/ui/MotionButton";
import UploadImage from "@/components/ui/UploadImage";

import { CheckCircle2, Tag } from "lucide-react";
import TrainerLeftSection from "@/components/fyte-connect/TrainerLeftSection";
import FormCardWrapper from "@/components/ui/form/formCardWrapper";
import StepTitle from "@/components/ui/form/stepTitle";
import SectionGrid from "@/components/ui/form/sectionGrid";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { TrainerFormData, trainerSchema } from "@/lib/validation/becometrainer";

export default function BecomeTrainerPage() {
  const router = useRouter();
  const supabase = createClient();
  const { user, isSignedIn } = useCurrentUser();

  // ----------------- FORM -----------------
  const form = useForm<TrainerFormData>({
    resolver: zodResolver(trainerSchema),
    defaultValues: {
      full_name: "",
      bio: "",
      experience_years: null,
      hourly_rate: null,
      expertise: [],
      avatar_url: null
    }
  });

  const {
    register,
    setValue,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = form;

  const expertise = watch("expertise");
  const avatarUrl = watch("avatar_url");

  // ----------------- LOAD EXISTING DATA -----------------
  useEffect(() => {
    if (!user?.id) return;

    const loadProfile = async () => {
      const { data } = await supabase
        .from("trainer_profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (data) {
        setValue("full_name", data.full_name || "");
        setValue("bio", data.bio || "");
        setValue("expertise", data.expertise || []);
        setValue("experience_years", data.experience_years ?? null);
        setValue("hourly_rate", data.hourly_rate ?? null);
        setValue("avatar_url", data.avatar_url || null);
      }
    };

    loadProfile();
  }, [user?.id, setValue, supabase]);

  // ----------------- TAGS -----------------
  const addExpertise = (tag: string) => {
    const t = tag.trim();
    if (!t) return;
    if (!expertise.includes(t)) {
      setValue("expertise", [...expertise, t], { shouldValidate: true });
    }
  };

  const removeExpertise = (tag: string) => {
    setValue(
      "expertise",
      expertise.filter((x) => x !== tag),
      { shouldValidate: true }
    );
  };

  // ----------------- SUBMIT -----------------
  const onSubmit: SubmitHandler<TrainerFormData> = async (vals) => {
    if (!user) return;

    const payload = {
      id: user.id,
      ...vals
    };

    const { error } = await supabase.from("trainer_profiles").upsert(payload);

    if (!error) router.push("/fyte-connect");
  };

  // ----------------- AUTH GUARD -----------------
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-[linear-gradient(135deg,#162a41,#1e3a5f)] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-3 font-semibold">
            You need to be logged in to become a trainer.
          </p>
          <button
            onClick={() => router.push("/sign-in")}
            className="px-6 py-3 rounded-xl bg-white/10 border border-white/40 hover:bg-white/20 transition"
          >
            Login / Sign Up
          </button>
        </div>
      </div>
    );
  }

  // ----------------- UI -----------------
  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#162a41,#1e3a5f)]">
      <UnifiedNavbar />

      <main className="mt-20 p-8 flex justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-[1200px] w-full items-center">

          <TrainerLeftSection />

          <FormCardWrapper className="bg-white border-gray-200 shadow-xl">
            <StepTitle
              title="Become a Trainer"
              subtitle="Fill your details to start coaching on FyteConnect."
            />

            {/* Image Upload */}
            <UploadImage
              label="Profile Photo"
              bucket="trainer-avatars"
              value={avatarUrl}
              onChange={(url) => setValue("avatar_url", url)}
              pathPrefix={`trainers/${user?.id}`}
              className="mb-6"
            />

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
              <SectionGrid cols={2}>
                <Input
                  label="Full Name"
                  {...register("full_name")}
                  error={errors.full_name?.message}
                />

                <Input
                  label="Years of Experience"
                  type="number"
                  {...register("experience_years")}
                  error={errors.experience_years?.message}
                />

                <div className="col-span-2">
                  <label className="text-sm font-semibold text-[#162a41]">Bio</label>
                  <textarea
                    {...register("bio")}
                    rows={4}
                    className="w-full rounded-xl bg-gray-100 border border-gray-300 px-4 py-3"
                  />
                  {errors.bio && (
                    <p className="text-xs text-red-600 mt-1">{errors.bio.message}</p>
                  )}
                </div>

                <Input
                  label="Hourly Rate (₹)"
                  type="number"
                  {...register("hourly_rate")}
                  error={errors.hourly_rate?.message}
                />
              </SectionGrid>

              {/* Expertise Section */}
              <div>
                <label className="text-sm font-semibold text-[#162a41]">Expertise</label>

                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="e.g. Fat loss, Strength training"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const input = e.target as HTMLInputElement;
                        addExpertise(input.value);
                        input.value = "";
                      }
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => {
                      const input = document.querySelector<HTMLInputElement>(
                        "input[placeholder='e.g. Fat loss, Strength training']"
                      );
                      if (input) {
                        addExpertise(input.value);
                        input.value = "";
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-sm"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {expertise.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 border border-gray-300 rounded-full text-xs flex items-center gap-1"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeExpertise(tag)}
                        className="text-red-500 text-[10px]"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>

                {errors.expertise && (
                  <p className="text-xs text-red-600 mt-1">{errors.expertise.message}</p>
                )}
              </div>

              <MotionButton
                type="submit"
                icon={<CheckCircle2 size={18} />}
                loading={isSubmitting}
              >
                Save Trainer Profile
              </MotionButton>
            </form>
          </FormCardWrapper>
        </div>
      </main>

      <UnifiedFooter />
    </div>
  );
}
