// app/trips/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getTripFromFirestore } from "@/lib/firebase/trip";
import { type TripResponse } from "@/lib/api-client";

type Trip = NonNullable<TripResponse["trip"]>;

export default function TripDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const data = await getTripFromFirestore(id as string);
        if (data) {
          setTrip(data as Trip);
        } else {
          router.push("/trips");
        }
      } catch {
        router.push("/trips");
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [id, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <div className="text-neutral-400 animate-pulse text-lg">
          Loading your trip...
        </div>
      </main>
    );
  }

  if (!trip) return null;

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-4 py-10">
      <div className="max-w-4xl mx-auto pb-20">
        {/* BACK BUTTON */}
        <button
          onClick={() => router.push("/trips")}
          className="mb-8 flex items-center gap-2 text-neutral-400 hover:text-white transition text-sm"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to My Trips
        </button>

        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-6 md:p-10 shadow-2xl overflow-hidden relative">
          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
            <div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
                {trip.tripTitle}
              </h2>
              <div className="flex items-center gap-4 mt-2 text-neutral-400 text-sm">
                <span className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {trip.destination}
                </span>
                <span className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {trip.duration}
                </span>
              </div>
            </div>
            <button
              onClick={() => window.print()}
              className="self-start md:self-center px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition border border-white/10 flex items-center gap-2 text-sm font-medium"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download PDF
            </button>
          </div>

          {/* ITINERARY DAYS */}
          <div className="grid gap-12">
            {trip.itinerary.map((day) => (
              <div key={day.day} className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center font-bold text-xl shadow-lg">
                    {day.day}
                  </div>
                  <h3 className="text-xl font-semibold">
                    Day {day.day}: {day.theme}
                  </h3>
                </div>

                <div className="grid gap-4 pl-16">
                  {day.activities.map((act, idx: number) => (
                    <div
                      key={idx}
                      className="group rounded-2xl border border-white/5 bg-white/5 p-5 hover:bg-white/[0.08] transition duration-300"
                    >
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 bg-white/5 px-2 py-1 rounded">
                        {act.time}
                      </span>
                      <h4 className="font-semibold text-lg text-white mt-2">
                        {act.activity}
                      </h4>
                      <p className="text-neutral-400 text-sm mt-1 leading-relaxed">
                        {act.description}
                      </p>
                    </div>
                  ))}

                  <div className="mt-4 rounded-2xl border border-white/5 bg-white/5 p-5">
                    <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-neutral-300 uppercase tracking-wider">
                      🍽️ Food Recommendations
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {day.food.map((item: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-sm text-neutral-400"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* BUDGET + TIPS */}
          <div className="mt-20 grid md:grid-cols-2 gap-8 border-t border-white/10 pt-12">
            <div className="space-y-4">
              <h3 className="text-xl font-bold">💰 Budget Breakdown</h3>
              <div className="rounded-2xl bg-white/5 border border-white/5 p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Total Estimate</span>
                  <span className="text-xl font-bold">
                    {trip.budgetBreakdown.total}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Daily Average</span>
                  <span className="font-semibold text-neutral-300">
                    {trip.budgetBreakdown.daily}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold">💡 Travel Tips</h3>
              <ul className="grid gap-3">
                {trip.travelTips.map((tip: string, idx: number) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 text-neutral-400 text-sm"
                  >
                    <svg
                      className="w-4 h-4 mt-0.5 text-neutral-500 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
