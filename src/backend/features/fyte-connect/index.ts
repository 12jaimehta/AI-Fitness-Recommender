import { createServerSupabase, getOptionalUser, requireUser } from "@backend/shared/api/supabase";
import { ApiError } from "@backend/shared/lib/errors";
import type { Creator, CreatorPlan, Trainer } from "@/shared/types";
import { trainerSchema, type TrainerFormData } from "@/shared/validation/becometrainer";

export async function getMarketplace() {
  const supabase = await createServerSupabase();
  const { data: trainers } = await supabase.from("trainer_profiles").select("*").limit(48);
  return {
    trainers: (trainers || []) as Trainer[],
  };
}

export async function getCreator(id: string) {
  const supabase = await createServerSupabase();
  const { data: creator } = await supabase.from("creators").select("*").eq("id", id).maybeSingle();
  const { data: plans } = await supabase
    .from("creator_plans")
    .select("*")
    .eq("creator_id", id)
    .order("created_at", { ascending: false });
  return {
    creator: creator as Creator | null,
    plans: (plans || []) as CreatorPlan[],
  };
}

export async function getTrainer(id: string) {
  const supabase = await createServerSupabase();
  const { data } = await supabase.from("trainer_profiles").select("*").eq("id", id).maybeSingle();
  return data as Trainer | null;
}

export async function getOwnTrainerProfile() {
  const { supabase, user } = await requireUser();
  const { data } = await supabase.from("trainer_profiles").select("*").eq("id", user.id).maybeSingle();
  return data as Trainer | null;
}

export async function upsertTrainerProfile(vals: TrainerFormData) {
  const { supabase, user } = await requireUser();
  const parsed = trainerSchema.safeParse(vals);
  if (!parsed.success) {
    throw new ApiError(parsed.error.issues[0]?.message || "Invalid trainer profile", 400);
  }

  const { data, error } = await supabase
    .from("trainer_profiles")
    .upsert({
      id: user.id,
      full_name: parsed.data.full_name,
      bio: parsed.data.bio,
      experience_years: parsed.data.experience_years,
      hourly_rate: parsed.data.hourly_rate,
      expertise: parsed.data.expertise,
      avatar_url: parsed.data.avatar_url,
      instagram_handle: parsed.data.instagram_handle,
    })
    .select()
    .single();
  if (error) throw new ApiError(error.message, 400);
  return data as Trainer;
}

export async function createBooking(input: { trainerId: string; sessionDate: string; notes?: string | null }) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("trainer_bookings").insert({
    user_id: user.id,
    trainer_id: input.trainerId,
    session_date: input.sessionDate,
    notes: input.notes || null,
  });
  if (error) throw new ApiError(error.message, 400);
}

export async function getPlan(planId: string) {
  const { supabase, user } = await getOptionalUser();
  const { data } = await supabase
    .from("creator_plans")
    .select(
      `
      id, title, description, price, duration_weeks, difficulty, cover_image, creator_id,
      creators ( id, full_name, instagram_handle )
    `
    )
    .eq("id", planId)
    .maybeSingle();

  const raw = data as
    | (CreatorPlan & {
        creators:
          | { id: string; full_name: string; instagram_handle?: string | null }
          | { id: string; full_name: string; instagram_handle?: string | null }[]
          | null;
      })
    | null;

  const plan = raw
    ? {
        ...raw,
        creators: Array.isArray(raw.creators) ? raw.creators[0] ?? null : raw.creators,
      }
    : null;

  let alreadyOwned = false;
  if (user && plan) {
    const { data: existing } = await supabase
      .from("plan_purchases")
      .select("id")
      .eq("user_id", user.id)
      .eq("plan_id", planId)
      .maybeSingle();
    alreadyOwned = Boolean(existing);
  }

  return { plan, alreadyOwned };
}

export async function purchasePlan(planId: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("plan_purchases").insert({
    user_id: user.id,
    plan_id: planId,
  });
  if (error) throw new ApiError(error.message, 400);
}

export async function listRatings(targetType: string, targetId: string) {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("ratings")
    .select(
      `
      id, user_id, rating, review, created_at,
      user_profiles ( full_name )
    `
    )
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .order("created_at", { ascending: false });

  if (error) throw new ApiError(error.message, 400);
  return data || [];
}

export async function createRating(input: {
  targetType: string;
  targetId: string;
  rating: number;
  review?: string | null;
}) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("ratings").insert({
    user_id: user.id,
    target_type: input.targetType,
    target_id: input.targetId,
    rating: input.rating,
    review: input.review || null,
  });
  if (error) throw new ApiError(error.message, 400);
}
