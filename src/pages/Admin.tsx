import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useRegistrations } from "@/hooks/use-registrations";
import { useTournaments } from "@/hooks/use-tournaments";
import { createTournament } from "@/services/tournaments";
import type { TournamentStatus, TournamentType } from "@/types/tournament";
import { toast } from "sonner";
import { CalendarDays, ChevronRight, ClipboardList, MapPin, School, Trophy, UserRound, Users } from "lucide-react";

type TournamentFormState = {
  title: string;
  type: TournamentType;
  status: TournamentStatus;
  startDate: string;
  endDate: string;
  location: string;
  teams: string;
  modality: string;
};

const initialFormState: TournamentFormState = {
  title: "",
  type: "municipal",
  status: "Inscrições abertas",
  startDate: "",
  endDate: "",
  location: "",
  teams: "0",
  modality: "",
};

function formatDate(date: string) {
  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsedDate);
}

function formatDateRange(startDate: string, endDate: string) {
  return `${formatDate(startDate)} ate ${formatDate(endDate)}`;
}

function getFlowLabel(type: TournamentType) {
  return type === "escolar" ? "Professor cadastra a escola" : "Capitao cadastra o time";
}

function getGroupLabel(type: TournamentType) {
  return type === "escolar" ? "Escolas" : "Times";
}

function getRegisteredGroupLabel(type: TournamentType) {
  return type === "escolar" ? "Escolas inscritas" : "Times inscritos";
}

function getAthleteLabel(type: TournamentType) {
  return type === "escolar" ? "Atletas" : "Jogadores";
}

function getTypeLabel(type: TournamentType) {
  return type === "escolar" ? "Jogos Escolares" : "Torneio Municipal / Comunidade";
}

