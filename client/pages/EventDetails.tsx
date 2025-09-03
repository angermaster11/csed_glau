import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchEvent, type ApiEvent } from "@/lib/eventsApi";

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error, refetch } = useQuery<ApiEvent>({
    queryKey: ["event", id],
    queryFn: () => fetchEvent(id as string),
    enabled: Boolean(id),
  });

  useEffect(() => {
    if (id) refetch();
  }, [id, refetch]);

  if (isLoading) return <div className="container mx-auto py-12">Loading...</div>;
  if (error || !data) return <div className="container mx-auto py-12">Event not found</div>;

  const event = data;

  return (
    <div className="container mx-auto py-12">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="rounded-xl overflow-hidden border bg-card">
            {event.banner && (
              <img
                src={event.banner}
                alt={event.title}
                className="w-full aspect-[16/8] object-cover"
              />
            )}
            <div className="p-6">
              <div className="text-xs uppercase tracking-wider text-indigo-600 font-semibold">
                {`${event.date} ${event.time}`}
              </div>
              <h1 className="mt-2 text-2xl sm:text-3xl font-bold">
                {event.title}
              </h1>
              <p className="mt-3 text-muted-foreground">{event.summary}</p>
              <div className="mt-4 text-sm text-muted-foreground">
                <div>Venue: {event.venue}</div>
                <div>Category: {event.category}</div>
                <div>Status: {event.status}</div>
                <div>Capacity: {event.capacity}</div>
              </div>
              <div className="mt-6 prose prose-sm dark:prose-invert">
                <p>{event.description}</p>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="rounded-xl border p-6 sticky top-24">
            <h3 className="font-semibold">Speakers</h3>
            <div className="mt-4 grid gap-4">
              {(event.speakers || []).map((s) => (
                <div key={s.id} className="flex items-center gap-3">
                  {s.image && (
                    <img src={s.image} alt={s.name} className="h-12 w-12 rounded-full object-cover border" />
                  )}
                  <div>
                    <div className="font-medium leading-tight">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.title} • {s.company}</div>
                  </div>
                </div>
              ))}
              {(!event.speakers || event.speakers.length === 0) && (
                <div className="text-sm text-muted-foreground">No speakers added.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
