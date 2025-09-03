type Project = {
  id: string;
  title: string;
  description: string;
  tech: string[];
  image: string;
};

const projects: Project[] = [
  {
    id: "csed-connect",
    title: "CSED Connect",
    description:
      "A platform to discover teammates, mentors, and resources for club projects.",
    tech: ["React", "Node", "Postgres"],
    image:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: "eventify",
    title: "Eventify",
    description: "End-to-end event management tool with tickets and insights.",
    tech: ["Next.js", "Razorpay", "Tailwind"],
    image:
      "https://images.unsplash.com/photo-1485217988980-11786ced9454?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: "start-kit",
    title: "Startup Starter Kit",
    description: "Templates and guides to go from idea to MVP fast.",
    tech: ["Docs", "Design", "Playbooks"],
    image:
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=1600&auto=format&fit=crop",
  },
];

export default function ProjectsPreview() {
  return (
    <section id="projects" className="container mx-auto py-16 md:py-24">
      <h2 className="text-2xl sm:text-3xl font-bold">Featured Projects</h2>
      <p className="text-muted-foreground mt-2">
        Student-led products shaping real impact.
      </p>
      <div className="mt-8 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-6 snap-x snap-mandatory">
          {projects.map((p) => (
            <div
              key={p.id}
              className="min-w-[300px] sm:min-w-[360px] max-w-[420px] snap-start rounded-xl border bg-card hover:shadow-lg transition overflow-hidden"
            >
              <div className="aspect-[16/10] overflow-hidden">
                <img src={p.image} alt={p.title} className="h-full w-full object-cover hover:scale-105 transition duration-500" />
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-lg">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {p.tech.map((t) => (
                    <span
                      key={t}
                      className="text-xs rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300 px-2 py-1 border border-indigo-200/60 dark:border-indigo-500/20"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
