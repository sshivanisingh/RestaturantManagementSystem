import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export async function GET(req: NextRequest) {
  const input = req.nextUrl.searchParams.get("input")?.trim() || "";

  if (!input || input.length < 3) {
    return NextResponse.json({
      suggestions: [],
    });
  }

  if (!API_KEY) {
    console.error("[Places Autocomplete] GOOGLE_MAPS_API_KEY is missing");

    return NextResponse.json(
      {
        suggestions: [],
        error: "Google Maps API key is not configured",
      },
      { status: 500 },
    );
  }

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
        cache: "no-store",
      },
    );

    const data = await response.json();

    console.log(
      "[Places Autocomplete]",
      response.status,
      response.ok ? "OK" : data,
    );

    if (!response.ok) {
      return NextResponse.json(
        {
          suggestions: [],
          error:
            data?.error?.message || "Google Places Autocomplete request failed",
        },
        { status: response.status },
      );
    }

    return NextResponse.json({
      suggestions: data.suggestions || [],
      source: "new",
    });
  } catch (error) {
    console.error("[Places Autocomplete] Exception:", error);

    return NextResponse.json(
      {
        suggestions: [],
        error: "Unable to connect to Google Places API",
      },
      { status: 500 },
    );
  }
}
