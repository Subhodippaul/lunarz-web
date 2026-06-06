"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Plus, Trash2, Eye, EyeOff, Upload, Loader2,
  ExternalLink, ImageIcon, Pencil, X, ChevronUp,
  ChevronDown, Save, GripVertical,
} from "lucide-react";
import {
  getAllBannerSlides, createBannerSlide, updateBannerSlide,
  deleteBannerSlide, reorderBannerSlides, uploadBannerImage,
  deleteBannerImage, type BannerSlide,
} from "@/lib/banner-services";
import { useToast } from "@/components/ui/toast";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

interface SlideForm {
  desktopFile: File | null;
  desktopPreview: string;   // blob URL or existing URL
  mobileFile: File | null;
  mobilePreview: string;
  href: string;
}

const emptyForm = (): SlideForm => ({
  desktopFile: null, desktopPreview: "",
  mobileFile: null,  mobilePreview: "",
  href: "/shop",
});

// ─────────────────────────────────────────────────────────────────────────────
// Image upload zone
// ─────────────────────────────────────────────────────────────────────────────

function UploadZone({
  label, hint, preview, aspectClass, onChange,
}: {
  label: string; hint: string; preview: string;
  aspectClass: string; onChange: (f: File) => void;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>
      <p className="text-xs text-gray-400 mb-2">{hint}</p>
      <label
        className={`relative block w-full ${aspectClass} border-2 border-dashed border-gray-300 rounded-lg overflow-hidden cursor-pointer hover:border-blue-400 transition-colors bg-gray-50`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files[0];
          if (f?.type.startsWith("image/")) onChange(f);
        }}
      >
        {preview ? (
          <Image src={preview} alt={label} fill className="object-cover" unoptimized={preview.startsWith("blob:")} />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-2">
            <ImageIcon className="w-8 h-8" />
            <span className="text-xs text-center px-2">Click or drag & drop</span>
          </div>
        )}
        <input
          type="file" accept="image/*" className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onChange(f);
            e.target.value = "";
          }}
        />
      </label>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Edit Modal
// ─────────────────────────────────────────────────────────────────────────────

