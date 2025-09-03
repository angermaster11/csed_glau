type Project = {
  id: string;
  title: string;
  description: string;
  tech: string[];
};

const projects: Project[] = [
  {
    id: "csed-connect",
    title: "CSED Connect",
    description:
      "A platform to discover teammates, mentors, and resources for club projects.",
    tech: ["React", "Node", "Postgres"],
  },
  {
    id: "eventify",
    title: "Eventify",
    description: "End-to-end event management tool with tickets and insights.",
    tech: ["Next.js", "Razorpay", "Tailwind"],
  },
  {
    id: "start-kit",
    title: "Startup Starter Kit",
    description: "Templates and guides to go from idea to MVP fast.",
    tech: ["Docs", "Design", "Playbooks"],
  },
];

export default function ProjectsPreview() {
  return (
    <section id="projects" className="container mx-auto py-16 md:py-24">
      <h2 className="text-2xl sm:text-3xl font-bold">Featured Projects</h2>
      <p className="text-muted-foreground mt-2">
        Student-led products shaping real impact.
      </p>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {projects.map((p) => (
          <div
            key={p.id}
            className="rounded-xl border bg-card p-5 hover:shadow-lg transition"
          >
            <h3 className="font-semibold text-lg">{p.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {p.description}
            </p>
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
        ))}
      </div>
    </section>
  );
}
