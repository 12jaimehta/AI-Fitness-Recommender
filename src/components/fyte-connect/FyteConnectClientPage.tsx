"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { UserPlus, Users } from "lucide-react";
import { getMarketplace } from "@frontend/features/fyte-connect";
import type { Trainer } from "@/shared/types";
import PageBreadcrumb from "@/components/shared/PageBreadcrumb";
import InstagramLink from "@/components/fyte-connect/InstagramLink";

export default function FyteConnectClientPage() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getMarketplace()
      .then((data) => {
        setTrainers(data.trainers || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const q = search.trim().toLowerCase().replace(/^@/, "");
  const filteredTrainers = useMemo(() => {
    if (!q) return trainers;
    return trainers.filter((trainer) => {
      const handle = (trainer.instagram_handle || "").toLowerCase();
      return (
        trainer.full_name?.toLowerCase().includes(q) ||
        trainer.bio?.toLowerCase().includes(q) ||
        handle.includes(q) ||
        trainer.expertise?.some((item) => item.toLowerCase().includes(q))
      );
    });
  }, [trainers, q]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <PageBreadcrumb items={[{ label: "Home" }, { label: "Trainers" }]} />

        <header className="mb-8 border-b border-gray-200 pb-6">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Trainers</h1>
          <p className="mt-2 text-gray-600">Hire a trainer, or list yourself so people can book you.</p>
        </header>

        <section className="mb-10 grid gap-4 sm:grid-cols-2">
          <a
            href="#hire"
            className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 transition hover:border-[#282828]"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#282828] text-white">
              <Users size={20} />
            </div>
            <h2 className="text-lg font-semibold text-[#282828]">Hire a trainer</h2>
            <p className="mt-2 flex-1 text-sm leading-6 text-gray-600">
              Browse trainers, open Instagram, and book a session.
            </p>
            <span className="mt-5 inline-flex w-fit items-center justify-center rounded-xl bg-[#282828] px-5 py-2.5 text-sm font-semibold text-white">
              Hire a trainer
            </span>
          </a>
          <Link
            href="/fyte-connect/become-trainer"
            className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 transition hover:border-[#282828]"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#282828] text-white">
              <UserPlus size={20} />
            </div>
            <h2 className="text-lg font-semibold text-[#282828]">Become a trainer</h2>
            <p className="mt-2 flex-1 text-sm leading-6 text-gray-600">
              Add your profile, rate, Instagram, and expertise so people can hire you.
            </p>
            <span className="mt-5 inline-flex w-fit items-center justify-center rounded-xl border-2 border-[#282828] bg-white px-5 py-2.5 text-sm font-semibold text-[#282828] transition hover:bg-[#282828] hover:text-white">
              Become a trainer
            </span>
          </Link>
        </section>

        <section id="hire" className="scroll-mt-24">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-[#282828]">Hire a trainer</h2>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, skill, or Instagram"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#282828] outline-none focus:border-[#282828] sm:max-w-md"
            />
          </div>

          {loading ? (
            <p className="text-gray-600">Loading...</p>
          ) : filteredTrainers.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTrainers.map((trainer) => (
                <article
                  key={trainer.id}
                  className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-[#282828] text-sm font-semibold text-white">
                    {trainer.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={trainer.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      (trainer.full_name || "T").charAt(0)
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-[#282828]">
                    {trainer.full_name || "Trainer"}
                    {trainer.is_verified ? (
                      <span className="ml-2 text-xs font-medium text-gray-500">Verified</span>
                    ) : null}
                  </h3>
                  <p className="mt-2 line-clamp-2 flex-1 text-sm text-gray-600">
                    {trainer.bio || "Personal trainer."}
                  </p>
                  {trainer.hourly_rate ? (
                    <p className="mt-2 text-sm text-gray-500">Rs {trainer.hourly_rate} / hour</p>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(trainer.expertise || []).slice(0, 3).map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-gray-200 px-2.5 py-1 text-xs text-gray-600"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link
                      href={`/fyte-connect/trainers/${trainer.id}`}
                      className="inline-flex items-center rounded-xl bg-[#282828] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#454545]"
                    >
                      Hire
                    </Link>
                    <InstagramLink handle={trainer.instagram_handle} compact />
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-gray-200 bg-white px-5 py-8 text-sm text-gray-600">
              {q ? "No trainers match that search." : "No trainers yet. Become the first."}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
