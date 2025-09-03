import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AdminUser,
  DashboardState,
  loadState,
  getCurrentUser,
  setCurrentUser,
  addMember,
  updateMember,
  deleteMember,
  addProject,
  updateProject,
  deleteProject,
  addEvent,
  updateEvent,
  deleteEvent,
  addOrder,
  Member,
  Project,
  ClubEvent,
} from "@/lib/adminStore";

function SectionCard({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="font-semibold">{title}</h3>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="text-xs rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300 px-2 py-1 border border-indigo-200/60 dark:border-indigo-500/20">{children}</span>;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [state, setState] = useState<DashboardState>(() => loadState());
  const [tab, setTab] = useState<"overview" | "members" | "projects" | "events" | "buyers" | "audits">("overview");

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) {
      navigate("/admin/login");
      return;
    }
    setUser(u);
    setState(loadState());
  }, [navigate]);

  const [memberForm, setMemberForm] = useState<Partial<Member>>({});
  const [projectForm, setProjectForm] = useState<Partial<Project>>({});
  const [eventForm, setEventForm] = useState<Partial<ClubEvent>>({});

  const resetForms = () => {
    setMemberForm({});
    setProjectForm({});
    setEventForm({});
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    navigate("/admin/login");
  };

  const actor = user?.name || "Unknown";

  const totals = useMemo(() => ({
    members: state.members.length,
    projects: state.projects.length,
    events: state.events.length,
    buyers: state.orders.length,
  }), [state]);

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Signed in as <span className="font-medium">{user?.name}</span></p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/" className="rounded-md border px-3 py-2 hover:bg-accent">View site</Link>
          <button onClick={handleSignOut} className="rounded-md bg-secondary px-3 py-2">Sign out</button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {([
          ["overview", "Overview"],
          ["members", "Members"],
          ["projects", "Projects"],
          ["events", "Events"],
          ["buyers", "Ticket Buyers"],
          ["audits", "Audit Log"],
        ] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} className={`rounded-md border px-3 py-2 hover:bg-accent ${tab === key ? "bg-accent" : ""}`}>{label}</button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <SectionCard title="Members"><div className="text-3xl font-bold">{totals.members}</div></SectionCard>
          <SectionCard title="Projects"><div className="text-3xl font-bold">{totals.projects}</div></SectionCard>
          <SectionCard title="Events"><div className="text-3xl font-bold">{totals.events}</div></SectionCard>
          <SectionCard title="Ticket Buyers"><div className="text-3xl font-bold">{totals.buyers}</div></SectionCard>
        </div>
      )}

      {tab === "members" && (
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <SectionCard
            title="Add Member"
            action={null}
          >
            <div className="space-y-3">
              <input className="w-full rounded-md border bg-background px-3 py-2" placeholder="Full name" value={memberForm.name || ""} onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })} />
              <input className="w-full rounded-md border bg-background px-3 py-2" placeholder="Role" value={memberForm.role || ""} onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })} />
              <input className="w-full rounded-md border bg-background px-3 py-2" placeholder="Avatar URL" value={memberForm.avatar || ""} onChange={(e) => setMemberForm({ ...memberForm, avatar: e.target.value })} />
              <div className="flex gap-2">
                <button className="rounded-md bg-primary px-4 py-2 text-primary-foreground" onClick={() => {
                  if (!memberForm.name || !memberForm.role) return;
                  const s = { ...state };
                  addMember(s, actor, { name: memberForm.name!, role: memberForm.role!, avatar: memberForm.avatar });
                  setState(s);
                  resetForms();
                }}>Add</button>
                <button className="rounded-md border px-4 py-2" onClick={resetForms}>Reset</button>
              </div>
            </div>
          </SectionCard>

          <div className="lg:col-span-2">
            <SectionCard title="Members List">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2 pr-4">Name</th>
                      <th className="py-2 pr-4">Role</th>
                      <th className="py-2 pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.members.map((m) => (
                      <tr key={m.id} className="border-b last:border-0">
                        <td className="py-2 pr-4">
                          <div className="flex items-center gap-2">
                            {m.avatar && <img src={m.avatar} className="h-8 w-8 rounded-full object-cover" />}
                            <div>
                              <div className="font-medium">{m.name}</div>
                              <div className="text-xs text-muted-foreground">added by {m.createdBy}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2 pr-4">{m.role}</td>
                        <td className="py-2 pr-4">
                          <div className="flex gap-2">
                            <button className="rounded-md border px-3 py-1" onClick={() => setMemberForm(m)}>Edit</button>
                            <button className="rounded-md border px-3 py-1 hover:bg-red-50 text-red-600" onClick={() => { const s = { ...state }; deleteMember(s, actor, m.id); setState(s); }}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      {tab === "projects" && (
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <SectionCard title="Add Project">
            <div className="space-y-3">
              <input className="w-full rounded-md border bg-background px-3 py-2" placeholder="Title" value={projectForm.title || ""} onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })} />
              <textarea className="w-full rounded-md border bg-background px-3 py-2" placeholder="Description" value={projectForm.description || ""} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} />
              <input className="w-full rounded-md border bg-background px-3 py-2" placeholder="Tech (comma separated)" value={(projectForm.tech || []).join(", ")} onChange={(e) => setProjectForm({ ...projectForm, tech: e.target.value.split(/,\s*/).filter(Boolean) })} />
              <div className="flex gap-2">
                <button className="rounded-md bg-primary px-4 py-2 text-primary-foreground" onClick={() => {
                  if (!projectForm.title || !projectForm.description) return;
                  const s = { ...state };
                  addProject(s, actor, { title: projectForm.title!, description: projectForm.description!, tech: projectForm.tech || [] });
                  setState(s);
                  resetForms();
                }}>Add</button>
                <button className="rounded-md border px-4 py-2" onClick={resetForms}>Reset</button>
              </div>
            </div>
          </SectionCard>

          <div className="lg:col-span-2">
            <SectionCard title="Projects List">
              <div className="grid gap-4">
                {state.projects.map((p) => (
                  <div key={p.id} className="rounded-lg border p-4 flex items-start justify-between">
                    <div>
                      <div className="font-semibold">{p.title}</div>
                      <div className="text-sm text-muted-foreground mt-1">{p.description}</div>
                      <div className="mt-2 flex flex-wrap gap-2">{p.tech.map((t) => <Tag key={t}>{t}</Tag>)}</div>
                      <div className="text-xs text-muted-foreground mt-1">added by {p.createdBy}</div>
                    </div>
                    <div className="flex gap-2">
                      <button className="rounded-md border px-3 py-1" onClick={() => setProjectForm(p)}>Edit</button>
                      <button className="rounded-md border px-3 py-1 hover:bg-red-50 text-red-600" onClick={() => { const s = { ...state }; deleteProject(s, actor, p.id); setState(s); }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      {tab === "events" && (
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <SectionCard title="Add Event">
            <div className="space-y-3">
              <input className="w-full rounded-md border bg-background px-3 py-2" placeholder="Title" value={eventForm.title || ""} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} />
              <input className="w-full rounded-md border bg-background px-3 py-2" placeholder="Date (YYYY-MM-DD)" value={eventForm.date || ""} onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })} />
              <input className="w-full rounded-md border bg-background px-3 py-2" placeholder="Price (₹)" value={eventForm.price != null ? (eventForm.price/100).toString() : ""} onChange={(e) => setEventForm({ ...eventForm, price: Math.round(parseFloat(e.target.value || "0") * 100) })} />
              <input className="w-full rounded-md border bg-background px-3 py-2" placeholder="Image URL" value={eventForm.image || ""} onChange={(e) => setEventForm({ ...eventForm, image: e.target.value })} />
              <textarea className="w-full rounded-md border bg-background px-3 py-2" placeholder="Summary" value={eventForm.summary || ""} onChange={(e) => setEventForm({ ...eventForm, summary: e.target.value })} />
              <div className="flex gap-2">
                <button className="rounded-md bg-primary px-4 py-2 text-primary-foreground" onClick={() => {
                  if (!eventForm.title || !eventForm.date || !eventForm.summary || eventForm.price == null) return;
                  const s = { ...state };
                  addEvent(s, actor, { title: eventForm.title!, date: eventForm.date!, price: eventForm.price!, image: eventForm.image, summary: eventForm.summary!, });
                  setState(s);
                  resetForms();
                }}>Add</button>
                <button className="rounded-md border px-4 py-2" onClick={resetForms}>Reset</button>
              </div>
            </div>
          </SectionCard>

          <div className="lg:col-span-2">
            <SectionCard title="Events List">
              <div className="grid gap-4">
                {state.events.map((e) => (
                  <div key={e.id} className="rounded-lg border p-4 flex items-start justify-between">
                    <div className="flex gap-3">
                      {e.image && <img src={e.image} className="h-16 w-24 rounded object-cover" />}
                      <div>
                        <div className="font-semibold">{e.title}</div>
                        <div className="text-sm text-muted-foreground">{new Date(e.date).toLocaleDateString()} • ₹{(e.price/100).toFixed(2)}</div>
                        <div className="text-sm mt-1">{e.summary}</div>
                        <div className="text-xs text-muted-foreground mt-1">added by {e.createdBy}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="rounded-md border px-3 py-1" onClick={() => setEventForm(e)}>Edit</button>
                      <button className="rounded-md border px-3 py-1 hover:bg-red-50 text-red-600" onClick={() => { const s = { ...state }; deleteEvent(s, actor, e.id); setState(s); }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      {tab === "buyers" && (
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <SectionCard title="Record Buyer (UI only)">
            <div className="space-y-3">
              <select className="w-full rounded-md border bg-background px-3 py-2" value={(eventForm as any).eventId || ""} onChange={(e) => setEventForm({ ...eventForm, id: e.target.value } as any)}>
                <option value="">Select event</option>
                {state.events.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
              </select>
              <input className="w-full rounded-md border bg-background px-3 py-2" placeholder="Buyer name" value={(projectForm as any).buyerName || ""} onChange={(e) => setProjectForm({ ...projectForm, buyerName: e.target.value } as any)} />
              <input className="w-full rounded-md border bg-background px-3 py-2" placeholder="Buyer email" value={(projectForm as any).buyerEmail || ""} onChange={(e) => setProjectForm({ ...projectForm, buyerEmail: e.target.value } as any)} />
              <input className="w-full rounded-md border bg-background px-3 py-2" placeholder="Amount (₹)" value={(projectForm as any).amount || ""} onChange={(e) => setProjectForm({ ...projectForm, amount: e.target.value } as any)} />
              <button className="rounded-md bg-primary px-4 py-2 text-primary-foreground" onClick={() => {
                const ev = state.events.find((x) => x.id === (eventForm as any).id);
                if (!ev) return;
                const amountPaise = Math.round(parseFloat((projectForm as any).amount || `${ev.price/100}`) * 100);
                const s = { ...state };
                addOrder(s, actor, { eventId: ev.id, eventTitle: ev.title, buyerName: (projectForm as any).buyerName || "Anonymous", buyerEmail: (projectForm as any).buyerEmail || "", amount: amountPaise });
                setState(s);
                resetForms();
              }}>Add Buyer</button>
            </div>
          </SectionCard>

          <div className="lg:col-span-2">
            <SectionCard title="Buyers List">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2 pr-4">Buyer</th>
                      <th className="py-2 pr-4">Event</th>
                      <th className="py-2 pr-4">Amount</th>
                      <th className="py-2 pr-4">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.orders.map((o) => (
                      <tr key={o.id} className="border-b last:border-0">
                        <td className="py-2 pr-4">
                          <div className="font-medium">{o.buyerName}</div>
                          <div className="text-xs text-muted-foreground">{o.buyerEmail}</div>
                        </td>
                        <td className="py-2 pr-4">{o.eventTitle}</td>
                        <td className="py-2 pr-4">₹{(o.amount/100).toFixed(2)}</td>
                        <td className="py-2 pr-4">{new Date(o.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      {tab === "audits" && (
        <div className="mt-6">
          <SectionCard title="Audit Log">
            <div className="space-y-3">
              {state.audits.length === 0 && <div className="text-sm text-muted-foreground">No changes yet.</div>}
              {state.audits.map((a) => (
                <div key={a.id} className="rounded-md border p-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm"><span className="font-medium">{a.actor}</span> {a.action} {a.entity} <span className="text-xs text-muted-foreground">({a.entityId})</span></div>
                    {a.details && <div className="text-xs text-muted-foreground mt-1">{a.details}</div>}
                  </div>
                  <div className="text-xs text-muted-foreground">{new Date(a.timestamp).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  );
}
