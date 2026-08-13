import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export async function GET(req: NextRequest) {
  const input = req.nextUrl.searchParams.get("input")?.trim() || "";

  if (input.length < 3) {
    return NextResponse.json({ suggestions: [] });
  }

  if (!API_KEY) {
    console.error("GOOGLE_MAPS_API_KEY is missing");
    return NextResponse.json(
      { error: "Google Maps API key is not configured", suggestions: [] },
      { status: 500 },
    );
  }

  // ─────────────────────────────────────────────────────────────
  // Google Places API (New)
  // ─────────────────────────────────────────────────────────────
  try {
    const response = await fetch(
      "https://places.googleapis.com/v1/places:autocomplete",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": API_KEY,
        },
        body: JSON.stringify({
          input,
          includedRegionCodes: ["in"],
          languageCode: "en",
        }),
      },
    );

    const data = await response.json();

    if (response.ok && data.suggestions?.length > 0) {
      return NextResponse.json({
        suggestions: data.suggestions,
        source: "new",
      });
    }

    console.warn(
      "[Places New] failed:",
      response.status,
      data?.error?.message || data,
    );
  } catch (error) {
    console.error("[Places New] exception:", error);
  }

  // ─────────────────────────────────────────────────────────────
  // Legacy Places API fallback
  // ─────────────────────────────────────────────────────────────
  try {
    const url =
      "https://maps.googleapis.com/maps/api/place/autocomplete/json" +
      `?input=${encodeURIComponent(input)}` +
      `&key=${API_KEY}` +
      `&components=country:in` +
      `&language=en` +
      `&types=geocode`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK" && data.predictions?.length > 0) {
      const suggestions = data.predictions.map((p: any) => ({
        placePrediction: {
          placeId: p.place_id,
          text: {
            text: p.description,
          },
          structuredFormat: {
            mainText: {
              text: p.structured_formatting?.main_text || p.description,
            },
            secondaryText: {
              text: p.structured_formatting?.secondary_text || "",
            },
          },
        },
      }));

      return NextResponse.json({
        suggestions,
        source: "legacy",
      });
    }

    console.warn(
      "[Places Legacy] status:",
      data.status,
      data.error_message || "",
    );
  } catch (error) {
    console.error("[Places Legacy] exception:", error);
  }

  return NextResponse.json({
    suggestions: [],
  });
}
