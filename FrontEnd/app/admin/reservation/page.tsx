"use client"

import { useState } from "react"
import { useToast }  from "@/components/ui/use-toast"
import { Toaster }   from "@/components/ui/toaster"
import { Input }     from "@/components/ui/input"
import { Label }     from "@/components/ui/label"
import {
  CalendarRange, Search, RefreshCw, Plus, X,
  User, Phone, Mail, Clock, Users, CheckCircle2,
  XCircle, AlertCircle, LogIn, LogOut, Eye,
} from "lucide-react"

import type { Reservation, ReservationStatus } from "@/src/types/api.types"
import {
  useGetAllReservations,
  useCreateReservation,
  useConfirmReservation,
  useCancelReservation,
  useCheckIn,
  useCheckOut,
  useMarkNoShow,
} from "@/src/hooks/usereservation"
import { useGetAllTables } from "@/src/hooks/useTable"

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CFG: Record<ReservationStatus, { label: string; badge: string; dot: string }> = {
  pending:   { label: "Pending",   badge: "bg-amber-100 text-amber-700",   dot: "bg-amber-500"   },
  confirmed: { label: "Confirmed", badge: "bg-blue-100 text-blue-700",     dot: "bg-blue-500"    },
  completed: { label: "Completed", badge: "bg-green-100 text-green-700",   dot: "bg-green-500"   },
  cancelled: { label: "Cancelled", badge: "bg-red-100 text-red-700",       dot: "bg-red-400"     },
  "no-show": { label: "No Show",   badge: "bg-gray-100 text-gray-500",     dot: "bg-gray-400"    },
}

type ReservationWithTable = Reservation & { tableId: string; tableLabel: string }

// ─── Modal shell ──────────────────────────────────────────────────────────────
function Modal({ open, onClose, children, wide = false }: {
  open: boolean; onClose: () => void; children: React.ReactNode; wide?: boolean
}) {
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

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: ReservationStatus }) {
  const cfg = STATUS_CFG[status]
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-poppins font-semibold px-2.5 py-1 rounded-full ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

// ─── Info row ─────────────────────────────────────────────────────────────────
function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-gray-400 flex-shrink-0 mt-0.5">{icon}</span>
      <span className="text-xs font-poppins text-gray-400 w-24 flex-shrink-0">{label}</span>
      <span className="text-sm font-poppins text-gray-700 font-medium break-words">{value}</span>
    </div>
  )
}

