export type AuditItem = {
  id: string;
  ts: string;
  actor?: string;
  action: "create" | "update" | "delete";
  entity: "member" | "project" | "event";
  entityId?: string;
  details?: string;
};

const KEY = "csed_audits_v1";

export function getAudits(): AuditItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as AuditItem[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function recordAudit(item: Omit<AuditItem, "id" | "ts">) {
  const list = getAudits();
  list.unshift({
    id: crypto.randomUUID(),
    ts: new Date().toISOString(),
    ...item,
  });
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 200)));
}

export function clearAudits() {
  localStorage.removeItem(KEY);
}
