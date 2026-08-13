"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { MapPin, Loader2, X } from "lucide-react"

export interface PlaceResult {
  fullAddress: string
  city       : string
  pincode    : string
  lat?       : number
  lng?       : number
}

interface Suggestion {
  placeId      : string
  mainText     : string
  secondaryText: string
  fullText     : string
}

interface Props {
  value      : string
  onChange   : (val: string) => void
  onSelect   : (result: PlaceResult) => void
  placeholder?: string
  className? : string
}

// ── Fetch suggestions via Next.js proxy (no CORS issues) ─────────────────────
async function fetchSuggestions(input: string): Promise<Suggestion[]> {
  if (!input || input.length < 3) return []
  try {
    const res  = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(input)}`)
    const data = await res.json()

    return (data.suggestions || []).map((s: any) => ({
      placeId      : s.placePrediction?.placeId || "",
      mainText     : s.placePrediction?.structuredFormat?.mainText?.text || s.placePrediction?.text?.text || "",
      secondaryText: s.placePrediction?.structuredFormat?.secondaryText?.text || "",
      fullText     : s.placePrediction?.text?.text || "",
    })).filter((s: Suggestion) => s.placeId)
  } catch {
    return []
  }
}

// ── Fetch place details via Next.js proxy ─────────────────────────────────────
async function fetchPlaceDetails(placeId: string): Promise<PlaceResult | null> {
  try {
    const res   = await fetch(`/api/places/details?placeId=${encodeURIComponent(placeId)}`)
    const place = await res.json()

    const get = (type: string) =>
      (place.addressComponents || []).find((c: any) => c.types?.includes(type))?.longText || ""

    const city    = get("locality") || get("administrative_area_level_2") || get("sublocality_level_1")
    const pincode = get("postal_code")

    return {
      fullAddress: place.formattedAddress || "",
      city,
      pincode,
      lat: place.location?.latitude,
      lng: place.location?.longitude,
    }
  } catch {
    return null
  }
}

export default function AddressAutocomplete({
  value, onChange, onSelect, placeholder = "Search delivery address...", className = "",
}: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading]         = useState(false)
  const [open, setOpen]               = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapperRef  = useRef<HTMLDivElement>(null)

  // ── Debounced search ────────────────────────────────────────────────────────
  const handleInput = useCallback((val: string) => {
    onChange(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!val || val.length < 3) { setSuggestions([]); setOpen(false); return }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      const results = await fetchSuggestions(val)
      setSuggestions(results)
      setOpen(results.length > 0)
      setLoading(false)
    }, 350)
  }, [onChange])

  // ── Select a suggestion ─────────────────────────────────────────────────────
  const handleSelect = useCallback(async (s: Suggestion) => {
    onChange(s.fullText)
    setOpen(false)
    setSuggestions([])

    const details = await fetchPlaceDetails(s.placeId)
    if (details) {
      onChange(details.fullAddress || s.fullText)
      onSelect(details)
    } else {
      onSelect({ fullAddress: s.fullText, city: "", pincode: "" })
    }
  }, [onChange, onSelect])

  // ── Close dropdown on outside click ────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div ref={wrapperRef} className="relative">

      {/* Input field */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {loading
            ? <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
            : <MapPin  className="h-4 w-4 text-brand-primary" />
          }
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className={`
            w-full pl-9 pr-8 py-2 rounded-md border border-gray-300 text-sm
            focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary
            bg-white transition-colors
            ${className}
          `}
        />
        {value && (
          <button
            type="button"
            onClick={() => { onChange(""); setSuggestions([]); setOpen(false) }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
          {suggestions.map((s) => (
            <li
              key={s.placeId}
              onMouseDown={(e) => { e.preventDefault(); handleSelect(s) }}
              className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-orange-50 border-b border-gray-100 last:border-0 transition-colors"
            >
              <MapPin className="h-4 w-4 text-brand-primary mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{s.mainText}</p>
                {s.secondaryText && (
                  <p className="text-xs text-gray-400 truncate">{s.secondaryText}</p>
                )}
              </div>
            </li>
          ))}
          <li className="px-4 py-1.5 text-right bg-gray-50">
            <span className="text-[10px] text-gray-300">Powered by Google</span>
          </li>
        </ul>
      )}
    </div>
  )
}
