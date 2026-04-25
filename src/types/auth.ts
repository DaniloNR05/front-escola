export type UserRole = "admin" | "professor" | "capitao";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  registrationType: "jep" | "comunidade" | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}
