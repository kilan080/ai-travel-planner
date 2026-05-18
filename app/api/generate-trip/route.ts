import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize Gemini (Fallback)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Initialize OpenRouter (Primary)
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPEN_ROUTER_API_KEY || "",
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { destination, duration, budget, interests } = body;

    const prompt = `
      Create a detailed ${duration}-day travel itinerary for ${destination}.
      Budget: ${budget}
      Interests: ${interests}

      IMPORTANT: Return ONLY a valid JSON object. Do not include markdown formatting or backticks.
      Return the data in this JSON format:
      {
        "tripTitle": "string",
        "destination": "string",
        "duration": "string",
        "itinerary": [
          {
            "day": 1,
            "theme": "string",
            "activities": [
              {
                "time": "string",
                "activity": "string",
                "description": "string"
              }
            ],
            "food": ["string"]
          }
        ],
        "budgetBreakdown": {
          "total": "string",
          "daily": "string"
        },
        "travelTips": ["string"]
      }
    `;

    let text = "";

    try {
      if (!process.env.OPEN_ROUTER_API_KEY) {
        throw new Error("OpenRouter API Key is missing");
      }

      // Try OpenRouter first
      const response = await openai.chat.completions.create({
        model: "openai/gpt-4o-mini", // You can change this to any OpenRouter model, e.g., "openai/gpt-4o-mini" or "meta-llama/llama-3.3-70b-instruct"
        messages: [{ role: "user", content: prompt }],
      });

      text = response.choices[0]?.message?.content || "";
    } catch (openRouterError) {
      console.warn("OpenRouter failed, falling back to Gemini API directly:", openRouterError);

      if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json(
          { error: "Both OpenRouter and Gemini API Keys are missing or failed." },
          { status: 500 },
        );
      }

      // Fallback to Gemini directly
      let model;
      try {
        model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      } catch (e) {
        console.warn("Gemini 2.0 Flash failed, falling back to Gemini Pro:", e);
        model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      }

      const result = await model.generateContent(prompt);
      text = result.response.text();
    }

    // Safety check: strip markdown code blocks if the model accidentally included them
    const cleanJson = text.replace(/```json|```/g, "").trim();
    
    let responseObj;
    try {
      responseObj = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error("Failed to parse AI response:", text);
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      trip: responseObj,
    });
  } catch (error: unknown) {
    console.error("CRITICAL API ERROR:", error);

    // Provide more specific feedback for common AI API errors
    let errorMessage = "Something went wrong while generating your trip.";
    
    if (typeof error === "object" && error !== null) {
      const err = error as { status?: number; message?: string };
      if (err.status === 429) {
        errorMessage = "Rate limit exceeded. Please wait a moment and try again.";
      } else if (err.status === 403) {
        errorMessage = "Invalid API Key or permission denied.";
      } else if (err.message) {
        errorMessage = err.message;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 },
    );
  }
}
