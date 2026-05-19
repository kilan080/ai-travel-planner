export interface TripFormData {
  destination: string;
  duration: string;
  budget: string;
  interests: string;
}

export interface TripResponse {
  trip?: {
    tripTitle: string;
    destination: string;
    duration: string;
    itinerary: {
      day: number;
      theme: string;
      activities: {
        time: string;
        activity: string;
        description: string;
      }[];
      food: string[];
    }[];
    budgetBreakdown: {
      total: string;
      daily: string;
    };
    travelTips: string[];
  };
  error?: string;
}

export async function generateTrip(formData: TripFormData): Promise<TripResponse> {
  try {
    const response = await fetch("/api/generate-trip", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || "Failed to generate trip" };
    }

    return { trip: data.trip };
  } catch (error) {
    console.error("API Client Error:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

export interface ChatRequestPayload {
  messages: { role: "user" | "system" | "assistant"; content: string }[];
  tripContext: object;
}

export interface ChatResponsePayload {
  message?: string;
  error?: string;
}

export async function generateChatResponse(payload: ChatRequestPayload): Promise<ChatResponsePayload> {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || "Failed to get response" };
    }

    return { message: data.message };
  } catch (error) {
    console.error("API Client Error:", error);
    return { error: "Something went wrong. Please try again." };
  }
}
