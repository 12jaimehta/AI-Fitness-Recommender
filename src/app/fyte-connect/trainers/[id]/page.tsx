"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/supabase-client";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock, User, Dumbbell } from "lucide-react";
import RatingReview from "@/components/fyte-connect/RatingReview";
import { useCurrentUser } from "@/lib/hooks/use-current-user";

interface TrainerProfile {
  id: string;
  full_name: string | null;
  bio: string | null;
  expertise: string[] | null;
  experience_years: number | null;
  hourly_rate: number | null;
  is_verified: boolean;
}

export default function TrainerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const { isSignedIn, user } = useCurrentUser();

  const trainerId = params?.id as string;
  const [trainer, setTrainer] = useState<TrainerProfile | null>(null);
  const [sessionDate, setSessionDate] = useState("");
  const [notes, setNotes] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    if (!trainerId) return;
    const loadTrainer = async () => {
      const { data } = await supabase
        .from("trainer_profiles")
        .select("*")
        .eq("id", trainerId)
        .single();
      setTrainer(data as any);
    };
    loadTrainer();
  }, [trainerId]);

  const handleBook = async () => {
    if (!isSignedIn || !user || !trainer) return;
    if (!sessionDate) return;

    setBookingLoading(true);
    await supabase.from("trainer_bookings").insert({
      user_id: user.id,
      trainer_id: trainer.id,
      session_date: sessionDate,
      notes: notes.trim() || null,
    });
    setBookingLoading(false);
    setNotes("");
    setSessionDate("");
    // You can add toast / message success here
  };

  if (!trainer) {
    return (
      <div className="min-h-screen bg-[#0f1c2f] flex items-center justify-center text-white">
        Loading trainer...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1c2f] text-white pb-20">
      <div className="max-w-[1200px] mx-auto px-6 pt-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="grid md:grid-cols-[2fr,1.5fr] gap-10">
          {/* Left - Trainer Info */}
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-[#162a41] flex items-center justify-center text-2xl font-bold shadow-lg">
                {(trainer.full_name || "T").charAt(0)}
              </div>
              <div>
                <h1 className="text-3xl font-extrabold flex items-center gap-2">
                  {trainer.full_name || "Trainer"}
                  {trainer.is_verified && (
                    <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-full">
                      Verified
                    </span>
                  )}
                </h1>
                <p className="text-sm text-white/60 mt-1">
                  {trainer.experience_years
                    ? `${trainer.experience_years}+ years experience`
                    : "Experienced fitness coach"}
                </p>
              </div>
            </div>

            {trainer.bio && (
              <p className="text-sm text-white/80 leading-relaxed mb-4">
                {trainer.bio}
              </p>
            )}

            {trainer.expertise && trainer.expertise.length > 0 && (
              <div className="mb-6">
                <p className="text-xs uppercase tracking-wide text-white/60 mb-2">
                  Expertise
                </p>
                <div className="flex flex-wrap gap-2">
                  {trainer.expertise.map((ex) => (
                    <span
                      key={ex}
                      className="text-xs bg-white/10 border border-white/10 px-3 py-1 rounded-full flex items-center gap-1"
                    >
                      <Dumbbell className="w-3 h-3" />
                      {ex}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <RatingReview targetType="trainer" targetId={trainer.id} />
          </div>

          {/* Right - Booking Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl"
          >
            <p className="text-sm font-semibold mb-1">Book a 1:1 Session</p>
            <p className="text-xs text-white/60 mb-4">
              Choose your preferred date & time and share any goals.
            </p>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-white/60" />
                <span>Duration: 60 min</span>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs text-white/70 mb-1 block">
                Session date & time
              </label>
              <input
                type="datetime-local"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="w-full bg-[#0f1c2f] border border-white/15 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#162a41]/60"
              />
            </div>

            <div className="mb-4">
              <label className="text-xs text-white/70 mb-1 block">
                Notes / goals (optional)
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#0f1c2f] border border-white/15 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#162a41]/60"
                placeholder="e.g. I want a fat-loss + muscle gain focused plan."
              />
            </div>

            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-white/70">Hourly rate</p>
              <p className="text-lg font-bold">
                {trainer.hourly_rate ? `₹${trainer.hourly_rate}` : "Custom"}
              </p>
            </div>

            {isSignedIn ? (
              <button
                disabled={bookingLoading || !sessionDate}
                onClick={handleBook}
                className={`w-full rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 transition
                  ${
                    !sessionDate || bookingLoading
                      ? "bg-white/10 text-white/40 cursor-not-allowed"
                      : "bg-[#162a41] hover:bg-[#1d3b61]"
                  }`}
              >
                {bookingLoading ? "Booking..." : "Book Session"}
                <Calendar className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => router.push("/sign-in")}
                className="w-full rounded-xl py-3 text-sm font-semibold bg-[#162a41] hover:bg-[#1d3b61] flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4" />
                Login to book
              </button>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
