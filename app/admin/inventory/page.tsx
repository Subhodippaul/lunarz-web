"use client";
import { useEffect, useState, useMemo } from "react";
import {
  Package, AlertTriangle, TrendingDown, Plus, Edit2, Trash2,
  Search, ChevronDown, ChevronUp, X, Loader2, BarChart3,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import type { ColorInventoryRow, ColorInventoryLog } from "@/lib/inventory-services";

// ─── helpers ──────────────────────────────────────────────────────────────────

const STATUS = (row: ColorInventoryRow) => {
  if (row.stock === 0)               return { label: "Out of Stock",  cls: "bg-red-100 text-red-800" };
  if (row.stock <= row.low_threshold) return { label: "Low Stock",    cls: "bg-yellow-100 text-yellow-800" };
  return                               { label: "In Stock",       cls: "bg-green-100 text-green-800" };
};

// ─── types ────────────────────────────────────────────────────────────────────

interface FormState {
  color: string;
  size: string;
  category: string;
  stock: number;
  low_threshold: number;
  notes: string;
}

const EMPTY_FORM: FormState = {
  color: "", size: "", category: "", stock: 0, low_threshold: 10, notes: "",
};

interface AdjustState {
  row: ColorInventoryRow;
  type: "in" | "out" | "adjustment";
  quantity: number;
  reason: string;
}

// ─── component ────────────────────────────────────────────────────────────────

export default function AdminInventory() {
  const { addToast } = useToast();

  const [rows, setRows] = useState<ColorInventoryRow[]>([]);
  const [log, setLog] = useState<ColorInventoryLog[]>([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [colorFilter, setColorFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "in" | "low" | "out">("all");

  // Form
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Adjust stock panel
  const [adjusting, setAdjusting] = useState<AdjustState | null>(null);
  const [adjustSaving, setAdjustSaving] = useState(false);

  // Log collapsed
  const [showLog, setShowLog] = useState(false);

  // ── fetch ──────────────────────────────────────────────────────────────────

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, logRes] = await Promise.all([
        fetch("/api/admin/color-inventory"),
        fetch("/api/admin/color-inventory/log"),
      ]);
      const invJson = await invRes.json();
      const logJson = await logRes.json().catch(() => ({ entries: [] }));
      setRows(invJson.rows ?? []);
      setLog(logJson.entries ?? []);
    } catch {
      addToast({ title: "Error", description: "Failed to load inventory", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ── derived ────────────────────────────────────────────────────────────────

  const categories = useMemo(() => Array.from(new Set(rows.map(r => r.category))).sort(), [rows]);
  const colors      = useMemo(() => Array.from(new Set(rows.map(r => r.color))).sort(), [rows]);
  const sizes       = useMemo(() => Array.from(new Set(rows.map(r => r.size))).sort(), [rows]);

  const filtered = useMemo(() => rows.filter(r => {
    if (search && !r.color.toLowerCase().includes(search.toLowerCase()) &&
        !r.size.toLowerCase().includes(search.toLowerCase()) &&
        !r.category.toLowerCase().includes(search.toLowerCase())) return false;
    if (catFilter !== "all" && r.category !== catFilter) return false;
    if (colorFilter !== "all" && r.color !== colorFilter) return false;
    const s = STATUS(r).label;
    if (statusFilter === "in"  && s !== "In Stock")     return false;
    if (statusFilter === "low" && s !== "Low Stock")    return false;
    if (statusFilter === "out" && s !== "Out of Stock") return false;
    return true;
  }), [rows, search, catFilter, colorFilter, statusFilter]);

  const totalStock = rows.reduce((s, r) => s + r.stock, 0);
  const lowCount   = rows.filter(r => r.stock > 0 && r.stock <= r.low_threshold).length;
  const outCount   = rows.filter(r => r.stock === 0).length;

  // ── form handlers ──────────────────────────────────────────────────────────

  const openAdd = () => { setForm(EMPTY_FORM); setEditingId(null); setShowForm(true); };
  const openEdit = (r: ColorInventoryRow) => {
    setForm({ color: r.color, size: r.size, category: r.category, stock: r.stock, low_threshold: r.low_threshold, notes: r.notes ?? "" });
    setEditingId(r.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.color.trim() || !form.size.trim() || !form.category.trim()) {
      addToast({ title: "Required", description: "Color, Size and Category are required", type: "error" });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/color-inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      addToast({ title: "Saved", description: `${form.color} / ${form.size} / ${form.category} updated`, type: "success" });
      setShowForm(false);
      fetchData();
    } catch (e: any) {
      addToast({ title: "Error", description: e.message, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, color: string, size: string, category: string) => {
    if (!confirm(`Delete inventory for ${color} / ${size} / ${category}?`)) return;
    try {
      const res = await fetch(`/api/admin/color-inventory?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error);
      addToast({ title: "Deleted", description: `${color} / ${size} / ${category} removed`, type: "success" });
      fetchData();
    } catch (e: any) {
      addToast({ title: "Error", description: e.message, type: "error" });
    }
  };

  // ── adjust handlers ────────────────────────────────────────────────────────

  const handleAdjust = async () => {
    if (!adjusting) return;
    if (!adjusting.reason.trim()) {
      addToast({ title: "Required", description: "Reason is required", type: "error" });
      return;
    }
    setAdjustSaving(true);
    try {
      const res = await fetch("/api/admin/color-inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: adjusting.row.id,
          type: adjusting.type,
          quantity: adjusting.quantity,
          reason: adjusting.reason,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      addToast({ title: "Updated", description: "Stock adjusted successfully", type: "success" });
      setAdjusting(null);
      fetchData();
    } catch (e: any) {
      addToast({ title: "Error", description: e.message, type: "error" });
    } finally {
      setAdjustSaving(false);
    }
  };

  // ── render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Color &amp; Size Inventory</h1>
          <p className="text-gray-500 mt-1 text-sm">Shared stock per color × size × category — updates all matching products automatically</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          Add Inventory
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: <Package className="h-5 w-5 text-blue-600" />,    bg: "bg-blue-50",   label: "SKU Groups",   val: rows.length },
          { icon: <BarChart3 className="h-5 w-5 text-green-600" />, bg: "bg-green-50",  label: "Total Units",   val: totalStock.toLocaleString() },
          { icon: <AlertTriangle className="h-5 w-5 text-yellow-600" />, bg: "bg-yellow-50", label: "Low Stock", val: lowCount },
          { icon: <TrendingDown className="h-5 w-5 text-red-600" />, bg: "bg-red-50",   label: "Out of Stock",  val: outCount },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${c.bg}`}>{c.icon}</div>
            <div>
              <p className="text-xs text-gray-500">{c.label}</p>
              <p className="text-xl font-bold text-gray-900">{c.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setColorFilter("all"); }}
            placeholder="Search color, size or category…"
            className="pl-9 pr-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={catFilter}
          onChange={e => setCatFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="in">In Stock</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </select>
      </div>

      {/* Color filter pills */}
      {colors.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-gray-500 font-medium shrink-0">Color:</span>
          <button
            onClick={() => setColorFilter("all")}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              colorFilter === "all"
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
            }`}
          >
            All
          </button>
          {colors.map(c => (
            <button
              key={c}
              onClick={() => setColorFilter(prev => prev === c ? "all" : c)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                colorFilter === c
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["Color", "Size", "Category", "Stock", "Threshold", "Status", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    No inventory entries found.{" "}
                    <button onClick={openAdd} className="text-blue-600 underline">Add one?</button>
                  </td>
                </tr>
              ) : filtered.map(row => {
                const st = STATUS(row);
                return (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{row.color}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-mono font-semibold">
                        {row.size}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{row.category}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-gray-900">{row.stock}</span>
                      <span className="text-gray-400 text-xs ml-1">units</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{row.low_threshold}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${st.cls}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setAdjusting({ row, type: "in", quantity: 1, reason: "" })}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                          title="Adjust stock"
                        >
                          <BarChart3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEdit(row)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(row.id, row.color, row.size, row.category)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent log (collapsible) */}
      {log.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <button
            onClick={() => setShowLog(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            <span>Recent Stock Movements</span>
            {showLog ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showLog && (
            <div className="border-t border-gray-100 px-4 py-3 space-y-2 max-h-64 overflow-y-auto">
              {log.slice(0, 30).map(entry => {
                const inv = rows.find(r => r.id === entry.color_inv_id);
                return (
                  <div key={entry.id} className="flex items-start gap-3 text-xs">
                    <span className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${
                      entry.type === "in" ? "bg-green-500" : entry.type === "out" ? "bg-red-500" : "bg-blue-500"
                    }`} />
                    <div>
                      <span className="font-medium text-gray-800">
                        {inv ? `${inv.color} / ${inv.size} / ${inv.category}` : "Unknown"}
                      </span>
                      <span className="text-gray-500 ml-2">
                        {entry.type === "out" ? "−" : "+"}{entry.quantity} — {entry.reason}
                        {entry.reference && <span className="text-gray-400 ml-1">({entry.reference})</span>}
                      </span>
                      <span className="text-gray-400 ml-2">
                        {new Date(entry.created_at).toLocaleDateString()} {new Date(entry.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Add / Edit Form Modal ───────────────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingId ? "Edit Inventory" : "Add Inventory"}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-gray-500">
              One row = shared stock for a <strong>color × size × category</strong> combination.
              All products with a matching variant color, size, and category share this stock.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Color *</label>
                <input
                  value={form.color}
                  onChange={e => setForm(p => ({ ...p, color: e.target.value }))}
                  placeholder="e.g. Black"
                  disabled={!!editingId}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Size *</label>
                <input
                  value={form.size}
                  onChange={e => setForm(p => ({ ...p, size: e.target.value }))}
                  placeholder="e.g. M, L, XL"
                  disabled={!!editingId}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Category *</label>
                <input
                  value={form.category}
                  onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  placeholder="e.g. Oversized, Regular, Hoodie"
                  disabled={!!editingId}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Stock (units)</label>
                <input
                  type="number" min="0"
                  value={form.stock}
                  onChange={e => setForm(p => ({ ...p, stock: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Low Stock Alert</label>
                <input
                  type="number" min="0"
                  value={form.low_threshold}
                  onChange={e => setForm(p => ({ ...p, low_threshold: parseInt(e.target.value) || 10 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Notes (optional)</label>
              <input
                value={form.notes}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                placeholder="e.g. Restocked from supplier X"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingId ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Adjust Stock Modal ─────────────────────────────────────────────── */}
      {adjusting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Adjust Stock</h2>
              <button onClick={() => setAdjusting(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600">
              <span className="font-medium">{adjusting.row.color}</span>
              {" / "}
              <span className="font-mono font-semibold bg-gray-100 px-1.5 py-0.5 rounded text-xs">{adjusting.row.size}</span>
              {" / "}{adjusting.row.category}
              {" "}— current stock: <span className="font-semibold">{adjusting.row.stock}</span>
            </p>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Operation</label>
              <div className="grid grid-cols-3 gap-2">
                {(["in", "out", "adjustment"] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setAdjusting(a => a ? { ...a, type: t } : a)}
                    className={`py-2 rounded-lg text-sm font-medium border transition-colors ${
                      adjusting.type === t
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {t === "in" ? "+ Add" : t === "out" ? "− Remove" : "= Set"}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {adjusting.type === "adjustment" ? "New total" : "Quantity"}
                </label>
                <input
                  type="number" min="0"
                  value={adjusting.quantity}
                  onChange={e => setAdjusting(a => a ? { ...a, quantity: parseInt(e.target.value) || 0 } : a)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Preview
                </label>
                <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm font-semibold text-gray-700">
                  {adjusting.type === "in"
                    ? adjusting.row.stock + adjusting.quantity
                    : adjusting.type === "out"
                    ? Math.max(0, adjusting.row.stock - adjusting.quantity)
                    : adjusting.quantity}{" "}units
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Reason *</label>
              <input
                value={adjusting.reason}
                onChange={e => setAdjusting(a => a ? { ...a, reason: e.target.value } : a)}
                placeholder="e.g. New shipment received"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setAdjusting(null)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjust}
                disabled={adjustSaving}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {adjustSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
