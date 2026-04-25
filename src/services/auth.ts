import type { AuthUser, LoginPayload } from "@/types/auth";
import { getApiUrl } from "@/lib/api";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(errorBody?.message || "Não foi possível concluir a requisição.");
  }

  return response.json() as Promise<T>;
}

export async function login(payload: LoginPayload): Promise<AuthUser> {
  const response = await fetch(getApiUrl("/api/auth/login"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await handleResponse<{ user: AuthUser }>(response);
  return data.user;
}
