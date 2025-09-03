export type AdminUser = { name: string };

export type Member = {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  createdBy: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
  deletedBy?: string;
  deletedAt?: string | null;
};

export type Project = {
  id: string;
  title: string;
  description: string;
  tech: string[];
  createdBy: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
  deletedBy?: string;
  deletedAt?: string | null;
};

export type ClubEvent = {
  id: string;
  title: string;
  date: string; // ISO
  price: number; // paise
  summary: string;
  image?: string;
  createdBy: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
  deletedBy?: string;
  deletedAt?: string | null;
};

export type OrderBuyer = {
  id: string; // ticket id
  eventId: string;
  eventTitle: string;
  buyerName: string;
  buyerEmail: string;
  amount: number; // paise
  paymentId?: string;
  createdAt: string;
};

export type AuditEntry = {
  id: string;
  timestamp: string;
  actor: string;
  action: "create" | "update" | "delete";
  entity: "member" | "project" | "event" | "order";
  entityId: string;
  details?: string;
};

export type DashboardState = {
  members: Member[];
  projects: Project[];
  events: ClubEvent[];
  orders: OrderBuyer[];
  audits: AuditEntry[];
};

const STORAGE_KEY = "csed_admin_state_v1";
const USER_KEY = "csed_admin_user";

export function getCurrentUser(): AdminUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}

export function setCurrentUser(user: AdminUser | null) {
  if (!user) localStorage.removeItem(USER_KEY);
  else localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function loadState(): DashboardState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as DashboardState;
    } catch {}
  }
  const now = new Date().toISOString();
  return {
    members: [
      {
        id: crypto.randomUUID(),
        name: "Arzoo Srivastava",
        role: "President",
        avatar:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop",
        createdBy: "system",
        createdAt: now,
      },
    ],
    projects: [
      {
        id: crypto.randomUUID(),
        title: "CSED Connect",
        description:
          "A platform to discover teammates, mentors, and resources for club projects.",
        tech: ["React", "Node", "Postgres"],
        createdBy: "system",
        createdAt: now,
      },
    ],
    events: [
      {
        id: "ignite-2025",
        title: "Ignite 2025: Startup Hackathon",
        date: "2025-11-16",
        price: 49900,
        summary:
          "48-hour hackathon to build and pitch startup ideas with mentors and prizes.",
        image:
          "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1600&auto=format&fit=crop",
        createdBy: "system",
        createdAt: now,
      },
    ],
    orders: [],
    audits: [],
  };
}

function saveState(state: DashboardState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function recordAudit(
  state: DashboardState,
  entry: Omit<AuditEntry, "id" | "timestamp">,
) {
  state.audits.unshift({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    ...entry,
  });
}

export function addMember(
  state: DashboardState,
  actor: string,
  m: Omit<Member, "id" | "createdAt" | "createdBy">,
) {
  const member: Member = {
    ...m,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    createdBy: actor,
  };
  state.members.unshift(member);
  recordAudit(state, {
    actor,
    action: "create",
    entity: "member",
    entityId: member.id,
    details: `Added ${member.name}`,
  });
  saveState(state);
}

export function updateMember(
  state: DashboardState,
  actor: string,
  id: string,
  patch: Partial<Member>,
) {
  const idx = state.members.findIndex((x) => x.id === id);
  if (idx >= 0) {
    state.members[idx] = {
      ...state.members[idx],
      ...patch,
      updatedAt: new Date().toISOString(),
      updatedBy: actor,
    };
    recordAudit(state, {
      actor,
      action: "update",
      entity: "member",
      entityId: id,
      details: `Updated ${state.members[idx].name}`,
    });
    saveState(state);
  }
}

export function deleteMember(state: DashboardState, actor: string, id: string) {
  const idx = state.members.findIndex((x) => x.id === id);
  if (idx >= 0) {
    const name = state.members[idx].name;
    state.members.splice(idx, 1);
    recordAudit(state, {
      actor,
      action: "delete",
      entity: "member",
      entityId: id,
      details: `Deleted ${name}`,
    });
    saveState(state);
  }
}

export function addProject(
  state: DashboardState,
  actor: string,
  p: Omit<Project, "id" | "createdAt" | "createdBy">,
) {
  const project: Project = {
    ...p,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    createdBy: actor,
  };
  state.projects.unshift(project);
  recordAudit(state, {
    actor,
    action: "create",
    entity: "project",
    entityId: project.id,
    details: `Added ${project.title}`,
  });
  saveState(state);
}

export function updateProject(
  state: DashboardState,
  actor: string,
  id: string,
  patch: Partial<Project>,
) {
  const idx = state.projects.findIndex((x) => x.id === id);
  if (idx >= 0) {
    state.projects[idx] = {
      ...state.projects[idx],
      ...patch,
      updatedAt: new Date().toISOString(),
      updatedBy: actor,
    };
    recordAudit(state, {
      actor,
      action: "update",
      entity: "project",
      entityId: id,
      details: `Updated ${state.projects[idx].title}`,
    });
    saveState(state);
  }
}

export function deleteProject(
  state: DashboardState,
  actor: string,
  id: string,
) {
  const idx = state.projects.findIndex((x) => x.id === id);
  if (idx >= 0) {
    const title = state.projects[idx].title;
    state.projects.splice(idx, 1);
    recordAudit(state, {
      actor,
      action: "delete",
      entity: "project",
      entityId: id,
      details: `Deleted ${title}`,
    });
    saveState(state);
  }
}

export function addEvent(
  state: DashboardState,
  actor: string,
  e: Omit<ClubEvent, "id" | "createdAt" | "createdBy">,
) {
  const ev: ClubEvent = {
    ...e,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    createdBy: actor,
  };
  state.events.unshift(ev);
  recordAudit(state, {
    actor,
    action: "create",
    entity: "event",
    entityId: ev.id,
    details: `Added ${ev.title}`,
  });
  saveState(state);
}

export function updateEvent(
  state: DashboardState,
  actor: string,
  id: string,
  patch: Partial<ClubEvent>,
) {
  const idx = state.events.findIndex((x) => x.id === id);
  if (idx >= 0) {
    state.events[idx] = {
      ...state.events[idx],
      ...patch,
      updatedAt: new Date().toISOString(),
      updatedBy: actor,
    };
    recordAudit(state, {
      actor,
      action: "update",
      entity: "event",
      entityId: id,
      details: `Updated ${state.events[idx].title}`,
    });
    saveState(state);
  }
}

export function deleteEvent(state: DashboardState, actor: string, id: string) {
  const idx = state.events.findIndex((x) => x.id === id);
  if (idx >= 0) {
    const title = state.events[idx].title;
    state.events.splice(idx, 1);
    recordAudit(state, {
      actor,
      action: "delete",
      entity: "event",
      entityId: id,
      details: `Deleted ${title}`,
    });
    saveState(state);
  }
}

export function addOrder(
  state: DashboardState,
  actor: string,
  o: Omit<OrderBuyer, "id" | "createdAt">,
) {
  const order: OrderBuyer = {
    ...o,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  state.orders.unshift(order);
  recordAudit(state, {
    actor,
    action: "create",
    entity: "order",
    entityId: order.id,
    details: `Recorded order for ${order.buyerName}`,
  });
  saveState(state);
}

export function save(state: DashboardState) {
  saveState(state);
}
