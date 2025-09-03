import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchEvents, type ApiEvent } from "@/lib/eventsApi";

export default function EventsList() {
  const [q, setQ] = useState("");
  const { data } = useQuery<ApiEvent[]>({ queryKey: ["events", "list"], queryFn: fetchEvents });
  const list = Array.isArray(data) ? data : [];
  const filtered = useMemo(() => {
    const t = q.toLowerCase().trim();
    const src = list.map((e) => ({ id: e._id, title: e.title, date: `${e.date} ${e.time}`, summary: e.summary || e.description, image: e.banner || "" }));
    if (!t) return src;
    return src.filter((e) => e.title.toLowerCase().includes(t) || e.summary.toLowerCase().includes(t));
  }, [q, list]);

  return (
    <div className="container mx-auto py-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">All Events</h1>
          <p className="text-muted-foreground">Browse upcoming and past events.</p>
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
              {e.image && <img src={e.image} alt={e.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />}
            </div>
            <div className="p-4">
              <div className="text-xs uppercase tracking-wider text-indigo-600 font-semibold">{e.date}</div>
              <h3 className="mt-1 font-semibold">{e.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{e.summary}</p>
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
