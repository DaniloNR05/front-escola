import { useQuery } from "@tanstack/react-query";
import { getRegistrations } from "@/services/registrations";
import type { RegistrationType } from "@/types/registration";

export function useRegistrations(filters?: { type?: RegistrationType; userId?: string }) {
  return useQuery({
    queryKey: ["registrations", filters?.type ?? "all", filters?.userId ?? "all-users"],
    queryFn: () => getRegistrations(filters),
  });
}
