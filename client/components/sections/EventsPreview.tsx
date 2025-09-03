import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchEvents, type ApiEvent } from "@/lib/eventsApi";

export type EventCard = {
  id: string;
  title: string;
  date: string;
  price?: number; // paise optional
  summary: string;
  image: string;
};

function mapApiToCard(e: ApiEvent): EventCard {
  return {
    id: e._id,
    title: e.title,
    date: `${e.date} ${e.time}`,
    price:
      (e as any).amount != null ? Number((e as any).amount) * 100 : undefined,
    summary: e.summary || e.description,
    image:
      e.banner ||
      "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=1600&auto=format&fit=crop",
  };
}

export default function EventsPreview() {
  const { data } = useQuery({
    queryKey: ["events", "preview"],
    queryFn: fetchEvents,
  });
  const list = Array.isArray(data) ? data : [];
  const events: EventCard[] = list.map(mapApiToCard);
  return (
    <section id="events" className="container mx-auto py-16 md:py-24">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">Upcoming Events</h2>
          <p className="text-muted-foreground mt-2">
            Learn, build and network with peers and mentors.
          </p>
        </div>
        <Link
          to="/events"
          className="hidden md:inline-flex items-center rounded-md border px-4 py-2 hover:bg-accent transition"
        >
          All events
        </Link>
      </div>
      <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {events.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No events to show.
          </div>
        ) : (
          <div className="flex gap-6 snap-x snap-mandatory">
            {events.map((e) => (
              <Link
                key={e.id}
                to={`/events/${e.id}`}
                className="min-w-[320px] sm:min-w-[380px] max-w-[420px] snap-start group rounded-xl overflow-hidden border bg-card hover:shadow-lg transition"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={e.image}
                    alt={e.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>
                <div className="p-4">
                  <div className="text-xs uppercase tracking-wider text-indigo-600 font-semibold">
                    {e.date}
                  </div>
                  <h3 className="mt-1 font-semibold">{e.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {e.summary}
                  </p>
                  {e.price != null && (
                    <div className="mt-4 flex items-center justify-between">
                      <span className="font-bold">
                        ₹{(e.price / 100).toFixed(2)}
                      </span>
                      <span className="text-sm text-primary">Buy ticket →</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
