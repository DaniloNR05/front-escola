import type {
  CreateAthletePayload,
  CreateRegistrationPayload,
  CreateRegistrationResponse,
  Registration,
  RegistrationType,
} from "@/types/registration";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(errorBody?.message || "Não foi possível concluir a requisição.");
  }

  return response.json() as Promise<T>;
}

export async function getRegistrations(filters?: {
  type?: RegistrationType;
  userId?: string;
}): Promise<Registration[]> {
  const params = new URLSearchParams();

  if (filters?.type) {
    params.set("type", filters.type);
  }

  if (filters?.userId) {
    params.set("userId", filters.userId);
  }

  const query = params.toString() ? `?${params.toString()}` : "";
  const response = await fetch(`/api/registrations${query}`);
  return handleResponse<Registration[]>(response);
}

export async function createRegistration(
  payload: CreateRegistrationPayload,
): Promise<CreateRegistrationResponse> {
  const response = await fetch("/api/registrations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<CreateRegistrationResponse>(response);
}

export async function addRegistrationAthlete(
  registrationId: string,
  payload: CreateAthletePayload,
): Promise<Registration> {
  const response = await fetch(`/api/registrations/${registrationId}/athletes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<Registration>(response);
}
