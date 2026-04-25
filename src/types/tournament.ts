export type TournamentType = "municipal" | "escolar";

export type TournamentStatus =
  | "Inscrições abertas"
  | "Em andamento"
  | "Encerrado"
  | "Em breve";

export interface Tournament {
  id: string;
  title: string;
  type: TournamentType;
  status: TournamentStatus | string;
  startDate: string;
  endDate: string;
  location: string;
  teams: number;
  modality: string;
}

export interface CreateTournamentPayload {
  title: string;
  type: TournamentType;
  status: TournamentStatus | string;
  startDate: string;
  endDate: string;
  location: string;
  teams: number;
  modality: string;
}
