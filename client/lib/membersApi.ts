import { api, BASE_URL } from "@/lib/api";

export type ApiMember = {
  _id: string;
  name: string;
  email: string;
  phone?: string | null;
  designation?: string | null;
  profile_pic?: string | null;
  created_at?: string;
};

export async function fetchMembers(): Promise<ApiMember[]> {
  const res = await fetch(`${BASE_URL}/api/members/members`, {
    method: "GET",
    headers: { "ngrok-skip-browser-warning": "true", Accept: "application/json" },
  });
  if (!res.ok) return [];
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return [];
  const data = await res.json();
  if (Array.isArray(data)) return data as ApiMember[];
  if (data && Array.isArray((data as any).members)) return (data as any).members as ApiMember[];
  return [];
}

export async function fetchMember(id: string): Promise<ApiMember> {
  const res = await fetch(`${BASE_URL}/api/members/members/${id}`, {
    method: "GET",
    headers: { "ngrok-skip-browser-warning": "true", Accept: "application/json" },
  });
  if (!res.ok) throw new Error("Failed to fetch member");
  return (await res.json()) as ApiMember;
}

export type UpsertMemberInput = {
  name: string;
  email: string;
  phone?: string | null;
  designation?: string | null;
  profile_pic?: File | null;
};

function toFormData(input: UpsertMemberInput) {
  const fd = new FormData();
  fd.set("name", input.name);
  fd.set("email", input.email);
  if (input.phone != null) fd.set("phone", input.phone);
  if (input.designation != null) fd.set("designation", input.designation);
  if (input.profile_pic) fd.set("profile_pic", input.profile_pic);
  return fd;
}

export async function createMember(input: UpsertMemberInput) {
  const fd = toFormData(input);
  const { data } = await api.post<{ id: string; message: string }>("/api/members/members", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function updateMemberApi(id: string, input: UpsertMemberInput) {
  const fd = toFormData(input);
  const { data } = await api.put<{ message: string }>(`/api/members/members/${id}`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function deleteMemberApi(id: string) {
  const { data } = await api.delete<{ message: string }>(`/api/members/members/${id}`);
  return data;
}
