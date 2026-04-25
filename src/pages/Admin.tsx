import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ScrollReveal } from "@/components/ScrollReveal";
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
import { School, Trophy, Users } from "lucide-react";

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

export default function Admin() {
  const [formState, setFormState] = useState<TournamentFormState>(initialFormState);
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
  const filteredTournaments = useMemo(
    () => (tournamentsQuery.data ?? []).filter((tournament) => tournament.type === formState.type),
    [formState.type, tournamentsQuery.data],
  );
  const filteredRegistrations = useMemo(
    () =>
      (registrationsQuery.data ?? []).filter((registration) =>
        isSchoolTournament ? registration.type === "jep" : registration.type === "comunidade",
      ),
    [isSchoolTournament, registrationsQuery.data],
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

              <ScrollReveal delay={100}>
                <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                  <div className="border-b bg-primary/10 p-6">
                    <h2 className="flex items-center gap-2 text-xl font-bold text-primary">
                      {isSchoolTournament ? <School className="h-5 w-5" /> : <Users className="h-5 w-5" />}
                      {isSchoolTournament ? "Acompanhamento do JEP" : "Acompanhamento da Comunidade"}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {isSchoolTournament
                        ? "Professores cadastram escolas e atletas no portal. Aqui o admin acompanha as inscrições recebidas."
                        : "Capitães cadastram os times e os jogadores no portal. Aqui o admin acompanha as inscrições recebidas."}
                    </p>
                  </div>

                  <div className="p-6">
                    <Tabs
                      defaultValue={isSchoolTournament ? "organizacoes" : "organizacoes"}
                      className="w-full"
                    >
                      <TabsList className="mb-6 grid w-full grid-cols-3">
                        <TabsTrigger value="organizacoes">{isSchoolTournament ? "Escolas" : "Times"}</TabsTrigger>
                        <TabsTrigger value="modalidades">Modalidades</TabsTrigger>
                        <TabsTrigger value="atletas">{isSchoolTournament ? "Atletas" : "Jogadores"}</TabsTrigger>
                      </TabsList>

                      <TabsContent value="organizacoes" className="space-y-4">
                        {registrationsQuery.isLoading && (
                          <p className="text-sm text-muted-foreground">Carregando inscrições...</p>
                        )}

                        {registrationsQuery.isSuccess && filteredRegistrations.length === 0 && (
                          <div className="rounded-md border p-4">
                            <p className="py-4 text-center text-sm text-muted-foreground">
                              Nenhuma {isSchoolTournament ? "escola" : "equipe"} inscrita ainda.
                            </p>
                          </div>
                        )}

                        {filteredRegistrations.map((registration) => (
                          <div key={registration.id} className="rounded-lg border p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h3 className="font-semibold text-foreground">{registration.organizationName}</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                  {registration.tournamentTitle}
                                </p>
                              </div>
                              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                                {registration.athletes.length} atletas
                              </span>
                            </div>
                            <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                              <p>Responsável: {registration.responsibleName}</p>
                              <p>CPF: {registration.responsibleCpf}</p>
                              <p>Contato: {registration.email} | {registration.phone}</p>
                            </div>
                          </div>
                        ))}
                      </TabsContent>

                      <TabsContent value="modalidades" className="space-y-4">
                        {tournamentsQuery.isLoading && (
                          <p className="text-sm text-muted-foreground">Carregando campeonatos...</p>
                        )}

                        {tournamentsQuery.isSuccess && filteredTournaments.length === 0 && (
                          <div className="rounded-md border p-4">
                            <p className="py-4 text-center text-sm text-muted-foreground">
                              Nenhum campeonato cadastrado para esse fluxo.
                            </p>
                          </div>
                        )}

                        {filteredTournaments.map((tournament) => (
                          <div key={tournament.id} className="rounded-lg border p-4">
                            <div className="font-semibold text-foreground">{tournament.modality}</div>
                            <p className="mt-1 text-sm text-muted-foreground">{tournament.title}</p>
                            <p className="mt-2 text-xs text-muted-foreground">
                              {formatDate(tournament.startDate)} ate {formatDate(tournament.endDate)} | {tournament.status}
                            </p>
                          </div>
                        ))}
                      </TabsContent>

                      <TabsContent value="atletas" className="space-y-4">
                        {registrationsQuery.isLoading && (
                          <p className="text-sm text-muted-foreground">Carregando atletas...</p>
                        )}

                        {registrationsQuery.isSuccess && filteredAthletes.length === 0 && (
                          <div className="rounded-md border p-4">
                            <p className="py-4 text-center text-sm text-muted-foreground">
                              Nenhum atleta cadastrado ainda.
                            </p>
                          </div>
                        )}

                        {filteredAthletes.map((athlete) => (
                          <div key={athlete.id} className="rounded-lg border p-4">
                            <div className="font-semibold text-foreground">{athlete.name}</div>
                            <p className="mt-1 text-sm text-muted-foreground">{athlete.organizationName}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              CPF: {athlete.cpf} | Identidade: {athlete.identity}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Campeonato: {athlete.tournamentTitle}
                            </p>
                          </div>
                        ))}
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              </ScrollReveal>
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
                        {isSchoolTournament ? "Escolas inscritas" : "Times inscritos"}
                      </div>
                      <div className="mt-1 text-2xl font-bold text-foreground">{filteredRegistrations.length}</div>
                    </div>
                    <div className="rounded-lg border p-4">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">
                        {isSchoolTournament ? "Atletas cadastrados" : "Jogadores cadastrados"}
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
