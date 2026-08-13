"use client";

import { useState } from "react";
import { Toaster }  from "@/components/ui/toaster";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";
import { Plus, Trash2, Edit2, Plus as PlusIcon, Minus, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  useGetInventory,
  useCreateInventory,
  useUpdateInventory,
  useDeleteInventory,
  useAdjustStock,
} from "@/src/hooks/useInventory";

// ─── Shared gradient class ────────────────────────────────────────────────────
const GRAD = "bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white";

// ─── Table Skeleton ───────────────────────────────────────────────────────────
function TableSkeleton() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <tr key={i} className="animate-pulse border-b border-gray-50">
          <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-32" /></td>
          <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-16" /></td>
          <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-12" /></td>
          <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-12" /></td>
          <td className="px-6 py-4"><div className="h-6 bg-gray-100 rounded-full w-20" /></td>
          <td className="px-6 py-4"><div className="flex gap-2"><div className="h-8 w-8 bg-gray-100 rounded-lg" /><div className="h-8 w-8 bg-gray-100 rounded-lg" /><div className="h-8 w-8 bg-gray-100 rounded-lg" /><div className="h-8 w-8 bg-gray-100 rounded-lg" /></div></td>
        </tr>
      ))}
    </>
  );
}

// ─── Item Form Modal ───────────────────────────────────────────────────────────
function ItemModal({ mode, initial, onClose, onSubmit, isPending }: {
  mode:      "create" | "edit";
  initial?:  { name: string; quantity: string; unit: string; reorderLevel: string };
  onClose:   () => void;
  onSubmit:  (d: { name: string; quantity: string; unit: string; reorderLevel: string }) => void;
  isPending: boolean;
}) {
  const EMPTY = { name: "", quantity: "", unit: "", reorderLevel: "" };
  const [form, setForm] = useState(initial ?? EMPTY);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-orange-50
        flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">

        {/* Close */}
        <button onClick={onClose}
          className="absolute top-3.5 right-3.5 z-10 w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200
            flex items-center justify-center text-gray-400 hover:text-gray-700 text-sm font-bold">
          ✕
        </button>

        {/* Header */}
        <div className="px-7 pt-6 pb-4 border-b border-gray-50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: "linear-gradient(135deg, hsl(var(--brand-primary)), hsl(var(--brand-secondary)))" }}>
            {mode === "create" ? "📦" : "✏️"}
          </div>
          <div>
            <h3 className="text-lg font-satisfy text-[hsl(var(--brand-primary))]">
              {mode === "create" ? "Add Inventory Item" : "Edit Inventory Item"}
            </h3>
            <p className="text-xs font-poppins text-gray-400">Fill in the required fields</p>
          </div>
        </div>

        {/* Body */}
        <div className="px-7 py-5 space-y-4 overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
          {[
            { key: "name",         label: "Item Name",               placeholder: "e.g., Tomatoes",      type: "text",   required: true  },
            { key: "quantity",     label: "Quantity",                 placeholder: "0",                   type: "number", required: true  },
            { key: "unit",         label: "Unit",                     placeholder: "e.g., kg, liters",    type: "text",   required: true  },
            { key: "reorderLevel", label: "Reorder Level (optional)", placeholder: "5",                   type: "number", required: false },
          ].map(({ key, label, placeholder, type, required }) => (
            <div key={key} className="space-y-1.5">
              <Label className="text-sm font-medium font-poppins text-[hsl(var(--brand-dark))]">
                {label} {required && <span className="text-[hsl(var(--brand-primary))]">*</span>}
              </Label>
              <Input
                type={type}
                placeholder={placeholder}
                value={(form as any)[key]}
                onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
              />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-7 pb-6 pt-2 flex gap-3">
          <Button type="button" variant="outline" onClick={onClose}
            className="flex-1 h-11 font-poppins border-gray-200 hover:border-orange-300">
            Cancel
          </Button>
          <Button type="button" disabled={isPending} onClick={() => onSubmit(form)}
            className={`flex-1 h-11 font-poppins ${GRAD}`}>
            {isPending ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                {mode === "create" ? "Creating..." : "Saving..."}
              </span>
            ) : mode === "create" ? "Add Item" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Adjust Stock Modal ────────────────────────────────────────────────────────
function AdjustModal({ item, type, onClose, onSubmit, isPending }: {
  item:      any;
  type:      "add" | "deduct";
  onClose:   () => void;
  onSubmit:  (amount: number) => void;
  isPending: boolean;
}) {
  const [amount, setAmount] = useState("");
  const isAdd = type === "add";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-orange-50
        animate-in fade-in zoom-in-95 duration-200">

        <button onClick={onClose}
          className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200
            flex items-center justify-center text-gray-400 hover:text-gray-700 text-sm font-bold">
          ✕
        </button>

        <div className="px-7 pt-6 pb-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0
              ${isAdd ? "bg-green-50" : "bg-orange-50"}`}>
              {isAdd ? "➕" : "➖"}
            </div>
            <div>
              <h3 className={`text-lg font-satisfy ${isAdd ? "text-green-600" : "text-[hsl(var(--brand-primary))]"}`}>
                {isAdd ? "Add Stock" : "Deduct Stock"}
              </h3>
              <p className="text-xs font-poppins text-gray-400">{item.name}</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-xs font-poppins text-gray-500">Current Stock</span>
            <span className="text-sm font-poppins font-semibold text-[hsl(var(--brand-dark))]">
              {item.quantity} {item.unit}
            </span>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium font-poppins text-[hsl(var(--brand-dark))]">
              Amount <span className="text-[hsl(var(--brand-primary))]">*</span>
            </Label>
            <Input type="number" placeholder="0" value={amount}
              onChange={(e) => setAmount(e.target.value)} />
          </div>

          <div className="flex gap-3 pt-1">
            <Button variant="outline" onClick={onClose}
              className="flex-1 h-11 font-poppins border-gray-200">
              Cancel
            </Button>
            <Button disabled={isPending || !amount} onClick={() => onSubmit(parseInt(amount))}
              className={`flex-1 h-11 font-poppins ${isAdd ? "bg-green-500 hover:bg-green-600 text-white" : GRAD}`}>
              {isPending ? "Updating..." : "Confirm"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ──────────────────────────────────────────────────────
function DeleteModal({ itemName, onClose, onConfirm, isPending }: {
  itemName:  string;
  onClose:   () => void;
  onConfirm: () => void;
  isPending: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-red-50
        animate-in fade-in zoom-in-95 duration-200">
        <div className="px-7 pt-6 pb-7 space-y-4 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-50">
            <span className="text-3xl">🗑️</span>
          </div>
          <div>
            <h3 className="text-lg font-satisfy text-red-500">Delete Item?</h3>
            <p className="text-sm font-poppins text-gray-500 mt-1">Are you sure you want to delete</p>
            <p className="text-sm font-poppins font-semibold text-[hsl(var(--brand-dark))]">"{itemName}"</p>
            <p className="text-xs font-poppins text-gray-400 mt-1">This action cannot be undone.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1 h-11 font-poppins border-gray-200">
              Cancel
            </Button>
            <Button onClick={onConfirm} disabled={isPending}
              className="flex-1 h-11 bg-gradient-to-r from-red-500 to-pink-500 text-white font-poppins">
              {isPending ? "Deleting..." : "Yes, Delete"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
//  MAIN PAGE
// ═════════════════════════════════════════════════════════════════════════════
export default function InventoryPage() {
  const { toast } = useToast();
  const { data, isLoading, error } = useGetInventory({ limit: 100 });
  const createMutation = useCreateInventory();
  const updateMutation = useUpdateInventory();
  const deleteMutation = useDeleteInventory();
  const adjustMutation = useAdjustStock();

  const [showCreate,   setShowCreate]   = useState(false);
  const [editTarget,   setEditTarget]   = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [adjustTarget, setAdjustTarget] = useState<{ item: any; type: "add" | "deduct" } | null>(null);

  const items        = (data?.data?.items || []) as any[];
  const lowStockItems = items.filter((i) => i.quantity <= (i.reorderLevel || 5));
  const totalQty      = items.reduce((sum, i) => sum + i.quantity, 0);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleCreate = async (form: any) => {
    if (!form.name || !form.quantity || !form.unit) {
      toast({ title: "Required fields missing", variant: "destructive" }); return;
    }
    try {
      await createMutation.mutateAsync({
        name: form.name, quantity: parseInt(form.quantity),
        unit: form.unit, reorderLevel: parseInt(form.reorderLevel) || 5,
      });
      toast({ title: "✅ Item added!" });
      setShowCreate(false);
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    }
  };

  const handleEdit = async (form: any) => {
    try {
      await updateMutation.mutateAsync({
        id: editTarget._id,
        payload: {
          name: form.name, quantity: parseInt(form.quantity),
          unit: form.unit, reorderLevel: parseInt(form.reorderLevel),
        },
      });
      toast({ title: "✅ Item updated!" });
      setEditTarget(null);
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(deleteTarget._id);
      toast({ title: "🗑️ Item deleted!" });
      setDeleteTarget(null);
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    }
  };

  const handleAdjust = async (amount: number) => {
    if (!adjustTarget) return;
    try {
      await adjustMutation.mutateAsync({ id: adjustTarget.item._id, amount, type: adjustTarget.type });
      toast({ title: adjustTarget.type === "add" ? "✅ Stock added!" : "✅ Stock deducted!" });
      setAdjustTarget(null);
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="p-4 md:p-6">

      {/* ── Modals ── */}
      {showCreate && (
        <ItemModal mode="create" onClose={() => setShowCreate(false)}
          onSubmit={handleCreate} isPending={createMutation.isPending} />
      )}
      {editTarget && (
        <ItemModal mode="edit"
          initial={{ name: editTarget.name, quantity: String(editTarget.quantity),
            unit: editTarget.unit, reorderLevel: String(editTarget.reorderLevel ?? "") }}
          onClose={() => setEditTarget(null)}
          onSubmit={handleEdit} isPending={updateMutation.isPending} />
      )}
      {deleteTarget && (
        <DeleteModal itemName={deleteTarget.name} onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete} isPending={deleteMutation.isPending} />
      )}
      {adjustTarget && (
        <AdjustModal item={adjustTarget.item} type={adjustTarget.type}
          onClose={() => setAdjustTarget(null)}
          onSubmit={handleAdjust} isPending={adjustMutation.isPending} />
      )}

      <div className="max-w-6xl mx-auto space-y-5">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-satisfy text-[hsl(var(--brand-primary))]">Inventory</h1>
            <p className="text-sm font-poppins text-gray-500 mt-0.5">Track and manage your stock levels</p>
          </div>
          <Button onClick={() => setShowCreate(true)} className={GRAD}>
            <Plus className="mr-2 h-4 w-4" /> Add Item
          </Button>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Items",    value: items.length,        color: "hsl(var(--brand-primary))", bg: "bg-orange-50"  },
            { label: "Low Stock",      value: lowStockItems.length, color: "#ef4444",                  bg: "bg-red-50"     },
            { label: "Total Quantity", value: totalQty,             color: "hsl(var(--brand-secondary))", bg: "bg-blue-50" },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`${bg} rounded-xl p-4 text-center border border-white`}>
              <div className="text-2xl font-satisfy font-bold" style={{ color }}>{value}</div>
              <div className="text-xs font-poppins text-gray-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* ── Low Stock Alert ── */}
        {lowStockItems.length > 0 && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-sm font-poppins text-red-700">
              <span className="font-semibold">{lowStockItems.length} item{lowStockItems.length > 1 ? "s" : ""}</span> below reorder level:{" "}
              {lowStockItems.map((i: any) => i.name).join(", ")}
            </p>
          </div>
        )}

        {/* ── Table Card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Table header label */}
          <div className="px-6 py-4 border-b border-gray-50">
            <p className="text-sm font-poppins text-gray-500">
              {isLoading ? "Loading..." : `${items.length} item${items.length !== 1 ? "s" : ""} in inventory`}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  {["Item Name", "Quantity", "Unit", "Reorder Level", "Status", "Actions"].map((h, i) => (
                    <th key={h} className={`px-6 py-3 text-xs font-semibold font-poppins text-gray-500
                      uppercase tracking-wider ${i >= 4 ? "text-center" : "text-left"}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  <TableSkeleton />
                ) : error ? (
                  <tr><td colSpan={6} className="py-16 text-center">
                    <span className="text-4xl block mb-2">⚠️</span>
                    <p className="font-satisfy text-lg text-red-400">Failed to load inventory</p>
                  </td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan={6} className="py-16 text-center">
                    <span className="text-4xl block mb-2">📦</span>
                    <p className="font-satisfy text-lg text-[hsl(var(--brand-primary))]">No items yet</p>
                    <p className="text-xs font-poppins text-gray-400 mt-1">Add your first inventory item</p>
                    <Button onClick={() => setShowCreate(true)} className={`mt-4 h-9 px-4 text-sm font-poppins ${GRAD}`}>
                      + Add First Item
                    </Button>
                  </td></tr>
                ) : (
                  items.map((item: any) => {
                    const isLow = item.quantity <= (item.reorderLevel || 5);
                    return (
                      <tr key={item._id}
                        className={`transition-colors hover:bg-orange-50/20 ${isLow ? "bg-red-50/30" : ""}`}>

                        {/* Name */}
                        <td className="px-6 py-4">
                          <p className="font-satisfy text-sm text-[hsl(var(--brand-dark))]">{item.name}</p>
                        </td>

                        {/* Quantity */}
                        <td className="px-6 py-4">
                          <span className={`font-poppins font-semibold text-sm
                            ${isLow ? "text-red-600" : "text-[hsl(var(--brand-dark))]"}`}>
                            {item.quantity}
                          </span>
                        </td>

                        {/* Unit */}
                        <td className="px-6 py-4">
                          <span className="text-xs font-poppins text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">
                            {item.unit}
                          </span>
                        </td>

                        {/* Reorder Level */}
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full
                            bg-orange-50 text-xs font-bold font-poppins text-[hsl(var(--brand-primary))]">
                            {item.reorderLevel ?? 5}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 text-center">
                          {isLow ? (
                            <span className="inline-flex items-center gap-1 text-xs font-poppins font-medium
                              px-2.5 py-1 rounded-full bg-red-100 text-red-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                              Low Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-poppins font-medium
                              px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                              In Stock
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <button onClick={() => setAdjustTarget({ item, type: "add" })} title="Add stock"
                              className="h-8 w-8 rounded-lg text-sm flex items-center justify-center
                                bg-green-50 text-green-600 hover:bg-green-100 transition-all font-bold">
                              +
                            </button>
                            <button onClick={() => setAdjustTarget({ item, type: "deduct" })} title="Deduct stock"
                              className="h-8 w-8 rounded-lg text-sm flex items-center justify-center
                                bg-orange-50 text-orange-500 hover:bg-orange-100 transition-all font-bold">
                              −
                            </button>
                            <button onClick={() => setEditTarget(item)}
                              className="h-8 px-2.5 rounded-lg text-xs font-poppins font-semibold text-white
                                bg-gradient-to-r from-brand-primary to-brand-secondary
                                hover:from-brand-primary/90 hover:to-brand-secondary/90 transition-all">
                              ✏️
                            </button>
                            <button onClick={() => setDeleteTarget(item)}
                              className="h-8 w-8 rounded-lg text-sm flex items-center justify-center
                                bg-red-50 text-red-400 hover:bg-red-100 transition-all">
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer count */}
          {!isLoading && items.length > 0 && (
            <div className="px-6 py-3 border-t border-gray-50 bg-gray-50/40">
              <p className="text-xs font-poppins text-gray-400">
                Total <span className="font-semibold text-[hsl(var(--brand-dark))]">{items.length}</span> items
                · <span className="font-semibold text-red-500">{lowStockItems.length}</span> low stock
              </p>
            </div>
          )}
        </div>
      </div>

      <Toaster />
    </div>
  );
}
