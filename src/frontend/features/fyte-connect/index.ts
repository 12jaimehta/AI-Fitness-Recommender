import { api } from "@frontend/shared/api/http";
import type { Creator, CreatorPlan, Trainer } from "@/shared/types";
import type { TrainerFormData } from "@/shared/validation/becometrainer";

export async function getMarketplace() {
  return api<{ trainers: Trainer[] }>("/api/connect/marketplace");
}

export async function getCreator(id: string) {
  return api<{ creator: Creator | null; plans: CreatorPlan[] }>(`/api/connect/creators/${id}`);
}

export async function getTrainer(id: string) {
  const { data } = await api<{ data: Trainer | null }>(`/api/connect/trainers/${id}`);
  return data;
}

export async function getOwnTrainerProfile() {
  const { data } = await api<{ data: Trainer | null }>("/api/connect/trainers");
  return data;
}

export async function upsertTrainerProfile(vals: TrainerFormData) {
  const { data } = await api<{ data: Trainer }>("/api/connect/trainers", {
    method: "POST",
    body: JSON.stringify(vals),
  });
  return data;
}

export async function createBooking(input: {
  trainerId: string;
  sessionDate: string;
  notes?: string | null;
}) {
  await api("/api/connect/bookings", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getPlan(planId: string) {
  return api<{
    plan: (CreatorPlan & {
      creators: { id: string; full_name: string; instagram_handle?: string | null } | null;
    }) | null;
    alreadyOwned: boolean;
  }>(`/api/connect/plans/${planId}`);
}

export async function purchasePlan(planId: string) {
  await api("/api/connect/purchases", {
    method: "POST",
    body: JSON.stringify({ planId }),
  });
}

export async function listRatings(targetType: string, targetId: string) {
  const { data } = await api<{ data: unknown[] }>(
    `/api/connect/ratings?targetType=${targetType}&targetId=${targetId}`
  );
  return data;
}

export async function createRating(input: {
  targetType: string;
  targetId: string;
  rating: number;
  review?: string | null;
}) {
  await api("/api/connect/ratings", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
