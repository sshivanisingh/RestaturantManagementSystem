"use client"

import { useState } from "react"
import { useToast }  from "@/components/ui/use-toast"
import { Toaster }   from "@/components/ui/toaster"
import { Plus, RefreshCw, X, Trash2, Edit2, CheckCircle, Clock, XCircle } from "lucide-react"

import {
  useGetAllTables,
  useCreateTable,
  useUpdateTable,
  useDeleteTable,
  useUpdateTableStatus,
} from "@/src/hooks/useTable"
import type { Table } from "@/src/types"

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

const STATUS_CONFIG = {
  available: { card: "bg-green-50  border-green-200",  badge: "bg-green-100  text-green-700",  dot: "bg-green-500",  icon: CheckCircle, label: "Available" },
  occupied:  { card: "bg-red-50    border-red-200",    badge: "bg-red-100    text-red-700",    dot: "bg-red-500",    icon: XCircle,     label: "Occupied"  },
  reserved:  { card: "bg-yellow-50 border-yellow-200", badge: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500", icon: Clock,       label: "Reserved"  },
} as const

function StatCard({ label, value, color, bg, dotColor }: { label: string; value: number; color: string; bg: string; dotColor: string }) {
  return (
    <div className={`${bg} rounded-2xl p-5 border border-white`}>
      <div className="flex items-center gap-2 mb-1">
        <span className={`w-2 h-2 rounded-full ${dotColor}`} />
        <p className="text-xs font-poppins text-gray-500">{label}</p>
      </div>
      <p className={`text-3xl font-satisfy font-bold ${color}`}>{value}</p>
    </div>
  )
}

function TableCard({ table, onClick }: { table: Table; onClick: () => void }) {
  const cfg = STATUS_CONFIG[table.status]
  const Icon = cfg.icon
  return (
    <button onClick={onClick}
      className={`w-full text-left ${cfg.card} rounded-2xl border-2 p-5
        hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group`}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center shadow-sm">
          <Icon className={`w-5 h-5 ${table.status === "available" ? "text-green-600" : table.status === "occupied" ? "text-red-500" : "text-yellow-600"}`} />
        </div>
        <span className={`text-xs font-poppins font-semibold px-2.5 py-1 rounded-full ${cfg.badge}`}>{cfg.label}</span>
      </div>
      <p className="text-lg font-satisfy text-gray-800 group-hover:text-[hsl(var(--brand-primary))] transition-colors">{table.tableLabel}</p>
      <p className="text-xs font-poppins text-gray-400 mt-0.5">
        {table.status === "available" ? "Ready to seat" : table.status === "occupied" ? "Currently in use" : "Booking held"}
      </p>
    </button>
  )
}

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">{children}</div>
    </div>
  )
}

function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="bg-gradient-to-r from-brand-primary to-brand-secondary px-6 py-4 flex items-center justify-between">
      <h2 className="text-lg font-satisfy text-white">{title}</h2>
      <button onClick={onClose} className="text-white/80 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
    </div>
  )
}

