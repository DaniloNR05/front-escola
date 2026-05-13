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
import { addRegistrationAthlete, createRegistration } from "@/services/registrations";
import type { Registration, RegistrationType } from "@/types/registration";
import { toast } from "sonner";
import { CalendarDays, MapPin, School, Trophy, Users } from "lucide-react";

type RegistrationFormState = {
  tournamentId: string;
  organizationName: string;
  responsibleName: string;
  responsibleCpf: string;
  email: string;
  phone: string;
};

type AthleteFormState = {
  name: string;
  cpf: string;
  identity: string;
};

const initialRegistrationForm: RegistrationFormState = {
  tournamentId: "",
  organizationName: "",
  responsibleName: "",
  responsibleCpf: "",
  email: "",
  phone: "",
};

const initialAthleteForm: AthleteFormState = {
  name: "",
  cpf: "",
  identity: "",
};

function textByType(type: RegistrationType) {
  return type === "jep"
    ? {
        title: "Jogos Escolares (JEP)",
        organizationLabel: "Nome da Escola",
        organizationPlaceholder: "Ex: E.E. Odilon Loures",
        responsibleLabel: "Nome do Professor Responsável",
        buttonLabel: "Cadastrar Escola",
      }
    : {
        title: "Torneio da Comunidade",
        organizationLabel: "Nome do Time",
        organizationPlaceholder: "Ex: Porteirinha F.C.",
        responsibleLabel: "Nome do Capitão",
        buttonLabel: "Cadastrar Time",
      };
}

function groupLabelByType(type: RegistrationType) {
  return type === "jep" ? "escola" : "time";
}

function athleteLabelByType(type: RegistrationType) {
  return type === "jep" ? "atletas" : "jogadores";
}

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

