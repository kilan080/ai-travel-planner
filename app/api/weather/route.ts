import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const destination = searchParams.get("destination");

  if (!destination) {
    return NextResponse.json(
      { error: "Destination is required" },
      { status: 400 },
    );
  }

  try {
    // Step 1: Geocode the destination → lat/lng
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(destination)}&count=1&language=en&format=json`,
    );
    const geoData = await geoRes.json();

    if (!geoData.results?.length) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 },
      );
    }

    const { latitude, longitude, name, country } = geoData.results[0];

    // Step 2: Fetch 7-day forecast
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=auto&forecast_days=7`,
    );
    const weatherData = await weatherRes.json();

    return NextResponse.json({
      location: { name, country, latitude, longitude },
      forecast: weatherData.daily,
    });
  } catch (error) {
    console.error("Weather API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch weather" },
      { status: 500 },
    );
  }
}
