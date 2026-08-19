import { NextRequest, NextResponse } from "next/server";

const MAP_API_KEY = process.env.MAP_API_KEY;

export async function GET(req: NextRequest) {
  const input = req.nextUrl.searchParams.get("input")?.trim() || "";

  // Don't search for empty or very short input
  if (!input || input.length < 3) {
    return NextResponse.json({
      suggestions: [],
      source: "maptiler",
    });
  }

  // Check MapTiler API key
  if (!MAP_API_KEY) {
    console.error("[MapTiler] MAP_API_KEY is missing");

    return NextResponse.json(
      {
        suggestions: [],
        error: "MapTiler API key is not configured",
      },
      { status: 500 },
    );
  }

  try {
    // Build MapTiler Geocoding API request
    const params = new URLSearchParams({
      key: MAP_API_KEY,
      autocomplete: "true",
      country: "in",
      language: "en",
      limit: "5",
    });

    const url =
      `https://api.maptiler.com/geocoding/` +
      `${encodeURIComponent(input)}.json?${params.toString()}`;

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📍 MAPTILER AUTOCOMPLETE");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔎 Search:", input);

    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
    });

    const data = await response.json();

    console.log("📡 Status:", response.status);

    // Handle MapTiler API errors
    if (!response.ok) {
      console.error("❌ MapTiler API Error:");
      console.error(data);

      return NextResponse.json(
        {
          suggestions: [],
          error:
            data?.message || data?.error || "MapTiler geocoding request failed",
        },
        {
          status: response.status,
        },
      );
    }

    /*
     * MapTiler returns:
     *
     * {
     *   features: [
     *     {
     *       id,
     *       type,
     *       geometry,
     *       properties,
     *       ...
     *     }
     *   ]
     * }
     */

    const features = Array.isArray(data.features) ? data.features : [];

    const suggestions = features.map((feature: any) => {
      const coordinates = Array.isArray(feature.geometry?.coordinates)
        ? feature.geometry.coordinates
        : [];

      const longitude =
        typeof coordinates[0] === "number" ? coordinates[0] : null;

      const latitude =
        typeof coordinates[1] === "number" ? coordinates[1] : null;

      // Full formatted address
      const formattedAddress =
        feature.properties?.formatted ||
        feature.place_name ||
        feature.text ||
        input;

      // Main title
      const mainText =
        feature.properties?.name || feature.text || formattedAddress;

      // Secondary address text
      let secondaryText = "";

      if (feature.properties?.address) {
        secondaryText = feature.properties.address;
      }

      /*
       * MapTiler context can contain:
       *
       * country
       * region
       * postcode
       * county
       * locality
       * place
       * neighborhood
       */
      if (!secondaryText && Array.isArray(feature.properties?.context)) {
        secondaryText = feature.properties.context
          .map((item: any) => {
            return item.text || item.name || "";
          })
          .filter(Boolean)
          .join(", ");
      }

      return {
        id: feature.id || `${latitude ?? "unknown"}-${longitude ?? "unknown"}`,

        /*
         * This structure is intentionally similar
         * to the Google Places response structure
         * your existing frontend was using.
         */
        placePrediction: {
          placeId: feature.id || "",

          text: {
            text: formattedAddress,
          },

          structuredFormat: {
            mainText: {
              text: mainText,
            },

            secondaryText: {
              text: secondaryText,
            },
          },
        },

        // Coordinates are useful when selecting an address
        coordinates: {
          lat: latitude,
          lng: longitude,
        },

        // Keep original MapTiler feature available
        // in case the frontend needs more information.
        raw: feature,
      };
    });

    console.log("✅ Suggestions:", suggestions.length);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return NextResponse.json({
      suggestions,
      source: "maptiler",
    });
  } catch (error) {
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error("❌ MAPTILER REQUEST FAILED");
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error(error);
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return NextResponse.json(
      {
        suggestions: [],
        error: "Unable to connect to MapTiler API",
      },
      {
        status: 500,
      },
    );
  }
}