export default function Admin() {
  const [formState, setFormState] = useState<TournamentFormState>(initialFormState);
  const [overviewType, setOverviewType] = useState<TournamentType>("municipal");
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tournamentsQuery = useTournaments();
  const registrationsQuery = useRegistrations();

  const createTournamentMutation = useMutation({
    mutationFn: createTournament,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
      setFormState(initialFormState);
      toast.success("Campeonato criado e publicado na listagem.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleChange = (field: keyof TournamentFormState, value: string) => {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleCreateTournament = (e: React.FormEvent) => {
    e.preventDefault();
    setOverviewType(formState.type);

    createTournamentMutation.mutate({
      title: formState.title,
      type: formState.type,
      status: formState.status,
      startDate: formState.startDate,
      endDate: formState.endDate,
      location: formState.location,
      teams: Number(formState.teams) || 0,
      modality: formState.modality,
    });
  };

  const isSchoolTournament = formState.type === "escolar";
  const isSchoolOverview = overviewType === "escolar";
  const filteredTournaments = useMemo(
    () => (tournamentsQuery.data ?? []).filter((tournament) => tournament.type === overviewType),
    [overviewType, tournamentsQuery.data],
  );
  const filteredRegistrations = useMemo(
    () =>
      (registrationsQuery.data ?? []).filter((registration) =>
        isSchoolOverview ? registration.type === "jep" : registration.type === "comunidade",
      ),
    [isSchoolOverview, registrationsQuery.data],
  );
  const filteredAthletes = useMemo(
    () =>
      filteredRegistrations.flatMap((registration) =>
        registration.athletes.map((athlete) => ({
          ...athlete,
          organizationName: registration.organizationName,
          tournamentTitle: registration.tournamentTitle,
        })),
      ),
    [filteredRegistrations],
  );
  const selectedTournament = useMemo(
    () => filteredTournaments.find((tournament) => tournament.id === selectedTournamentId) ?? filteredTournaments[0] ?? null,
    [filteredTournaments, selectedTournamentId],
  );
  const selectedTournamentRegistrations = useMemo(
    () =>
      selectedTournament
        ? filteredRegistrations.filter((registration) => registration.tournamentId === selectedTournament.id)
        : [],
    [filteredRegistrations, selectedTournament],
  );
  const selectedTournamentAthletes = useMemo(
    () =>
      selectedTournamentRegistrations.flatMap((registration) =>
        registration.athletes.map((athlete) => ({
          ...athlete,
          organizationName: registration.organizationName,
        })),
      ),
    [selectedTournamentRegistrations],
  );

  useEffect(() => {
    if (filteredTournaments.length === 0) {
      setSelectedTournamentId(null);
      return;
    }

    if (!selectedTournamentId || !filteredTournaments.some((tournament) => tournament.id === selectedTournamentId)) {
      setSelectedTournamentId(filteredTournaments[0].id);
    }
  }, [filteredTournaments, selectedTournamentId]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />
      <main className="flex-1 py-10">
        {user?.role !== "admin" && (
          <div className="container max-w-3xl">
            <div className="rounded-xl border bg-card p-8 text-center shadow-sm">
              <h1 className="text-2xl font-extrabold text-foreground">Acesso restrito</h1>
              <p className="mt-2 text-muted-foreground">
                Apenas administradores podem acessar o painel. Entre com a conta de administrador para continuar.
              </p>
            </div>
          </div>
        )}

        {user?.role === "admin" && (
        <div className="container max-w-6xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-foreground">Painel de Administração</h1>
              <p className="text-muted-foreground">Crie torneios e publique automaticamente na página de campeonatos.</p>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            <div className="space-y-6">
              <Tabs defaultValue="criar" className="space-y-6">
                <div className="rounded-xl border bg-card p-2 shadow-sm">
                  <TabsList className="grid h-auto w-full grid-cols-2 gap-2 bg-transparent p-0">
                    <TabsTrigger
                      value="criar"
                      className="rounded-lg border border-border px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      Criar Campeonato
                    </TabsTrigger>
                    <TabsTrigger
                      value="torneios"
                      className="rounded-lg border border-border px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      Torneios
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="criar" className="mt-0">
                  <ScrollReveal>
                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                      <h2 className="mb-6 flex items-center gap-2 text-xl font-bold">
                        <Trophy className="h-5 w-5 text-primary" />
                        Criar Novo Campeonato
                      </h2>

                      <form onSubmit={handleCreateTournament} className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="title">Nome do Campeonato</Label>
                          <Input
                            id="title"
                            value={formState.title}
                            onChange={(e) => handleChange("title", e.target.value)}
                            placeholder="Ex: JEP 2026 ou Copa da Comunidade"
                            required
                          />
                        </div>

                        <div className="space-y-3">
                          <Label>Tipo de Campeonato</Label>
                          <RadioGroup
                            value={formState.type}
                            onValueChange={(value) => handleChange("type", value)}
                            className="grid grid-cols-1 gap-4 md:grid-cols-2"
                          >
                            <div>
                              <RadioGroupItem value="municipal" id="municipal" className="peer sr-only" />
                              <Label
                                htmlFor="municipal"
                                className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                              >
                                <Trophy className="mb-3 h-6 w-6" />
                                Torneio Municipal / Comunidade
                              </Label>
                            </div>
                            <div>
                              <RadioGroupItem value="escolar" id="escolar" className="peer sr-only" />
                              <Label
                                htmlFor="escolar"
                                className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                              >
                                <School className="mb-3 h-6 w-6" />
                                Jogos Escolares
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="modality">Modalidade</Label>
                            <Input
                              id="modality"
                              value={formState.modality}
                              onChange={(e) => handleChange("modality", e.target.value)}
                              placeholder="Ex: Futsal"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="location">Local</Label>
                            <Input
                              id="location"
                              value={formState.location}
                              onChange={(e) => handleChange("location", e.target.value)}
                              placeholder="Ex: Ginásio Municipal"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <select
                              id="status"
                              value={formState.status}
                              onChange={(e) => handleChange("status", e.target.value)}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              <option value="Inscrições abertas">Inscrições abertas</option>
                              <option value="Em andamento">Em andamento</option>
                              <option value="Em breve">Em breve</option>
                              <option value="Encerrado">Encerrado</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="teams">Quantidade de Equipes</Label>
                            <Input
                              id="teams"
                              type="number"
                              min="0"
                              value={formState.teams}
                              onChange={(e) => handleChange("teams", e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Fluxo de inscrição</Label>
                            <div className="flex h-10 items-center rounded-md border bg-muted/40 px-3 text-sm text-muted-foreground">
                              {isSchoolTournament ? "Professor cadastra a escola" : "Capitão cadastra o time"}
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="startDate">Data de Início</Label>
                            <Input
                              id="startDate"
                              type="date"
                              value={formState.startDate}
                              onChange={(e) => handleChange("startDate", e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="endDate">Data de Término</Label>
                            <Input
                              id="endDate"
                              type="date"
                              value={formState.endDate}
                              onChange={(e) => handleChange("endDate", e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={createTournamentMutation.isPending}>
                          {createTournamentMutation.isPending ? "Criando campeonato..." : "Criar Campeonato"}
                        </Button>
                      </form>
                    </div>
                  </ScrollReveal>
                </TabsContent>

                <TabsContent value="torneios" className="mt-0">
                  <ScrollReveal delay={100}>
                    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                      <div className="border-b bg-primary/10 p-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                          <div>
                            <h2 className="flex items-center gap-2 text-xl font-bold text-primary">
                              <ClipboardList className="h-5 w-5" />
                              Torneios Cadastrados
                            </h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                              Selecione um campeonato para ver informacoes, equipes inscritas e {getAthleteLabel(overviewType).toLowerCase()}.
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-2 rounded-xl border bg-background p-2">
                            <button
                              type="button"
                              onClick={() => setOverviewType("municipal")}
                              className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                                overviewType === "municipal"
                                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                  : "border-border bg-background text-foreground hover:bg-accent"
                              }`}
                            >
                              Comunidade
                            </button>
                            <button
                              type="button"
                              onClick={() => setOverviewType("escolar")}
                              className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                                overviewType === "escolar"
                                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                  : "border-border bg-background text-foreground hover:bg-accent"
                              }`}
                            >
                              Jogos Escolares
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="p-6">
                        {tournamentsQuery.isLoading && (
                          <p className="text-sm text-muted-foreground">Carregando campeonatos...</p>
                        )}

                        {tournamentsQuery.isSuccess && filteredTournaments.length === 0 && (
                          <div className="rounded-md border p-6 text-center">
                            <p className="text-sm text-muted-foreground">
                              Nenhum campeonato cadastrado para {overviewType === "escolar" ? "os jogos escolares" : "a comunidade"}.
                            </p>
                          </div>
                        )}

                        {filteredTournaments.length > 0 && (
                          <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
                            <div className="space-y-3">
                              {filteredTournaments.map((tournament) => {
                                const registrationsCount = filteredRegistrations.filter(
                                  (registration) => registration.tournamentId === tournament.id,
                                ).length;

                                return (
                                  <button
                                    key={tournament.id}
                                    type="button"
                                    onClick={() => setSelectedTournamentId(tournament.id)}
                                    className={`w-full rounded-xl border p-4 text-left transition ${
                                      selectedTournament?.id === tournament.id
                                        ? "border-primary bg-primary/5 shadow-sm"
                                        : "border-border bg-background hover:border-primary/40 hover:bg-accent/40"
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div>
                                        <div className="font-semibold text-foreground">{tournament.title}</div>
                                        <div className="mt-1 text-sm text-muted-foreground">{tournament.modality}</div>
                                      </div>
                                      <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                    </div>
                                    <div className="mt-3 text-xs text-muted-foreground">
                                      {formatDateRange(tournament.startDate, tournament.endDate)}
                                    </div>
                                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                                      <span>{registrationsCount} {getRegisteredGroupLabel(overviewType).toLowerCase()}</span>
                                      <span>{tournament.status}</span>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>

                            {selectedTournament && (
                              <div className="rounded-xl border bg-background">
                                <div className="border-b p-6">
                                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                    <div>
                                      <div className="flex flex-wrap items-center gap-2">
                                        <Badge variant="secondary">{selectedTournament.status}</Badge>
                                        <Badge variant="outline">{getTypeLabel(selectedTournament.type)}</Badge>
                                      </div>
                                      <h3 className="mt-3 text-2xl font-bold text-foreground">
                                        {selectedTournament.title}
                                      </h3>
                                      <p className="mt-1 text-sm text-muted-foreground">
                                        {selectedTournament.modality}
                                      </p>
                                    </div>

                                    <div className="grid gap-2 text-sm text-muted-foreground">
                                      <div className="flex items-center gap-2">
                                        <CalendarDays className="h-4 w-4" />
                                        {formatDateRange(selectedTournament.startDate, selectedTournament.endDate)}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        {selectedTournament.location}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="mt-6 grid gap-3 md:grid-cols-4">
                                    <div className="rounded-lg border p-4">
                                      <div className="text-xs uppercase tracking-wide text-muted-foreground">Fluxo</div>
                                      <div className="mt-1 text-sm font-semibold text-foreground">
                                        {getFlowLabel(selectedTournament.type)}
                                      </div>
                                    </div>
                                    <div className="rounded-lg border p-4">
                                      <div className="text-xs uppercase tracking-wide text-muted-foreground">
                                        {getGroupLabel(selectedTournament.type)}
                                      </div>
                                      <div className="mt-1 text-2xl font-bold text-foreground">
                                        {selectedTournamentRegistrations.length}
                                      </div>
                                    </div>
                                    <div className="rounded-lg border p-4">
                                      <div className="text-xs uppercase tracking-wide text-muted-foreground">
                                        {getAthleteLabel(selectedTournament.type)}
                                      </div>
                                      <div className="mt-1 text-2xl font-bold text-foreground">
                                        {selectedTournamentAthletes.length}
                                      </div>
                                    </div>
                                    <div className="rounded-lg border p-4">
                                      <div className="text-xs uppercase tracking-wide text-muted-foreground">Vagas previstas</div>
                                      <div className="mt-1 text-2xl font-bold text-foreground">
                                        {selectedTournament.teams}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="p-6">
                                  <Tabs defaultValue="informacoes" className="w-full">
                                    <TabsList className="mb-6 grid w-full grid-cols-3">
                                      <TabsTrigger value="informacoes">Informacoes</TabsTrigger>
                                      <TabsTrigger value="equipes">{getGroupLabel(selectedTournament.type)}</TabsTrigger>
                                      <TabsTrigger value="jogadores">{getAthleteLabel(selectedTournament.type)}</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="informacoes" className="space-y-4">
                                      <div className="grid gap-4 md:grid-cols-2">
                                        <div className="rounded-lg border p-4">
                                          <div className="text-xs uppercase tracking-wide text-muted-foreground">Nome</div>
                                          <div className="mt-1 font-semibold text-foreground">{selectedTournament.title}</div>
                                        </div>
                                        <div className="rounded-lg border p-4">
                                          <div className="text-xs uppercase tracking-wide text-muted-foreground">Modalidade</div>
                                          <div className="mt-1 font-semibold text-foreground">{selectedTournament.modality}</div>
                                        </div>
                                        <div className="rounded-lg border p-4">
                                          <div className="text-xs uppercase tracking-wide text-muted-foreground">Periodo</div>
                                          <div className="mt-1 font-semibold text-foreground">
                                            {formatDateRange(selectedTournament.startDate, selectedTournament.endDate)}
                                          </div>
                                        </div>
                                        <div className="rounded-lg border p-4">
                                          <div className="text-xs uppercase tracking-wide text-muted-foreground">Local</div>
                                          <div className="mt-1 font-semibold text-foreground">{selectedTournament.location}</div>
                                        </div>
                                      </div>
                                    </TabsContent>

                                    <TabsContent value="equipes" className="space-y-4">
                                      {registrationsQuery.isLoading && (
                                        <p className="text-sm text-muted-foreground">Carregando inscricoes...</p>
                                      )}

                                      {registrationsQuery.isSuccess && selectedTournamentRegistrations.length === 0 && (
                                        <div className="rounded-lg border p-6 text-center">
                                          <p className="text-sm text-muted-foreground">
                                            Nenhuma {selectedTournament.type === "escolar" ? "escola" : "equipe"} inscrita neste campeonato.
                                          </p>
                                        </div>
                                      )}

                                      {selectedTournamentRegistrations.map((registration) => (
                                        <div key={registration.id} className="rounded-lg border p-4">
                                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                            <div>
                                              <h4 className="font-semibold text-foreground">{registration.organizationName}</h4>
                                              <p className="mt-1 text-sm text-muted-foreground">
                                                Responsavel: {registration.responsibleName}
                                              </p>
                                            </div>
                                            <Badge variant="outline">
                                              {registration.athletes.length} {selectedTournament.type === "escolar" ? "atletas" : "jogadores"}
                                            </Badge>
                                          </div>
                                          <div className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                                            <p>CPF: {registration.responsibleCpf}</p>
                                            <p>Contato: {registration.phone}</p>
                                            <p className="md:col-span-2">E-mail: {registration.email}</p>
                                          </div>
                                        </div>
                                      ))}
                                    </TabsContent>

                                    <TabsContent value="jogadores" className="space-y-4">
                                      {registrationsQuery.isLoading && (
                                        <p className="text-sm text-muted-foreground">Carregando {getAthleteLabel(selectedTournament.type).toLowerCase()}...</p>
                                      )}

                                      {registrationsQuery.isSuccess && selectedTournamentAthletes.length === 0 && (
                                        <div className="rounded-lg border p-6 text-center">
                                          <p className="text-sm text-muted-foreground">
                                            Nenhum {selectedTournament.type === "escolar" ? "atleta" : "jogador"} cadastrado neste campeonato.
                                          </p>
                                        </div>
                                      )}

                                      {selectedTournamentRegistrations.map((registration) => (
                                        <div key={registration.id} className="rounded-lg border p-4">
                                          <div className="flex items-center gap-2">
                                            <UserRound className="h-4 w-4 text-primary" />
                                            <h4 className="font-semibold text-foreground">{registration.organizationName}</h4>
                                          </div>

                                          {registration.athletes.length === 0 && (
                                            <p className="mt-3 text-sm text-muted-foreground">
                                              Nenhum {selectedTournament.type === "escolar" ? "atleta" : "jogador"} vinculado ainda.
                                            </p>
                                          )}

                                          {registration.athletes.length > 0 && (
                                            <div className="mt-4 grid gap-3 md:grid-cols-2">
                                              {registration.athletes.map((athlete) => (
                                                <div key={athlete.id} className="rounded-lg border bg-muted/30 p-3">
                                                  <div className="font-medium text-foreground">{athlete.name}</div>
                                                  <div className="mt-1 text-xs text-muted-foreground">
                                                    CPF: {athlete.cpf}
                                                  </div>
                                                  <div className="mt-1 text-xs text-muted-foreground">
                                                    Identidade: {athlete.identity}
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </TabsContent>
                                  </Tabs>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </ScrollReveal>
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-6">
              <ScrollReveal delay={200}>
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                  <h3 className="mb-4 flex items-center gap-2 font-bold">
                    <Trophy className="h-4 w-4 text-primary" />
                    Resumo do Fluxo
                  </h3>

                  <div className="grid gap-3">
                    <div className="rounded-lg border p-4">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">Campeonatos</div>
                      <div className="mt-1 text-2xl font-bold text-foreground">{filteredTournaments.length}</div>
                    </div>
                    <div className="rounded-lg border p-4">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">
                        {getRegisteredGroupLabel(overviewType)}
                      </div>
                      <div className="mt-1 text-2xl font-bold text-foreground">{filteredRegistrations.length}</div>
                    </div>
                    <div className="rounded-lg border p-4">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">
                        {getAthleteLabel(overviewType)} cadastrados
                      </div>
                      <div className="mt-1 text-2xl font-bold text-foreground">{filteredAthletes.length}</div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <h4 className="text-sm font-semibold text-foreground">Ultimos campeonatos desse fluxo</h4>

                    {filteredTournaments.slice(0, 4).map((tournament) => (
                      <div key={tournament.id} className="rounded-lg border p-3 text-sm">
                        <div className="font-semibold">{tournament.title}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}
                        </div>
                      </div>
                    ))}

                    {filteredTournaments.length === 0 && (
                      <p className="text-sm text-muted-foreground">Nenhum campeonato encontrado.</p>
                    )}
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
