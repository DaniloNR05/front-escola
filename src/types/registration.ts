import type { AuthUser } from "@/types/auth";

export type RegistrationType = "jep" | "comunidade";

export interface Athlete {
  id: string;
  name: string;
  cpf: string;
  identity: string;
}

export interface Registration {
  id: string;
  tournamentId: string;
  tournamentTitle: string;
  tournamentType: "escolar" | "municipal";
  type: RegistrationType;
  organizationName: string;
  responsibleName: string;
  responsibleCpf: string;
  email: string;
  phone: string;
  athletes: Athlete[];
  createdAt: string;
}

export interface CreateRegistrationPayload {
  tournamentId: string;
  type: RegistrationType;
  organizationName: string;
  responsibleName: string;
  responsibleCpf: string;
  email: string;
  phone: string;
}

export interface CreateRegistrationResponse {
  registration: Registration;
  credentials: {
    email: string;
    passwordHint: string;
  };
  user: AuthUser;
}

export interface CreateAthletePayload {
  name: string;
  cpf: string;
  identity: string;
}
