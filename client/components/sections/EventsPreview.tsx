import { Link } from "react-router-dom";

export type EventCard = {
  id: string;
  title: string;
  date: string;
  price: number; // paise
  summary: string;
  image: string;
};

export const sampleEvents: EventCard[] = [
  {
    id: "ignite-2025",
    title: "Ignite 2025: Startup Hackathon",
    date: "2025-11-16",
    price: 49900,
    summary:
      "48-hour hackathon to build and pitch startup ideas with mentors and prizes.",
    image:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: "founders-summit",
    title: "Founders Summit",
    date: "2025-12-05",
    price: 29900,
    summary: "Talks and fireside chats with successful founders and investors.",
    image:
      "https://images.unsplash.com/photo-1529336953121-ad5a0d43d0d4?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: "design-sprint",
    title: "Design Sprint Weekend",
    date: "2026-01-20",
    price: 19900,
    summary:
      "Build rapid prototypes and validate ideas with users in 48 hours.",
    image:
      "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: "ai-bootcamp",
    title: "AI Bootcamp",
    date: "2026-02-15",
    price: 39900,
    summary: "Hands-on ML and AI product building with mentors.",
    image:
      "https://images.unsplash.com/photo-1555255707-c07966088b7b?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: "product-design",
    title: "Product Design Lab",
    date: "2026-03-10",
    price: 25900,
    summary: "Design thinking, UX/UI sprints, and prototyping.",
    image:
      "https://images.unsplash.com/photo-1527443195645-7f3c29f44d80?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: "funding-101",
    title: "Funding 101 Workshop",
    date: "2026-04-22",
    price: 14900,
    summary: "Basics of fundraising, pitch decks, and investor Q&A.",
    image:
      "https://images.unsplash.com/photo-1581012770724-1893a84bb4b1?q=80&w=1600&auto=format&fit=crop",
  },
];

export default function EventsPreview() {
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
        <div className="flex gap-6 snap-x snap-mandatory">
          {sampleEvents.map((e) => (
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
                  {new Date(e.date).toLocaleDateString()}
                </div>
                <h3 className="mt-1 font-semibold">{e.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  {e.summary}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-bold">₹{(e.price / 100).toFixed(2)}</span>
                  <span className="text-sm text-primary">Buy ticket →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
