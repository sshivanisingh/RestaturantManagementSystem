"use client"

import { useState, useEffect } from "react"
import { Button }   from "@/components/ui/button"
import { Input }    from "@/components/ui/input"
import { Label }    from "@/components/ui/label"
import { Toaster }  from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import {
  useGetAllCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useToggleCategoryStatus,
} from "@/src/hooks"
import type {
  MenuCategory,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "@/src/types/api.types"

// ═════════════════════════════════════════════════════════════════════════════
//  AUTO EMOJI MAP  —  key: lowercase keyword,  value: emoji
//  Jab bhi name mein koi keyword match ho, woh emoji auto-select ho jaata hai
// ═════════════════════════════════════════════════════════════════════════════
const AUTO_EMOJI_MAP: Record<string, string> = {
  // Breakfast / Morning
  breakfast: "🌅", morning: "🌅", brunch: "🥞",
  pancake: "🥞", waffle: "🧇", egg: "🍳", omelette: "🍳",
  toast: "🍞", bread: "🥖", bagel: "🥯", croissant: "🥐",

  // Coffee / Tea / Drinks
  coffee: "☕", tea: "🍵", chai: "🍵", latte: "☕", espresso: "☕",
  juice: "🧃", smoothie: "🥤", shake: "🥤", milkshake: "🥤",
  drink: "🥤", beverage: "🍹", mocktail: "🍹", cocktail: "🍸",
  wine: "🍷", beer: "🍺", alcohol: "🍾", water: "💧",

  // Soups
  soup: "🍲", stew: "🫕", broth: "🍵", shorba: "🍲", rasam: "🍲",

  // Starters / Snacks
  starter: "🔥", starters: "🔥", appetizer: "🔥", snack: "🥨",
  finger: "🥨", fries: "🍟", chips: "🍟", nachos: "🌽",
  popcorn: "🍿", nuts: "🥜",

  // Salads / Healthy
  salad: "🥗", healthy: "🥬", diet: "🥗", green: "🥬",
  vegan: "🌿", vegetarian: "🥦", veggie: "🥦", plant: "🌱",
  bowl: "🥙", grain: "🌾",

  // Burgers / Sandwiches / Fast Food
  burger: "🍔", sandwich: "🥪", wrap: "🌯", roll: "🌯",
  hotdog: "🌭", sub: "🥪", taco: "🌮", burrito: "🌯",
  quesadilla: "🫔",

  // Pizza / Flatbreads
  pizza: "🍕", flatbread: "🫓", naan: "🫓", pita: "🫓",
  focaccia: "🥖",

  // Pasta / Noodles / Rice
  pasta: "🍝", noodle: "🍜", ramen: "🍜", spaghetti: "🍝",
  penne: "🍝", rice: "🍚", biryani: "🍛", pulao: "🍚",
  "fried rice": "🍚", risotto: "🍚",

  // Indian
  curry: "🍛", dal: "🫕", daal: "🫕", sabzi: "🥘", paneer: "🧀",
  tandoori: "🔥", tandoor: "🔥", kebab: "🍢", tikka: "🍢",
  korma: "🍛", masala: "🌶️", biryani2: "🍛", paratha: "🫓",
  roti: "🫓", chapati: "🫓", dosa: "🥞", idli: "🍚",
  samosa: "🥟", chaat: "🥘",

  // Chinese / Asian
  chinese: "🥡", asian: "🥢", dim: "🥟", dumpling: "🥟",
  gyoza: "🥟", sushi: "🍣", sashimi: "🐟", maki: "🍣",
  ramen2: "🍜", pho: "🍜", pad: "🍜", wonton: "🍲",
  spring: "🥟", "fried rice2": "🍳",

  // Seafood / Fish
  seafood: "🦞", fish: "🐟", prawn: "🦐", shrimp: "🦐",
  lobster: "🦞", crab: "🦀", squid: "🦑", salmon: "🐟",
  tuna: "🐟", "fish & chips": "🐟",

  // Meat / Grill / BBQ
  meat: "🥩", beef: "🥩", chicken: "🍗", mutton: "🍖",
  lamb: "🍖", pork: "🥓", bacon: "🥓", steak: "🥩",
  bbq: "🔥", grill: "🍖", grilled: "🍖", roast: "🍗",
  wings: "🍗",

  // Desserts / Sweets
  dessert: "🍰", sweet: "🍬", cake: "🎂", pastry: "🥐",
  cookie: "🍪", chocolate: "🍫", candy: "🍬", ice: "🍦",
  gelato: "🍨", pudding: "🍮", brownie: "🍫", pie: "🥧",
  halwa: "🍮", mithai: "🍬", ladoo: "🍡", barfi: "🍬",
  gulab: "🍡",

  // Fruits
  fruit: "🍎", mango: "🥭", apple: "🍎", banana: "🍌",
  strawberry: "🍓", berry: "🫐", orange: "🍊", pineapple: "🍍",
  watermelon: "🍉", coconut: "🥥", grape: "🍇",

  // Vegetable
  vegetable: "🥕", carrot: "🥕", corn: "🌽", mushroom: "🍄",
  potato: "🥔", tomato: "🍅", onion: "🧅", garlic: "🧄",

  // Specials / Trending
  special: "⭐", specials: "⭐", chef: "👨‍🍳", today: "📅",
  trending: "🔥", popular: "❤️", favorite: "❤️", new: "🆕",
  seasonal: "🌸", limited: "⏳", kids: "🧒", family: "👨‍👩‍👧",
  combo: "🎁", offer: "🎉", deal: "💰",

  // World Cuisines
  italian: "🇮🇹", mexican: "🇲🇽", thai: "🇹🇭", japanese: "🇯🇵",
  korean: "🇰🇷", american: "🍔", mediterranean: "🫒", continental: "🍽️",
  indian: "🇮🇳", fusion: "✨", arabic: "🫕", turkish: "🥙",

  // Default fallback
  menu: "🍽️", category: "🍽️", food: "🍽️", item: "🍽️",
}

// Keyword match — name se best emoji dhundho
function getAutoEmoji(name: string): string {
  if (!name.trim()) return ""
  const lower = name.toLowerCase()

  // 1. Exact match
  if (AUTO_EMOJI_MAP[lower]) return AUTO_EMOJI_MAP[lower]

  // 2. Partial match — pehla keyword jo name mein hai
  const match = Object.keys(AUTO_EMOJI_MAP).find((key) => lower.includes(key))
  if (match) return AUTO_EMOJI_MAP[match]

  // 3. No match — empty (user manually choose kar sakta hai)
  return "🍽️"
}

// ═════════════════════════════════════════════════════════════════════════════
//  TYPES
// ═════════════════════════════════════════════════════════════════════════════
interface CategoryFormState {
  name:        string
  description: string
  icon:        string
  sortOrder:   number
}
const EMPTY_FORM: CategoryFormState = { name: "", description: "", icon: "", sortOrder: 0 }

// Quick-pick emoji suggestions
const QUICK_EMOJIS = [
  "🍽️","🍔","🍕","🥗","🍜","🍣","🥩","🍰","☕","🥤",
  "🍱","🥘","🌮","🥪","🍛","🔥","⭐","🌿","🦐","🧁",
  "🍹","🥞","🫕","🍲","🥙","🎂","🍫","🍦","🍺","🍷",
]

// ═════════════════════════════════════════════════════════════════════════════
//  TOGGLE SWITCH
// ═════════════════════════════════════════════════════════════════════════════
function Switch({ checked, onChange, disabled }: {
  checked: boolean; onChange: () => void; disabled?: boolean
}) {
  return (
    <button type="button" role="switch" aria-checked={checked}
      onClick={onChange} disabled={disabled}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full
        border-2 border-transparent transition-colors duration-200 ease-in-out
        focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed
        ${checked ? "bg-green-500" : "bg-gray-200"}`}
    >
      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full
        bg-white shadow-md ring-0 transition duration-200 ease-in-out
        ${checked ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
//  CATEGORY FORM MODAL
// ═════════════════════════════════════════════════════════════════════════════
function CategoryModal({ mode, initial, onClose, onSubmit, isPending }: {
  mode: "create" | "edit"; initial?: CategoryFormState
  onClose: () => void; onSubmit: (d: CategoryFormState) => void; isPending: boolean
}) {
  const [form, setForm] = useState<CategoryFormState>(initial ?? EMPTY_FORM)
  const [autoDetected, setAutoDetected] = useState(false)
  const { toast } = useToast()

  const set = (key: keyof CategoryFormState) =>
    (val: string | number) => setForm((p) => ({ ...p, [key]: val }))

  // ✅ Name type karte hi auto emoji detect karo
  const handleNameChange = (name: string) => {
    setForm((prev) => {
      const emoji = getAutoEmoji(name)
      // Sirf tab override karo jab user ne manually icon nahi choose kiya
      // ya pehle bhi auto-detected tha
      const shouldAutoSet = !prev.icon || autoDetected
      if (shouldAutoSet && emoji) {
        setAutoDetected(true)
        return { ...prev, name, icon: emoji }
      }
      return { ...prev, name }
    })
  }

  // Jab user manually emoji choose kare toh auto-override band kar do
  const handleIconChange = (emoji: string) => {
    setAutoDetected(false)
    set("icon")(emoji)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast({ title: "Name required", description: "Category name cannot be empty", variant: "destructive" })
      return
    }
    onSubmit(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-orange-50
        flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">

        {/* Sticky close button */}
        <button onClick={onClose}
          className="absolute top-3.5 right-3.5 z-10 w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200
            flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors text-sm font-bold">
          ✕
        </button>

        {/* Scrollable body */}
        <div className="px-7 pt-6 pb-7 space-y-5 overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-r from-brand-primary to-brand-secondary shadow-md transition-all duration-300">
              {form.icon || (mode === "create" ? "➕" : "✏️")}
            </div>
            <div>
              <h3 className="text-lg font-satisfy text-[hsl(var(--brand-primary))]">
                {mode === "create" ? "New Category" : "Edit Category"}
              </h3>
              <p className="text-xs font-poppins text-gray-400">
                {mode === "create" ? "Icon auto-detect hoga name se ✨" : "Update category details"}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name — auto emoji trigger */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium font-poppins text-[hsl(var(--brand-dark))]">
                Name <span className="text-[hsl(var(--brand-primary))]">*</span>
              </Label>
              <div className="relative">
                <Input
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Biryani, Starters, Desserts..."
                  required
                  
                />
                {/* Auto-detect badge */}
                {autoDetected && form.icon && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-lg" title="Auto-detected icon">
                    {form.icon}
                  </span>
                )}
              </div>
              {autoDetected && (
                <p className="text-xs text-green-500 font-poppins flex items-center gap-1">
                  ✨ Icon auto-detect 
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium font-poppins text-[hsl(var(--brand-dark))]">
                Description <span className="text-gray-400 font-normal">(optional)</span>
              </Label>
              <textarea
                value={form.description}
                onChange={(e) => set("description")(e.target.value)}
                placeholder="Brief description of this category..."
                rows={1}
                className="w-full px-3 py-2.5 font-poppins text-sm rounded-lg border-2 border-[hsl(var(--brand-muted))] focus:border-[hsl(var(--brand-primary))] placeholder:text-gray-300 transition-all resize-none outline-none focus:shadow-[0_0_0_3px_hsl(var(--brand-primary)/10)]"
              />
            </div>

            {/* Icon — manual override */}
            <div className="space-y-2">
              <Label className="text-sm font-medium font-poppins text-[hsl(var(--brand-dark))]">
                Icon <span className="text-gray-400 font-normal">(ya manually choose karo)</span>
              </Label>

              {/* Quick-pick grid */}
              <div className="flex flex-wrap gap-1 p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleIconChange(emoji)}
                    className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center transition-all
                      hover:scale-110 border
                      ${form.icon === emoji
                        ? "border-[hsl(var(--brand-primary))] bg-orange-50 scale-110 shadow-sm"
                        : "border-gray-200 bg-white hover:border-orange-200"
                      }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Custom input */}
              <div className="flex gap-2">
                <div className="w-11 h-11 rounded-lg border-2 border-[hsl(var(--brand-muted))] flex items-center justify-center text-xl flex-shrink-0 bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10">
                  {form.icon || "🍽️"}
                </div>
                <Input
                  value={form.icon}
                  onChange={(e) => handleIconChange(e.target.value)}
                  placeholder="paste any imo ji"
                   
                />
              </div>
            </div>

            {/* Sort Order */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium font-poppins text-[hsl(var(--brand-dark))]">Sort Order</Label>
              <Input
                type="number" min={0} value={form.sortOrder}
                onChange={(e) => set("sortOrder")(Number(e.target.value))}
                placeholder="0"
             
              />
              <p className="text-xs font-poppins text-gray-400">Lower number = appears first in menu</p>
            </div>

            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" onClick={onClose}
                className="flex-1 h-11 font-poppins border-gray-200 hover:border-orange-300">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="flex-1 h-11 bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white font-poppins"
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Saving...
                  </span>
                ) : mode === "create" ? "Create Category" : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
//  DELETE MODAL
// ═════════════════════════════════════════════════════════════════════════════
function DeleteModal({ category, onClose, onConfirm, isPending }: {
  category: MenuCategory; onClose: () => void; onConfirm: () => void; isPending: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-red-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-7 pt-6 pb-7 space-y-5 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-50">
            <span className="text-3xl">🗑️</span>
          </div>
          <div>
            <h3 className="text-lg font-satisfy text-red-500">Delete Category?</h3>
            <p className="text-sm font-poppins text-gray-500 mt-1">Are you sure you want to delete</p>
            <p className="text-sm font-poppins font-semibold text-[hsl(var(--brand-dark))] mt-0.5">"{category.name}"</p>
            <p className="text-xs font-poppins text-gray-400 mt-2">This action cannot be undone.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1 h-11 font-poppins border-gray-200">Cancel</Button>
            <Button onClick={onConfirm} disabled={isPending}
              className="flex-1 h-11 bg-gradient-to-r from-red-500 to-pink-500 text-white font-poppins">
              {isPending ? "Deleting..." : "Yes, Delete"}
            </Button>
          </div>
        </div>
      </div>
    </div>
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
          <td className="px-6 py-4"><div className="flex items-center gap-2.5"><div className="w-8 h-8 bg-gray-100 rounded-lg" /><div className="h-4 bg-gray-100 rounded w-28" /></div></td>
          <td className="px-6 py-4"><div className="h-3 bg-gray-100 rounded w-44" /></td>
          <td className="px-6 py-4 text-center"><div className="h-7 w-7 bg-gray-100 rounded-full mx-auto" /></td>
          <td className="px-6 py-4 text-center"><div className="h-6 w-11 bg-gray-100 rounded-full mx-auto" /></td>
          <td className="px-6 py-4 text-center"><div className="h-3 bg-gray-100 rounded w-20 mx-auto" /></td>
          <td className="px-6 py-4"><div className="flex justify-center gap-2"><div className="h-8 w-16 bg-gray-100 rounded-lg" /><div className="h-8 w-8 bg-gray-100 rounded-lg" /></div></td>
        </tr>
      ))}
    </>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
//  MAIN PAGE
// ═════════════════════════════════════════════════════════════════════════════
export default function MenuCategoriesPage() {
  const { toast } = useToast()

  const [createModal,  setCreateModal]  = useState(false)
  const [editTarget,   setEditTarget]   = useState<MenuCategory | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<MenuCategory | null>(null)
  const [togglingId,   setTogglingId]   = useState<string | null>(null)
  const [search,       setSearch]       = useState("")

  const { data, isLoading, isError } = useGetAllCategories()
  const categories: MenuCategory[]   = data?.data ?? []

  const filtered = categories
    .filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))

  const activeCount   = categories.filter((c) => c.isActive).length
  const inactiveCount = categories.filter((c) => !c.isActive).length

  const { mutate: createCategory, isPending: creating } = useCreateCategory({
    onSuccess: () => {
      toast({ title: "✅ Category created!", description: "New category added to your menu." })
      setCreateModal(false)
    },
    onError: (err: any) => {
      toast({ title: "Failed", description: err?.response?.data?.message || "Could not create category", variant: "destructive" })
    },
  })

  const { mutate: updateCategory, isPending: updating } = useUpdateCategory({
    onSuccess: () => {
      toast({ title: "✅ Category updated!", description: "Changes saved successfully." })
      setEditTarget(null)
    },
    onError: (err: any) => {
      toast({ title: "Failed", description: err?.response?.data?.message || "Could not update category", variant: "destructive" })
    },
  })

  const { mutate: deleteCategory, isPending: deleting } = useDeleteCategory({
    onSuccess: () => {
      toast({ title: "🗑️ Deleted!", description: "Category removed from menu." })
      setDeleteTarget(null)
    },
    onError: (err: any) => {
      toast({ title: "Failed", description: err?.response?.data?.message || "Could not delete", variant: "destructive" })
    },
  })

  const { mutate: toggleStatus } = useToggleCategoryStatus({
    onSuccess: () => { setTogglingId(null); toast({ title: "Status updated!" }) },
    onError: (err: any) => {
      setTogglingId(null)
      toast({ title: "Failed", description: err?.response?.data?.message || "Could not toggle status", variant: "destructive" })
    },
  })

  const handleCreate = (form: CategoryFormState) =>
    createCategory({ name: form.name, description: form.description, icon: form.icon, sortOrder: form.sortOrder } as CreateCategoryPayload)

  const handleUpdate = (form: CategoryFormState) => {
    if (!editTarget) return
    updateCategory({ id: editTarget._id, payload: { name: form.name, description: form.description, icon: form.icon, sortOrder: form.sortOrder } as UpdateCategoryPayload })
  }

  const handleToggle = (id: string) => { setTogglingId(id); toggleStatus(id) }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">

      {createModal && (
        <CategoryModal mode="create" onClose={() => setCreateModal(false)} onSubmit={handleCreate} isPending={creating} />
      )}
      {editTarget && (
        <CategoryModal
          mode="edit"
          initial={{ name: editTarget.name, description: editTarget.description ?? "", icon: editTarget.icon ?? "", sortOrder: (editTarget as any).sortOrder ?? 0 }}
          onClose={() => setEditTarget(null)}
          onSubmit={handleUpdate}
          isPending={updating}
        />
      )}
      {deleteTarget && (
        <DeleteModal category={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteCategory(deleteTarget._id)} isPending={deleting} />
      )}

      <div className="max-w-6xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-satisfy text-[hsl(var(--brand-primary))]">Menu Categories</h1>
            <p className="text-sm font-poppins text-gray-500 mt-0.5">Manage your restaurant's menu sections</p>
          </div>
          <Button onClick={() => setCreateModal(true)}
            className="bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white">
            + New Category
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total",    value: categories.length, color: "hsl(var(--brand-primary))", bg: "bg-orange-50" },
            { label: "Active",   value: activeCount,       color: "#10b981",                   bg: "bg-green-50"  },
            { label: "Inactive", value: inactiveCount,     color: "#94a3b8",                   bg: "bg-gray-100"  },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`${bg} rounded-xl p-4 text-center border border-white`}>
              <div className="text-2xl font-satisfy font-bold" style={{ color }}>{value}</div>
              <div className="text-xs font-poppins text-gray-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-6 py-4 border-b border-gray-50">
            <p className="text-sm font-poppins text-gray-500">
              {isLoading ? "Loading..." : `${filtered.length} categor${filtered.length !== 1 ? "ies" : "y"}`}
            </p>
            <div className="relative w-full sm:w-64">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search categories..."
                className="h-9 pl-8 pr-8 font-poppins text-sm rounded-lg border border-gray-200 focus:border-[hsl(var(--brand-primary))] placeholder:text-gray-300 transition-all" />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">✕</button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  {["Name", "Description", "Order", "Status", "Created", "Actions"].map((h, i) => (
                    <th key={h} className={`px-6 py-3 text-xs font-semibold font-poppins text-gray-500 uppercase tracking-wider ${i >= 2 ? "text-center" : "text-left"}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? <TableSkeleton /> : isError ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <span className="text-4xl block mb-2">⚠️</span>
                      <p className="font-satisfy text-lg text-red-400">Failed to load categories</p>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <span className="text-4xl block mb-2">{search ? "🔍" : "🍽️"}</span>
                      <p className="font-satisfy text-lg text-[hsl(var(--brand-primary))]">
                        {search ? "No categories found" : "No categories yet"}
                      </p>
                      {!search && (
                        <Button onClick={() => setCreateModal(true)} className="mt-3 bg-gradient-to-r from-brand-primary to-brand-secondary text-white">
                          + Create First Category
                        </Button>
                      )}
                    </td>
                  </tr>
                ) : (
                  filtered.map((cat) => (
                    <tr key={cat._id} className={`transition-colors hover:bg-orange-50/30 ${!cat.isActive ? "opacity-60" : ""}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                            style={{ background: "hsl(var(--brand-primary)/10)" }}>
                            {cat.icon || "🍽️"}
                          </div>
                          <span className="font-satisfy text-sm text-[hsl(var(--brand-dark))] whitespace-nowrap">{cat.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <p className="text-xs font-poppins text-gray-400 truncate">
                          {cat.description || <span className="italic text-gray-300">No description</span>}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-orange-50 text-xs font-bold font-poppins text-[hsl(var(--brand-primary))]">
                          {(cat as any).sortOrder ?? 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-center gap-1">
                          <Switch checked={cat.isActive} onChange={() => handleToggle(cat._id)} disabled={togglingId === cat._id} />
                          <span className={`text-xs font-poppins ${cat.isActive ? "text-green-500" : "text-gray-400"}`}>
                            {togglingId === cat._id ? "..." : cat.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-xs font-poppins text-gray-400 whitespace-nowrap">
                          {new Date(cat.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => setEditTarget(cat)}
                            className="h-8 px-3 rounded-lg text-xs font-poppins font-medium border border-blue-200 text-blue-500 hover:bg-blue-50 transition-all">
                            ✏️ Edit
                          </button>
                          <button onClick={() => setDeleteTarget(cat)}
                            className="h-8 w-8 rounded-lg text-sm flex items-center justify-center border border-red-200 text-red-400 hover:bg-red-50 transition-all">
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

          {!isLoading && filtered.length > 0 && (
            <div className="px-6 py-3 border-t border-gray-50 bg-gray-50/40">
              <p className="text-xs font-poppins text-gray-400">
                Showing <span className="font-semibold text-[hsl(var(--brand-dark))]">{filtered.length}</span>
                {" "}of{" "}
                <span className="font-semibold text-[hsl(var(--brand-dark))]">{categories.length}</span> categories
              </p>
            </div>
          )}
        </div>
      </div>
      <Toaster />
    </div>
  )
}