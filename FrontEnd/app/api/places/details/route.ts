import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export async function GET(req: NextRequest) {
  const placeId = req.nextUrl.searchParams.get("placeId")?.trim() || "";

  if (!placeId) {
    return NextResponse.json(
      {
        error: "placeId is required",
      },
      { status: 400 },
    );
  }

  if (!API_KEY) {
    console.error("[Places Details] GOOGLE_MAPS_API_KEY is missing");

    return NextResponse.json(
      {
        error: "Google Maps API key is not configured",
      },
      { status: 500 },
    );
  }

  try {
    const response = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
      {
        method: "GET",
        headers: {
          "X-Goog-Api-Key": API_KEY,
          "X-Goog-FieldMask":
            "id,displayName,formattedAddress,addressComponents,location",
        },
        cache: "no-store",
      },
    );

    const data = await response.json();

    console.log("[Places Details]", response.status, response.ok ? "OK" : data);

    if (!response.ok) {
      return NextResponse.json(
        {
          error: data?.error?.message || "Google Places Details request failed",
        },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Places Details] Exception:", error);

    return NextResponse.json(
      {
        error: "Unable to connect to Google Places API",
      },
      { status: 500 },
    );
  }
}
