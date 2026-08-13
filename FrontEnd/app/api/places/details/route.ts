import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export async function GET(req: NextRequest) {
  const placeId = req.nextUrl.searchParams.get("placeId")?.trim() || "";

  if (!placeId) {
    return NextResponse.json({ error: "placeId is required" }, { status: 400 });
  }

  if (!API_KEY) {
    console.error("GOOGLE_MAPS_API_KEY is missing");

    return NextResponse.json(
      { error: "Google Maps API key is not configured" },
      { status: 500 },
    );
  }

  // ─────────────────────────────────────────────────────────────
  // Places API (New)
  // ─────────────────────────────────────────────────────────────
  try {
    const response = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
      {
        headers: {
          "X-Goog-Api-Key": API_KEY,
          "X-Goog-FieldMask": "id,formattedAddress,addressComponents,location",
        },
      },
    );

    const data = await response.json();

    if (response.ok && data.formattedAddress) {
      return NextResponse.json(data);
    }

    console.warn(
      "[Place Details New] failed:",
      response.status,
      data?.error?.message || data,
    );
  } catch (error) {
    console.error("[Place Details New] exception:", error);
  }

  // ─────────────────────────────────────────────────────────────
  // Legacy Places API fallback
  // ─────────────────────────────────────────────────────────────
  try {
    const url =
      "https://maps.googleapis.com/maps/api/place/details/json" +
      `?place_id=${encodeURIComponent(placeId)}` +
      `&key=${API_KEY}` +
      `&fields=formatted_address,address_components,geometry`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK" && data.result) {
      const result = data.result;

      const addressComponents = (result.address_components || []).map(
        (component: any) => ({
          longText: component.long_name,
          types: component.types,
        }),
      );

      return NextResponse.json({
        formattedAddress: result.formatted_address || "",

        addressComponents,

        location: {
          latitude: result.geometry?.location?.lat,
          longitude: result.geometry?.location?.lng,
        },
      });
    }

    console.warn(
      "[Place Details Legacy] status:",
      data.status,
      data.error_message || "",
    );
  } catch (error) {
    console.error("[Place Details Legacy] exception:", error);
  }

  return NextResponse.json(
    { error: "Place details not found" },
    { status: 404 },
  );
}
