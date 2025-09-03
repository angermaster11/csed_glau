import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "@/lib/adminStore";
import { ApiEvent, ApiSpeaker, createEvent, deleteEvent, fetchEvents, updateEvent } from "@/lib/eventsApi";

export default function AdminEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // form state
  const [editingId, setEditingId] = useState<string | null>(null);
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
    speakers: [] as ApiSpeaker[],
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
    setForm({ title: "", description: "", date: "", time: "", venue: "", capacity: 100, category: "general", summary: "", status: "upcoming", speakers: [], banner: null });
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      const payload = { ...form };
      if (editingId) {
        await updateEvent(editingId, payload);
      } else {
        await createEvent(payload);
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
      setEvents(await fetchEvents());
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || "Delete failed");
    }
  };

  if (loading) return <div className="container mx-auto py-12">Loading...</div>;

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-2xl sm:text-3xl font-bold">Manage Events</h1>
      <p className="text-muted-foreground">Create, update and delete events</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-5">
          <h3 className="font-semibold mb-3">{editingId ? "Edit Event" : "Add Event"}</h3>
          {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
          <div className="space-y-3">
            <input className="w-full rounded-md border bg-background px-3 py-2" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <textarea className="w-full rounded-md border bg-background px-3 py-2" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <input className="rounded-md border bg-background px-3 py-2" placeholder="Date (YYYY-MM-DD)" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              <input className="rounded-md border bg-background px-3 py-2" placeholder="Time (HH:MM)" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
            </div>
            <input className="w-full rounded-md border bg-background px-3 py-2" placeholder="Venue" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <input type="number" className="rounded-md border bg-background px-3 py-2" placeholder="Capacity" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value || "0", 10) })} />
              <input className="rounded-md border bg-background px-3 py-2" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </div>
            <input className="w-full rounded-md border bg-background px-3 py-2" placeholder="Summary" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
            <select className="w-full rounded-md border bg-background px-3 py-2" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
            </select>
            <input type="file" accept="image/*" onChange={(e) => setForm({ ...form, banner: e.target.files?.[0] || null })} />

            <div>
              <div className="flex items-center justify-between mt-2">
                <h4 className="font-medium">Speakers</h4>
                <button
                  type="button"
                  className="rounded-md border px-2 py-1 text-sm"
                  onClick={() => setForm({ ...form, speakers: [...form.speakers, { id: crypto.randomUUID(), name: "", title: "", company: "", bio: "", image: "", linkedin: "" }] })}
                >
                  Add speaker
                </button>
              </div>
              <div className="mt-2 space-y-3">
                {form.speakers.map((s, idx) => (
                  <div key={s.id} className="rounded-md border p-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input className="rounded-md border bg-background px-3 py-2" placeholder="Name" value={s.name} onChange={(e) => {
                        const speakers = [...form.speakers];
                        speakers[idx] = { ...s, name: e.target.value };
                        setForm({ ...form, speakers });
                      }} />
                      <input className="rounded-md border bg-background px-3 py-2" placeholder="Title" value={s.title} onChange={(e) => {
                        const speakers = [...form.speakers];
                        speakers[idx] = { ...s, title: e.target.value };
                        setForm({ ...form, speakers });
                      }} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input className="rounded-md border bg-background px-3 py-2" placeholder="Company" value={s.company} onChange={(e) => {
                        const speakers = [...form.speakers];
                        speakers[idx] = { ...s, company: e.target.value };
                        setForm({ ...form, speakers });
                      }} />
                      <input className="rounded-md border bg-background px-3 py-2" placeholder="LinkedIn URL" value={s.linkedin || ""} onChange={(e) => {
                        const speakers = [...form.speakers];
                        speakers[idx] = { ...s, linkedin: e.target.value } as any;
                        setForm({ ...form, speakers });
                      }} />
                    </div>
                    <input className="w-full rounded-md border bg-background px-3 py-2" placeholder="Image URL" value={s.image || ""} onChange={(e) => {
                      const speakers = [...form.speakers];
                      speakers[idx] = { ...s, image: e.target.value } as any;
                      setForm({ ...form, speakers });
                    }} />
                    <textarea className="w-full rounded-md border bg-background px-3 py-2" placeholder="Bio" value={s.bio} onChange={(e) => {
                      const speakers = [...form.speakers];
                      speakers[idx] = { ...s, bio: e.target.value };
                      setForm({ ...form, speakers });
                    }} />
                    <div className="flex justify-end">
                      <button type="button" className="rounded-md border px-2 py-1 text-sm hover:bg-red-50 text-red-600" onClick={() => {
                        const speakers = form.speakers.filter((x) => x.id !== s.id);
                        setForm({ ...form, speakers });
                      }}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 mt-3">
              <button className="rounded-md bg-primary px-4 py-2 text-primary-foreground" onClick={handleSubmit}>{editingId ? "Update" : "Create"}</button>
              <button className="rounded-md border px-4 py-2" onClick={resetForm}>Reset</button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-xl border bg-card p-5">
          <h3 className="font-semibold mb-3">Events</h3>
          <div className="grid gap-4">
            {events.map((e) => (
              <div key={e._id} className="rounded-md border p-4 flex items-start gap-3 justify-between">
                <div className="flex gap-3">
                  {e.banner && <img src={e.banner} className="h-16 w-24 rounded object-cover" />}
                  <div>
                    <div className="font-semibold">{e.title}</div>
                    <div className="text-sm text-muted-foreground">{e.date} {e.time} • {e.venue}</div>
                    <div className="text-xs text-muted-foreground">{e.status} • {e.speakers?.length || 0} speaker(s)</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="rounded-md border px-3 py-1" onClick={() => { setEditingId(e._id); setForm({ title: e.title, description: e.description, date: e.date, time: e.time, venue: e.venue, capacity: e.capacity, category: e.category, summary: e.summary, status: e.status, speakers: e.speakers, banner: null }); }}>Edit</button>
                  <button className="rounded-md border px-3 py-1 hover:bg-red-50 text-red-600" onClick={() => handleDelete(e._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
