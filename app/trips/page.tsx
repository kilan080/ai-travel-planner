// app/trips/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { getUserTrips, deleteTripFromFirestore } from "@/lib/firebase/trip";
import toast, { Toaster } from "react-hot-toast";

interface Trip {
  id: string;
  tripTitle: string;
  destination: string;
  duration: string;
  budgetBreakdown: { total: string; daily: string };
  travelTips: string[];
  createdAt?: { seconds: number };
}

export default function TripsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    // Wait a moment for auth to hydrate before redirecting
    const timeout = setTimeout(() => {
      if (!user) router.push("/generate");
    }, 500);
    return () => clearTimeout(timeout);
  }, [user, router]);

  useEffect(() => {
    if (!user) return;
    const fetchTrips = async () => {
      try {
        const data = await getUserTrips(user.uid);
        setTrips(data as Trip[]);
      } catch {
        toast.error("Failed to load trips");
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, [user]);

  const handleDelete = async (tripId: string) => {
    if (!confirm("Delete this trip?")) return;
    try {
      setDeletingId(tripId);
      await deleteTripFromFirestore(tripId);
      setTrips((prev) => prev.filter((t) => t.id !== tripId));
      toast.success("Trip deleted");
    } catch {
      toast.error("Failed to delete trip");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (trip: Trip) => {
    if (!trip.createdAt?.seconds) return null;
    return new Date(trip.createdAt.seconds * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <div className="text-neutral-400 animate-pulse text-lg">
          Loading your trips...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-4 py-10">
      <Toaster position="top-center" />

      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">My Trips</h1>
            <p className="text-neutral-400 mt-1 text-sm">
              {trips.length} {trips.length === 1 ? "trip" : "trips"} saved
            </p>
          </div>
          <Link
            href="/generate"
            className="px-5 py-2.5 rounded-xl bg-white text-black text-sm font-medium hover:opacity-90 transition flex items-center gap-2"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Trip
          </Link>
        </div>

        {/* EMPTY STATE */}
        {trips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
              <svg
                className="w-8 h-8 text-neutral-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-1.1.1-1.5.5l-.3.3c-.4.4-.5 1-.1 1.4L10 12l-4 4H4l-2 2 2 2 2-2v-2l4-4 3.6 7.1c.4.4 1 .3 1.4-.1l.3-.3c.4-.4.6-1 .5-1.5z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">No trips yet</h2>
            <p className="text-neutral-400 text-sm mb-6 max-w-sm">
              Generate your first AI-powered itinerary and it will appear here.
            </p>
            <Link
              href="/generate"
              className="px-6 py-3 rounded-xl bg-white text-black text-sm font-medium hover:opacity-90 transition"
            >
              Generate a Trip
            </Link>
          </div>
        ) : (
          /* TRIP GRID */
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {trips.map((trip) => (
              <div
                key={trip.id}
                className="group rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/[0.08] transition duration-300 flex flex-col justify-between gap-6"
              >
                {/* TOP */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-semibold text-lg leading-snug line-clamp-2">
                      {trip.tripTitle}
                    </h2>
                    <button
                      onClick={() => handleDelete(trip.id)}
                      disabled={deletingId === trip.id}
                      className="flex-shrink-0 p-1.5 rounded-lg text-neutral-600 hover:text-red-400 hover:bg-red-400/10 transition disabled:opacity-40"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="flex items-center gap-1 text-xs text-neutral-400 bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg">
                      <svg
                        className="w-3 h-3"
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
                    <span className="flex items-center gap-1 text-xs text-neutral-400 bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg">
                      <svg
                        className="w-3 h-3"
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

                  <div className="flex justify-between text-sm pt-1">
                    <span className="text-neutral-500">Total budget</span>
                    <span className="font-semibold text-neutral-200">
                      {trip.budgetBreakdown.total}
                    </span>
                  </div>
                </div>

                {/* BOTTOM */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  {formatDate(trip) && (
                    <span className="text-xs text-neutral-500">
                      {formatDate(trip)}
                    </span>
                  )}
                  <Link
                    href={`/trips/${trip.id}`}
                    className="ml-auto text-sm font-medium text-white flex items-center gap-1 hover:gap-2 transition-all"
                  >
                    View trip
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
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
