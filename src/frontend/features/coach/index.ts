import { api } from "@frontend/shared/api/http";
import { clampIsoDateToToday, localIsoDate } from "@/shared/lib/plan-tracking";
import { cachedQuery, invalidateQueryCache, setQueryCache } from "@frontend/shared/lib/query-cache";
import type { CoachInterviewView, CoachToday } from "@/shared/types/coach";

function key(date: string) {
  return `coach:${date}`;
}

function bust(date: string) {
  invalidateQueryCache(key(date));
}

export function seedCoachToday(date: string, data: CoachToday) {
  setQueryCache(key(date), data, 20_000);
}

export async function getCoachToday(date = localIsoDate()) {
  const day = clampIsoDateToToday(date);
  return cachedQuery(key(day), async () => {
    const { data } = await api<{ data: CoachToday }>(`/api/coach/today?date=${day}`);
    return data;
  }, 20_000);
}

export async function coachCheckin(body: Record<string, unknown>, date = localIsoDate()) {
  const { data } = await api<{ data: { board: CoachToday; note: string } }>("/api/coach/checkin", {
    method: "POST",
    body: JSON.stringify({ ...body, date }),
  });
  bust(date);
  seedCoachToday(date, data.board);
  return data;
}

export async function startCoachInterview(body: Record<string, unknown>, date = localIsoDate()) {
  const { data } = await api<{ data: CoachInterviewView }>("/api/coach/interview", {
    method: "POST",
    body: JSON.stringify({ ...body, date }),
  });
  bust(date);
  return data;
}

export async function answerCoachInterview(interview_id: string, question_id: string, value: string) {
  const { data } = await api<{ data: CoachInterviewView }>("/api/coach/interview/answer", {
    method: "POST",
    body: JSON.stringify({ interview_id, question_id, value }),
  });
  return data;
}

export async function completeCoachInterview(interview_id: string, option_id?: string, date = localIsoDate()) {
  const { data } = await api<{ data: { board: CoachToday; note: string } }>("/api/coach/interview/complete", {
    method: "POST",
    body: JSON.stringify({ interview_id, option_id }),
  });
  bust(date);
  seedCoachToday(date, data.board);
  return data;
}
