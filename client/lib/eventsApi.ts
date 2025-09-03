import { api, BASE_URL } from "@/lib/api";

export type ApiSpeaker = {
  id: string;
  name: string;
  title: string;
  company: string;
  bio: string;
  image?: string | null;
  linkedin?: string | null;
};

export type ApiEvent = {
  _id: string; // mongo id
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  capacity: number;
  category: string;
  summary: string;
  status: string; // completed|upcoming
  banner?: string;
  speakers: ApiSpeaker[];
  created_at?: string;
};

export async function fetchEvents(): Promise<ApiEvent[]> {
  const res = await fetch(`${BASE_URL}/api/events/events`, {
    method: "GET",
    headers: {
      "ngrok-skip-browser-warning": "true",
      Accept: "application/json",
    },
  });
  if (!res.ok) return [];
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return [];
  const data = await res.json();
  if (Array.isArray(data)) return data as ApiEvent[];
  if (data && Array.isArray((data as any).events)) return (data as any).events as ApiEvent[];
  return [];
}

export async function fetchEvent(id: string): Promise<ApiEvent> {
  const res = await fetch(`${BASE_URL}/api/events/events/${id}`, {
    method: "GET",
    headers: {
      "ngrok-skip-browser-warning": "true",
      Accept: "application/json",
    },
  });
  if (!res.ok) throw new Error("Failed to fetch event");
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) throw new Error("Invalid response");
  return (await res.json()) as ApiEvent;
}

export type UpsertEventInput = {
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  capacity: number;
  category: string;
  summary: string;
  status: string;
  speakers: ApiSpeaker[];
  banner?: File | null;
};

function toFormData(input: UpsertEventInput) {
  const fd = new FormData();
  fd.set("title", input.title);
  fd.set("description", input.description);
  fd.set("date", input.date);
  fd.set("time", input.time);
  fd.set("venue", input.venue);
  fd.set("capacity", String(input.capacity));
  fd.set("category", input.category);
  fd.set("summary", input.summary);
  fd.set("status", input.status);
  fd.set("speakers", JSON.stringify(input.speakers ?? []));
  if (input.banner) fd.set("banner", input.banner);
  return fd;
}

export async function createEvent(input: UpsertEventInput) {
  const fd = toFormData(input);
  const { data } = await api.post<{ id: string; message: string }>("/api/events/events", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function updateEvent(id: string, input: UpsertEventInput) {
  const fd = toFormData(input);
  const { data } = await api.put<{ message: string }>(`/api/events/events/${id}`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function deleteEvent(id: string) {
  const { data } = await api.delete<{ message: string }>(`/api/events/events/${id}`);
  return data;
}
