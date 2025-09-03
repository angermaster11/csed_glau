import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { sampleEvents } from "@/components/sections/EventsPreview";

export default function EventsList() {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const t = q.toLowerCase().trim();
    if (!t) return sampleEvents;
    return sampleEvents.filter(
      (e) => e.title.toLowerCase().includes(t) || e.summary.toLowerCase().includes(t),
    );
  }, [q]);

  return (
    <div className="container mx-auto py-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">All Events</h1>
          <p className="text-muted-foreground">Browse and buy tickets to CSED events.</p>
        </div>
        <input
          placeholder="Search events..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="rounded-md border bg-background px-3 py-2 w-60"
        />
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((e) => (
          <Link key={e.id} to={`/events/${e.id}`} className="group rounded-xl overflow-hidden border bg-card hover:shadow-lg transition">
            <div className="aspect-[16/10] overflow-hidden">
              <img src={e.image} alt={e.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
            </div>
            <div className="p-4">
              <div className="text-xs uppercase tracking-wider text-indigo-600 font-semibold">{new Date(e.date).toLocaleDateString()}</div>
              <h3 className="mt-1 font-semibold">{e.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{e.summary}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-bold">₹{(e.price / 100).toFixed(2)}</span>
                <span className="text-sm text-primary">Buy ticket →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-sm text-muted-foreground mt-8">No events match your search.</div>
      )}
    </div>
  );
}
