import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "@/lib/adminStore";
import {
  ApiEvent,
  ApiSpeaker,
  createEvent,
  deleteEvent,
  fetchEvent,
  fetchEvents,
  updateEvent,
} from "@/lib/eventsApi";

// Local speaker type to allow file upload for image
type LocalSpeaker = Omit<ApiSpeaker, "image"> & {
  image?: string | File | null;
};

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function toTimeInputValue(value: string) {
  if (!value) return "";
  const m = value.match(/^(\d{1,2}):(\d{2})(?:\s*[AP]M)?$/i);
  if (m) {
    const hh = m[1].padStart(2, "0");
    const mm = m[2];
    return `${hh}:${mm}`;
  }
  return value;
}

export default function AdminEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    venue: "",
    capacity: 100,
    category: "general",
    summary: "",
    status: "upcoming",
    amount: 0,
    speakers: [] as LocalSpeaker[],
    banner: null as File | null,
  });

  useEffect(() => {
    if (!getCurrentUser()) {
      navigate("/admin/login");
      return;
    }
    (async () => {
      try {
        const list = await fetchEvents();
        setEvents(list);
      } catch (e: any) {
        setError(e?.message || "Failed to load events");
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const resetForm = () => {
    setEditingId(null);
    setBannerPreview(null);
    setForm({
      title: "",
      description: "",
      date: "",
      time: "",
      venue: "",
      capacity: 100,
      category: "general",
      summary: "",
      status: "upcoming",
      amount: 0,
      speakers: [],
      banner: null,
    });
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      // normalize speakers: convert File -> data URL string
      const speakers: ApiSpeaker[] = [];
      for (const s of form.speakers) {
        let img: string | null | undefined =
          typeof s.image === "string" ? s.image : null;
        if (s.image && s.image instanceof File) {
          img = await fileToDataUrl(s.image);
        }
        speakers.push({
          id: s.id,
          name: s.name,
          title: s.title,
          company: s.company,
          bio: s.bio,
          image: img ?? undefined,
          linkedin: s.linkedin,
        });
      }
      const payload = { ...form, time: form.time, speakers } as any;
      if (editingId) {
        await updateEvent(editingId, payload);
        try {
          (await import("@/lib/audit")).recordAudit({
            action: "update",
            entity: "event",
            entityId: editingId,
            details: `Updated ${form.title}`,
          });
        } catch {}
      } else {
        const res = await createEvent(payload);
        try {
          (await import("@/lib/audit")).recordAudit({
            action: "create",
            entity: "event",
            entityId: (res as any)?.id,
            details: `Created ${form.title}`,
          });
        } catch {}
      }
      const list = await fetchEvents();
      setEvents(list);
      resetForm();
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || "Save failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    try {
      await deleteEvent(id);
      try {
        (await import("@/lib/audit")).recordAudit({
          action: "delete",
          entity: "event",
          entityId: id,
          details: "Deleted event",
        });
      } catch {}
      setEvents(await fetchEvents());
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || "Delete failed");
    }
  };

  const handleEdit = async (id: string) => {
    try {
      setEditingId(id);
      const e = await fetchEvent(id);
      setBannerPreview(e.banner || null);
      setForm({
        title: e.title,
        description: e.description,
        date: e.date,
        time: toTimeInputValue(e.time),
        venue: e.venue,
        capacity: e.capacity,
        category: e.category,
        summary: e.summary,
        status: e.status,
        amount: (e as any).amount ?? 0,
        speakers: (e.speakers || []).map((s) => ({ ...s })),
        banner: null,
      });
    } catch (e: any) {
      setError(e?.message || "Failed to load event");
    }
  };

  const bannerPreviewUrl = useMemo(() => {
    if (form.banner) return URL.createObjectURL(form.banner);
    return bannerPreview || null;
  }, [form.banner, bannerPreview]);

  if (loading) return <div className="container mx-auto py-12">Loading...</div>;

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-2xl sm:text-3xl font-bold">Manage Events</h1>
      <p className="text-muted-foreground">Create, update and delete events</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h3 className="font-semibold mb-3">
            {editingId ? "Edit Event" : "Add Event"}
          </h3>
          {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Title</label>
              <input
                className="w-full rounded-md border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Description</label>
              <textarea
                className="w-full rounded-md border bg-background px-3 py-2 min-h-24 focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Date</label>
                <input
                  type="date"
                  className="w-full rounded-md border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Time</label>
                <input
                  type="time"
                  className="w-full rounded-md border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Venue</label>
              <input
                className="w-full rounded-md border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Capacity</label>
                <input
                  type="number"
                  className="w-full rounded-md border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  value={form.capacity}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      capacity: parseInt(e.target.value || "0", 10),
                    })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Category</label>
                <input
                  className="w-full rounded-md border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Amount (₹)</label>
                <input
                  type="number"
                  className="w-full rounded-md border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  value={form.amount}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      amount: parseInt(e.target.value || "0", 10),
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Summary</label>
              <input
                className="w-full rounded-md border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Status</label>
              <select
                className="w-full rounded-md border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Banner</label>
              {bannerPreviewUrl && (
                <img
                  src={bannerPreviewUrl}
                  alt="Banner preview"
                  className="w-full aspect-[16/9] object-cover rounded-md border"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setForm({ ...form, banner: file });
                  if (!file) return;
                  setBannerPreview(null);
                }}
              />
            </div>

            <div className="pt-2 border-t">
              <div className="flex items-center justify-between mt-2">
                <h4 className="font-medium">Speakers</h4>
                <button
                  type="button"
                  className="rounded-md border px-2 py-1 text-sm hover:bg-accent"
                  onClick={() =>
                    setForm({
                      ...form,
                      speakers: [
                        ...form.speakers,
                        {
                          id: crypto.randomUUID(),
                          name: "",
                          title: "",
                          company: "",
                          bio: "",
                          image: null,
                          linkedin: "",
                        },
                      ],
                    })
                  }
                >
                  Add speaker
                </button>
              </div>
              <div className="mt-2 space-y-3">
                {form.speakers.map((s, idx) => {
                  const preview =
                    typeof s.image === "string"
                      ? s.image
                      : s.image instanceof File
                        ? URL.createObjectURL(s.image)
                        : "";
                  return (
                    <div key={s.id} className="rounded-md border p-3 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          className="rounded-md border bg-background px-3 py-2"
                          placeholder="Name"
                          value={s.name}
                          onChange={(e) => {
                            const speakers = [...form.speakers];
                            speakers[idx] = { ...s, name: e.target.value };
                            setForm({ ...form, speakers });
                          }}
                        />
                        <input
                          className="rounded-md border bg-background px-3 py-2"
                          placeholder="Title"
                          value={s.title}
                          onChange={(e) => {
                            const speakers = [...form.speakers];
                            speakers[idx] = { ...s, title: e.target.value };
                            setForm({ ...form, speakers });
                          }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          className="rounded-md border bg-background px-3 py-2"
                          placeholder="Company"
                          value={s.company}
                          onChange={(e) => {
                            const speakers = [...form.speakers];
                            speakers[idx] = { ...s, company: e.target.value };
                            setForm({ ...form, speakers });
                          }}
                        />
                        <input
                          className="rounded-md border bg-background px-3 py-2"
                          placeholder="LinkedIn URL"
                          value={s.linkedin || ""}
                          onChange={(e) => {
                            const speakers = [...form.speakers];
                            speakers[idx] = {
                              ...s,
                              linkedin: e.target.value,
                            } as any;
                            setForm({ ...form, speakers });
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        {preview && (
                          <img
                            src={preview}
                            alt={s.name || "Speaker"}
                            className="h-24 w-24 rounded object-cover border"
                          />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="w-full rounded-md border bg-background px-3 py-2"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            const speakers = [...form.speakers];
                            speakers[idx] = { ...s, image: file } as any;
                            setForm({ ...form, speakers });
                          }}
                        />
                      </div>
                      <textarea
                        className="w-full rounded-md border bg-background px-3 py-2"
                        placeholder="Bio"
                        value={s.bio}
                        onChange={(e) => {
                          const speakers = [...form.speakers];
                          speakers[idx] = { ...s, bio: e.target.value };
                          setForm({ ...form, speakers });
                        }}
                      />
                      <div className="flex justify-end">
                        <button
                          type="button"
                          className="rounded-md border px-2 py-1 text-sm hover:bg-red-50 text-red-600"
                          onClick={() => {
                            const speakers = form.speakers.filter(
                              (x) => x.id !== s.id,
                            );
                            setForm({ ...form, speakers });
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2 mt-3">
              <button
                className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
                onClick={handleSubmit}
              >
                {editingId ? "Update" : "Create"}
              </button>
              <button
                className="rounded-md border px-4 py-2 hover:bg-accent"
                onClick={resetForm}
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-xl border bg-card p-5">
          <h3 className="font-semibold mb-3">Events</h3>
          <div className="grid gap-4">
            {events.map((e) => (
              <div
                key={e._id}
                className="rounded-md border p-4 flex items-start gap-3 justify-between hover:bg-accent/30"
              >
                <div className="flex gap-3">
                  {e.banner && (
                    <img
                      src={e.banner}
                      className="h-16 w-24 rounded object-cover"
                    />
                  )}
                  <div>
                    <div className="font-semibold">{e.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {e.date} {e.time} • {e.venue}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {e.status} • ₹{(e as any).amount ?? 0} •{" "}
                      {e.speakers?.length || 0} speaker(s)
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="rounded-md border px-3 py-1"
                    onClick={() => handleEdit(e._id)}
                  >
                    Edit
                  </button>
                  <button
                    className="rounded-md border px-3 py-1 hover:bg-red-50 text-red-600"
                    onClick={() => handleDelete(e._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
