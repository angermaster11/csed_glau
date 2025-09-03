import { api, BASE_URL } from "@/lib/api";

export type ApiMember = {
  name: string;
  email: string;
  designation: string;
  linkedin?: string | null;
};

export type ApiProject = {
  _id: string;
  project_name: string;
  project_summary: string;
  project_description: string;
  project_title: string;
  who_involved: ApiMember[];
  techStacks: string[];
  project_image?: string;
  created_at?: string;
};

export async function fetchProjects(): Promise<ApiProject[]> {
  const res = await fetch(`${BASE_URL}/api/projects/projects`, {
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
  if (Array.isArray(data)) return data as ApiProject[];
  if (data && Array.isArray((data as any).projects))
    return (data as any).projects as ApiProject[];
  return [];
}

export async function fetchProject(id: string): Promise<ApiProject> {
  const res = await fetch(`${BASE_URL}/api/projects/projects/${id}`, {
    method: "GET",
    headers: {
      "ngrok-skip-browser-warning": "true",
      Accept: "application/json",
    },
  });
  if (!res.ok) throw new Error("Failed to fetch project");
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) throw new Error("Invalid response");
  return (await res.json()) as ApiProject;
}

export type UpsertProjectInput = {
  project_name: string;
  project_summary: string;
  project_description: string;
  project_title: string;
  who_involved: ApiMember[];
  techStacks: string[];
  project_image?: File | null;
};

function toFormData(input: UpsertProjectInput) {
  const fd = new FormData();
  fd.set("project_name", input.project_name);
  fd.set("project_summary", input.project_summary);
  fd.set("project_description", input.project_description);
  fd.set("project_title", input.project_title);
  fd.set("who_involved", JSON.stringify(input.who_involved ?? []));
  fd.set("techStacks", JSON.stringify(input.techStacks ?? []));
  if (input.project_image) fd.set("project_image", input.project_image);
  return fd;
}

export async function createProject(input: UpsertProjectInput) {
  const fd = toFormData(input);
  const { data } = await api.post<{ id: string; message: string }>(
    "/api/projects/projects",
    fd,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return data;
}

export async function updateProject(id: string, input: UpsertProjectInput) {
  const fd = toFormData(input);
  const { data } = await api.put<{ message: string }>(
    `/api/projects/projects/${id}`,
    fd,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return data;
}

export async function deleteProject(id: string) {
  const { data } = await api.delete<{ message: string }>(
    `/api/projects/projects/${id}`,
  );
  return data;
}
