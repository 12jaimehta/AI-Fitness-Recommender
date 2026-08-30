"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getOwnTrainerProfile, upsertTrainerProfile } from "@frontend/features/fyte-connect";
import { useCurrentUser } from "@/lib/hooks/use-current-user";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { trainerSchema, type TrainerFormData } from "@/lib/validation/becometrainer";
import PageBreadcrumb from "@/components/shared/PageBreadcrumb";
import UploadImage from "@/components/ui/UploadImage";
import InstagramLink from "@/components/fyte-connect/InstagramLink";

export default function BecomeTrainerClientPage() {
  const router = useRouter();
  const { user } = useCurrentUser();
  const [tagDraft, setTagDraft] = useState("");
  const [submitError, setSubmitError] = useState("");

  const form = useForm<TrainerFormData>({
    resolver: zodResolver(trainerSchema) as never,
    defaultValues: {
      full_name: "",
      bio: "",
      experience_years: null,
      hourly_rate: null,
      expertise: [],
      avatar_url: null,
      instagram_handle: "",
    },
  });

  const {
    register,
    setValue,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const expertise = watch("expertise") || [];
  const avatarUrl = watch("avatar_url");
  const instagramHandle = watch("instagram_handle");

  useEffect(() => {
    if (!user?.id) return;

    const loadProfile = async () => {
      const data = await getOwnTrainerProfile();
      if (!data) return;
      setValue("full_name", data.full_name || "");
      setValue("bio", data.bio || "");
      setValue("expertise", data.expertise || []);
      setValue("experience_years", (data.experience_years ?? null) as TrainerFormData["experience_years"]);
      setValue("hourly_rate", (data.hourly_rate ?? null) as TrainerFormData["hourly_rate"]);
      setValue("avatar_url", data.avatar_url || null);
      setValue("instagram_handle", data.instagram_handle || "");
    };

    loadProfile();
  }, [user?.id, setValue]);

  const addExpertise = (tag: string) => {
    const next = tag.trim();
    if (!next) return;
    if (!expertise.includes(next)) {
      setValue("expertise", [...expertise, next], { shouldValidate: true });
    }
    setTagDraft("");
  };

  const removeExpertise = (tag: string) => {
    setValue(
      "expertise",
      expertise.filter((item) => item !== tag),
      { shouldValidate: true }
    );
  };

  const onSubmit: SubmitHandler<TrainerFormData> = async (vals) => {
    if (!user) return;
    setSubmitError("");
    try {
      await upsertTrainerProfile(vals);
      router.push("/fyte-connect");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Could not save your trainer profile.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <PageBreadcrumb
          items={[
            { label: "Home" },
            { label: "Trainers", href: "/fyte-connect" },
            { label: "Become a trainer" },
          ]}
        />

        <header className="mb-8 border-b border-gray-200 pb-6">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Become a trainer</h1>
          <p className="mt-2 text-gray-600">
            Add your details so people can find you, book a session, and message you on Instagram.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1fr,1.4fr]">
          <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-[#282828]">What people see</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-gray-600">
              <li>Your name, photo, and bio on the Trainers page.</li>
              <li>A book-a-session form on your profile.</li>
              <li>An Instagram button if you add your handle.</li>
              <li>You can edit this any time.</li>
            </ul>
          </aside>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8"
          >
            <UploadImage
              label="Profile photo"
              bucket="trainer-avatars"
              value={avatarUrl}
              onChange={(url) => setValue("avatar_url", url)}
              pathPrefix={`trainers/${user?.id}`}
              className="mb-6"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-[#282828]">Full name</label>
                <input
                  {...register("full_name")}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#282828]"
                />
                {errors.full_name ? (
                  <p className="mt-1 text-xs text-red-600">{errors.full_name.message}</p>
                ) : null}
              </div>

              <div>
                <label className="text-sm font-semibold text-[#282828]">Years of experience</label>
                <input
                  type="number"
                  min={0}
                  {...register("experience_years")}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#282828]"
                />
                {errors.experience_years ? (
                  <p className="mt-1 text-xs text-red-600">{errors.experience_years.message}</p>
                ) : null}
              </div>

              <div className="sm:col-span-2">
                <label className="text-sm font-semibold text-[#282828]">Bio</label>
                <textarea
                  {...register("bio")}
                  rows={4}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#282828]"
                />
                {errors.bio ? <p className="mt-1 text-xs text-red-600">{errors.bio.message}</p> : null}
              </div>

              <div>
                <label className="text-sm font-semibold text-[#282828]">Hourly rate (Rs)</label>
                <input
                  type="number"
                  min={0}
                  {...register("hourly_rate")}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#282828]"
                />
                {errors.hourly_rate ? (
                  <p className="mt-1 text-xs text-red-600">{errors.hourly_rate.message}</p>
                ) : null}
              </div>

              <div>
                <label className="text-sm font-semibold text-[#282828]">Instagram</label>
                <input
                  {...register("instagram_handle")}
                  placeholder="@yourname"
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#282828]"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Handle or profile URL. People get a button to message you on Instagram.
                </p>
                {instagramHandle ? (
                  <div className="mt-2">
                    <InstagramLink handle={instagramHandle} compact />
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-6">
              <label className="text-sm font-semibold text-[#282828]">Expertise</label>
              <div className="mt-2 flex gap-2">
                <input
                  value={tagDraft}
                  onChange={(event) => setTagDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addExpertise(tagDraft);
                    }
                  }}
                  placeholder="e.g. Fat loss, Strength training"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#282828]"
                />
                <button
                  type="button"
                  onClick={() => addExpertise(tagDraft)}
                  className="shrink-0 rounded-xl border-2 border-[#282828] px-4 py-2 text-sm font-semibold text-[#282828] hover:bg-[#282828] hover:text-white"
                >
                  Add
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {expertise.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-700"
                  >
                    {tag}
                    <button type="button" onClick={() => removeExpertise(tag)} className="text-gray-500">
                      Remove
                    </button>
                  </span>
                ))}
              </div>
              {errors.expertise ? (
                <p className="mt-1 text-xs text-red-600">{errors.expertise.message}</p>
              ) : null}
            </div>

            {submitError ? (
              <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {submitError}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 w-full rounded-xl bg-[#282828] px-5 py-3 text-sm font-semibold text-white hover:bg-[#454545] disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : "Save trainer profile"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
