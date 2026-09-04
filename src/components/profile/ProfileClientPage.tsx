"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserProfile, updateUserProfile } from "@/lib/service/progress-database";
import { useUser } from "@/lib/hooks/use-user";
import { ProfileSkeleton } from "@/components/ui/Skeleton";
import PageHero from "@/components/shared/PageHero";
import FormInput from "@/components/shared/FormInput";
import FormSelect from "@/components/shared/FormSelect";
import OptionChipGrid from "@/components/shared/OptionChipGrid";
import { fitnessLevelOptions } from "@/lib/constant";
import { PROGRAM_GOAL_OPTIONS, programGoalLabel } from "@/shared/lib/program-goals";
import { profileSetupSchema } from "@/lib/validation/profileSchema";
import { isProfileComplete } from "@/shared/lib/profile";
import { fyte } from "@/shared/lib/ui";
import { cn } from "@/lib/utils";
import type { UserProfile } from "@/shared/types";

const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const FITNESS = fitnessLevelOptions.filter((item) => item.value);

const emptyForm = {
  full_name: "",
  age: "",
  gender: "",
  height: "",
  initial_weight: "",
  fitness_level: "",
  goals: [] as string[],
};

type FormState = typeof emptyForm;

function fromProfile(profile: UserProfile | null, emailName: string): FormState {
  return {
    full_name: profile?.full_name || emailName,
    age: profile?.age != null ? String(profile.age) : "",
    gender: profile?.gender || "",
    height: profile?.height != null ? String(profile.height) : "",
    initial_weight: profile?.initial_weight != null ? String(profile.initial_weight) : "",
    fitness_level: profile?.fitness_level || "",
    goals: Array.isArray(profile?.goals) ? profile.goals : [],
  };
}

export default function ProfileClientPage() {
  const router = useRouter();
  const { user, isSignedIn, isLoading: userLoading } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const complete = isProfileComplete(profile);
  const showForm = !complete || editing;

  useEffect(() => {
    if (userLoading) return;
    if (!isSignedIn || !user) {
      setLoading(false);
      return;
    }
    getUserProfile()
      .then((data) => {
        setProfile(data);
        setForm(fromProfile(data, user.user_metadata?.full_name || ""));
        setEditing(!isProfileComplete(data));
      })
      .catch(() => {
        setForm(fromProfile(null, user.user_metadata?.full_name || ""));
        setEditing(true);
      })
      .finally(() => setLoading(false));
  }, [isSignedIn, user, userLoading]);

  const setField = (name: keyof FormState, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    const parsed = profileSetupSchema.safeParse(form);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] || "form");
        if (!next[key]) next[key] = issue.message;
      }
      setFieldErrors(next);
      return;
    }
    setFieldErrors({});
    setSaving(true);
    try {
      const saved = await updateUserProfile({ ...parsed.data, profile_completed: true });
      setProfile(saved);
      setForm(fromProfile(saved, ""));
      setEditing(false);
      router.push("/progress");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  };

  if (userLoading || loading) return <ProfileSkeleton />;

  const name = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "You";
  const email = user?.email || profile?.email || "";

  return (
    <div className={fyte.page}>
      <PageHero
        photo="profile"
        kicker="Account"
        title={complete ? name : "Finish your profile"}
        subtitle={
          complete
            ? "These numbers feed every plan and every coach decision. Keep them current."
            : "One minute. Your plans need your age, height, weight, and goal to be right."
        }
        aside={
          <div className={cn(fyte.stat, "flex items-center gap-4 lg:w-80")}>
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-xl font-extrabold text-fyte-ink">
              {name.charAt(0).toUpperCase()}
            </span>
            <span className="min-w-0">
              <span className="block truncate font-bold">{name}</span>
              <span className="block truncate text-sm text-white/70">{email}</span>
            </span>
          </div>
        }
      />

      <div className="relative z-10 mx-auto -mt-10 max-w-3xl px-4 pb-20 sm:px-6">
        {showForm ? (
          <form onSubmit={handleSave} className={cn(fyte.card, "p-6 sm:p-8")}>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <FormInput label="Full name" placeholder="Your name" value={form.full_name} onChange={(v) => setField("full_name", v)} error={fieldErrors.full_name} required />
              </div>
              <FormInput label="Age" type="number" placeholder="28" value={form.age} onChange={(v) => setField("age", v)} error={fieldErrors.age} required />
              <FormSelect label="Sex" compact columns={3} value={form.gender} onChange={(v) => setField("gender", v)} options={GENDERS} error={fieldErrors.gender} required />
              <FormInput label="Height (cm)" type="number" placeholder="175" value={form.height} onChange={(v) => setField("height", v)} error={fieldErrors.height} required />
              <FormInput label="Weight (kg)" type="number" placeholder="72" value={form.initial_weight} onChange={(v) => setField("initial_weight", v)} error={fieldErrors.initial_weight} required />
              <div className="sm:col-span-2">
                <FormSelect label="Training experience" compact columns={3} value={form.fitness_level} onChange={(v) => setField("fitness_level", v)} options={FITNESS} error={fieldErrors.fitness_level} required />
              </div>
            </div>

            <div className="mt-6">
              <OptionChipGrid
                label="Goals"
                options={PROGRAM_GOAL_OPTIONS}
                selected={form.goals}
                onToggle={(value) =>
                  setField("goals", form.goals.includes(value) ? form.goals.filter((item) => item !== value) : [...form.goals, value])
                }
                error={fieldErrors.goals}
              />
            </div>

            {error ? <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-fyte-danger">{error}</p> : null}

            <div className="mt-8 flex flex-wrap gap-3">
              <button type="submit" disabled={saving} className={fyte.primary}>
                {saving ? "Saving…" : complete ? "Save changes" : "Save and continue"}
              </button>
              {complete ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setForm(fromProfile(profile, ""));
                    setFieldErrors({});
                  }}
                  className={fyte.ghost}
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        ) : (
          <div className={cn(fyte.card, "p-6 sm:p-8")}>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3">
              {[
                ["Age", profile?.age ?? "-"],
                ["Sex", profile?.gender || "-"],
                ["Height", profile?.height ? `${profile.height} cm` : "-"],
                ["Weight", profile?.initial_weight ? `${profile.initial_weight} kg` : "-"],
                ["Experience", profile?.fitness_level || "-"],
                ["Goal", (profile?.goals || []).length ? profile!.goals!.map((g) => programGoalLabel(g)).join(", ") : "-"],
              ].map(([label, value]) => (
                <div key={String(label)}>
                  <dt className={fyte.kicker}>{label}</dt>
                  <dd className="mt-1 text-lg font-bold capitalize text-fyte-ink">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-8 flex flex-wrap gap-3 border-t border-fyte-line pt-6">
              <button type="button" onClick={() => setEditing(true)} className={fyte.secondary}>
                Edit profile
              </button>
              <button type="button" onClick={() => router.push("/progress")} className={fyte.ghost}>
                Back to coach
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
