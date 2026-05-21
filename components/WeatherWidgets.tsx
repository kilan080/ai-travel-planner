"use client";

import { useEffect, useState } from "react";

interface ForecastDay {
  date: string;
  maxTemp: number;
  minTemp: number;
  precipitation: number;
  weatherCode: number;
}

interface WeatherData {
  location: { name: string; country: string };
  forecast: ForecastDay[];
}

// WMO weather code → label + emoji
const getWeatherInfo = (code: number): { label: string; icon: string } => {
  if (code === 0) return { label: "Clear sky", icon: "☀️" };
  if (code <= 2) return { label: "Partly cloudy", icon: "⛅" };
  if (code === 3) return { label: "Overcast", icon: "☁️" };
  if (code <= 49) return { label: "Foggy", icon: "🌫️" };
  if (code <= 59) return { label: "Drizzle", icon: "🌦️" };
  if (code <= 69) return { label: "Rain", icon: "🌧️" };
  if (code <= 79) return { label: "Snow", icon: "❄️" };
  if (code <= 84) return { label: "Rain showers", icon: "🌧️" };
  if (code <= 94) return { label: "Snow showers", icon: "🌨️" };
  return { label: "Thunderstorm", icon: "⛈️" };
};

const formatDay = (dateStr: string, index: number): string => {
  if (index === 0) return "Today";
  if (index === 1) return "Tomorrow";
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

export default function WeatherWidget({
  destination,
}: {
  destination: string;
}) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch(
          `/api/weather?destination=${encodeURIComponent(destination)}`,
        );
        const data = await res.json();

        if (data.error) {
          setError(true);
          return;
        }

        // Shape the data
        const forecast: ForecastDay[] = data.forecast.time.map(
          (date: string, i: number) => ({
            date,
            maxTemp: Math.round(data.forecast.temperature_2m_max[i]),
            minTemp: Math.round(data.forecast.temperature_2m_min[i]),
            precipitation: data.forecast.precipitation_sum[i],
            weatherCode: data.forecast.weathercode[i],
          }),
        );

        setWeather({ location: data.location, forecast });
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [destination]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 animate-pulse">
        <div className="h-4 w-32 bg-white/10 rounded mb-4" />
        <div className="flex gap-3">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-24 w-full bg-white/5 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-neutral-500 text-sm">
        Weather data unavailable for this destination.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold text-white">7-Day Forecast</h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            {weather.location.name}, {weather.location.country}
          </p>
        </div>
        <span className="text-xs text-neutral-600 bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg">
          Open-Meteo
        </span>
      </div>

      {/* FORECAST GRID */}
      <div className="grid grid-cols-7 gap-2">
        {weather.forecast.map((day, i) => {
          const { icon } = getWeatherInfo(day.weatherCode);
          return (
            <div
              key={day.date}
              className={`flex flex-col items-center gap-1.5 rounded-xl p-2 text-center transition ${
                i === 0
                  ? "bg-white/10 border border-white/10"
                  : "bg-white/5 hover:bg-white/[0.08]"
              }`}
            >
              <span className="text-xs text-neutral-500 font-medium truncate w-full text-center">
                {formatDay(day.date, i).split(" ")[0]}
              </span>
              <span className="text-2xl leading-none">{icon}</span>
              <span className="text-xs text-neutral-200 font-semibold">
                {day.maxTemp}°
              </span>
              <span className="text-xs text-neutral-500">{day.minTemp}°</span>
              {day.precipitation > 0 && (
                <span className="text-xs text-blue-400">
                  {day.precipitation}mm
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* TODAY DETAIL */}
      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-neutral-400">
          <span className="text-xl">
            {getWeatherInfo(weather.forecast[0].weatherCode).icon}
          </span>
          <span>{getWeatherInfo(weather.forecast[0].weatherCode).label}</span>
        </div>
        <div className="flex items-center gap-3 text-neutral-400">
          <span>
            H:{" "}
            <span className="text-white font-medium">
              {weather.forecast[0].maxTemp}°C
            </span>
          </span>
          <span>
            L:{" "}
            <span className="text-white font-medium">
              {weather.forecast[0].minTemp}°C
            </span>
          </span>
          {weather.forecast[0].precipitation > 0 && (
            <span className="text-blue-400">
              💧 {weather.forecast[0].precipitation}mm
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
