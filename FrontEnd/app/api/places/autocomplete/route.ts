import { NextRequest, NextResponse } from "next/server"

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!

export async function GET(req: NextRequest) {
  const input = req.nextUrl.searchParams.get("input") || ""

  if (!input || input.length < 3) {
    return NextResponse.json({ suggestions: [] })
  }

  // ── Try Places API (New) first ────────────────────────────────────────────
  try {
    const res = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
      method : "POST",
      headers: {
        "Content-Type"  : "application/json",
        "X-Goog-Api-Key": API_KEY,
      },
      body: JSON.stringify({
        input,
        includedRegionCodes: ["in"],
        languageCode       : "en",
      }),
    })

    if (res.ok) {
      const data = await res.json()
      if (data.suggestions?.length > 0) {
        return NextResponse.json({ suggestions: data.suggestions, source: "new" })
      }
    }

    const errText = await res.text().catch(() => "")
    console.warn("[Places New] failed:", res.status, errText)
  } catch (e) {
    console.warn("[Places New] exception:", e)
  }

  // ── Fallback: Legacy Places REST API ─────────────────────────────────────
  try {
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${API_KEY}&components=country:in&language=en&types=geocode`
    const res  = await fetch(url)
    const data = await res.json()

    if (data.status === "OK" && data.predictions?.length > 0) {
      // Convert legacy format → new format shape (so frontend parsing stays the same)
      const suggestions = data.predictions.map((p: any) => ({
        placePrediction: {
          placeId: p.place_id,
          text   : { text: p.description },
          structuredFormat: {
            mainText     : { text: p.structured_formatting?.main_text      || p.description },
            secondaryText: { text: p.structured_formatting?.secondary_text || "" },
          },
        },
      }))
      return NextResponse.json({ suggestions, source: "legacy" })
    }

    console.warn("[Places Legacy] status:", data.status, data.error_message || "")
  } catch (e) {
    console.warn("[Places Legacy] exception:", e)
  }

  return NextResponse.json({ suggestions: [] })
}
