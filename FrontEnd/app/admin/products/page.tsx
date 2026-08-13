"use client"

import { useState, useRef, useEffect } from "react"
import Image         from "next/image"
import { Button }    from "@/components/ui/button"
import { Input }     from "@/components/ui/input"
import { Label }     from "@/components/ui/label"
import { Toaster }   from "@/components/ui/toaster"
import { useToast }  from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  useGetAllItems,
  useCreateItem,
  useUpdateItem,
  useDeleteItem,
  useToggleItemStatus,
  useToggleItemAvailability,
  useGetAllCategories,
} from "@/src/hooks"
import type { MenuItem } from "@/src/types/api.types"
import { Plus } from "lucide-react"

// ─── Shared gradient button className ────────────────────────────────────────
const GRAD_BTN = "bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white"

// ═════════════════════════════════════════════════════════════════════════════
//  TYPES
// ═════════════════════════════════════════════════════════════════════════════
interface ItemForm {
  name:            string
  description:     string
  categoryId:      string
  price:           number
  discountPercent: number
  type:            "Veg" | "Non-Veg" | "Vegan"
  preparationTime: number
  servingSize:     string
  ingredients:     string
  calories:        number
  protein:         number
  carbs:           number
  fat:             number
  isBestSeller:    boolean
  initialRating:   number
  image:           File | null
}

const EMPTY_FORM: ItemForm = {
  name: "", description: "", categoryId: "",
  price: 0, discountPercent: 0,
  type: "Veg", preparationTime: 0, servingSize: "1 person",
  ingredients: "", calories: 0, protein: 0, carbs: 0, fat: 0,
  isBestSeller: false, initialRating: 0, image: null,
}

