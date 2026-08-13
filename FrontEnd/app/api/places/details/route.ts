import { NextRequest, NextResponse } from "next/server"

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!

export async function GET(req: NextRequest) {
  const placeId = req.nextUrl.searchParams.get("placeId") || ""

  if (!placeId) {
    return NextResponse.json({ error: "placeId required" }, { status: 400 })
  }

  // ── Try Places API (New) first ────────────────────────────────────────────
  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}`,
      {
        headers: {
          "X-Goog-Api-Key" : API_KEY,
          "X-Goog-FieldMask": "addressComponents,formattedAddress,location",
        },
      }
    )

    if (res.ok) {
      const data = await res.json()
      if (data.formattedAddress) return NextResponse.json(data)
    }
    console.warn("[Place Details New] failed:", res.status)
  } catch (e) {
    console.warn("[Place Details New] exception:", e)
  }

  // ── Fallback: Legacy Place Details API ───────────────────────────────────
  try {
    const url  = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&key=${API_KEY}&fields=formatted_address,address_components,geometry`
    const res  = await fetch(url)
    const data = await res.json()

    if (data.status === "OK" && data.result) {
      const r = data.result
      // Convert legacy format → new format shape
      const addressComponents = (r.address_components || []).map((c: any) => ({
        longText: c.long_name,
        types   : c.types,
      }))

      return NextResponse.json({
        formattedAddress  : r.formatted_address,
        addressComponents,
        location: {
          latitude : r.geometry?.location?.lat,
          longitude: r.geometry?.location?.lng,
        },
      })
    }
    console.warn("[Place Details Legacy] status:", data.status)
  } catch (e) {
    console.warn("[Place Details Legacy] exception:", e)
  }

  return NextResponse.json({ error: "not found" }, { status: 404 })
}
