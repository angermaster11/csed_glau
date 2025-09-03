import { useQuery } from "@tanstack/react-query";
import { fetchProjects, type ApiProject } from "@/lib/projectsApi";

function mapToCard(p: ApiProject) {
  return {
    id: p._id,
    title: p.project_title || p.project_name,
    description: p.project_summary || p.project_description,
    tech: p.techStacks || [],
    image: p.project_image || "",
  };
}

export default function ProjectsPreview() {
  const { data } = useQuery<ApiProject[]>({ queryKey: ["projects", "preview"], queryFn: fetchProjects });
  const list = Array.isArray(data) ? data.map(mapToCard) : [];

  return (
    <section id="projects" className="container mx-auto py-16 md:py-24">
      <h2 className="text-2xl sm:text-3xl font-bold">Featured Projects</h2>
      <p className="text-muted-foreground mt-2">
        Student-led products shaping real impact.
      </p>
      <div className="mt-8 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {list.length === 0 ? (
          <div className="text-sm text-muted-foreground">No projects to show.</div>
        ) : (
          <div className="flex gap-6 snap-x snap-mandatory">
            {list.map((p) => (
              <div
                key={p.id}
                className="min-w-[300px] sm:min-w-[360px] max-w-[420px] snap-start rounded-xl border bg-card hover:shadow-lg transition overflow-hidden"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  {p.image && <img src={p.image} alt={p.title} className="h-full w-full object-cover hover:scale-105 transition duration-500" />}
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
        )}
      </div>
    </section>
  );
}
