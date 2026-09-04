"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getOwnTrainerProfile, upsertTrainerProfile } from "@frontend/features/fyte-connect";
import { useCurrentUser } from "@/lib/hooks/use-current-user";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { trainerSchema, type TrainerFormData } from "@/lib/validation/becometrainer";
import PageHero from "@/components/shared/PageHero";
import { fyte } from "@/shared/lib/ui";
import { cn } from "@/lib/utils";
import { BecomeTrainerSkeleton } from "@/components/ui/Skeleton";
import UploadImage from "@/components/ui/UploadImage";
import InstagramLink from "@/components/fyte-connect/InstagramLink";

const INPUT =
  "mt-1.5 h-12 w-full rounded-xl border-2 border-fyte-line bg-fyte-card px-4 text-base font-medium text-fyte-ink outline-none transition placeholder:text-gray-400 focus:border-fyte-ink";

export default function BecomeTrainerClientPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useCurrentUser();
  const [tagDraft, setTagDraft] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [ready, setReady] = useState(false);

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
    if (userLoading) return;
    if (!user?.id) {
      setReady(true);
      return;
    }

    let cancelled = false;
    setReady(false);
    const loadProfile = async () => {
      try {
        const data = await getOwnTrainerProfile();
        if (cancelled || !data) return;
        setValue("full_name", data.full_name || "");
        setValue("bio", data.bio || "");
        setValue("expertise", data.expertise || []);
        setValue("experience_years", (data.experience_years ?? null) as TrainerFormData["experience_years"]);
        setValue("hourly_rate", (data.hourly_rate ?? null) as TrainerFormData["hourly_rate"]);
        setValue("avatar_url", data.avatar_url || null);
        setValue("instagram_handle", data.instagram_handle || "");
      } finally {
        if (!cancelled) setReady(true);
      }
    };

    void loadProfile();
    return () => {
      cancelled = true;
    };
  }, [user?.id, userLoading, setValue]);

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

  if (userLoading || !ready) {
    return <BecomeTrainerSkeleton />;
  }

  return (
    <div className={fyte.page}>
      <PageHero
        photo="connect"
        kicker="Trainers"
        title="Get booked."
        subtitle="Your name, photo, rate and Instagram on the Trainers page, with a book-a-session form. Edit any time."
      />
      <div className={cn(fyte.content, "grid gap-6 lg:grid-cols-[1fr_1.6fr]")}>
          <aside className={cn(fyte.card, "h-fit lg:sticky lg:top-28")}>
            <p className={fyte.kicker}>What people see</p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-fyte-muted">
              {[
                "Your name, photo, and bio on the Trainers page.",
                "A book-a-session form on your profile.",
                "An Instagram button if you add your handle.",
                "Your hourly rate, so nobody has to ask.",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-fyte-ink" />
                  {item}
                </li>
              ))}
            </ul>
          </aside>

          <form onSubmit={handleSubmit(onSubmit)} className={cn(fyte.card, "p-6 sm:p-8")}>
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
                <label className="text-sm font-semibold text-fyte-ink">Full name</label>
                <input
                  {...register("full_name")}
                  className={INPUT}
                />
                {errors.full_name ? (
                  <p className="mt-1 text-xs font-medium text-fyte-danger">{errors.full_name.message}</p>
                ) : null}
              </div>

              <div>
                <label className="text-sm font-semibold text-fyte-ink">Years of experience</label>
                <input
                  type="number"
                  min={0}
                  {...register("experience_years")}
                  className={INPUT}
                />
                {errors.experience_years ? (
                  <p className="mt-1 text-xs font-medium text-fyte-danger">{errors.experience_years.message}</p>
                ) : null}
              </div>

              <div className="sm:col-span-2">
                <label className="text-sm font-semibold text-fyte-ink">Bio</label>
                <textarea
                  {...register("bio")}
                  rows={4}
                  className={cn(INPUT, "h-auto py-3")}
                />
                {errors.bio ? <p className="mt-1 text-xs font-medium text-fyte-danger">{errors.bio.message}</p> : null}
              </div>

              <div>
                <label className="text-sm font-semibold text-fyte-ink">Hourly rate (Rs)</label>
                <input
                  type="number"
                  min={0}
                  {...register("hourly_rate")}
                  className={INPUT}
                />
                {errors.hourly_rate ? (
                  <p className="mt-1 text-xs font-medium text-fyte-danger">{errors.hourly_rate.message}</p>
                ) : null}
              </div>

              <div>
                <label className="text-sm font-semibold text-fyte-ink">Instagram</label>
                <input
                  {...register("instagram_handle")}
                  placeholder="@yourname"
                  className={INPUT}
                />
                <p className="mt-1 text-xs text-fyte-muted">
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
              <label className="text-sm font-semibold text-fyte-ink">Expertise</label>
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
                  className={INPUT}
                />
                <button
                  type="button"
                  onClick={() => addExpertise(tagDraft)}
                  className={cn(fyte.secondary, "h-12 w-auto shrink-0")}
                >
                  Add
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {expertise.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-2 rounded-full bg-fyte-panel px-3 py-1 text-xs font-medium text-fyte-ink"
                  >
                    {tag}
                    <button type="button" onClick={() => removeExpertise(tag)} className="text-fyte-muted hover:text-fyte-ink">
                      Remove
                    </button>
                  </span>
                ))}
              </div>
              {errors.expertise ? (
                <p className="mt-1 text-xs font-medium text-fyte-danger">{errors.expertise.message}</p>
              ) : null}
            </div>

            {submitError ? (
              <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-fyte-danger">
                {submitError}
              </p>
            ) : null}

            <button type="submit" disabled={isSubmitting} className={`${fyte.primary} mt-8`}>
              {isSubmitting ? "Saving…" : "Save trainer profile"}
            </button>
          </form>
      </div>
    </div>
  );
}
