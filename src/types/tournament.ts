export type TournamentType = "municipal" | "escolar";

export type TournamentStatus =
  | "Inscrições abertas"
  | "Em andamento"
  | "Encerrado"
  | "Em breve";

export interface TournamentMatch {
  id: string;
  stage: string;
  homeRegistrationId: string;
  awayRegistrationId: string;
  homeScore: number | null;
  awayScore: number | null;
  winnerRegistrationId: string | null;
  scheduledAt: string;
  location: string;
}

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
  matches: TournamentMatch[];
  championRegistrationIds: string[];
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

export interface UpdateTournamentCompetitionPayload {
  matches: TournamentMatch[];
  championRegistrationIds: string[];
}
