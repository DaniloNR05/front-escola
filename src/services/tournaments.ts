import type { CreateTournamentPayload, Tournament } from "@/types/tournament";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(errorBody?.message || "Não foi possível concluir a requisição.");
  }

  return response.json() as Promise<T>;
}

export async function getTournaments(): Promise<Tournament[]> {
  const response = await fetch("/api/tournaments");
  return handleResponse<Tournament[]>(response);
}

export async function createTournament(payload: CreateTournamentPayload): Promise<Tournament> {
  const response = await fetch("/api/tournaments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<Tournament>(response);
}
