"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChatMessage,
  getTripFromFirestore,
  updateTripsInFirestore,
} from "@/lib/firebase/trip";
import { type TripResponse } from "@/lib/api-client";
import TripChat from "@/components/TripChat";
import toast, { Toaster } from "react-hot-toast";
import WeatherWidget from "@/components/WeatherWidgets";

interface Trip extends NonNullable<TripResponse["trip"]> {
  chatMessages?: ChatMessage[];
}

export default function TripDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editedTrip, setEditedTrip] = useState<Trip | null>(null);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const data = await getTripFromFirestore(id as string);
        if (data) {
          setTrip(data as unknown as Trip);
          setEditedTrip(data as unknown as Trip);
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

  const updateTitle = (value: string) => {
    setEditedTrip((prev) => (prev ? { ...prev, tripTitle: value } : prev));
  };

  const updateDayTheme = (dayIndex: number, value: string) => {
    setEditedTrip((prev) => {
      if (!prev) return prev;
      const itinerary = [...prev.itinerary];
      itinerary[dayIndex] = { ...itinerary[dayIndex], theme: value };
      return { ...prev, itinerary };
    });
  };

  const updateActivity = (
    dayIndex: number,
    actIndex: number,
    field: "time" | "activity" | "description",
    value: string,
  ) => {
    setEditedTrip((prev) => {
      if (!prev) return prev;
      const itinerary = [...prev.itinerary];
      const activities = [...itinerary[dayIndex].activities];
      activities[actIndex] = { ...activities[actIndex], [field]: value };
      itinerary[dayIndex] = { ...itinerary[dayIndex], activities };
      return { ...prev, itinerary };
    });
  };

  const deleteActivity = (dayIndex: number, actIndex: number) => {
    setEditedTrip((prev) => {
      if (!prev) return prev;
      const itinerary = [...prev.itinerary];
      const activities = itinerary[dayIndex].activities.filter(
        (_, i) => i !== actIndex,
      );
      itinerary[dayIndex] = { ...itinerary[dayIndex], activities };
      return { ...prev, itinerary };
    });
  };

  const updateFood = (dayIndex: number, foodIndex: number, value: string) => {
    setEditedTrip((prev) => {
      if (!prev) return prev;
      const itinerary = [...prev.itinerary];
      const food = [...itinerary[dayIndex].food];
      food[foodIndex] = value;
      itinerary[dayIndex] = { ...itinerary[dayIndex], food };
      return { ...prev, itinerary };
    });
  };

  const updateTip = (tipIndex: number, value: string) => {
    setEditedTrip((prev) => {
      if (!prev) return prev;
      const travelTips = [...prev.travelTips];
      travelTips[tipIndex] = value;
      return { ...prev, travelTips };
    });
  };

  const handleSave = async () => {
    if (!editedTrip) return;
    try {
      setSaving(true);
      await updateTripsInFirestore(id as string, {
        tripTitle: editedTrip.tripTitle,
        itinerary: editedTrip.itinerary,
        travelTips: editedTrip.travelTips,
      });
      setTrip(editedTrip);
      setEditing(false);
      toast.success("Trip saved!");
    } catch {
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedTrip(trip);
    setEditing(false);
  };

  if (loading) {
    return (
      <main className="flex-1 text-slate-900 flex items-center justify-center">
        <div className="text-slate-500 animate-pulse text-lg">
          Loading your trip...
        </div>
      </main>
    );
  }

  if (!trip || !editedTrip) return null;

  const display = editing ? editedTrip : trip;

  return (
    <main className="flex-1 text-slate-900 px-4 py-10 w-full">
      <Toaster position="top-center" />
      <div className="max-w-4xl mx-auto pb-20">
        {/* BACK BUTTON */}
        <button
          onClick={() => router.push("/trips")}
          className="mb-8 flex items-center gap-2 text-slate-500 hover:text-rose-600 transition text-sm font-medium"
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

        <div className="rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden relative p-6 md:p-10">
          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
            <div className="flex-1">
              {editing ? (
                <input
                  value={editedTrip.tripTitle}
                  onChange={(e) => updateTitle(e.target.value)}
                  className="text-3xl font-bold bg-transparent border-b border-slate-300 text-slate-900 outline-none w-full pb-1 focus:border-rose-400 transition"
                />
              ) : (
                <h2 className="text-4xl font-bold text-slate-900">
                  {trip.tripTitle}
                </h2>
              )}
              <div className="flex items-center gap-4 mt-2 text-slate-500 text-sm">
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
                  {display.destination}
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
                  {display.duration}
                </span>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {editing ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-5 py-2 rounded-xl bg-rose-500 text-white font-medium hover:bg-rose-600 shadow-sm transition text-sm disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setEditing(true)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition text-sm font-medium flex items-center gap-2"
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit Trip
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition border border-slate-200 flex items-center gap-2 text-sm font-medium text-slate-700"
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
                </>
              )}
            </div>
          </div>

          {/* ITINERARY DAYS */}
          <div className="grid gap-12">
            {display.itinerary.map((day, dayIndex) => (
              <div key={day.day} className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xl shadow-sm">
                    {day.day}
                  </div>
                  {editing ? (
                    <input
                      value={editedTrip.itinerary[dayIndex].theme}
                      onChange={(e) => updateDayTheme(dayIndex, e.target.value)}
                      className="text-lg font-semibold bg-transparent border-b border-slate-300 text-slate-900 outline-none flex-1 pb-1 focus:border-rose-400 transition"
                      placeholder="Day theme"
                    />
                  ) : (
                    <h3 className="text-xl font-semibold text-slate-900">
                      Day {day.day}: {day.theme}
                    </h3>
                  )}
                </div>

                <div className="grid gap-4 pl-16">
                  {day.activities.map((act, actIndex) => (
                    <div
                      key={actIndex}
                      className="group rounded-2xl border border-slate-200 bg-slate-50 p-5 hover:bg-slate-100 transition duration-300"
                    >
                      {editing ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <input
                              value={
                                editedTrip.itinerary[dayIndex].activities[
                                  actIndex
                                ].time
                              }
                              onChange={(e) =>
                                updateActivity(
                                  dayIndex,
                                  actIndex,
                                  "time",
                                  e.target.value,
                                )
                              }
                              className="text-xs font-bold uppercase tracking-wider bg-white border border-slate-200 rounded px-2 py-1 text-slate-700 outline-none w-28 focus:border-rose-400 transition"
                              placeholder="Time"
                            />
                            <button
                              onClick={() => deleteActivity(dayIndex, actIndex)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
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
                          <input
                            value={
                              editedTrip.itinerary[dayIndex].activities[
                                actIndex
                              ].activity
                            }
                            onChange={(e) =>
                              updateActivity(
                                dayIndex,
                                actIndex,
                                "activity",
                                e.target.value,
                              )
                            }
                            className="w-full font-semibold bg-transparent border-b border-slate-300 text-slate-900 outline-none pb-1 focus:border-rose-400 transition"
                            placeholder="Activity name"
                          />
                          <textarea
                            value={
                              editedTrip.itinerary[dayIndex].activities[
                                actIndex
                              ].description
                            }
                            onChange={(e) =>
                              updateActivity(
                                dayIndex,
                                actIndex,
                                "description",
                                e.target.value,
                              )
                            }
                            className="w-full text-sm text-slate-600 bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none resize-none focus:border-rose-400 transition"
                            rows={2}
                            placeholder="Description"
                          />
                        </div>
                      ) : (
                        <>
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded">
                            {act.time}
                          </span>
                          <h4 className="font-semibold text-lg text-slate-900 mt-2">
                            {act.activity}
                          </h4>
                          <p className="text-slate-600 text-sm mt-1 leading-relaxed">
                            {act.description}
                          </p>
                        </>
                      )}
                    </div>
                  ))}

                  {/* FOOD */}
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-slate-700 uppercase tracking-wider">
                      🍽️ Food Recommendations
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {day.food.map((item: string, foodIdx: number) =>
                        editing ? (
                          <input
                            key={foodIdx}
                            value={editedTrip.itinerary[dayIndex].food[foodIdx]}
                            onChange={(e) =>
                              updateFood(dayIndex, foodIdx, e.target.value)
                            }
                            className="px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700 outline-none focus:border-rose-400 transition w-36"
                          />
                        ) : (
                          <span
                            key={foodIdx}
                            className="px-3 py-1 rounded-lg bg-rose-50 border border-rose-100 text-sm text-rose-600 font-medium"
                          >
                            {item}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* BUDGET + TIPS */}
          <div className="mt-20 grid md:grid-cols-2 gap-8 border-t border-slate-200 pt-12">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900">
                💰 Budget Breakdown
              </h3>
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Total Estimate</span>
                  <span className="text-xl font-bold text-slate-900">
                    {display.budgetBreakdown.total}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Daily Average</span>
                  <span className="font-semibold text-slate-900">
                    {display.budgetBreakdown.daily}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900">
                💡 Travel Tips
              </h3>
              <ul className="grid gap-3">
                {display.travelTips.map((tip: string, tipIdx: number) => (
                  <li
                    key={tipIdx}
                    className="flex items-start gap-3 text-slate-600 text-sm"
                  >
                    <svg
                      className="w-4 h-4 mt-0.5 text-rose-400 flex-shrink-0"
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
                    {editing ? (
                      <input
                        value={editedTrip.travelTips[tipIdx]}
                        onChange={(e) => updateTip(tipIdx, e.target.value)}
                        className="flex-1 bg-transparent border-b border-slate-300 text-slate-700 outline-none focus:border-rose-400 pb-0.5 transition"
                      />
                    ) : (
                      tip
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 relative z-10">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              🌤️ Weather Forecast
            </h3>
            <WeatherWidget destination={trip.destination} />
          </div>

          {/* CHAT */}
          <div className="mt-12 relative z-10">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-900">
              <svg
                className="w-5 h-5 text-rose-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
              Ask Your Trip Assistant
            </h3>
            <TripChat
              tripId={id as string}
              tripContext={trip}
              initialMessages={trip.chatMessages || []}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
