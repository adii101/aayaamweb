import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ComicCard } from "@/components/ComicCard";
import { ComicButton } from "@/components/ComicButton";
import { apiRequest } from "@/lib/queryClient";
import {
  Calendar,
  Plus,
  Pencil,
  Trash2,
  LogOut,
  ArrowLeft,
  X,
  Trophy,
  Users,
  User,
  Book,
} from "lucide-react";

type DbEvent = {
  _id: string;
  name: string;
  date: string;
  description: string;
  fullDescription: string;
  type: "Solo" | "Team";
  prize: string;
  rules: string[];
  rounds: number;
  unstopUrl?: string;
  ruleBookUrl?: string;
};

const emptyEvent: Omit<DbEvent, "_id"> = {
  name: "",
  date: "",
  description: "",
  fullDescription: "",
  type: "Solo",
  prize: "",
  rules: [""],
  rounds: 1,
  unstopUrl: "",
  ruleBookUrl: "",
};

export default function AdminEvents() {
  const [, setLocation] = useLocation();
  const [adminOk, setAdminOk] = useState<boolean | null>(null);
  const [events, setEvents] = useState<DbEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<DbEvent | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyEvent);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/events", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load events");
      const data = (await res.json()) as DbEvent[];
      setEvents(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load events");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch("/api/admin/me", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setAdminOk(data?.admin === true))
      .catch(() => setAdminOk(false));
  }, []);

  useEffect(() => {
    if (adminOk) loadEvents();
  }, [adminOk, loadEvents]);

  const openEdit = (ev: DbEvent) => {
    setEditing(ev);
    setForm({
      name: ev.name,
      date: ev.date,
      description: ev.description,
      fullDescription: ev.fullDescription,
      type: ev.type,
      prize: ev.prize,
      rules: ev.rules?.length ? [...ev.rules] : [""],
      rounds: ev.rounds,
      unstopUrl: ev.unstopUrl ?? "",
      ruleBookUrl: ev.ruleBookUrl ?? "",
    });
    setError(null);
  };

  // open edit and scroll to rules section once modal rendered
  const openRules = (ev: DbEvent) => {
    openEdit(ev);
    // wait a tick and then scroll to the rule book url input
    setTimeout(() => {
      const el = document.getElementById("admin-rulebook-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 200);
  };

  const openCreate = () => {
    setCreating(true);
    setForm(emptyEvent);
    setError(null);
  };

  const closeModal = () => {
    setEditing(null);
    setCreating(false);
  };

  const updateForm = (key: keyof typeof form, value: string | number | string[]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const addRule = () => setForm((f) => ({ ...f, rules: [...f.rules, ""] }));
  const setRule = (i: number, v: string) => {
    setForm((f) => ({
      ...f,
      rules: f.rules.map((r, j) => (j === i ? v : r)),
    }));
  };
  const removeRule = (i: number) => {
    setForm((f) => ({ ...f, rules: f.rules.filter((_, j) => j !== i) }));
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        rules: form.rules.filter(Boolean),
        unstopUrl: form.unstopUrl || undefined,
        ruleBookUrl: form.ruleBookUrl || undefined,
      };
      await apiRequest("PUT", `/api/events/${editing._id}`, payload);
      await loadEvents();
      closeModal();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const saveCreate = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        rules: form.rules.filter(Boolean),
        unstopUrl: form.unstopUrl || undefined,
        ruleBookUrl: form.ruleBookUrl || undefined,
      };
      await apiRequest("POST", "/api/events", payload);
      await loadEvents();
      closeModal();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create");
    } finally {
      setSaving(false);
    }
  };

  const deleteEvent = async (id: string) => {
    if (!confirm("Delete this event? This cannot be undone.")) return;
    try {
      await apiRequest("DELETE", `/api/events/${id}`);
      await loadEvents();
      closeModal();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
    setLocation("/admin/login");
  };

  if (adminOk === null) {
    return (
      <div className="min-h-screen flex items-center justify-center font-display text-2xl">
        Loading...
      </div>
    );
  }
  if (adminOk === false) {
    setLocation("/admin/login");
    return null;
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <ComicButton
            variant="white"
            size="sm"
            onClick={() => setLocation("/admin")}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={20} /> Back
          </ComicButton>
          <h1 className="font-display text-3xl uppercase flex items-center gap-2">
            <Calendar size={32} /> Manage events
          </h1>
        </div>
        <div className="flex gap-2">
          <ComicButton variant="primary" size="sm" onClick={openCreate} className="flex items-center gap-2">
            <Plus size={18} /> New event
          </ComicButton>
          <ComicButton variant="destructive" size="sm" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut size={18} /> Logout
          </ComicButton>
        </div>
      </div>

      {error && (
        <div className="mb-4 font-bold text-red-700 bg-red-100 p-3 comic-border rounded-xl">
          {error}
        </div>
      )}

      {loading ? (
        <p className="font-bold text-lg">Loading events...</p>
      ) : events.length === 0 ? (
        <ComicCard bgVariant="white" tiltAmount={0}>
          <p className="font-bold text-lg text-gray-600">No events yet. Create one to show on the Events page.</p>
          <ComicButton variant="primary" className="mt-4" onClick={openCreate}>
            <Plus size={20} className="inline mr-2" /> Add first event
          </ComicButton>
        </ComicCard>
      ) : (
        <div className="grid gap-4">
          {events.map((ev) => (
            <ComicCard key={ev._id} bgVariant="white" tiltAmount={0} className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl uppercase">{ev.name}</h2>
                <p className="font-bold text-gray-600 flex items-center gap-2 mt-1">
                  {ev.type === "Team" ? <Users size={18} /> : <User size={18} />} {ev.type} · {ev.date}
                </p>
                <p className="text-sm font-bold text-gray-500 flex items-center gap-1 mt-1">
                  <Trophy size={14} /> {ev.prize}
                </p>
              </div>
              <div className="flex gap-2">
                <ComicButton variant="secondary" size="sm" onClick={() => openEdit(ev)} className="flex items-center gap-2">
                  <Pencil size={16} /> Edit
                </ComicButton>
                <ComicButton variant="accent" size="sm" onClick={() => openRules(ev)} className="flex items-center gap-2">
                  <Book size={16} /> Rulebook
                </ComicButton>
                <ComicButton variant="destructive" size="sm" onClick={() => deleteEvent(ev._id)} className="flex items-center gap-2">
                  <Trash2 size={16} /> Delete
                </ComicButton>
              </div>
            </ComicCard>
          ))}
        </div>
      )}

      <AnimatePresence>
        {(editing || creating) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white comic-border comic-shadow-lg rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-[hsl(var(--tertiary))] border-b-4 border-black p-4 flex justify-between items-center z-10">
                <h2 className="text-2xl font-display text-white text-comic-stroke m-0">
                  {editing ? "Edit event" : "New event"}
                </h2>
                <button
                  onClick={closeModal}
                  className="bg-white comic-border rounded-full p-1 hover:bg-red-500 hover:text-white transition-colors"
                >
                  <X size={24} strokeWidth={3} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="font-display uppercase text-sm block mb-1">Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => updateForm("name", e.target.value)}
                    className="w-full p-2 border-2 border-black rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="font-display uppercase text-sm block mb-1">Date</label>
                  <input
                    value={form.date}
                    onChange={(e) => updateForm("date", e.target.value)}
                    className="w-full p-2 border-2 border-black rounded-lg font-bold"
                    placeholder="e.g. 13 March 2026"
                  />
                </div>
                <div>
                  <label className="font-display uppercase text-sm block mb-1">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => updateForm("type", e.target.value as "Solo" | "Team")}
                    className="w-full p-2 border-2 border-black rounded-lg font-bold"
                  >
                    <option value="Solo">Solo</option>
                    <option value="Team">Team</option>
                  </select>
                </div>
                <div>
                  <label className="font-display uppercase text-sm block mb-1">Short description</label>
                  <input
                    value={form.description}
                    onChange={(e) => updateForm("description", e.target.value)}
                    className="w-full p-2 border-2 border-black rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="font-display uppercase text-sm block mb-1">Full description</label>
                  <textarea
                    value={form.fullDescription}
                    onChange={(e) => updateForm("fullDescription", e.target.value)}
                    className="w-full p-2 border-2 border-black rounded-lg font-bold min-h-[80px]"
                  />
                </div>
                <div>
                  <label className="font-display uppercase text-sm block mb-1">Prize</label>
                  <input
                    value={form.prize}
                    onChange={(e) => updateForm("prize", e.target.value)}
                    className="w-full p-2 border-2 border-black rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="font-display uppercase text-sm block mb-1">Rounds</label>
                  <input
                    type="number"
                    min={1}
                    value={form.rounds}
                    onChange={(e) => updateForm("rounds", parseInt(e.target.value, 10) || 1)}
                    className="w-full p-2 border-2 border-black rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="font-display uppercase text-sm block mb-1">Unstop URL (optional)</label>
                  <input
                    value={form.unstopUrl ?? ""}
                    onChange={(e) => updateForm("unstopUrl", e.target.value)}
                    className="w-full p-2 border-2 border-black rounded-lg font-bold"
                    placeholder="https://unstop.com/..."
                  />
                </div>
                <div id="admin-rulebook-section">
                  <label className="font-display uppercase text-sm block mb-1">Rule book URL (optional)</label>
                  <p className="text-xs text-gray-500 mb-1">Paste the shareable Google Drive link or any URL pointing to the PDF</p>
                  <input
                    value={form.ruleBookUrl ?? ""}
                    onChange={(e) => updateForm("ruleBookUrl", e.target.value)}
                    className="w-full p-2 border-2 border-black rounded-lg font-bold"
                    placeholder="https://drive.google.com/…"
                  />
                </div>
                <div>
                  <div id="admin-rules-section" className="flex justify-between items-center mb-1">
                    <label className="font-display uppercase text-sm">Rules (one per line)</label>
                    <ComicButton variant="white" size="sm" onClick={addRule}>+ Rule</ComicButton>
                  </div>
                  {form.rules.map((r, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input
                        value={r}
                        onChange={(e) => setRule(i, e.target.value)}
                        className="flex-1 p-2 border-2 border-black rounded-lg font-bold"
                      />
                      <ComicButton variant="destructive" size="sm" onClick={() => removeRule(i)}>×</ComicButton>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 pt-4">
                  {editing && (
                    <ComicButton variant="destructive" onClick={() => editing && deleteEvent(editing._id)} disabled={saving}>
                      Delete
                    </ComicButton>
                  )}
                  <div className="flex-1" />
                  <ComicButton variant="white" onClick={closeModal} disabled={saving}>Cancel</ComicButton>
                  <ComicButton
                    variant="primary"
                    onClick={editing ? saveEdit : saveCreate}
                    disabled={saving || !form.name.trim()}
                  >
                    {saving ? "Saving..." : editing ? "Save" : "Create"}
                  </ComicButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
