"use client"

import type React from "react"
import { useState } from "react"
import { Input }    from "@/components/ui/input"
import { Label }    from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Toaster }  from "@/components/ui/toaster"
import {
  Bike, Car, CheckCircle2, ChevronLeft, ChevronRight,
  MapPin, Phone, Plus, RefreshCw, Search,
  Shield, ShieldCheck, Star, Truck, User, XCircle, Zap,
  Package, IndianRupee, Clock, AlertCircle, X,
} from "lucide-react"

import type { DeliveryBoy, VehicleType } from "@/src/types/api.types"
import {
  useGetAllDeliveryBoys,
  useRegisterDeliveryBoy,
  useUpdateDeliveryBoyProfile,
  useApproveDeliveryBoy,
} from "@/src/hooks/usedeliveryboy"

const PAGE_SIZE = 15

interface FormState {
  name: string; email: string; phone: string; password: string
  vehicleType: VehicleType; vehicleNumber: string
  isApproved: boolean; isActive: boolean
}
const EMPTY_FORM: FormState = {
  name: "", email: "", phone: "", password: "",
  vehicleType: "bike", vehicleNumber: "",
  isApproved: false, isActive: true,
}

const VehicleIcon = ({ type, className = "" }: { type: VehicleType; className?: string }) =>
  type === "car" ? <Car className={className} /> : <Bike className={className} />

const StatusDot = ({ online }: { online: boolean }) => (
  <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${online ? "bg-emerald-400 animate-pulse" : "bg-gray-300"}`} />
)

function StatusBadge({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-poppins font-semibold px-2 py-0.5 rounded-full ${color}`}>
      {children}
    </span>
  )
}

function Modal({ open, onClose, children, wide = false }: { open: boolean; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${wide ? "max-w-lg" : "max-w-md"} max-h-[90vh] overflow-hidden flex flex-col`}>
        {children}
      </div>
    </div>
  )
}

function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="bg-gradient-to-r from-brand-primary to-brand-secondary px-6 py-4 flex items-center justify-between flex-shrink-0">
      <h2 className="text-lg font-satisfy text-white">{title}</h2>
      <button onClick={onClose} className="text-white/80 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
    </div>
  )
}

function SkeletonRow() {
  return (
    <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_1fr_40px] gap-4 px-5 py-4 items-center border-b border-gray-50 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 bg-gray-200 rounded w-3/4" />
          <div className="h-2 bg-gray-100 rounded w-1/2" />
        </div>
      </div>
      {[...Array(5)].map((_, i) => <div key={i} className="h-3 bg-gray-100 rounded w-3/4" />)}
    </div>
  )
}

function Toggle({ checked, onChange, color = "bg-emerald-500" }: { checked: boolean; onChange: () => void; color?: string }) {
  return (
    <button type="button" onClick={onChange}
      className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${checked ? color : "bg-gray-300"}`}>
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  )
}