// ─── Skeleton rows ────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className="grid grid-cols-[2fr_1fr_1.5fr_0.7fr_1fr_1fr] gap-4 px-5 py-4 items-center border-b border-gray-50 animate-pulse">
      <div className="space-y-1.5"><div className="h-3 bg-gray-200 rounded w-3/4" /><div className="h-2 bg-gray-100 rounded w-1/2" /></div>
      {[...Array(4)].map((_, i) => <div key={i} className="h-3 bg-gray-100 rounded w-3/4" />)}
      <div className="h-6 bg-gray-100 rounded-full w-20" />
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
export default function ReservationPage() {
  const { toast } = useToast()

  const [statusFilter, setStatusFilter] = useState<"all" | ReservationStatus>("all")
  const [dateFilter,   setDateFilter]   = useState("")
  const [search,       setSearch]       = useState("")
  const [detailOpen,   setDetailOpen]   = useState(false)
  const [createOpen,   setCreateOpen]   = useState(false)
  const [cancelOpen,   setCancelOpen]   = useState(false)
  const [selected,     setSelected]     = useState<ReservationWithTable | null>(null)
  const [cancelReason, setCancelReason] = useState("")

  // Create form state
  const [form, setForm] = useState({
    tableId: "", guestName: "", guestPhone: "", guestEmail: "",
    date: "", partySize: 2, durationMins: 60, specialRequest: "",
  })

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data, isLoading, isError, refetch, isFetching } = useGetAllReservations()
  const { data: tablesData } = useGetAllTables()

  const allReservations: ReservationWithTable[] = (data?.data ?? []) as ReservationWithTable[]
  const tables = (tablesData?.data ?? []) as { _id: string; tableLabel: string }[]

  // ── Mutations ──────────────────────────────────────────────────────────────
  const { mutate: createRes,  isPending: creating   } = useCreateReservation({
    onSuccess: () => { toast({ title: "Reservation created" }); setCreateOpen(false); resetForm() },
    onError:   (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  })
  const { mutate: confirmRes, isPending: confirming } = useConfirmReservation({
    onSuccess: () => { toast({ title: "Reservation confirmed" }); setDetailOpen(false) },
    onError:   (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  })
  const { mutate: cancelRes,  isPending: cancelling } = useCancelReservation({
    onSuccess: () => { toast({ title: "Reservation cancelled" }); setCancelOpen(false); setDetailOpen(false) },
    onError:   (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  })
  const { mutate: checkIn,    isPending: checkingIn  } = useCheckIn({
    onSuccess: () => { toast({ title: "Guest checked in" }); setDetailOpen(false) },
    onError:   (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  })
  const { mutate: checkOut,   isPending: checkingOut } = useCheckOut({
    onSuccess: () => { toast({ title: "Guest checked out" }); setDetailOpen(false) },
    onError:   (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  })
  const { mutate: noShow,     isPending: markingNoShow } = useMarkNoShow({
    onSuccess: () => { toast({ title: "Marked as no-show" }); setDetailOpen(false) },
    onError:   (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  })

  // ── Client filtering ───────────────────────────────────────────────────────
  const filtered = allReservations.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false
    if (dateFilter) {
      const rDate = new Date(r.date).toDateString()
      const fDate = new Date(dateFilter).toDateString()
      if (rDate !== fDate) return false
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      const name  = (r.guestName  ?? "").toLowerCase()
      const phone = (r.guestPhone ?? "").toLowerCase()
      const table = (r.tableLabel ?? "").toLowerCase()
      if (!name.includes(q) && !phone.includes(q) && !table.includes(q)) return false
    }
    return true
  })

  // ── Stats ──────────────────────────────────────────────────────────────────
  const today = new Date().toDateString()
  const stats = {
    total:     allReservations.length,
    pending:   allReservations.filter((r) => r.status === "pending").length,
    confirmed: allReservations.filter((r) => r.status === "confirmed").length,
    today:     allReservations.filter((r) => new Date(r.date).toDateString() === today).length,
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  const resetForm = () => setForm({ tableId: "", guestName: "", guestPhone: "", guestEmail: "", date: "", partySize: 2, durationMins: 60, specialRequest: "" })

  const handleCreate = () => {
    if (!form.tableId || !form.guestName || !form.guestPhone || !form.date) {
      toast({ title: "Required fields missing", variant: "destructive" }); return
    }
    createRes({ tableId: form.tableId, data: { guestName: form.guestName, guestPhone: form.guestPhone, guestEmail: form.guestEmail || undefined, date: form.date, partySize: form.partySize, durationMins: form.durationMins, specialRequest: form.specialRequest || undefined } })
  }

  const isActing = confirming || cancelling || checkingIn || checkingOut || markingNoShow

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-5">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-satisfy text-[hsl(var(--brand-primary))]">Reservations</h1>
            <p className="text-sm font-poppins text-gray-500 mt-0.5">Manage table bookings and guest reservations</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => refetch()} disabled={isFetching}
              className="h-9 px-3 rounded-xl border border-gray-200 bg-white text-sm font-poppins text-gray-500
                hover:border-orange-300 transition-colors flex items-center gap-1.5 disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} /> Refresh
            </button>
            <button onClick={() => setCreateOpen(true)}
              className="h-9 px-4 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary
                text-white text-sm font-poppins font-medium flex items-center gap-1.5 hover:opacity-90 transition-opacity shadow-sm">
              <Plus className="w-4 h-4" /> New Reservation
            </button>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Total Bookings", value: isLoading ? "—" : stats.total,     color: "text-[hsl(var(--brand-primary))]", bg: "bg-orange-50"  },
            { label: "Pending",        value: isLoading ? "—" : stats.pending,   color: "text-amber-600",                   bg: "bg-amber-50"   },
            { label: "Confirmed",      value: isLoading ? "—" : stats.confirmed, color: "text-blue-600",                    bg: "bg-blue-50"    },
            { label: "Today",          value: isLoading ? "—" : stats.today,     color: "text-emerald-600",                 bg: "bg-emerald-50" },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`${bg} rounded-2xl p-5 border border-white`}>
              <p className="text-xs font-poppins text-gray-500 mb-1">{label}</p>
              <p className={`text-3xl font-satisfy font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* ── Filters ── */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
          {/* Search */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Guest name, phone, table…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          {/* Date */}
          <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-input bg-background text-sm font-poppins focus:outline-none focus:ring-2 focus:ring-ring" />
          {dateFilter && (
            <button onClick={() => setDateFilter("")} className="h-8 px-3 text-xs font-poppins text-gray-500 hover:text-orange-500 border border-gray-200 rounded-lg transition-colors">Clear date</button>
          )}
          {/* Status chips */}
          <div className="flex items-center gap-2 flex-wrap">
            {(["all", "pending", "confirmed", "completed", "cancelled", "no-show"] as const).map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`h-8 px-3 text-xs font-poppins font-medium rounded-full transition-all capitalize
                  ${statusFilter === s
                    ? "bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-sm"
                    : "bg-white border border-gray-200 text-gray-500 hover:border-orange-300"}`}>
                {s === "all" ? `All (${allReservations.length})` : s === "no-show" ? "No Show" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* ── Table ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Header row */}
          <div className="hidden md:grid grid-cols-[2fr_1fr_1.5fr_0.7fr_1fr_1fr] gap-4 px-5 py-3
            bg-gray-50 border-b border-gray-100 text-xs font-poppins font-semibold text-gray-400 uppercase tracking-wide">
            <span>Guest</span><span>Table</span><span>Date & Time</span><span>Party</span><span>Duration</span><span>Status</span>
          </div>

          {isLoading && [...Array(5)].map((_, i) => <SkeletonRow key={i} />)}

          {isError && !isLoading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <AlertCircle className="w-10 h-10 text-red-300" />
              <p className="font-poppins text-sm text-gray-500">Failed to load reservations</p>
              <button onClick={() => refetch()} className="h-8 px-4 rounded-xl border border-gray-200 text-sm font-poppins text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" /> Try Again
              </button>
            </div>
          )}

          {!isLoading && !isError && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center">
                <CalendarRange className="w-7 h-7 text-orange-300" />
              </div>
              <div className="text-center">
                <p className="font-satisfy text-[hsl(var(--brand-primary))] text-lg">No reservations found</p>
                <p className="font-poppins text-gray-400 text-sm mt-1">Try adjusting filters or add a new booking</p>
              </div>
            </div>
          )}

          {!isLoading && !isError && filtered.map((r, idx) => (
            <div key={(r as any)._id ?? r.id}
              onClick={() => { setSelected(r); setDetailOpen(true) }}
              className={`grid grid-cols-[2fr_1fr_1.5fr_0.7fr_1fr_1fr] gap-4 px-5 py-4 items-center
                hover:bg-orange-50/40 transition-colors cursor-pointer
                ${isFetching ? "opacity-60 pointer-events-none" : ""}
                ${idx !== filtered.length - 1 ? "border-b border-gray-50" : ""}`}>
              {/* Guest */}
              <div className="min-w-0">
                <p className="font-poppins font-semibold text-gray-800 text-sm truncate">{r.guestName ?? "Guest"}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3 text-gray-300" />
                  <span className="text-xs font-poppins text-gray-400">{r.guestPhone ?? "—"}</span>
                </div>
              </div>
              {/* Table */}
              <span className="text-sm font-poppins font-semibold text-gray-700">{r.tableLabel ?? "—"}</span>
              {/* Date */}
              <div>
                <p className="text-sm font-poppins text-gray-700">{new Date(r.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                <p className="text-xs font-poppins text-gray-400">{new Date(r.date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p>
              </div>
              {/* Party */}
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-gray-300" />
                <span className="text-sm font-poppins font-semibold text-gray-700">{r.partySize}</span>
              </div>
              {/* Duration */}
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-gray-300" />
                <span className="text-sm font-poppins text-gray-600">{r.durationMins ? `${r.durationMins}m` : "—"}</span>
              </div>
              {/* Status */}
              <StatusBadge status={r.status} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Detail Modal ── */}
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} wide>
        <ModalHeader title="Reservation Details" onClose={() => setDetailOpen(false)} />
        {selected && (
          <div className="overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
            <div className="p-6 space-y-5">
              {/* Status + table */}
              <div className="flex items-center justify-between">
                <StatusBadge status={selected.status} />
                <span className="text-sm font-poppins font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">{selected.tableLabel}</span>
              </div>

              {/* Date/time highlight */}
              <div className="bg-orange-50 rounded-2xl px-5 py-4 flex items-center gap-3">
                <CalendarRange className="w-6 h-6 text-[hsl(var(--brand-primary))] flex-shrink-0" />
                <div>
                  <p className="font-satisfy text-[hsl(var(--brand-primary))] text-lg">
                    {new Date(selected.date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </p>
                  <p className="text-xs font-poppins text-orange-400">
                    {new Date(selected.date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    {selected.durationMins ? ` · ${selected.durationMins} min` : ""}
                    {" · "}{selected.partySize} guests
                  </p>
                </div>
              </div>

              {/* Guest info */}
              <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                <p className="text-xs font-poppins font-semibold text-gray-400 uppercase tracking-wide">Guest Info</p>
                <InfoRow icon={<User  className="w-4 h-4" />} label="Name"  value={selected.guestName} />
                <InfoRow icon={<Phone className="w-4 h-4" />} label="Phone" value={selected.guestPhone} />
                <InfoRow icon={<Mail  className="w-4 h-4" />} label="Email" value={selected.guestEmail} />
                {selected.specialRequest && (
                  <InfoRow icon={<AlertCircle className="w-4 h-4" />} label="Request" value={selected.specialRequest} />
                )}
              </div>

              {/* Timeline */}
              {(selected.checkedInAt || selected.checkedOutAt || selected.cancelReason) && (
                <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                  <p className="text-xs font-poppins font-semibold text-gray-400 uppercase tracking-wide">Timeline</p>
                  {selected.checkedInAt  && <InfoRow icon={<LogIn  className="w-4 h-4" />} label="Checked In"  value={new Date(selected.checkedInAt).toLocaleString("en-IN")} />}
                  {selected.checkedOutAt && <InfoRow icon={<LogOut className="w-4 h-4" />} label="Checked Out" value={new Date(selected.checkedOutAt).toLocaleString("en-IN")} />}
                  {selected.cancelReason && <InfoRow icon={<XCircle className="w-4 h-4 text-red-400" />} label="Cancel Reason" value={selected.cancelReason} />}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                {selected.status === "pending" && (
                  <>
                    <button disabled={isActing} onClick={() => confirmRes({ tableId: selected.tableId, reservationId: selected.id ?? (selected as any)._id })}
                      className="h-9 px-4 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white text-sm font-poppins font-medium flex items-center gap-1.5 hover:opacity-90 transition-opacity disabled:opacity-60">
                      {confirming ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Confirm
                    </button>
                    <button disabled={isActing} onClick={() => setCancelOpen(true)}
                      className="h-9 px-4 rounded-xl border border-red-200 text-red-500 text-sm font-poppins font-medium flex items-center gap-1.5 hover:bg-red-50 transition-colors disabled:opacity-60">
                      <XCircle className="w-4 h-4" /> Cancel
                    </button>
                  </>
                )}
                {selected.status === "confirmed" && !selected.checkedInAt && (
                  <>
                    <button disabled={isActing} onClick={() => checkIn({ tableId: selected.tableId, reservationId: selected.id ?? (selected as any)._id })}
                      className="h-9 px-4 rounded-xl bg-emerald-500 text-white text-sm font-poppins font-medium flex items-center gap-1.5 hover:bg-emerald-600 transition-colors disabled:opacity-60">
                      {checkingIn ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <LogIn className="w-4 h-4" />} Check In
                    </button>
                    <button disabled={isActing} onClick={() => setCancelOpen(true)}
                      className="h-9 px-4 rounded-xl border border-red-200 text-red-500 text-sm font-poppins font-medium flex items-center gap-1.5 hover:bg-red-50 transition-colors disabled:opacity-60">
                      <XCircle className="w-4 h-4" /> Cancel
                    </button>
                  </>
                )}
                {selected.status === "confirmed" && selected.checkedInAt && !selected.checkedOutAt && (
                  <>
                    <button disabled={isActing} onClick={() => checkOut({ tableId: selected.tableId, reservationId: selected.id ?? (selected as any)._id })}
                      className="h-9 px-4 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white text-sm font-poppins font-medium flex items-center gap-1.5 hover:opacity-90 transition-opacity disabled:opacity-60">
                      {checkingOut ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <LogOut className="w-4 h-4" />} Check Out
                    </button>
                    <button disabled={isActing} onClick={() => noShow({ tableId: selected.tableId, reservationId: selected.id ?? (selected as any)._id })}
                      className="h-9 px-4 rounded-xl border border-gray-200 text-gray-500 text-sm font-poppins font-medium flex items-center gap-1.5 hover:bg-gray-50 transition-colors disabled:opacity-60">
                      {markingNoShow ? <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" /> : <Eye className="w-4 h-4" />} No Show
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Cancel Reason Modal ── */}
      <Modal open={cancelOpen} onClose={() => { setCancelOpen(false); setCancelReason("") }}>
        <ModalHeader title="Cancel Reservation" onClose={() => { setCancelOpen(false); setCancelReason("") }} />
        <div className="p-6 space-y-4">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto">
            <XCircle className="w-7 h-7 text-red-500" />
          </div>
          <p className="text-center font-poppins text-sm text-gray-500">Are you sure you want to cancel this reservation?</p>
          <div className="space-y-1.5">
            <Label className="text-xs font-poppins font-medium text-gray-500">Reason (optional)</Label>
            <Input value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="e.g. Guest requested cancellation" />
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setCancelOpen(false); setCancelReason("") }} disabled={cancelling}
              className="flex-1 h-10 rounded-xl border border-gray-200 text-sm font-poppins text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">
              Go Back
            </button>
            <button disabled={cancelling}
              onClick={() => { if (!selected) return; cancelRes({ tableId: selected.tableId, reservationId: selected.id ?? (selected as any)._id, reason: cancelReason || undefined }) }}
              className="flex-1 h-10 rounded-xl bg-red-500 text-white text-sm font-poppins font-medium hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {cancelling ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Cancelling…</> : <><XCircle className="w-4 h-4" />Cancel Booking</>}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Create Reservation Modal ── */}
      <Modal open={createOpen} onClose={() => { setCreateOpen(false); resetForm() }} wide>
        <ModalHeader title="New Reservation" onClose={() => { setCreateOpen(false); resetForm() }} />
        <div className="overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none] p-6 space-y-4">
          <p className="text-xs font-poppins font-semibold text-gray-400 uppercase tracking-wide">Booking Details</p>

          <div className="space-y-1.5">
            <Label className="text-xs font-poppins font-medium text-gray-500">Table <span className="text-red-400">*</span></Label>
            <select value={form.tableId} onChange={(e) => setForm((p) => ({ ...p, tableId: e.target.value }))}
              className="w-full h-10 px-3 border border-input rounded-md text-sm font-poppins bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
              <option value="">Select a table</option>
              {tables.map((t) => <option key={t._id} value={t._id}>{t.tableLabel}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-poppins font-medium text-gray-500">Date & Time <span className="text-red-400">*</span></Label>
              <Input type="datetime-local" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-poppins font-medium text-gray-500">Party Size <span className="text-red-400">*</span></Label>
              <Input type="number" min={1} max={20} value={form.partySize} onChange={(e) => setForm((p) => ({ ...p, partySize: Number(e.target.value) }))} />
            </div>
          </div>

          <p className="text-xs font-poppins font-semibold text-gray-400 uppercase tracking-wide pt-1">Guest Info</p>
          <div className="space-y-1.5">
            <Label className="text-xs font-poppins font-medium text-gray-500">Guest Name <span className="text-red-400">*</span></Label>
            <Input value={form.guestName} onChange={(e) => setForm((p) => ({ ...p, guestName: e.target.value }))} placeholder="Full name" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-poppins font-medium text-gray-500">Phone <span className="text-red-400">*</span></Label>
              <Input value={form.guestPhone} onChange={(e) => setForm((p) => ({ ...p, guestPhone: e.target.value }))} placeholder="Phone number" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-poppins font-medium text-gray-500">Email <span className="text-gray-400 font-normal">(optional)</span></Label>
              <Input type="email" value={form.guestEmail} onChange={(e) => setForm((p) => ({ ...p, guestEmail: e.target.value }))} placeholder="email@example.com" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-poppins font-medium text-gray-500">Duration (mins)</Label>
              <Input type="number" min={15} step={15} value={form.durationMins} onChange={(e) => setForm((p) => ({ ...p, durationMins: Number(e.target.value) }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-poppins font-medium text-gray-500">Special Request</Label>
              <Input value={form.specialRequest} onChange={(e) => setForm((p) => ({ ...p, specialRequest: e.target.value }))} placeholder="e.g. window seat" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => { setCreateOpen(false); resetForm() }} disabled={creating}
              className="flex-1 h-10 rounded-xl border border-gray-200 text-sm font-poppins text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button onClick={handleCreate} disabled={creating}
              className="flex-1 h-10 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white text-sm font-poppins font-medium hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2">
              {creating ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating…</> : <><Plus className="w-4 h-4" />Create Booking</>}
            </button>
          </div>
        </div>
      </Modal>

      <Toaster />
    </div>
  )
}