export default function Inscricao() {
  const [inscriptionType, setInscriptionType] = useState<RegistrationType>("jep");
  const [formState, setFormState] = useState<RegistrationFormState>(initialRegistrationForm);
  const [athleteForm, setAthleteForm] = useState<AthleteFormState>(initialAthleteForm);
  const [currentRegistration, setCurrentRegistration] = useState<Registration | null>(null);
  const queryClient = useQueryClient();
  const { user, login: persistLogin } = useAuth();
  const tournamentsQuery = useTournaments();
  const registrationsQuery = useRegistrations(user ? { userId: user.id } : undefined);
  const activeType =
    user && user.role !== "admin" && user.registrationType
      ? user.registrationType
      : inscriptionType;
  const labels = textByType(activeType);
  const existingProfileRegistration = useMemo(
    () => (registrationsQuery.data ?? []).find((registration) => registration.type === activeType) ?? null,
    [activeType, registrationsQuery.data],
  );
  const myRegistrations = useMemo(
    () => (registrationsQuery.data ?? []).filter((registration) => registration.type === activeType),
    [activeType, registrationsQuery.data],
  );
  const hasLinkedOrganization = Boolean(user && user.role !== "admin" && existingProfileRegistration);

  const availableTournaments = useMemo(() => {
    const tournamentType = activeType === "jep" ? "escolar" : "municipal";

    return (tournamentsQuery.data ?? []).filter(
      (tournament) =>
        tournament.type === tournamentType && tournament.status === "Inscrições abertas",
    );
  }, [activeType, tournamentsQuery.data]);

  const selectedTournament = useMemo(
    () => (tournamentsQuery.data ?? []).find((tournament) => tournament.id === formState.tournamentId) ?? null,
    [formState.tournamentId, tournamentsQuery.data],
  );

  const selectedTournamentRegistration = useMemo(
    () =>
      (registrationsQuery.data ?? []).find(
        (registration) => registration.type === activeType && registration.tournamentId === formState.tournamentId,
      ) ?? null,
    [activeType, formState.tournamentId, registrationsQuery.data],
  );

  useEffect(() => {
    setAthleteForm(initialAthleteForm);
    setFormState((current) => ({
      tournamentId:
        availableTournaments.find((tournament) => tournament.id === current.tournamentId)?.id
        ?? availableTournaments[0]?.id
        ?? "",
      organizationName: existingProfileRegistration?.organizationName ?? "",
      responsibleName: existingProfileRegistration?.responsibleName ?? user?.name ?? "",
      responsibleCpf: existingProfileRegistration?.responsibleCpf ?? "",
      email: existingProfileRegistration?.email ?? user?.email ?? current.email,
      phone: existingProfileRegistration?.phone ?? current.phone,
    }));
  }, [availableTournaments, existingProfileRegistration, user]);

  useEffect(() => {
    if (!user || user.role === "admin" || registrationsQuery.data === undefined) {
      return;
    }

    const compatibleType = user.registrationType ?? inscriptionType;
    const compatibleRegistration = registrationsQuery.data.find(
      (registration) => registration.type === compatibleType,
    );

    if (compatibleType && compatibleType !== inscriptionType) {
      setInscriptionType(compatibleType);
      return;
    }

    if (compatibleRegistration) {
      setFormState((current) => ({
        ...current,
        tournamentId: current.tournamentId || compatibleRegistration.tournamentId,
      }));
    }
  }, [inscriptionType, registrationsQuery.data, user]);

  useEffect(() => {
    setCurrentRegistration(selectedTournamentRegistration);
    setAthleteForm(initialAthleteForm);
  }, [selectedTournamentRegistration]);

  const createRegistrationMutation = useMutation({
    mutationFn: createRegistration,
    onSuccess: (response) => {
      setCurrentRegistration(response.registration);
      persistLogin(response.user);
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      if (hasLinkedOrganization) {
        toast.success("Campeonato vinculado com sucesso. Agora adicione os atletas.");
      } else {
        toast.success("Cadastro inicial realizado. Agora adicione os atletas.");
        toast.info(`Acesso criado: ${response.credentials.email}. ${response.credentials.passwordHint}`);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const addAthleteMutation = useMutation({
    mutationFn: (payload: AthleteFormState) => {
      if (!currentRegistration) {
        throw new Error("Cadastre a escola ou o time antes de adicionar atletas.");
      }

      return addRegistrationAthlete(currentRegistration.id, payload);
    },
    onSuccess: (registration) => {
      setCurrentRegistration(registration);
      setAthleteForm(initialAthleteForm);
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      toast.success("Atleta adicionado com sucesso.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleFormChange = (field: keyof RegistrationFormState, value: string) => {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleAthleteChange = (field: keyof AthleteFormState, value: string) => {
    setAthleteForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (hasLinkedOrganization && existingProfileRegistration) {
      createRegistrationMutation.mutate({
        tournamentId: formState.tournamentId,
        type: activeType,
        organizationName: existingProfileRegistration.organizationName,
        responsibleName: existingProfileRegistration.responsibleName,
        responsibleCpf: existingProfileRegistration.responsibleCpf,
        email: existingProfileRegistration.email,
        phone: existingProfileRegistration.phone,
      });
      return;
    }

    createRegistrationMutation.mutate({
      tournamentId: formState.tournamentId,
      type: activeType,
      organizationName: formState.organizationName,
      responsibleName: formState.responsibleName,
      responsibleCpf: formState.responsibleCpf,
      email: formState.email,
      phone: formState.phone,
    });
  };

  const handleAthleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAthleteMutation.mutate(athleteForm);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="hero-gradient py-16 md:py-20">
          <div className="container text-center">
            <h1 className="section-fade-in text-3xl font-extrabold text-primary-foreground md:text-4xl text-balance">
              Portal de Inscrições
            </h1>
            <p className="section-fade-in mx-auto mt-3 max-w-md text-primary-foreground/80 text-pretty" style={{ animationDelay: "0.15s" }}>
              Cadastre sua escola ou equipe e gerencie a inscrição dos atletas em cada campeonato.
            </p>
          </div>
        </section>

        <section className="bg-slate-50 py-16 md:py-20">
          <div className="container grid max-w-5xl gap-6 lg:grid-cols-[1fr_380px]">
            <ScrollReveal>
              <div className="rounded-xl border bg-card p-6 shadow-sm md:p-8">
                {user?.role && user.role !== "admin" && (
                  <div className="mb-6 rounded-md bg-primary/10 p-4 text-sm text-primary">
                    Logado como <strong>{user.name}</strong>. Você pode gerenciar seus campeonatos e continuar cadastrando atletas.
                  </div>
                )}

                {!hasLinkedOrganization && (
                  <>
                    <div className="mb-8">
                      <Label className="mb-4 block text-base">O que você deseja inscrever?</Label>
                      <RadioGroup
                        value={inscriptionType}
                        onValueChange={(value) => setInscriptionType(value as RegistrationType)}
                        className="grid grid-cols-1 gap-4 md:grid-cols-2"
                      >
                        <div>
                          <RadioGroupItem value="jep" id="jep" className="peer sr-only" />
                          <Label
                            htmlFor="jep"
                            className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 text-center hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                          >
                            <School className="mb-3 h-8 w-8 text-primary" />
                            <span className="font-bold">Jogos Escolares (JEP)</span>
                            <span className="mt-1 text-xs text-muted-foreground">Sou professor/responsável por uma escola</span>
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem value="comunidade" id="comunidade" className="peer sr-only" />
                          <Label
                            htmlFor="comunidade"
                            className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 text-center hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                          >
                            <Users className="mb-3 h-8 w-8 text-primary" />
                            <span className="font-bold">Torneio da Comunidade</span>
                            <span className="mt-1 text-xs text-muted-foreground">Sou capitão/responsável por um time</span>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="tournamentId">Campeonato com inscrições abertas</Label>
                        <select
                          id="tournamentId"
                          value={formState.tournamentId}
                          onChange={(e) => handleFormChange("tournamentId", e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          disabled={availableTournaments.length === 0}
                          required
                        >
                          {availableTournaments.length === 0 && <option value="">Nenhum campeonato aberto</option>}
                          {availableTournaments.map((tournament) => (
                            <option key={tournament.id} value={tournament.id}>
                              {tournament.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="organizationName">{labels.organizationLabel}</Label>
                        <Input
                          id="organizationName"
                          value={formState.organizationName}
                          onChange={(e) => handleFormChange("organizationName", e.target.value)}
                          placeholder={labels.organizationPlaceholder}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="responsibleName">{labels.responsibleLabel}</Label>
                        <Input
                          id="responsibleName"
                          value={formState.responsibleName}
                          onChange={(e) => handleFormChange("responsibleName", e.target.value)}
                          placeholder="Seu nome completo"
                          required
                        />
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="responsibleCpf">CPF do Responsável</Label>
                          <Input
                            id="responsibleCpf"
                            value={formState.responsibleCpf}
                            onChange={(e) => handleFormChange("responsibleCpf", e.target.value)}
                            placeholder="000.000.000-00"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Telefone / WhatsApp</Label>
                          <Input
                            id="phone"
                            value={formState.phone}
                            onChange={(e) => handleFormChange("phone", e.target.value)}
                            placeholder="(38) 90000-0000"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">E-mail de Contato</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formState.email}
                          onChange={(e) => handleFormChange("email", e.target.value)}
                          placeholder="seuemail@exemplo.com"
                          required
                        />
                      </div>

                      <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-800">
                        <strong>Fluxo:</strong> primeiro você conclui o cadastro de {groupLabelByType(activeType)} e, em seguida, já adiciona os atletas com nome, CPF e identidade.
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        size="lg"
                        disabled={createRegistrationMutation.isPending || availableTournaments.length === 0}
                      >
                        {createRegistrationMutation.isPending ? "Cadastrando..." : labels.buttonLabel}
                      </Button>
                    </form>
                  </>
                )}

                {hasLinkedOrganization && existingProfileRegistration && (
                  <div className="space-y-6">
                    <div className="rounded-lg border bg-primary/5 p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">{labels.title}</Badge>
                        <Badge variant="outline">
                          {existingProfileRegistration.organizationName}
                        </Badge>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">
                        Sua {groupLabelByType(activeType)} ja esta vinculada. Agora basta escolher um campeonato disponivel para inscrever e cadastrar os {athleteLabelByType(activeType)}.
                      </p>
                    </div>

                    <Tabs defaultValue={myRegistrations.length > 0 ? "meus" : "disponiveis"} className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="meus">Meus campeonatos</TabsTrigger>
                        <TabsTrigger value="disponiveis">Disponiveis</TabsTrigger>
                      </TabsList>

                      <TabsContent value="meus" className="space-y-3">
                        <Label className="text-base">Campeonatos em que voce ja esta inscrito</Label>

                        {myRegistrations.length === 0 && (
                          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                            Voce ainda nao esta inscrito em nenhum campeonato com essa conta.
                          </div>
                        )}

                        {myRegistrations.map((registration) => {
                          const tournament = (tournamentsQuery.data ?? []).find(
                            (item) => item.id === registration.tournamentId,
                          );

                          return (
                            <button
                              key={registration.id}
                              type="button"
                              onClick={() => handleFormChange("tournamentId", registration.tournamentId)}
                              className={`w-full rounded-xl border p-4 text-left transition ${
                                formState.tournamentId === registration.tournamentId
                                  ? "border-primary bg-primary/5 shadow-sm"
                                  : "border-border hover:border-primary/40 hover:bg-accent/30"
                              }`}
                            >
                              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                <div>
                                  <div className="font-semibold text-foreground">{registration.tournamentTitle}</div>
                                  <div className="mt-1 text-sm text-muted-foreground">
                                    {tournament?.modality ?? "Modalidade nao informada"}
                                  </div>
                                </div>
                                <Badge variant="secondary">
                                  {registration.athletes.length} {athleteLabelByType(activeType)}
                                </Badge>
                              </div>
                              <div className="mt-3 grid gap-2 text-xs text-muted-foreground md:grid-cols-2">
                                <div className="flex items-center gap-2">
                                  <CalendarDays className="h-3.5 w-3.5" />
                                  {tournament
                                    ? `${formatDate(tournament.startDate)} ate ${formatDate(tournament.endDate)}`
                                    : "Periodo nao informado"}
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-3.5 w-3.5" />
                                  {tournament?.location ?? "Local nao informado"}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </TabsContent>

                      <TabsContent value="disponiveis" className="space-y-3">
                        <Label className="text-base">Campeonatos disponiveis</Label>

                        {availableTournaments.length === 0 && (
                          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                            Nenhum campeonato com inscricoes abertas no momento.
                          </div>
                        )}

                        {availableTournaments.map((tournament) => {
                          const linkedRegistration = (registrationsQuery.data ?? []).find(
                            (registration) => registration.tournamentId === tournament.id && registration.type === activeType,
                          );

                          return (
                            <button
                              key={tournament.id}
                              type="button"
                              onClick={() => handleFormChange("tournamentId", tournament.id)}
                              className={`w-full rounded-xl border p-4 text-left transition ${
                                formState.tournamentId === tournament.id
                                  ? "border-primary bg-primary/5 shadow-sm"
                                  : "border-border hover:border-primary/40 hover:bg-accent/30"
                              }`}
                            >
                              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                <div>
                                  <div className="font-semibold text-foreground">{tournament.title}</div>
                                  <div className="mt-1 text-sm text-muted-foreground">{tournament.modality}</div>
                                </div>
                                <Badge variant={linkedRegistration ? "secondary" : "outline"}>
                                  {linkedRegistration ? "Ja inscrito" : "Disponivel"}
                                </Badge>
                              </div>
                              <div className="mt-3 grid gap-2 text-xs text-muted-foreground md:grid-cols-2">
                                <div className="flex items-center gap-2">
                                  <CalendarDays className="h-3.5 w-3.5" />
                                  {formatDate(tournament.startDate)} ate {formatDate(tournament.endDate)}
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-3.5 w-3.5" />
                                  {tournament.location}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </TabsContent>
                    </Tabs>

                    {selectedTournament && (
                      <div className="rounded-lg border p-4">
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-primary" />
                          <h2 className="font-semibold text-foreground">{selectedTournament.title}</h2>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {selectedTournament.modality} | {selectedTournament.location}
                        </p>
                        {!selectedTournamentRegistration && (
                          <div className="mt-4 space-y-4">
                            <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-800">
                              Sua {groupLabelByType(activeType)} ainda nao esta inscrita neste campeonato. Clique abaixo para vincular e liberar o cadastro dos {athleteLabelByType(activeType)}.
                            </div>
                            <form onSubmit={handleSubmit}>
                              <Button
                                type="submit"
                                className="w-full"
                                size="lg"
                                disabled={createRegistrationMutation.isPending}
                              >
                                {createRegistrationMutation.isPending
                                  ? "Inscrevendo..."
                                  : `Inscrever ${existingProfileRegistration.organizationName}`}
                              </Button>
                            </form>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </ScrollReveal>

            <ScrollReveal delay={120}>
              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <h2 className="text-lg font-bold text-foreground">
                  {hasLinkedOrganization ? "Atletas do Campeonato" : "Atletas da Inscrição"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {currentRegistration
                    ? `${currentRegistration.tournamentTitle} vinculado a ${currentRegistration.organizationName}.`
                    : hasLinkedOrganization
                      ? "Selecione um campeonato e conclua a inscricao da sua escola ou equipe para liberar os atletas."
                      : "Conclua o cadastro inicial para liberar o cadastro dos jogadores."}
                </p>

                {!currentRegistration && (
                  <>
                    {!hasLinkedOrganization && registrationsQuery.data && registrationsQuery.data.length > 0 && (
                      <div className="mt-6 space-y-3">
                        <h3 className="text-sm font-semibold text-foreground">Minhas inscricoes</h3>
                        {registrationsQuery.data.map((registration) => (
                          <button
                            key={registration.id}
                            type="button"
                            onClick={() => setCurrentRegistration(registration)}
                            className="w-full rounded-lg border p-4 text-left transition-colors hover:bg-accent"
                          >
                            <div className="font-medium text-foreground">{registration.organizationName}</div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              {registration.tournamentTitle} | {registration.athletes.length} atletas
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {((!registrationsQuery.data || registrationsQuery.data.length === 0) || hasLinkedOrganization) && (
                      <div className="mt-6 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                        {hasLinkedOrganization
                          ? "Depois de inscrever sua escola ou equipe no campeonato escolhido, o cadastro de atletas sera liberado aqui."
                          : "Após cadastrar a escola ou o time, o painel lateral libera a inclusão dos atletas."}
                      </div>
                    )}
                  </>
                )}

                {currentRegistration && (
                  <div className="mt-6 space-y-6">
                    <div className="rounded-lg bg-primary/10 p-4 text-sm text-primary">
                      Protocolo: <strong>{currentRegistration.id.slice(0, 8).toUpperCase()}</strong>
                    </div>

                    <form onSubmit={handleAthleteSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="athleteName">Nome do Atleta</Label>
                        <Input
                          id="athleteName"
                          value={athleteForm.name}
                          onChange={(e) => handleAthleteChange("name", e.target.value)}
                          placeholder="Nome completo"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="athleteCpf">CPF</Label>
                        <Input
                          id="athleteCpf"
                          value={athleteForm.cpf}
                          onChange={(e) => handleAthleteChange("cpf", e.target.value)}
                          placeholder="000.000.000-00"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="athleteIdentity">Identidade</Label>
                        <Input
                          id="athleteIdentity"
                          value={athleteForm.identity}
                          onChange={(e) => handleAthleteChange("identity", e.target.value)}
                          placeholder="RG / Identidade"
                          required
                        />
                      </div>

                      <Button type="submit" className="w-full" disabled={addAthleteMutation.isPending}>
                        {addAthleteMutation.isPending ? "Salvando atleta..." : "Adicionar Atleta"}
                      </Button>
                    </form>

                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-foreground">
                        {activeType === "jep" ? "Atletas cadastrados" : "Jogadores cadastrados"} ({currentRegistration.athletes.length})
                      </h3>

                      {currentRegistration.athletes.length === 0 && (
                        <p className="text-sm text-muted-foreground">Nenhum atleta cadastrado ainda.</p>
                      )}

                      {currentRegistration.athletes.map((athlete) => (
                        <div key={athlete.id} className="rounded-lg border p-3">
                          <div className="font-medium text-foreground">{athlete.name}</div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            CPF: {athlete.cpf} | Identidade: {athlete.identity}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