// ═════════════════════════════════════════════════════════════════════════════
//  TOGGLE SWITCH
// ═════════════════════════════════════════════════════════════════════════════
function Switch({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={onChange} disabled={disabled}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
        transition-colors duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed
        ${checked ? "bg-green-500" : "bg-gray-200"}`}>
      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0
        transition duration-200 ${checked ? "translate-x-4" : "translate-x-0"}`} />
    </button>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
//  TYPE BADGE
// ═════════════════════════════════════════════════════════════════════════════
function TypeBadge({ type }: { type: string }) {
  const map: Record<string, string> = {
    Veg:       "bg-green-50 text-green-700",
    "Non-Veg": "bg-red-50 text-red-700",
    Vegan:     "bg-emerald-50 text-emerald-700",
  }
  const dot: Record<string, string> = {
    Veg: "bg-green-500", "Non-Veg": "bg-red-500", Vegan: "bg-emerald-500",
  }
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-poppins font-medium px-2 py-0.5 rounded-full ${map[type] ?? ""}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot[type] ?? "bg-gray-400"}`} />
      {type}
    </span>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
//  STAR RATING PICKER
// ═════════════════════════════════════════════════════════════════════════════
function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          className="text-2xl transition-transform hover:scale-110 focus:outline-none"
        >
          <span className={(hovered || value) >= star ? "text-yellow-400" : "text-gray-200"}>★</span>
        </button>
      ))}
      {value > 0 && (
        <span className="text-xs font-poppins text-gray-500 ml-1">{value}.0</span>
      )}
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
//  ITEM FORM MODAL  — shadcn Dialog
// ═════════════════════════════════════════════════════════════════════════════
function ItemModal({
  open, mode, initial, initialImageUrl, categories, onClose, onSubmit, isPending,
}: {
  open:             boolean
  mode:             "create" | "edit"
  initial?:         ItemForm
  initialImageUrl?: string
  categories:       { _id: string; name: string }[]
  onClose:          () => void
  onSubmit:         (form: ItemForm) => void
  isPending:        boolean
}) {
  const [form,      setForm]      = useState<ItemForm>(initial ?? EMPTY_FORM)
  const [preview,   setPreview]   = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"basic" | "details" | "nutrition">("basic")
  const fileRef                   = useRef<HTMLInputElement>(null)
  const { toast }                 = useToast()

  // Jab modal open ho — form reset karo aur existing image preview set karo
  useEffect(() => {
    if (open) {
      setForm(initial ?? EMPTY_FORM)
      setPreview(initialImageUrl ?? null)
      setActiveTab("basic")
    }
  }, [open])

  const set = (key: keyof ItemForm) => (val: any) => setForm((p) => ({ ...p, [key]: val }))

  const handleOpenChange = (val: boolean) => {
    if (!val) {
      onClose()
      setTimeout(() => { setForm(initial ?? EMPTY_FORM); setPreview(null); setActiveTab("basic") }, 300)
    }
  }

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Images only", variant: "destructive" }); return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Too large", description: "Max 5MB", variant: "destructive" }); return
    }
    setForm((p) => ({ ...p, image: file }))
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { toast({ title: "Name required", variant: "destructive" }); return }
    if (!form.categoryId)  { toast({ title: "Category required", variant: "destructive" }); return }
    if (form.price <= 0)   { toast({ title: "Valid price required", variant: "destructive" }); return }
    onSubmit(form)
  }

  const tabs = [
    { id: "basic",     label: "Basic Info" },
    { id: "details",   label: "Details" },
    { id: "nutrition", label: "Nutrition" },
  ] as const

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-full max-w-2xl rounded-2xl p-0 overflow-hidden gap-0 max-h-[90vh] flex flex-col">

         

        {/* Header */}
        <DialogHeader className="flex flex-row items-center gap-3 px-6 pt-5 pb-4 flex-shrink-0 border-b border-gray-50 space-y-0">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            >
            {mode === "create" ? "➕" : "✏️"}
          </div>
          <div>
            <DialogTitle className="text-lg font-satisfy text-[hsl(var(--brand-primary))] text-left">
              {mode === "create" ? "New Menu Item" : "Edit Menu Item"}
            </DialogTitle>
            <DialogDescription className="text-xs font-poppins text-gray-400 text-left">
              Fill in all required fields
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 flex-shrink-0 px-6">
          {tabs.map((t) => (
            <button key={t.id} type="button" onClick={() => setActiveTab(t.id)}
              className={`py-2.5 px-4 text-xs font-poppins font-medium transition-all border-b-2 -mb-px
                ${activeTab === t.id
                  ? "border-[hsl(var(--brand-primary))] text-[hsl(var(--brand-primary))]"
                  : "border-transparent text-gray-400 hover:text-gray-600"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Scrollable form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
          <div className="px-6 py-5 space-y-4">

            {/* ── BASIC INFO ── */}
            {activeTab === "basic" && (
              <div className="space-y-4">

                {/* Image Upload */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium font-poppins text-[hsl(var(--brand-dark))]">
                    Image <span className="text-gray-400 font-normal">(optional)</span>
                  </Label>
                  <div onClick={() => fileRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-xl cursor-pointer transition-all
                      ${preview ? "border-orange-300" : "border-gray-200 hover:border-orange-300 hover:bg-orange-50/30"}`}>
                    {preview ? (
                      <div className="flex items-center gap-4 p-3">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <Image src={preview} alt="preview" fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-poppins text-gray-600 truncate">
                            {form.image instanceof File ? form.image.name : "Current image"}
                          </p>
                          <p className="text-xs font-poppins text-gray-400">
                            {form.image instanceof File ? "" : "Click to replace"}
                          </p>
                          <button type="button"
                            onClick={(e) => { e.stopPropagation(); setPreview(null); setForm((p) => ({ ...p, image: null })); if (fileRef.current) fileRef.current.value = "" }}
                            className="text-xs text-red-400 hover:text-red-600 font-poppins mt-1">
                            Remove
                          </button>
                        </div>
                        <span className="text-green-500 text-lg">✅</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center py-6 text-center">
                        <span className="text-2xl mb-1">🖼️</span>
                        <p className="text-xs font-poppins text-gray-500">Click to upload or drag & drop</p>
                        <p className="text-xs font-poppins text-gray-400 mt-0.5">PNG, JPG, WebP — max 5MB</p>
                      </div>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
                </div>

                {/* Name */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium font-poppins text-[hsl(var(--brand-dark))]">
                    Name <span className="text-[hsl(var(--brand-primary))]">*</span>
                  </Label>
                  <Input value={form.name} onChange={(e) => set("name")(e.target.value)}
                    placeholder="e.g. Paneer Tikka" required
                    />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium font-poppins text-[hsl(var(--brand-dark))]">Description</Label>
                  <textarea value={form.description} onChange={(e) => set("description")(e.target.value)}
                    placeholder="Brief description..." rows={2}
                    className="w-full px-3 py-2 font-poppins text-sm rounded-lg border-2 border-[hsl(var(--brand-muted))] focus:border-[hsl(var(--brand-primary))] placeholder:text-gray-300 transition-all resize-none outline-none" />
                </div>

                {/* Category + Type */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium font-poppins text-[hsl(var(--brand-dark))]">
                      Category <span className="text-[hsl(var(--brand-primary))]">*</span>
                    </Label>
                    <select value={form.categoryId} onChange={(e) => set("categoryId")(e.target.value)} required
                      className="w-full h-10 px-3 font-poppins text-sm rounded-lg border-2 border-[hsl(var(--brand-muted))] focus:border-[hsl(var(--brand-primary))] outline-none transition-all bg-white">
                      <option value="">Select category</option>
                      {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium font-poppins text-[hsl(var(--brand-dark))]">
                      Type <span className="text-[hsl(var(--brand-primary))]">*</span>
                    </Label>
                    <select value={form.type} onChange={(e) => set("type")(e.target.value as any)}
                      className="w-full h-10 px-3 font-poppins text-sm rounded-lg border-2 border-[hsl(var(--brand-muted))] focus:border-[hsl(var(--brand-primary))] outline-none transition-all bg-white">
                      <option value="Veg">🟢 Veg</option>
                      <option value="Non-Veg">🔴 Non-Veg</option>
                      <option value="Vegan">🌿 Vegan</option>
                    </select>
                  </div>
                </div>

                {/* Price + Discount */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium font-poppins text-[hsl(var(--brand-dark))]">
                      Price (₹) <span className="text-[hsl(var(--brand-primary))]">*</span>
                    </Label>
                    <Input type="number" min={0} value={form.price}
                      onChange={(e) => set("price")(Number(e.target.value))} placeholder="0"
                       />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium font-poppins text-[hsl(var(--brand-dark))]">Discount (%)</Label>
                    <Input type="number" min={0} max={100} value={form.discountPercent}
                      onChange={(e) => set("discountPercent")(Number(e.target.value))} placeholder="0"
                      />
                  </div>
                </div>

                {/* Discounted price preview */}
                {form.discountPercent > 0 && form.price > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
                    <span className="text-sm">🏷️</span>
                    <p className="text-xs font-poppins text-green-700">
                      Final price: <strong>₹{(form.price - (form.price * form.discountPercent) / 100).toFixed(2)}</strong>
                      {" "}(₹{form.price} - {form.discountPercent}% off)
                    </p>
                  </div>
                )}

                {/* Initial Rating */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium font-poppins text-[hsl(var(--brand-dark))]">
                    Initial Rating <span className="text-gray-400 font-normal">(optional)</span>
                  </Label>
                  <StarPicker value={form.initialRating} onChange={(v) => set("initialRating")(v)} />
                  <p className="text-xs font-poppins text-gray-400">
                    Set a starting rating. Users will add reviews later.
                  </p>
                </div>

                {/* Best Seller */}
                <div className="flex items-center justify-between p-3 bg-orange-50/50 rounded-lg">
                  <div>
                    <p className="text-sm font-poppins font-medium text-[hsl(var(--brand-dark))]">⭐ Best Seller</p>
                    <p className="text-xs font-poppins text-gray-400">Mark as best seller to highlight it</p>
                  </div>
                  <Switch checked={form.isBestSeller} onChange={() => set("isBestSeller")(!form.isBestSeller)} />
                </div>
              </div>
            )}

            {/* ── DETAILS ── */}
            {activeTab === "details" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium font-poppins text-[hsl(var(--brand-dark))]">Prep Time (min)</Label>
                    <Input type="number" min={0} value={form.preparationTime}
                      onChange={(e) => set("preparationTime")(Number(e.target.value))} placeholder="0"
                      />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium font-poppins text-[hsl(var(--brand-dark))]">Serving Size</Label>
                    <Input value={form.servingSize} onChange={(e) => set("servingSize")(e.target.value)}
                      placeholder="1 person"
                       />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium font-poppins text-[hsl(var(--brand-dark))]">
                    Ingredients <span className="text-gray-400 font-normal">(comma separated)</span>
                  </Label>
                  <textarea value={form.ingredients} onChange={(e) => set("ingredients")(e.target.value)}
                    placeholder="e.g. Paneer, Onion, Capsicum, Tomato, Spices" rows={3}
                    className="w-full px-3 py-2 font-poppins text-sm rounded-lg border-2 border-[hsl(var(--brand-muted))] focus:border-[hsl(var(--brand-primary))] placeholder:text-gray-300 transition-all resize-none outline-none" />
                  {form.ingredients && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {form.ingredients.split(",").map((i) => i.trim()).filter(Boolean).map((ing, idx) => (
                        <span key={idx} className="text-xs font-poppins px-2 py-0.5 bg-orange-50 text-[hsl(var(--brand-primary))] rounded-full">
                          {ing}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── NUTRITION ── */}
            {activeTab === "nutrition" && (
              <div className="space-y-4">
                <p className="text-xs font-poppins text-gray-400">All values per serving (optional)</p>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { key: "calories", label: "Calories (kcal)", icon: "🔥" },
                    { key: "protein",  label: "Protein (g)",     icon: "💪" },
                    { key: "carbs",    label: "Carbs (g)",       icon: "🌾" },
                    { key: "fat",      label: "Fat (g)",         icon: "🥑" },
                  ] as const).map(({ key, label, icon }) => (
                    <div key={key} className="space-y-1.5">
                      <Label className="text-sm font-medium font-poppins text-[hsl(var(--brand-dark))]">
                        {icon} {label}
                      </Label>
                      <Input type="number" min={0} value={form[key]}
                        onChange={(e) => set(key)(Number(e.target.value))} placeholder="0"
                       />
                    </div>
                  ))}
                </div>
                {(form.calories > 0 || form.protein > 0 || form.carbs > 0 || form.fat > 0) && (
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {[
                      { label: "Cal",     value: form.calories, color: "text-orange-500", bg: "bg-orange-50" },
                      { label: "Protein", value: form.protein,  color: "text-blue-500",   bg: "bg-blue-50"   },
                      { label: "Carbs",   value: form.carbs,    color: "text-yellow-600", bg: "bg-yellow-50" },
                      { label: "Fat",     value: form.fat,      color: "text-red-500",    bg: "bg-red-50"    },
                    ].map(({ label, value, color, bg }) => (
                      <div key={label} className={`${bg} rounded-xl p-2 text-center`}>
                        <div className={`text-base font-satisfy font-bold ${color}`}>{value}</div>
                        <div className="text-xs font-poppins text-gray-500">{label}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-6 pb-6 pt-2 border-t border-gray-50 flex-shrink-0">
            <Button type="button" variant="outline" onClick={onClose}
              className="flex-1 h-10 font-poppins">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className={`flex-1 h-10 font-poppins font-semibold ${GRAD_BTN}`}>
              {isPending ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Saving...
                </span>
              ) : mode === "create" ? "Create Item" : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
//  DELETE MODAL — shadcn Dialog
// ═════════════════════════════════════════════════════════════════════════════
function DeleteModal({ open, item, onClose, onConfirm, isPending }: {
  open: boolean; item: MenuItem | null; onClose: () => void; onConfirm: () => void; isPending: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm rounded-2xl p-0 overflow-hidden gap-0">
      
        <div className="px-7 pt-6 pb-7 space-y-5 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-50">
            <span className="text-3xl">🗑️</span>
          </div>
          <div>
            <DialogTitle className="text-lg font-satisfy text-red-500">Delete Item?</DialogTitle>
            <DialogDescription className="text-sm font-poppins text-gray-500 mt-1">
              Are you sure you want to delete
            </DialogDescription>
            <p className="text-sm font-poppins font-semibold text-[hsl(var(--brand-dark))] mt-0.5">
              "{item?.name}"
            </p>
            <p className="text-xs font-poppins text-gray-400 mt-2">This action cannot be undone.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1 h-11 font-poppins">
              Cancel
            </Button>
            <Button onClick={onConfirm} disabled={isPending}
              className="flex-1 h-11 font-poppins font-semibold text-white bg-red-500 hover:bg-red-600">
              {isPending ? "Deleting..." : "Yes, Delete"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
//  TABLE SKELETON
// ═════════════════════════════════════════════════════════════════════════════
function TableSkeleton() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <tr key={i} className="animate-pulse border-b border-gray-50">
          <td className="px-4 py-3"><div className="w-10 h-10 bg-gray-100 rounded-lg" /></td>
          <td className="px-4 py-3"><div className="h-4 bg-gray-100 rounded w-32" /></td>
          <td className="px-4 py-3"><div className="h-4 bg-gray-100 rounded w-20" /></td>
          <td className="px-4 py-3"><div className="h-5 bg-gray-100 rounded-full w-14" /></td>
          <td className="px-4 py-3"><div className="h-4 bg-gray-100 rounded w-16" /></td>
          <td className="px-4 py-3 text-center"><div className="h-5 w-9 bg-gray-100 rounded-full mx-auto" /></td>
          <td className="px-4 py-3 text-center"><div className="h-5 w-9 bg-gray-100 rounded-full mx-auto" /></td>
          <td className="px-4 py-3"><div className="flex justify-center gap-2"><div className="h-8 w-14 bg-gray-100 rounded-lg" /><div className="h-8 w-8 bg-gray-100 rounded-lg" /></div></td>
        </tr>
      ))}
    </>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
//  MAIN PAGE
// ═════════════════════════════════════════════════════════════════════════════
export default function MenuItemsPage() {
  const { toast } = useToast()

  const [createModal,    setCreateModal]    = useState(false)
  const [editTarget,     setEditTarget]     = useState<MenuItem | null>(null)
  const [deleteTarget,   setDeleteTarget]   = useState<MenuItem | null>(null)
  const [togglingStatus, setTogglingStatus] = useState<string | null>(null)
  const [togglingAvail,  setTogglingAvail]  = useState<string | null>(null)
  const [search,         setSearch]         = useState("")
  const [typeFilter,     setTypeFilter]     = useState<string>("all")
  const [catFilter,      setCatFilter]      = useState<string>("all")

  // ── Data ─────────────────────────────────────────────────────────────────
  const { data: itemsData, isLoading, isError } = useGetAllItems()
  const { data: catsData }                       = useGetAllCategories()
  const items:      MenuItem[]                   = (itemsData?.data as any)?.items ?? []
  const categories: { _id: string; name: string }[] = (catsData?.data ?? []) as any

  // categoryId backend se populated aa sakta hai — extract _id safely
  const getCatId = (catId: any): string =>
    typeof catId === "object" ? catId?._id ?? "" : catId ?? ""

  const filtered = items.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === "all" || item.type === typeFilter
    const matchCat  = catFilter  === "all" || getCatId(item.categoryId) === catFilter
    return matchSearch && matchType && matchCat
  })

  const stats = {
    total:       items.length,
    active:      items.filter((i) => i.isActive).length,
    available:   items.filter((i) => i.isAvailable).length,
    bestSellers: items.filter((i) => i.isBestSeller).length,
  }

  // ── Mutations ─────────────────────────────────────────────────────────────
  const { mutate: createItem, isPending: creating } = useCreateItem({
    onSuccess: () => { toast({ title: "✅ Item created!" }); setCreateModal(false) },
    onError:   (err: any) => toast({ title: "Failed", description: err?.response?.data?.message, variant: "destructive" }),
  })

  const { mutate: updateItem, isPending: updating } = useUpdateItem({
    onSuccess: () => { toast({ title: "✅ Item updated!" }); setEditTarget(null) },
    onError:   (err: any) => toast({ title: "Failed", description: err?.response?.data?.message, variant: "destructive" }),
  })

  const { mutate: deleteItem, isPending: deleting } = useDeleteItem({
    onSuccess: () => { toast({ title: "🗑️ Item deleted!" }); setDeleteTarget(null) },
    onError:   (err: any) => toast({ title: "Failed", description: err?.response?.data?.message, variant: "destructive" }),
  })

  const { mutate: toggleStatus } = useToggleItemStatus({
    onSuccess: () => { setTogglingStatus(null); toast({ title: "Status updated!" }) },
    onError:   (err: any) => { setTogglingStatus(null); toast({ title: "Failed", description: err?.response?.data?.message, variant: "destructive" }) },
  })

  const { mutate: toggleAvail } = useToggleItemAvailability({
    onSuccess: () => { setTogglingAvail(null); toast({ title: "Availability updated!" }) },
    onError:   (err: any) => { setTogglingAvail(null); toast({ title: "Failed", description: err?.response?.data?.message, variant: "destructive" }) },
  })

  // ── FormData builder ──────────────────────────────────────────────────────
  const buildFormData = (form: ItemForm): FormData => {
    const fd = new FormData()
    fd.append("name",             form.name)
    fd.append("description",      form.description)
    fd.append("categoryId",       form.categoryId)
    fd.append("price",            String(form.price))
    fd.append("discountPercent",  String(form.discountPercent))
    fd.append("type",             form.type)
    fd.append("preparationTime",  String(form.preparationTime))
    fd.append("servingSize",      form.servingSize)
    fd.append("isBestSeller",     String(form.isBestSeller))
    fd.append("initialRating",    String(form.initialRating))
    const ingArr = form.ingredients.split(",").map((s) => s.trim()).filter(Boolean)
    fd.append("ingredients", JSON.stringify(ingArr))
    fd.append("nutrition[calories]", String(form.calories))
    fd.append("nutrition[protein]",  String(form.protein))
    fd.append("nutrition[carbs]",    String(form.carbs))
    fd.append("nutrition[fat]",      String(form.fat))
    if (form.image instanceof File) fd.append("image", form.image)
    return fd
  }

  const handleCreate = (form: ItemForm) => createItem(buildFormData(form))
  const handleUpdate = (form: ItemForm) => {
    if (!editTarget) return
    updateItem({ id: editTarget._id, formData: buildFormData(form) })
  }

  const getCatName = (id: any) => categories.find((c) => c._id === getCatId(id))?.name ?? "—"

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="p-4 md:p-6">

          {/* ── Modals ── */}
          <ItemModal
            open={createModal}
            mode="create"
            categories={categories}
            onClose={() => setCreateModal(false)}
            onSubmit={handleCreate}
            isPending={creating}
          />
          <ItemModal
            open={!!editTarget}
            mode="edit"
            categories={categories}
            initialImageUrl={editTarget?.image ?? undefined}
            initial={editTarget ? {
              name:            editTarget.name,
              description:     editTarget.description ?? "",
              categoryId:      (typeof editTarget.categoryId === "object" ? (editTarget.categoryId as any)?._id : editTarget.categoryId) ?? "",
              price:           editTarget.price,
              discountPercent: editTarget.discountPercent ?? 0,
              type:            editTarget.type as any,
              preparationTime: editTarget.preparationTime ?? 0,
              servingSize:     editTarget.servingSize ?? "1 person",
              ingredients:     (editTarget.ingredients ?? []).join(", "),
              calories:        Number(editTarget.nutrition?.calories ?? 0),
              protein:         Number(editTarget.nutrition?.protein  ?? 0),
              carbs:           Number(editTarget.nutrition?.carbs    ?? 0),
              fat:             Number(editTarget.nutrition?.fat      ?? 0),
              isBestSeller:    editTarget.isBestSeller ?? false,
              initialRating:   (editTarget.rating as any)?.averageRating ?? (editTarget.rating as number) ?? 0,
              image:           null,
            } : undefined}
            onClose={() => setEditTarget(null)}
            onSubmit={handleUpdate}
            isPending={updating}
          />
          <DeleteModal
            open={!!deleteTarget}
            item={deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onConfirm={() => deleteTarget && deleteItem(deleteTarget._id)}
            isPending={deleting}
          />

          <div className="max-w-7xl mx-auto space-y-5">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-satisfy text-[hsl(var(--brand-primary))]">Menu Items</h1>
                <p className="text-sm font-poppins text-gray-500 mt-0.5">Manage all your restaurant menu items</p>
              </div>
              <Button onClick={() => setCreateModal(true)} className={GRAD_BTN}>
                <Plus className="mr-2 h-4 w-4" /> New Item
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Total",        value: stats.total,       color: "hsl(var(--brand-primary))", bg: "bg-orange-50"  },
                { label: "Active",       value: stats.active,      color: "#10b981",                   bg: "bg-green-50"   },
                { label: "Available",    value: stats.available,   color: "#3b82f6",                   bg: "bg-blue-50"    },
                { label: "Best Sellers", value: stats.bestSellers, color: "#f59e0b",                   bg: "bg-yellow-50"  },
              ].map(({ label, value, color, bg }) => (
                <div key={label} className={`${bg} rounded-xl p-3 text-center`}>
                  <div className="text-xl font-satisfy font-bold" style={{ color }}>{value}</div>
                  <div className="text-xs font-poppins text-gray-500 mt-0.5">{label}</div>
                </div>
              ))}
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-3 px-5 py-3.5 border-b border-gray-50">
                <div className="relative flex-1 min-w-48">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
                  <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search items..."
                    />
                  {search && <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">✕</button>}
                </div>
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
                  className="h-9 px-3 font-poppins text-sm rounded-lg outline-none bg-white text-gray-600">
                  <option value="all">All Types</option>
                  <option value="Veg">🟢 Veg</option>
                  <option value="Non-Veg">🔴 Non-Veg</option>
                  <option value="Vegan">🌿 Vegan</option>
                </select>
                <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}
                  className="h-9 px-3 font-poppins text-sm rounded-lg outline-none bg-white text-gray-600">
                  <option value="all">All Categories</option>
                  {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
                <p className="text-xs font-poppins text-gray-400 ml-auto">
                  {filtered.length} of {items.length} items
                </p>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/60">
                      {["Image", "Name", "Category", "Type", "Price", "Active", "Available", "Actions"].map((h, i) => (
                        <th key={h} className={`px-4 py-3 text-xs font-semibold font-poppins text-gray-500 uppercase tracking-wider
                          ${i >= 5 ? "text-center" : i === 0 ? "text-center" : "text-left"}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {isLoading ? (
                      <TableSkeleton />
                    ) : isError ? (
                      <tr><td colSpan={8} className="py-16 text-center">
                        <span className="text-4xl block mb-2">⚠️</span>
                        <p className="font-satisfy text-lg text-red-400">Failed to load items</p>
                      </td></tr>
                    ) : filtered.length === 0 ? (
                      <tr><td colSpan={8} className="py-16 text-center">
                        <span className="text-4xl block mb-2">{search ? "🔍" : "🍽️"}</span>
                        <p className="font-satisfy text-lg text-[hsl(var(--brand-primary))]">
                          {search ? "No items found" : "No items yet"}
                        </p>
                        <p className="text-xs font-poppins text-gray-400 mt-1">
                          {search ? `No results for "${search}"` : "Add your first menu item"}
                        </p>
                        {!search && (
                          <Button onClick={() => setCreateModal(true)} className={`mt-4 h-9 px-4 font-poppins text-sm ${GRAD_BTN}`}>
                            + Add First Item
                          </Button>
                        )}
                      </td></tr>
                    ) : (
                      filtered.map((item) => (
                        <tr key={item._id} className={`transition-colors hover:bg-orange-50/20 ${!item.isActive ? "opacity-60" : ""}`}>

                          {/* Image */}
                          <td className="px-4 py-3 text-center">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-orange-50 flex items-center justify-center mx-auto">
                              {item.image
                                ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                : <span className="text-lg">🍽️</span>
                              }
                            </div>
                          </td>

                          {/* Name */}
                          <td className="px-4 py-3 max-w-xs">
                            <div className="flex items-center gap-1.5">
                              <p className="font-satisfy text-sm text-[hsl(var(--brand-dark))] truncate">{item.name}</p>
                              {item.isBestSeller && <span className="text-xs">⭐</span>}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              {(item.preparationTime ?? 0) > 0 && (
                                <span className="text-xs font-poppins text-gray-400">⏱ {item.preparationTime}min</span>
                              )}
                              {/* Rating display */}
                              {(item.rating as any)?.averageRating > 0 && (
                                <span className="text-xs font-poppins text-yellow-500">
                                  ★ {(item.rating as any).averageRating.toFixed(1)}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Category */}
                          <td className="px-4 py-3">
                            <span className="text-xs font-poppins text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">
                              {getCatName(item.categoryId)}
                            </span>
                          </td>

                          {/* Type */}
                          <td className="px-4 py-3"><TypeBadge type={item.type ?? ""} /></td>

                          {/* Price */}
                          <td className="px-4 py-3">
                            {(item.discountPercent ?? 0) > 0 ? (
                              <div>
                                <p className="text-sm font-poppins font-semibold text-[hsl(var(--brand-dark))]">
                                  ₹{item.discountedPrice?.toFixed(2)}
                                </p>
                                <p className="text-xs font-poppins text-gray-400 line-through">₹{item.price}</p>
                                <span className="text-xs font-poppins text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                                  -{item.discountPercent}%
                                </span>
                              </div>
                            ) : (
                              <p className="text-sm font-poppins font-semibold text-[hsl(var(--brand-dark))]">₹{item.price}</p>
                            )}
                          </td>

                          {/* Active Switch */}
                          <td className="px-4 py-3">
                            <div className="flex flex-col items-center gap-0.5">
                              <Switch checked={item.isActive}
                                onChange={() => { setTogglingStatus(item._id); toggleStatus(item._id) }}
                                disabled={togglingStatus === item._id} />
                              <span className={`text-xs font-poppins ${item.isActive ? "text-green-500" : "text-gray-400"}`}>
                                {togglingStatus === item._id ? "..." : item.isActive ? "On" : "Off"}
                              </span>
                            </div>
                          </td>

                          {/* Available Switch */}
                          <td className="px-4 py-3">
                            <div className="flex flex-col items-center gap-0.5">
                              <Switch checked={item.isAvailable}
                                onChange={() => { setTogglingAvail(item._id); toggleAvail(item._id) }}
                                disabled={togglingAvail === item._id} />
                              <span className={`text-xs font-poppins ${item.isAvailable ? "text-blue-500" : "text-gray-400"}`}>
                                {togglingAvail === item._id ? "..." : item.isAvailable ? "In Stock" : "Out"}
                              </span>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1.5">
                              <button onClick={() => setEditTarget(item)}
                                className={`h-8 px-3 rounded-lg text-xs font-poppins font-semibold text-white
                                  bg-gradient-to-r from-brand-primary to-brand-secondary
                                  hover:from-brand-primary/90 hover:to-brand-secondary/90 transition-all`}>
                                ✏️ Edit
                              </button>
                              <button onClick={() => setDeleteTarget(item)}
                                className="h-8 w-8 rounded-lg text-sm flex items-center justify-center
                                  bg-red-50 text-red-400 hover:bg-red-100 transition-all">
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              {!isLoading && filtered.length > 0 && (
                <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/40">
                  <p className="text-xs font-poppins text-gray-400">
                    Showing <span className="font-semibold text-[hsl(var(--brand-dark))]">{filtered.length}</span> of{" "}
                    <span className="font-semibold text-[hsl(var(--brand-dark))]">{items.length}</span> items
                  </p>
                </div>
              )}
            </div>
          </div>

      <Toaster />
    </div>
  )
}