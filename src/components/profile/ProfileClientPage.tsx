"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserProfile, updateUserProfile } from "@/lib/service/progress-database";
import { useUser } from "@/lib/hooks/use-user";
import PageBreadcrumb from "@/components/shared/PageBreadcrumb";
import PageLoader from "@/components/ui/PageLoader";
import OptionChipGrid from "@/components/shared/OptionChipGrid";
import { fitnessLevelOptions } from "@/lib/constant";
import { PROGRAM_GOAL_OPTIONS } from "@/shared/lib/program-goals";
import { profileSetupSchema } from "@/lib/validation/profileSchema";
import { isProfileComplete } from "@/shared/lib/profile";
import type { UserProfile } from "@/shared/types";

const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const FITNESS = fitnessLevelOptions.filter((item) => item.value);
const GOALS = PROGRAM_GOAL_OPTIONS;

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
    const parsed = profileSetupSchema.safeParse({
      full_name: form.full_name,
      age: form.age,
      gender: form.gender,
      height: form.height,
      initial_weight: form.initial_weight,
      fitness_level: form.fitness_level,
      goals: form.goals,
    });
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
      const saved = await updateUserProfile({
        full_name: parsed.data.full_name,
        age: parsed.data.age,
        gender: parsed.data.gender,
        height: parsed.data.height,
        initial_weight: parsed.data.initial_weight,
        fitness_level: parsed.data.fitness_level,
        goals: parsed.data.goals,
        profile_completed: true,
      });
      setProfile(saved);
      setForm(fromProfile(saved, ""));
      setEditing(false);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  };

  if (userLoading || loading) {
    return <PageLoader />;
  }

  const inputClass =
    "mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#282828]";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <PageBreadcrumb items={[{ label: "Home" }, { label: "My profile" }]} />

        <header className="mb-8 border-b border-gray-200 pb-6">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">My profile</h1>
          <p className="mt-2 text-gray-600">
            {complete
              ? "Your details for diet, workout, and progress."
              : "Add these details to use diet, workout, progress, and trainers."}
          </p>
        </header>

        {!complete ? (
          <p className="mb-6 rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm text-gray-700">
            You signed in with a magic link. Fill this once so your plans can use your age, height, weight, and goals.
          </p>
        ) : null}

        {showForm ? (
          <form onSubmit={handleSave} className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-sm font-semibold text-[#282828]">Email</label>
                <input value={user?.email || profile?.email || ""} disabled className={`${inputClass} bg-gray-50 text-gray-500`} />
              </div>
              <div>
                <label className="text-sm font-semibold text-[#282828]">Full name</label>
                <input
                  value={form.full_name}
                  onChange={(event) => setField("full_name", event.target.value)}
                  className={inputClass}
                />
                {fieldErrors.full_name ? <p className="mt-1 text-xs text-red-600">{fieldErrors.full_name}</p> : null}
              </div>
              <div>
                <label className="text-sm font-semibold text-[#282828]">Age</label>
                <input
                  type="number"
                  min={13}
                  max={100}
                  value={form.age}
                  onChange={(event) => setField("age", event.target.value)}
                  className={inputClass}
                />
                {fieldErrors.age ? <p className="mt-1 text-xs text-red-600">{fieldErrors.age}</p> : null}
              </div>
              <div>
                <label className="text-sm font-semibold text-[#282828]">Gender</label>
                <select
                  value={form.gender}
                  onChange={(event) => setField("gender", event.target.value)}
                  className={inputClass}
                >
                  <option value="">Select gender</option>
                  {GENDERS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
                {fieldErrors.gender ? <p className="mt-1 text-xs text-red-600">{fieldErrors.gender}</p> : null}
              </div>
              <div>
                <label className="text-sm font-semibold text-[#282828]">Fitness level</label>
                <select
                  value={form.fitness_level}
                  onChange={(event) => setField("fitness_level", event.target.value)}
                  className={inputClass}
                >
                  <option value="">Select level</option>
                  {FITNESS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
                {fieldErrors.fitness_level ? (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.fitness_level}</p>
                ) : null}
              </div>
              <div>
                <label className="text-sm font-semibold text-[#282828]">Height (cm)</label>
                <input
                  type="number"
                  min={100}
                  max={250}
                  step="0.1"
                  value={form.height}
                  onChange={(event) => setField("height", event.target.value)}
                  className={inputClass}
                />
                {fieldErrors.height ? <p className="mt-1 text-xs text-red-600">{fieldErrors.height}</p> : null}
              </div>
              <div>
                <label className="text-sm font-semibold text-[#282828]">Weight (kg)</label>
                <input
                  type="number"
                  min={30}
                  max={400}
                  step="0.1"
                  value={form.initial_weight}
                  onChange={(event) => setField("initial_weight", event.target.value)}
                  className={inputClass}
                />
                {fieldErrors.initial_weight ? (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.initial_weight}</p>
                ) : null}
              </div>
            </div>

            <div className="mt-6">
              <OptionChipGrid
                label="Goals"
                options={GOALS}
                selected={form.goals}
                onToggle={(value) =>
                  setField(
                    "goals",
                    form.goals.includes(value) ? form.goals.filter((item) => item !== value) : [...form.goals, value]
                  )
                }
                error={fieldErrors.goals}
              />
            </div>

            {error ? (
              <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-[#282828] px-5 py-3 text-sm font-semibold text-white hover:bg-[#454545] disabled:opacity-60"
              >
                {saving ? "Saving..." : complete ? "Save changes" : "Save and continue"}
              </button>
              {complete ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setForm(fromProfile(profile, ""));
                    setFieldErrors({});
                  }}
                  className="rounded-xl border-2 border-[#282828] px-5 py-3 text-sm font-semibold text-[#282828] hover:bg-[#282828] hover:text-white"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-gray-500">Email</dt>
                <dd className="mt-1 font-semibold text-[#282828]">{user?.email || profile?.email}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Full name</dt>
                <dd className="mt-1 font-semibold text-[#282828]">{profile?.full_name || "-"}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Age</dt>
                <dd className="mt-1 font-semibold text-[#282828]">{profile?.age ?? "-"}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Gender</dt>
                <dd className="mt-1 font-semibold text-[#282828]">{profile?.gender || "-"}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Height</dt>
                <dd className="mt-1 font-semibold text-[#282828]">{profile?.height ? `${profile.height} cm` : "-"}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Weight</dt>
                <dd className="mt-1 font-semibold text-[#282828]">
                  {profile?.initial_weight ? `${profile.initial_weight} kg` : "-"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Fitness level</dt>
                <dd className="mt-1 font-semibold text-[#282828]">{profile?.fitness_level || "-"}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Goals</dt>
                <dd className="mt-1 font-semibold text-[#282828]">
                  {(profile?.goals || []).length ? profile?.goals?.join(", ") : "-"}
                </dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="mt-6 rounded-xl border-2 border-[#282828] bg-white px-5 py-2.5 text-sm font-semibold text-[#282828] transition hover:bg-[#282828] hover:text-white"
            >
              Edit profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
