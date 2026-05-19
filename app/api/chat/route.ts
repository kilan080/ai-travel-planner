import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function POST(req: NextRequest) {
  try {
    const { messages, tripContext } = await req.json();

    const systemPrompt = `You are a helpful travel assistant. The user is asking questions about their trip.

Here is their itinerary context:
${JSON.stringify(tripContext, null, 2)}

Answer questions specifically about this trip. Be concise, helpful, and friendly.
If asked about something unrelated to travel or this trip, gently redirect the conversation.`;

    const response = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini", // OpenRouter model format
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      max_tokens: 500,
    });

    return NextResponse.json({
      message: response.choices[0].message.content,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to get response";
    console.error("Chat API error:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 },
    );
  }
}