function EditModal({
  slide, onClose, onSaved,
}: {
  slide: BannerSlide;
  onClose: () => void;
  onSaved: (updated: BannerSlide) => void;
}) {
  const [form, setForm] = useState<SlideForm>({
    desktopFile: null,
    desktopPreview: slide.desktop_url,
    mobileFile: null,
    mobilePreview: slide.mobile_url,
    href: slide.href,
  });
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const setFile = (
    fileKey: "desktopFile" | "mobileFile",
    previewKey: "desktopPreview" | "mobilePreview",
    file: File
  ) => {
    setForm((p) => ({ ...p, [fileKey]: file, [previewKey]: URL.createObjectURL(file) }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates: Partial<BannerSlide> = { href: form.href };

      if (form.desktopFile) {
        updates.desktop_url = await uploadBannerImage(form.desktopFile, "desktop");
        await deleteBannerImage(slide.desktop_url);
      }
      if (form.mobileFile) {
        updates.mobile_url = await uploadBannerImage(form.mobileFile, "mobile");
        await deleteBannerImage(slide.mobile_url);
      }

      await updateBannerSlide(slide.id, updates);
      onSaved({ ...slide, ...updates });
      addToast({ title: "Saved", description: "Slide updated successfully.", type: "success" });
      onClose();
    } catch (err: any) {
      addToast({ title: "Error", description: err.message, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Edit Slide</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <UploadZone
              label="Desktop Image"
              hint="Ratio 16:7 — e.g. 1920×840 px"
              preview={form.desktopPreview}
              aspectClass="aspect-16/7"
              onChange={(f) => setFile("desktopFile", "desktopPreview", f)}
            />
            <UploadZone
              label="Mobile Image"
              hint="Ratio 3:4 — e.g. 750×1000 px"
              preview={form.mobilePreview}
              aspectClass="aspect-3/4"
              onChange={(f) => setFile("mobileFile", "mobilePreview", f)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Redirect URL
            </label>
            <input
              type="text"
              value={form.href}
              onChange={(e) => setForm((p) => ({ ...p, href: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────

export default function AdminBannersPage() {
  const [slides, setSlides] = useState<BannerSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<SlideForm>(emptyForm());
  const [addSaving, setAddSaving] = useState(false);
  const [editSlide, setEditSlide] = useState<BannerSlide | null>(null);
  const [orderChanged, setOrderChanged] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const { addToast } = useToast();

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      setSlides(await getAllBannerSlides());
      setOrderChanged(false);
    } catch {
      addToast({ title: "Error", description: "Failed to load banners.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // ── Reorder helpers ─────────────────────────────────────────────────────────

  const moveSlide = (from: number, to: number) => {
    if (to < 0 || to >= slides.length) return;
    const next = [...slides];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setSlides(next);
    setOrderChanged(true);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = "move";
    setDragIndex(index);
  };
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };
  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== dropIndex) {
      moveSlide(dragIndex, dropIndex);
    }
    setDragIndex(null);
    setDragOverIndex(null);
  };
  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleSaveOrder = async () => {
    setSaving(true);
    try {
      await reorderBannerSlides(slides.map((s) => s.id));
      setOrderChanged(false);
      addToast({ title: "Order saved", description: "Slide order updated successfully.", type: "success" });
    } catch (err: any) {
      addToast({ title: "Error", description: err.message, type: "error" });
      await load(); // revert local state
    } finally {
      setSaving(false);
    }
  };

  // ── Add slide ───────────────────────────────────────────────────────────────

  const setAddFile = (
    fileKey: "desktopFile" | "mobileFile",
    previewKey: "desktopPreview" | "mobilePreview",
    file: File
  ) => {
    setAddForm((p) => ({ ...p, [fileKey]: file, [previewKey]: URL.createObjectURL(file) }));
  };

  const handleAdd = async () => {
    if (!addForm.desktopFile || !addForm.mobileFile) {
      addToast({ title: "Missing images", description: "Upload both desktop and mobile images.", type: "error" });
      return;
    }
    setAddSaving(true);
    try {
      const [desktopUrl, mobileUrl] = await Promise.all([
        uploadBannerImage(addForm.desktopFile, "desktop"),
        uploadBannerImage(addForm.mobileFile, "mobile"),
      ]);
      await createBannerSlide({
        desktop_url: desktopUrl,
        mobile_url: mobileUrl,
        href: addForm.href || "/shop",
        sort_order: slides.length,
        is_active: true,
      });
      addToast({ title: "Slide added", description: "Banner slide created.", type: "success" });
      setAddForm(emptyForm());
      setShowAddForm(false);
      await load();
    } catch (err: any) {
      addToast({ title: "Error", description: err.message, type: "error" });
    } finally {
      setAddSaving(false);
    }
  };

  // ── Toggle active ───────────────────────────────────────────────────────────

  const handleToggleActive = async (slide: BannerSlide) => {
    try {
      await updateBannerSlide(slide.id, { is_active: !slide.is_active });
      setSlides((prev) => prev.map((s) => s.id === slide.id ? { ...s, is_active: !s.is_active } : s));
    } catch (err: any) {
      addToast({ title: "Error", description: err.message, type: "error" });
    }
  };

  // ── Delete slide ────────────────────────────────────────────────────────────

  const handleDelete = async (slide: BannerSlide) => {
    if (!confirm("Delete this slide? This cannot be undone.")) return;
    try {
      await deleteBannerSlide(slide);
      setSlides((prev) => prev.filter((s) => s.id !== slide.id));
      addToast({ title: "Deleted", description: "Slide removed.", type: "success" });
    } catch (err: any) {
      addToast({ title: "Error", description: err.message, type: "error" });
    }
  };

  // ───────────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <>
      {/* Edit modal */}
      {editSlide && (
        <EditModal
          slide={editSlide}
          onClose={() => setEditSlide(null)}
          onSaved={(updated) => {
            setSlides((prev) => prev.map((s) => s.id === updated.id ? updated : s));
            setEditSlide(null);
          }}
        />
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Banner Slides</h1>
            <p className="text-gray-500 mt-1 text-sm">
              Desktop 16:7 ratio · Mobile 3:4 ratio. Drag or use ▲▼ to reorder, then click Save Order.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {orderChanged && (
              <button
                onClick={handleSaveOrder}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Saving…" : "Save Order"}
              </button>
            )}
            <button
              onClick={() => setShowAddForm((v) => !v)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Slide
            </button>
          </div>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">New Banner Slide</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UploadZone
                label="Desktop Image"
                hint="Ratio 16:7 — e.g. 1920×840 px"
                preview={addForm.desktopPreview}
                aspectClass="aspect-16/7"
                onChange={(f) => setAddFile("desktopFile", "desktopPreview", f)}
              />
              <UploadZone
                label="Mobile Image"
                hint="Ratio 3:4 — e.g. 750×1000 px"
                preview={addForm.mobilePreview}
                aspectClass="aspect-3/4"
                onChange={(f) => setAddFile("mobileFile", "mobilePreview", f)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Redirect URL
              </label>
              <input
                type="text"
                value={addForm.href}
                onChange={(e) => setAddForm((p) => ({ ...p, href: e.target.value }))}
                placeholder="/shop"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAdd}
                disabled={addSaving}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
              >
                {addSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {addSaving ? "Uploading…" : "Save Slide"}
              </button>
              <button
                onClick={() => { setShowAddForm(false); setAddForm(emptyForm()); }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Slide list */}
        {slides.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No banner slides yet. Add one above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`bg-white border rounded-xl shadow-sm transition-all select-none ${
                  dragOverIndex === index && dragIndex !== index
                    ? "border-blue-400 shadow-md ring-2 ring-blue-300"
                    : "border-gray-200"
                } ${dragIndex === index ? "opacity-50" : ""} ${!slide.is_active ? "opacity-60" : ""}`}
              >
                <div className="p-4 flex items-center gap-3">
                  {/* Drag handle */}
                  <div className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 shrink-0">
                    <GripVertical className="w-5 h-5" />
                  </div>

                  {/* Order number */}
                  <span className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">
                    {index + 1}
                  </span>

                  {/* Desktop thumbnail */}
                  <div className="shrink-0 hidden sm:block">
                    <p className="text-xs text-gray-400 mb-1">Desktop</p>
                    <div className="relative w-36 aspect-16/7 rounded-md overflow-hidden border border-gray-200 bg-gray-100">
                      <Image src={slide.desktop_url} alt="desktop" fill className="object-cover" />
                    </div>
                  </div>

                  {/* Mobile thumbnail */}
                  <div className="shrink-0">
                    <p className="text-xs text-gray-400 mb-1">Mobile</p>
                    <div className="relative w-12 aspect-3/4 rounded-md overflow-hidden border border-gray-200 bg-gray-100">
                      <Image src={slide.mobile_url} alt="mobile" fill className="object-cover" />
                    </div>
                  </div>

                  {/* Href */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 mb-1">Link</p>
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-700 truncate">{slide.href}</span>
                      <a
                        href={slide.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-500 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Status badge */}
                  <span className={`shrink-0 hidden md:inline-flex text-xs px-2 py-0.5 rounded-full font-medium ${
                    slide.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    {slide.is_active ? "Active" : "Hidden"}
                  </span>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Move up/down — visible on mobile too */}
                    <button
                      onClick={() => moveSlide(index, index - 1)}
                      disabled={index === 0}
                      title="Move up"
                      className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveSlide(index, index + 1)}
                      disabled={index === slides.length - 1}
                      title="Move down"
                      className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => setEditSlide(slide)}
                      title="Edit slide"
                      className="p-1.5 rounded text-blue-500 hover:bg-blue-50 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    {/* Toggle active */}
                    <button
                      onClick={() => handleToggleActive(slide)}
                      title={slide.is_active ? "Hide slide" : "Show slide"}
                      className={`p-1.5 rounded transition-colors ${
                        slide.is_active
                          ? "text-green-600 hover:bg-green-50"
                          : "text-gray-400 hover:bg-gray-100"
                      }`}
                    >
                      {slide.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(slide)}
                      title="Delete slide"
                      className="p-1.5 rounded text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {orderChanged && (
          <div className="flex justify-center">
            <button
              onClick={handleSaveOrder}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium shadow"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Saving order…" : "Save Order"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
