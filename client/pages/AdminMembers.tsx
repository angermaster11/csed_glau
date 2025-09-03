import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "@/lib/adminStore";
import { fetchMembers, fetchMember, createMember, updateMemberApi, deleteMemberApi, type ApiMember } from "@/lib/membersApi";

export default function AdminMembers() {
  const navigate = useNavigate();
  const [members, setMembers] = useState<ApiMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [picPreview, setPicPreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    designation: "",
    profile_pic: null as File | null,
  });

  useEffect(() => {
    if (!getCurrentUser()) {
      navigate("/admin/login");
      return;
    }
    (async () => {
      try {
        const list = await fetchMembers();
        setMembers(list);
      } catch (e: any) {
        setError(e?.message || "Failed to load members");
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const resetForm = () => {
    setEditingId(null);
    setPicPreview(null);
    setForm({ name: "", email: "", phone: "", designation: "", profile_pic: null });
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      if (!form.name || !form.email) { setError("Name and email required"); return; }
      const payload = { ...form } as any;
      if (editingId) {
        await updateMemberApi(editingId, payload);
        try { (await import("@/lib/audit")).recordAudit({ action: "update", entity: "member", entityId: editingId, details: `Updated ${form.name}` }); } catch {}
      } else {
        const res = await createMember(payload);
        try { (await import("@/lib/audit")).recordAudit({ action: "create", entity: "member", entityId: (res as any)?.id, details: `Created ${form.name}` }); } catch {}
      }
      setMembers(await fetchMembers());
      resetForm();
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || "Save failed");
    }
  };

  const handleEdit = async (id: string) => {
    try {
      setEditingId(id);
      const m = await fetchMember(id);
      setPicPreview(m.profile_pic || null);
      setForm({ name: m.name, email: m.email, phone: m.phone || "", designation: m.designation || "", profile_pic: null });
    } catch (e: any) {
      setError(e?.message || "Failed to load member");
    }
  };

  const previewUrl = useMemo(() => {
    if (form.profile_pic) return URL.createObjectURL(form.profile_pic);
    return picPreview || null;
  }, [form.profile_pic, picPreview]);

  if (loading) return <div className="container mx-auto py-12">Loading...</div>;

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-3">
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <h3 className="font-semibold mb-3">{editingId ? "Edit Member" : "Add Member"}</h3>
        {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Full Name</label>
            <input className="w-full rounded-md border bg-background px-3 py-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Email</label>
            <input type="email" className="w-full rounded-md border bg-background px-3 py-2" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Phone</label>
              <input className="w-full rounded-md border bg-background px-3 py-2" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Designation</label>
              <input className="w-full rounded-md border bg-background px-3 py-2" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Profile Picture</label>
            {previewUrl && <img src={previewUrl} alt="Preview" className="h-24 w-24 rounded-full object-cover border" />}
            <input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0] || null; setForm({ ...form, profile_pic: file }); if (!file) return; setPicPreview(null); }} />
          </div>
          <div className="flex gap-2 mt-3">
            <button className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90" onClick={handleSubmit}>{editingId ? "Update" : "Add"}</button>
            <button className="rounded-md border px-4 py-2 hover:bg-accent" onClick={resetForm}>Reset</button>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 rounded-xl border bg-card p-5">
        <h3 className="font-semibold mb-3">Members List</h3>
        <div className="grid gap-4">
          {members.map((m) => (
            <div key={m._id} className="rounded-md border p-4 flex items-center justify-between hover:bg-accent/30">
              <div className="flex items-center gap-3">
                {m.profile_pic && <img src={m.profile_pic} className="h-12 w-12 rounded-full object-cover" />}
                <div>
                  <div className="font-semibold">{m.name}</div>
                  <div className="text-sm text-muted-foreground">{m.designation || "Member"}</div>
                  <div className="text-xs text-muted-foreground">{m.email}{m.phone ? ` • ${m.phone}` : ""}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="rounded-md border px-3 py-1" onClick={() => handleEdit(m._id)}>Edit</button>
                <button className="rounded-md border px-3 py-1 hover:bg-red-50 text-red-600" onClick={async () => { if (!confirm("Delete this member?")) return; await deleteMemberApi(m._id); try { (await import("@/lib/audit")).recordAudit({ action: "delete", entity: "member", entityId: m._id, details: `Deleted ${m.name}` }); } catch {} setMembers(await fetchMembers()); }}>Delete</button>
              </div>
            </div>
          ))}
          {members.length === 0 && <div className="text-sm text-muted-foreground">No members found.</div>}
        </div>
      </div>
    </div>
  );
}