function DeleteModal({ open, label, onConfirm, onClose, loading }: { open: boolean; label: string; onConfirm: () => void; onClose: () => void; loading: boolean }) {
  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader title="Delete Table" onClose={onClose} />
      <div className="p-6 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto">
          <Trash2 className="w-7 h-7 text-red-500" />
        </div>
        <div>
          <p className="font-satisfy text-gray-800 text-lg">Delete "{label}"?</p>
          <p className="text-sm font-poppins text-gray-400 mt-1">This action cannot be undone.</p>
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} disabled={loading}
            className="flex-1 h-10 rounded-xl border border-gray-200 text-sm font-poppins text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 h-10 rounded-xl bg-red-500 text-white text-sm font-poppins font-medium hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Deleting…</> : <><Trash2 className="w-4 h-4" />Delete</>}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default function TableServicesPage() {
  const { toast } = useToast()

  const { data: tablesRes, isLoading, isError, refetch, isFetching } = useGetAllTables()
  const tables: Table[] = tablesRes?.data ?? []

  const { mutate: createTable, isPending: isCreating } = useCreateTable({
    onSuccess: () => { toast({ title: "Table created" }); setCreateOpen(false); setCreateLabel("") },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  })
  const { mutate: updateTable, isPending: isUpdating } = useUpdateTable({
    onSuccess: () => { toast({ title: "Table updated" }); setEditOpen(false) },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  })
  const { mutate: deleteTable, isPending: isDeleting } = useDeleteTable({
    onSuccess: () => { toast({ title: "Table deleted" }); setDeleteOpen(false); setEditOpen(false) },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  })
  const { mutate: updateStatus, isPending: isStatusUpdating } = useUpdateTableStatus({
    onSuccess: () => { toast({ title: "Status updated" }); setEditOpen(false) },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  })

  const [createOpen,  setCreateOpen]  = useState(false)
  const [createLabel, setCreateLabel] = useState("")
  const [editOpen,    setEditOpen]    = useState(false)
  const [deleteOpen,  setDeleteOpen]  = useState(false)
  const [selected,    setSelected]    = useState<Table | null>(null)
  const [formStatus,  setFormStatus]  = useState<Table["status"]>("available")
  const [formLabel,   setFormLabel]   = useState("")
  const [filter,      setFilter]      = useState<"all" | Table["status"]>("all")

  const handleCreate = () => {
    if (!createLabel.trim()) { toast({ title: "Label required", variant: "destructive" }); return }
    createTable({ tableLabel: createLabel.trim() })
  }
  const openEdit = (table: Table) => { setSelected(table); setFormStatus(table.status); setFormLabel(table.tableLabel); setEditOpen(true) }
  const handleSave = () => {
    if (!selected) return
    if (formLabel.trim() !== selected.tableLabel) { updateTable({ id: selected._id, data: { tableLabel: formLabel.trim(), status: formStatus } }); return }
    if (formStatus !== selected.status) { updateStatus({ id: selected._id, status: formStatus }); return }
    setEditOpen(false)
  }

  const isMutating = isUpdating || isStatusUpdating
  const filtered = filter === "all" ? tables : tables.filter((t) => t.status === filter)
  const stats = {
    available: tables.filter((t) => t.status === "available").length,
    occupied:  tables.filter((t) => t.status === "occupied").length,
    reserved:  tables.filter((t) => t.status === "reserved").length,
  }

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-satisfy text-[hsl(var(--brand-primary))]">Table Services</h1>
            <p className="text-sm font-poppins text-gray-500 mt-0.5">Manage restaurant tables and seating</p>
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
              <Plus className="w-4 h-4" /> Add Table
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Available" value={stats.available} color="text-green-600"  bg="bg-green-50"  dotColor="bg-green-500"  />
          <StatCard label="Occupied"  value={stats.occupied}  color="text-red-500"    bg="bg-red-50"    dotColor="bg-red-500"    />
          <StatCard label="Reserved"  value={stats.reserved}  color="text-yellow-600" bg="bg-yellow-50" dotColor="bg-yellow-500" />
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-2 flex-wrap">
          {(["all", "available", "occupied", "reserved"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`h-8 px-3.5 text-xs font-poppins font-medium rounded-full transition-all
                ${filter === f
                  ? "bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-500 hover:border-orange-300"}`}>
              {capitalize(f)}
              <span className="ml-1 opacity-70">({f === "all" ? tables.length : stats[f as keyof typeof stats]})</span>
            </button>
          ))}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <div key={i} className="bg-gray-100 animate-pulse rounded-2xl h-32" />)}
          </div>
        )}

        {/* Error */}
        {isError && !isLoading && (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <p className="font-poppins text-red-500 text-sm">Failed to load tables.</p>
            <button onClick={() => refetch()} className="h-9 px-4 rounded-xl border border-gray-200 text-sm font-poppins text-gray-600 hover:bg-gray-50 transition-colors">Try again</button>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && tables.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center"><span className="text-3xl">🪑</span></div>
            <div className="text-center">
              <p className="font-satisfy text-[hsl(var(--brand-primary))] text-lg">No tables yet</p>
              <p className="font-poppins text-gray-400 text-sm mt-1">Add your first table to get started</p>
            </div>
            <button onClick={() => setCreateOpen(true)}
              className="h-10 px-5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white text-sm font-poppins font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" /> Add Table
            </button>
          </div>
        )}

        {/* Grid */}
        {!isLoading && !isError && filtered.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((table) => <TableCard key={table._id} table={table} onClick={() => openEdit(table)} />)}
          </div>
        )}

        {!isLoading && !isError && tables.length > 0 && filtered.length === 0 && (
          <div className="py-16 text-center"><p className="font-poppins text-gray-400 text-sm">No {filter} tables found.</p></div>
        )}
      </div>

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => { setCreateOpen(false); setCreateLabel("") }}>
        <ModalHeader title="Add New Table" onClose={() => { setCreateOpen(false); setCreateLabel("") }} />
        <div className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-poppins font-medium text-gray-500">Table Label</label>
            <input autoFocus value={createLabel} onChange={(e) => setCreateLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()} placeholder="e.g. T1, Table 5, VIP 1"
              className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-poppins
                placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition-all" />
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setCreateOpen(false); setCreateLabel("") }} disabled={isCreating}
              className="flex-1 h-10 rounded-xl border border-gray-200 text-sm font-poppins text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button onClick={handleCreate} disabled={isCreating}
              className="flex-1 h-10 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white text-sm font-poppins font-medium hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2">
              {isCreating ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating…</> : <><Plus className="w-4 h-4" />Create Table</>}
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)}>
        <ModalHeader title={`Edit — ${selected?.tableLabel ?? ""}`} onClose={() => setEditOpen(false)} />
        <div className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-poppins font-medium text-gray-500">Table Label</label>
            <input value={formLabel} onChange={(e) => setFormLabel(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-poppins
                focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-poppins font-medium text-gray-500">Status</label>
            <div className="grid grid-cols-3 gap-2">
              {(["available", "occupied", "reserved"] as const).map((s) => {
                const cfg = STATUS_CONFIG[s]; const Icon = cfg.icon
                return (
                  <button key={s} onClick={() => setFormStatus(s)}
                    className={`h-11 rounded-xl flex flex-col items-center justify-center gap-0.5 border-2 transition-all
                      ${formStatus === s ? "border-[hsl(var(--brand-primary))] bg-orange-50" : "border-gray-100 bg-gray-50 hover:border-gray-200"}`}>
                    <Icon className={`w-4 h-4 ${s === "available" ? "text-green-600" : s === "occupied" ? "text-red-500" : "text-yellow-600"}`} />
                    <span className="text-[10px] font-poppins font-medium text-gray-600">{cfg.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={() => setDeleteOpen(true)}
              className="h-10 px-3 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
            <button onClick={() => setEditOpen(false)} disabled={isMutating}
              className="flex-1 h-10 rounded-xl border border-gray-200 text-sm font-poppins text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button onClick={handleSave} disabled={isMutating}
              className="flex-1 h-10 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white text-sm font-poppins font-medium hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2">
              {isMutating ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</> : <><Edit2 className="w-4 h-4" />Save Changes</>}
            </button>
          </div>
        </div>
      </Modal>

      <DeleteModal open={deleteOpen} label={selected?.tableLabel ?? ""}
        onConfirm={() => selected && deleteTable(selected._id)}
        onClose={() => setDeleteOpen(false)} loading={isDeleting} />

      <Toaster />
    </div>
  )
}
