"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import { generateTrip, type TripResponse } from "@/lib/api-client";
import { saveTripToFirestore } from "@/lib/firebase/trip";

export default function GeneratePage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [formData, setFormData] = useState({
    destination: "",
    duration: "",
    budget: "",
    interests: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { destination, duration, budget, interests } = formData;

    if (!destination || !duration || !budget || !interests) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const data = await generateTrip(formData);

      if (data.error) {
        toast.error(data.error);
        return;
      }

      if (data.trip) {
        if (user) {
          const tripId = await saveTripToFirestore(data.trip, user.uid);
          router.push(`/trips/${tripId}`); // ← redirect here
        } else {
          toast.error("Please sign in to save your trip");
        }
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 text-slate-900 px-4 py-10 w-full">
      <Toaster position="top-center" />

      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
        {/* LEFT SECTION — unchanged */}
        <div className="space-y-6">
          <div className="inline-block rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-600 font-medium">
            AI Powered Travel Planning
          </div>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight">
            Plan smarter trips with AI
          </h1>
          <p className="text-slate-600 text-base md:text-lg leading-relaxed">
            Generate personalized travel itineraries based on your budget,
            interests, and destination preferences.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
              <h3 className="font-semibold mb-2">Smart Itineraries</h3>
              <p className="text-sm text-slate-600">
                AI creates detailed day-by-day travel plans instantly.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
              <h3 className="font-semibold mb-2">Budget Friendly</h3>
              <p className="text-sm text-slate-600">
                Trips tailored to your spending limit and preferences.
              </p>
            </div>
          </div>
        </div>

        {/* FORM SECTION */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-xl">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">Generate Your Trip</h2>
            <p className="text-slate-600 mt-2 text-sm">
              Fill in your travel preferences and let AI do the planning.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-2 text-sm text-slate-700 font-medium">
                Destination
              </label>
              <input
                type="text"
                name="destination"
                placeholder="e.g Japan"
                value={formData.destination}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 transition"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm text-slate-700 font-medium">
                Duration
              </label>
              <input
                type="text"
                name="duration"
                placeholder="e.g 7 days"
                value={formData.duration}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 transition"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm text-slate-700 font-medium">
                Budget
              </label>
              <input
                type="text"
                name="budget"
                placeholder="e.g $2000"
                value={formData.budget}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 transition"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm text-slate-700 font-medium">
                Interests
              </label>
              <textarea
                name="interests"
                placeholder="e.g Anime, food, nightlife"
                value={formData.interests}
                onChange={handleChange}
                rows={4}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none resize-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-rose-500 text-white font-medium py-3 transition hover:bg-rose-600 disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {loading ? "Generating & saving..." : "Generate Trip"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