export default function DeliveryBoysPage() {
  const { toast } = useToast()

  const [search,     setSearch]     = useState("")
  const [activeTab,  setActiveTab]  = useState("all")
  const [page,       setPage]       = useState(1)
  const [detailOpen, setDetailOpen] = useState(false)
  const [formOpen,   setFormOpen]   = useState(false)
  const [selected,   setSelected]   = useState<DeliveryBoy | null>(null)
  const [form,       setForm]       = useState<FormState>(EMPTY_FORM)
  const [formMode,   setFormMode]   = useState<"create" | "edit">("create")

  const isOnlineFilter =
    activeTab === "online"  ? true  :
    activeTab === "offline" ? false : undefined

  const { data, isLoading, isError, refetch, isFetching } =
    useGetAllDeliveryBoys({ page, limit: PAGE_SIZE, isOnline: isOnlineFilter })

  const boys       = data?.data?.deliveryBoys ?? []
  const total      = data?.data?.total        ?? 0
  const totalPages = data?.data?.totalPages   ?? 1

  const { mutate: registerBoy, isPending: registering } = useRegisterDeliveryBoy({
    onSuccess: () => { toast({ title: "Delivery boy registered successfully" }); setFormOpen(false) },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  })
  const { mutate: updateProfile, isPending: updating } = useUpdateDeliveryBoyProfile({
    onSuccess: () => { toast({ title: "Profile updated successfully" }); setFormOpen(false) },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  })
  const { mutate: approveBoy, isPending: approving } = useApproveDeliveryBoy({
    onSuccess: (_, vars) => {
      const msg = vars.isApproved === true ? "Account approved" : vars.isApproved === false ? "Approval revoked" : vars.isActive === false ? "Account deactivated" : "Account activated"
      toast({ title: msg }); setDetailOpen(false)
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  })

  const filtered = boys
    .filter((b) => { if (!search.trim()) return true; const q = search.toLowerCase(); return b.name.toLowerCase().includes(q) || b.email.toLowerCase().includes(q) || b.phone.includes(q) })
    .filter((b) => { if (activeTab === "pending") return !b.isApproved; if (activeTab === "inactive") return !b.isActive; return true })

  const online   = boys.filter((b) => b.isOnline).length
  const pending  = boys.filter((b) => !b.isApproved).length
  const inactive = boys.filter((b) => !b.isActive).length

  const openCreate = () => { setForm(EMPTY_FORM); setFormMode("create"); setFormOpen(true) }
  const openEdit   = (b: DeliveryBoy) => { setForm({ name: b.name, email: b.email, phone: b.phone, password: "", vehicleType: b.vehicleType, vehicleNumber: b.vehicleNumber ?? "", isApproved: b.isApproved, isActive: b.isActive }); setFormMode("edit"); setSelected(b); setFormOpen(true) }
  const openDetail = (b: DeliveryBoy) => { setSelected(b); setDetailOpen(true) }
  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { const { name, value } = e.target; setForm((p) => ({ ...p, [name]: value })) }
  const handleSubmit = () => {
    if (!form.name || !form.email || !form.phone) { toast({ title: "Required fields missing", variant: "destructive" }); return }
    if (formMode === "create") {
      if (!form.password) { toast({ title: "Password required", variant: "destructive" }); return }
      registerBoy({ name: form.name, email: form.email, phone: form.phone, password: form.password, vehicleType: form.vehicleType, vehicleNumber: form.vehicleNumber || undefined })
    } else {
      updateProfile({ name: form.name, phone: form.phone, vehicleType: form.vehicleType, vehicleNumber: form.vehicleNumber || undefined })
    }
  }
  const handleTabChange = (tab: string) => { setActiveTab(tab); setPage(1); setSearch("") }
  const handlePage      = (p: number)   => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }) }

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-satisfy text-[hsl(var(--brand-primary))]">Delivery Boys</h1>
            <p className="text-sm font-poppins text-gray-500 mt-0.5">Manage delivery partners · {isLoading ? "…" : `${total} registered`}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => refetch()} disabled={isFetching}
              className="h-9 px-3 rounded-xl border border-gray-200 bg-white text-sm font-poppins text-gray-500 hover:border-orange-300 transition-colors flex items-center gap-1.5 disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} /> Refresh
            </button>
            <button onClick={openCreate}
              className="h-9 px-4 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white text-sm font-poppins font-medium flex items-center gap-1.5 hover:opacity-90 transition-opacity shadow-sm">
              <Plus className="w-4 h-4" /> Add Delivery Boy
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Total Registered", value: isLoading ? "—" : total,    icon: User,    color: "text-violet-600",  bg: "bg-violet-50"  },
            { label: "Online Now",        value: isLoading ? "—" : online,   icon: Zap,     color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Pending Approval",  value: isLoading ? "—" : pending,  icon: Clock,   color: "text-amber-600",   bg: "bg-amber-50"   },
            { label: "Inactive",          value: isLoading ? "—" : inactive, icon: XCircle, color: "text-red-500",     bg: "bg-red-50"     },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className={`${bg} rounded-2xl p-5 border border-white`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-poppins text-gray-500 mb-1">{label}</p>
                  <p className={`text-2xl font-satisfy font-bold ${color}`}>{value}</p>
                </div>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/60">
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search name, email, phone…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {([{ key: "all", label: "All" }, { key: "online", label: "Online" }, { key: "pending", label: "Pending" }, { key: "inactive", label: "Inactive" }] as const).map(({ key, label }) => (
              <button key={key} onClick={() => handleTabChange(key)}
                className={`h-8 px-3.5 text-xs font-poppins font-medium rounded-full transition-all
                  ${activeTab === key ? "bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-sm" : "bg-white border border-gray-200 text-gray-500 hover:border-orange-300"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="hidden md:grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_1fr_40px] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-poppins font-semibold text-gray-400 uppercase tracking-wide">
            <span>Delivery Boy</span><span>Vehicle</span><span>Status</span><span>Deliveries</span><span>Rating</span><span>Earnings</span><span />
          </div>

          {isLoading && [...Array(6)].map((_, i) => <SkeletonRow key={i} />)}

          {isError && !isLoading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <AlertCircle className="w-10 h-10 text-red-300" />
              <p className="font-poppins text-sm text-gray-500">Failed to load delivery boys</p>
              <button onClick={() => refetch()} className="h-8 px-4 rounded-xl border border-gray-200 text-sm font-poppins text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" /> Try Again
              </button>
            </div>
          )}

          {!isLoading && !isError && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center"><Truck className="w-7 h-7 text-orange-300" /></div>
              <div className="text-center">
                <p className="font-satisfy text-[hsl(var(--brand-primary))] text-lg">{search ? `No results for "${search}"` : "No delivery boys found"}</p>
                {search && <button onClick={() => setSearch("")} className="text-xs font-poppins text-orange-500 underline mt-1">Clear search</button>}
              </div>
            </div>
          )}

          {!isLoading && !isError && filtered.map((boy, idx) => (
            <div key={boy._id}
              className={`grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_1fr_40px] gap-4 px-5 py-4 items-center hover:bg-orange-50/40 transition-colors cursor-pointer ${isFetching ? "opacity-60 pointer-events-none" : ""} ${idx !== filtered.length - 1 ? "border-b border-gray-50" : ""}`}
              onClick={() => openDetail(boy)}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white font-satisfy text-base select-none">
                    {boy.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5"><StatusDot online={boy.isOnline} /></span>
                </div>
                <div className="min-w-0">
                  <p className="font-poppins font-semibold text-gray-800 text-sm truncate">{boy.name}</p>
                  <p className="text-xs font-poppins text-gray-400 truncate">{boy.email}</p>
                  <div className="flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3 text-gray-300" /><span className="text-xs font-poppins text-gray-400">{boy.phone}</span></div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0"><VehicleIcon type={boy.vehicleType} className="w-4 h-4 text-orange-400" /></div>
                <div className="min-w-0">
                  <p className="text-sm font-poppins text-gray-700 capitalize">{boy.vehicleType}</p>
                  {boy.vehicleNumber && <p className="text-xs font-mono text-gray-400 truncate">{boy.vehicleNumber}</p>}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                {!boy.isApproved ? <StatusBadge color="bg-amber-100 text-amber-700">Pending</StatusBadge>
                  : !boy.isActive ? <StatusBadge color="bg-red-100 text-red-700">Inactive</StatusBadge>
                  : boy.isOnline ? <StatusBadge color="bg-emerald-100 text-emerald-700">Online</StatusBadge>
                  : <StatusBadge color="bg-gray-100 text-gray-500">Offline</StatusBadge>}
                {boy.currentOrderId && <StatusBadge color="bg-blue-100 text-blue-700">On Delivery</StatusBadge>}
              </div>
              <div className="flex items-center gap-1.5"><Package className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" /><span className="text-sm font-poppins font-semibold text-gray-700">{boy.totalDeliveries}</span></div>
              <div>
                {boy.totalRatings > 0 ? (
                  <><div className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /><span className="text-sm font-poppins font-semibold text-gray-700">{boy.averageRating.toFixed(1)}</span></div><p className="text-xs font-poppins text-gray-400">{boy.totalRatings} reviews</p></>
                ) : <span className="text-xs font-poppins text-gray-400">No ratings</span>}
              </div>
              <div className="flex items-center gap-1"><IndianRupee className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" /><span className="text-sm font-poppins font-semibold text-gray-700">{boy.totalEarnings.toLocaleString("en-IN")}</span></div>
              <div className="flex items-center justify-center text-gray-300 hover:text-orange-400 transition-colors" onClick={(e) => { e.stopPropagation(); openDetail(boy) }}>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          ))}

          {!isLoading && !isError && totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs font-poppins text-gray-500">Page {page} of {totalPages} · {total} total</p>
              <div className="flex items-center gap-1">
                <button disabled={page <= 1 || isFetching} onClick={() => handlePage(page - 1)} className="h-7 w-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-40 transition-colors"><ChevronLeft className="w-3.5 h-3.5" /></button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const p = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i
                  return <button key={p} disabled={isFetching} onClick={() => handlePage(p)} className={`h-7 w-7 rounded-lg text-xs font-poppins font-medium transition-all ${p === page ? "bg-gradient-to-r from-brand-primary to-brand-secondary text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>{p}</button>
                })}
                <button disabled={page >= totalPages || isFetching} onClick={() => handlePage(page + 1)} className="h-7 w-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-40 transition-colors"><ChevronRight className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} wide>
        <ModalHeader title="Delivery Boy Details" onClose={() => setDetailOpen(false)} />
        {selected && (
          <div className="overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white font-satisfy text-2xl flex-shrink-0">{selected.name.charAt(0)}</div>
                <div>
                  <p className="font-satisfy text-gray-800 text-lg">{selected.name}</p>
                  <p className="text-xs font-poppins text-gray-400">Joined {new Date(selected.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge color={selected.isApproved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}>
                  {selected.isApproved ? <><ShieldCheck className="w-3 h-3" /> Approved</> : <><Shield className="w-3 h-3" /> Pending</>}
                </StatusBadge>
                <StatusBadge color={selected.isActive ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"}>{selected.isActive ? "Active" : "Inactive"}</StatusBadge>
                <StatusBadge color={selected.isOnline ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}><StatusDot online={selected.isOnline} /><span className="ml-1">{selected.isOnline ? "Online" : "Offline"}</span></StatusBadge>
                {selected.currentOrderId && <StatusBadge color="bg-blue-100 text-blue-700"><Truck className="w-3 h-3" /> On Delivery</StatusBadge>}
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                <p className="text-xs font-poppins font-semibold text-gray-400 uppercase tracking-wide">Contact Info</p>
                {[
                  { icon: <User className="w-4 h-4" />,  label: "Email",     value: selected.email },
                  { icon: <Phone className="w-4 h-4" />, label: "Phone",     value: selected.phone },
                  { icon: <VehicleIcon type={selected.vehicleType} className="w-4 h-4" />, label: "Vehicle", value: `${selected.vehicleType.charAt(0).toUpperCase() + selected.vehicleType.slice(1)}${selected.vehicleNumber ? " · " + selected.vehicleNumber : ""}` },
                  { icon: <MapPin className="w-4 h-4" />, label: "Last Seen", value: selected.lastLocationUpdatedAt ? `Updated ${new Date(selected.lastLocationUpdatedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}` : "Location not available" },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <span className="text-gray-400 flex-shrink-0">{icon}</span>
                    <span className="text-xs font-poppins text-gray-400 w-20 flex-shrink-0">{label}</span>
                    <span className="text-sm font-poppins text-gray-700 font-medium truncate">{value}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Deliveries", value: String(selected.totalDeliveries), icon: <Package className="w-4 h-4 text-violet-500" />, bg: "bg-violet-50" },
                  { label: "Rating", value: selected.totalRatings > 0 ? `${selected.averageRating.toFixed(1)} ★` : "—", sub: selected.totalRatings > 0 ? `${selected.totalRatings} reviews` : "", icon: <Star className="w-4 h-4 text-amber-400" />, bg: "bg-amber-50" },
                  { label: "Earnings", value: `₹${selected.totalEarnings.toLocaleString("en-IN")}`, icon: <IndianRupee className="w-4 h-4 text-emerald-500" />, bg: "bg-emerald-50" },
                ].map(({ label, value, sub, icon, bg }) => (
                  <div key={label} className={`${bg} rounded-xl p-3 text-center`}>
                    <div className="flex justify-center mb-1">{icon}</div>
                    <p className="text-sm font-poppins font-bold text-gray-800">{value}</p>
                    {sub && <p className="text-[10px] font-poppins text-gray-400">{sub}</p>}
                    <p className="text-[10px] font-poppins text-gray-400 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <button onClick={() => { setDetailOpen(false); openEdit(selected) }} className="h-9 px-4 rounded-xl border border-gray-200 text-sm font-poppins text-gray-600 hover:bg-gray-50 transition-colors">Edit Profile</button>
                <button disabled={approving} onClick={() => approveBoy({ deliveryBoyId: selected._id, isApproved: !selected.isApproved })}
                  className={`h-9 px-4 rounded-xl text-sm font-poppins font-medium flex items-center gap-1.5 transition-colors disabled:opacity-60 ${selected.isApproved ? "border border-amber-200 text-amber-600 hover:bg-amber-50" : "bg-emerald-500 text-white hover:bg-emerald-600"}`}>
                  {approving ? <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" /> : selected.isApproved ? <><XCircle className="w-3.5 h-3.5" /> Revoke</> : <><CheckCircle2 className="w-3.5 h-3.5" /> Approve</>}
                </button>
                <button disabled={approving} onClick={() => approveBoy({ deliveryBoyId: selected._id, isActive: !selected.isActive })}
                  className={`h-9 px-4 rounded-xl text-sm font-poppins font-medium flex items-center gap-1.5 border transition-colors disabled:opacity-60 ${selected.isActive ? "border-red-200 text-red-500 hover:bg-red-50" : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"}`}>
                  {selected.isActive ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Create / Edit Modal */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)}>
        <ModalHeader title={formMode === "create" ? "Register Delivery Boy" : "Edit Profile"} onClose={() => setFormOpen(false)} />
        <div className="overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none] p-6 space-y-4">
          <p className="text-xs font-poppins font-semibold text-gray-400 uppercase tracking-wide">Personal Info</p>
          <div className="space-y-1.5"><Label className="text-xs font-poppins font-medium text-gray-500">Full Name <span className="text-red-400">*</span></Label><Input name="name" value={form.name} onChange={handleInput} placeholder="e.g. Ravi Kumar" /></div>
          <div className="space-y-1.5"><Label className="text-xs font-poppins font-medium text-gray-500">Email <span className="text-red-400">*</span></Label><Input name="email" type="email" value={form.email} onChange={handleInput} placeholder="ravi@example.com" disabled={formMode === "edit"} /></div>
          <div className="space-y-1.5"><Label className="text-xs font-poppins font-medium text-gray-500">Phone <span className="text-red-400">*</span></Label><Input name="phone" value={form.phone} onChange={handleInput} placeholder="10-digit mobile" maxLength={10} /></div>
          {formMode === "create" && <div className="space-y-1.5"><Label className="text-xs font-poppins font-medium text-gray-500">Password <span className="text-red-400">*</span></Label><Input name="password" type="password" value={form.password} onChange={handleInput} placeholder="Min. 8 characters" /></div>}

          <p className="text-xs font-poppins font-semibold text-gray-400 uppercase tracking-wide pt-2">Vehicle Info</p>
          <div className="space-y-1.5">
            <Label className="text-xs font-poppins font-medium text-gray-500">Vehicle Type</Label>
            <select name="vehicleType" value={form.vehicleType} onChange={handleInput} className="w-full h-10 px-3 border border-input rounded-md text-sm font-poppins bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
              <option value="bike">Bike</option><option value="bicycle">Bicycle</option><option value="scooter">Scooter</option><option value="car">Car</option>
            </select>
          </div>
          <div className="space-y-1.5"><Label className="text-xs font-poppins font-medium text-gray-500">Vehicle Number <span className="text-gray-400 font-normal">(optional)</span></Label><Input name="vehicleNumber" value={form.vehicleNumber} onChange={handleInput} placeholder="e.g. DL 4C AB 1234" className="font-mono" /></div>

          {formMode === "create" && (
            <>
              <p className="text-xs font-poppins font-semibold text-gray-400 uppercase tracking-wide pt-2">Account Settings</p>
              {[
                { key: "isApproved" as const, label: "Approve Account", sub: "Allow to receive orders immediately", color: "bg-emerald-500" },
                { key: "isActive"   as const, label: "Active Account",  sub: "Deactivate to block login",          color: "bg-blue-500"    },
              ].map(({ key, label, sub, color }) => (
                <div key={key} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                  <div><p className="text-sm font-poppins font-medium text-gray-700">{label}</p><p className="text-xs font-poppins text-gray-400">{sub}</p></div>
                  <Toggle checked={form[key]} onChange={() => setForm((p) => ({ ...p, [key]: !p[key] }))} color={color} />
                </div>
              ))}
            </>
          )}
          <div className="flex gap-3 pt-2">
            <button onClick={() => setFormOpen(false)} disabled={registering || updating} className="flex-1 h-10 rounded-xl border border-gray-200 text-sm font-poppins text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">Cancel</button>
            <button onClick={handleSubmit} disabled={registering || updating} className="flex-1 h-10 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white text-sm font-poppins font-medium hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2">
              {(registering || updating) ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</> : formMode === "create" ? "Register" : "Save Changes"}
            </button>
          </div>
        </div>
      </Modal>

      <Toaster />
    </div>
  )
}
