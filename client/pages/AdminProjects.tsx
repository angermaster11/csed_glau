import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "@/lib/adminStore";
import type { ApiProject, ApiMember } from "@/lib/projectsApi";
import { fetchProjects, fetchProject, createProject, updateProject, deleteProject } from "@/lib/projectsApi";

export default function AdminProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    project_name: "",
    project_title: "",
    project_summary: "",
    project_description: "",
    techStacks: [] as string[],
    who_involved: [] as ApiMember[],
    project_image: null as File | null,
  });
  const [techInput, setTechInput] = useState("");

  useEffect(() => {
    if (!getCurrentUser()) {
      navigate("/admin/login");
      return;
    }
    (async () => {
      try {
        const list = await fetchProjects();
        setProjects(list);
      } catch (e: any) {
        setError(e?.message || "Failed to load projects");
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const resetForm = () => {
    setEditingId(null);
    setImagePreview(null);
    setForm({ project_name: "", project_title: "", project_summary: "", project_description: "", techStacks: [], who_involved: [], project_image: null });
    setTechInput("");
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      const payload = { ...form };
      if (editingId) {
        await updateProject(editingId, payload as any);
        try { (await import("@/lib/audit")).recordAudit({ action: "update", entity: "project", entityId: editingId, details: `Updated ${form.project_title || form.project_name}` }); } catch {}
      } else {
        const res = await createProject(payload as any);
        try { (await import("@/lib/audit")).recordAudit({ action: "create", entity: "project", entityId: (res as any)?.id, details: `Created ${form.project_title || form.project_name}` }); } catch {}
      }
      const list = await fetchProjects();
      setProjects(list);
      resetForm();
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || "Save failed");
    }
  };

  const handleEdit = async (id: string) => {
    try {
      setEditingId(id);
      const p = await fetchProject(id);
      setImagePreview(p.project_image || null);
      setForm({
        project_name: p.project_name,
        project_title: p.project_title,
        project_summary: p.project_summary,
        project_description: p.project_description,
        techStacks: p.techStacks || [],
        who_involved: (p.who_involved || []).map((m) => ({ ...m })),
        project_image: null,
      });
    } catch (e: any) {
      setError(e?.message || "Failed to load project");
    }
  };

  const imagePreviewUrl = useMemo(() => {
    if (form.project_image) return URL.createObjectURL(form.project_image);
    return imagePreview || null;
  }, [form.project_image, imagePreview]);

  if (loading) return <div className="container mx-auto py-12">Loading...</div>;

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-3">
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <h3 className="font-semibold mb-3">{editingId ? "Edit Project" : "Add Project"}</h3>
        {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Project Name</label>
            <input className="w-full rounded-md border bg-background px-3 py-2" value={form.project_name} onChange={(e) => setForm({ ...form, project_name: e.target.value })} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Project Title</label>
            <input className="w-full rounded-md border bg-background px-3 py-2" value={form.project_title} onChange={(e) => setForm({ ...form, project_title: e.target.value })} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Summary</label>
            <input className="w-full rounded-md border bg-background px-3 py-2" value={form.project_summary} onChange={(e) => setForm({ ...form, project_summary: e.target.value })} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Description</label>
            <textarea className="w-full rounded-md border bg-background px-3 py-2 min-h-24" value={form.project_description} onChange={(e) => setForm({ ...form, project_description: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Tech Stacks</label>
            <div className="flex gap-2">
              <input className="flex-1 rounded-md border bg-background px-3 py-2" placeholder="Add tech and press Enter" value={techInput} onChange={(e) => setTechInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && techInput.trim()) { e.preventDefault(); setForm({ ...form, techStacks: [...form.techStacks, techInput.trim()] }); setTechInput(""); } }} />
              <button type="button" className="rounded-md border px-3 py-2" onClick={() => { if (techInput.trim()) { setForm({ ...form, techStacks: [...form.techStacks, techInput.trim()] }); setTechInput(""); } }}>Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.techStacks.map((t, i) => (
                <span key={`${t}-${i}`} className="text-xs rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300 px-2 py-1 border border-indigo-200/60 dark:border-indigo-500/20 flex items-center gap-1">
                  {t}
                  <button type="button" className="text-indigo-700/70 hover:text-indigo-700" onClick={() => setForm({ ...form, techStacks: form.techStacks.filter((x, idx) => idx !== i) })}>×</button>
                </span>
              ))}
            </div>
          </div>
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Team Members</h4>
              <button type="button" className="rounded-md border px-2 py-1 text-sm hover:bg-accent" onClick={() => setForm({ ...form, who_involved: [...form.who_involved, { name: "", email: "", designation: "", linkedin: "" }] })}>Add member</button>
            </div>
            <div className="mt-3 space-y-3">
              {form.who_involved.map((m, idx) => (
                <div key={idx} className="rounded-md border p-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input className="rounded-md border bg-background px-3 py-2" placeholder="Name" value={m.name} onChange={(e) => { const a=[...form.who_involved]; a[idx] = { ...m, name: e.target.value }; setForm({ ...form, who_involved: a }); }} />
                    <input className="rounded-md border bg-background px-3 py-2" placeholder="Email" value={m.email} onChange={(e) => { const a=[...form.who_involved]; a[idx] = { ...m, email: e.target.value }; setForm({ ...form, who_involved: a }); }} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input className="rounded-md border bg-background px-3 py-2" placeholder="Designation" value={m.designation} onChange={(e) => { const a=[...form.who_involved]; a[idx] = { ...m, designation: e.target.value }; setForm({ ...form, who_involved: a }); }} />
                    <input className="rounded-md border bg-background px-3 py-2" placeholder="LinkedIn" value={m.linkedin || ""} onChange={(e) => { const a=[...form.who_involved]; a[idx] = { ...m, linkedin: e.target.value }; setForm({ ...form, who_involved: a }); }} />
                  </div>
                  <div className="flex justify-end">
                    <button type="button" className="rounded-md border px-2 py-1 text-sm hover:bg-red-50 text-red-600" onClick={() => setForm({ ...form, who_involved: form.who_involved.filter((_, i) => i !== idx) })}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Project Image</label>
            {imagePreviewUrl && <img src={imagePreviewUrl} alt="Preview" className="w-full aspect-[16/9] object-cover rounded-md border" />}
            <input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0] || null; setForm({ ...form, project_image: file }); if (!file) return; setImagePreview(null); }} />
          </div>
          <div className="flex gap-2 mt-3">
            <button className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90" onClick={handleSubmit}>{editingId ? "Update" : "Add"}</button>
            <button className="rounded-md border px-4 py-2 hover:bg-accent" onClick={resetForm}>Reset</button>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 rounded-xl border bg-card p-5">
        <h3 className="font-semibold mb-3">Projects List</h3>
        <div className="grid gap-4">
          {projects.map((p) => (
            <div key={p._id} className="rounded-md border p-4 flex items-start justify-between hover:bg-accent/30">
              <div className="flex gap-3">
                {p.project_image && <img src={p.project_image} className="h-16 w-24 rounded object-cover" />}
                <div>
                  <div className="font-semibold">{p.project_title || p.project_name}</div>
                  <div className="text-sm text-muted-foreground mt-1">{p.project_summary}</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(p.techStacks || []).map((t) => (
                      <span key={t} className="text-xs rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300 px-2 py-1 border border-indigo-200/60 dark:border-indigo-500/20">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="rounded-md border px-3 py-1" onClick={() => handleEdit(p._id)}>Edit</button>
                <button className="rounded-md border px-3 py-1 hover:bg-red-50 text-red-600" onClick={async () => { if (!confirm("Delete this project?")) return; await deleteProject(p._id); try { (await import("@/lib/audit")).recordAudit({ action: "delete", entity: "project", entityId: p._id, details: `Deleted ${p.project_title || p.project_name}` }); } catch {} setProjects(await fetchProjects()); }}>Delete</button>
              </div>
            </div>
          ))}
          {projects.length === 0 && <div className="text-sm text-muted-foreground">No projects found.</div>}
        </div>
      </div>
    </div>
  );
}
