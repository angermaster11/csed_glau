import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchProject, type ApiProject } from "@/lib/projectsApi";

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error, refetch } = useQuery<ApiProject>({
    queryKey: ["project", id],
    queryFn: () => fetchProject(id as string),
    enabled: Boolean(id),
  });

  useEffect(() => {
    if (id) refetch();
  }, [id, refetch]);

  if (isLoading)
    return <div className="container mx-auto py-12">Loading...</div>;
  if (error || !data)
    return <div className="container mx-auto py-12">Project not found</div>;

  const p = data;

  return (
    <div className="container mx-auto py-12">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="rounded-xl overflow-hidden border bg-card">
            {p.project_image && (
              <img
                src={p.project_image}
                alt={p.project_title || p.project_name}
                className="w-full aspect-[16/8] object-cover"
              />
            )}
            <div className="p-6">
              <div className="text-xs uppercase tracking-wider text-indigo-600 font-semibold">
                {p.project_title || p.project_name}
              </div>
              <h1 className="mt-2 text-2xl sm:text-3xl font-bold">
                {p.project_name}
              </h1>
              {p.project_summary && (
                <p className="mt-3 text-muted-foreground">
                  {p.project_summary}
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                {(p.techStacks || []).map((t) => (
                  <span
                    key={t}
                    className="text-xs rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300 px-2 py-1 border border-indigo-200/60 dark:border-indigo-500/20"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <div className="mt-6 prose prose-sm dark:prose-invert max-w-none">
                <p>{p.project_description}</p>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="rounded-xl border p-6 sticky top-24">
            <h3 className="font-semibold">Team Members</h3>
            <div className="mt-4 grid gap-3">
              {(p.who_involved || []).map((m, i) => (
                <div key={`${m.email}-${i}`} className="rounded-md border p-3">
                  <div className="font-medium leading-tight">{m.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {m.designation}
                  </div>
                  {m.linkedin && (
                    <a
                      href={m.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-indigo-600 mt-1 inline-block"
                    >
                      LinkedIn
                    </a>
                  )}
                </div>
              ))}
              {(!p.who_involved || p.who_involved.length === 0) && (
                <div className="text-sm text-muted-foreground">
                  No members listed.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
