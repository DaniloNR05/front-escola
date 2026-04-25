import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/contexts/AuthContext";
import { useRegistrations } from "@/hooks/use-registrations";
import { useTournaments } from "@/hooks/use-tournaments";
import { addRegistrationAthlete, createRegistration } from "@/services/registrations";
import type { Registration, RegistrationType } from "@/types/registration";
import { toast } from "sonner";
import { School, Users } from "lucide-react";

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

export default function Inscricao() {
  const [inscriptionType, setInscriptionType] = useState<RegistrationType>("jep");
  const [formState, setFormState] = useState<RegistrationFormState>(initialRegistrationForm);
  const [athleteForm, setAthleteForm] = useState<AthleteFormState>(initialAthleteForm);
  const [currentRegistration, setCurrentRegistration] = useState<Registration | null>(null);
  const queryClient = useQueryClient();
  const { user, login: persistLogin } = useAuth();
  const tournamentsQuery = useTournaments();
  const registrationsQuery = useRegistrations(user ? { userId: user.id } : undefined);
  const labels = textByType(inscriptionType);

  const availableTournaments = useMemo(() => {
    const tournamentType = inscriptionType === "jep" ? "escolar" : "municipal";

    return (tournamentsQuery.data ?? []).filter(
      (tournament) =>
        tournament.type === tournamentType && tournament.status === "Inscrições abertas",
    );
  }, [inscriptionType, tournamentsQuery.data]);

  useEffect(() => {
    setCurrentRegistration(null);
    setAthleteForm(initialAthleteForm);
    setFormState((current) => ({
      ...initialRegistrationForm,
      tournamentId:
        availableTournaments.length > 0 ? availableTournaments[0].id : "",
      email: current.email,
      phone: current.phone,
    }));
  }, [inscriptionType, availableTournaments]);

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
      setCurrentRegistration(compatibleRegistration);
    }
  }, [inscriptionType, registrationsQuery.data, user]);

  const createRegistrationMutation = useMutation({
    mutationFn: createRegistration,
    onSuccess: (response) => {
      setCurrentRegistration(response.registration);
      persistLogin(response.user);
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      toast.success("Cadastro inicial realizado. Agora adicione os atletas.");
      toast.info(`Acesso criado: ${response.credentials.email}. ${response.credentials.passwordHint}`);
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

    createRegistrationMutation.mutate({
      tournamentId: formState.tournamentId,
      type: inscriptionType,
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
              Cadastre sua escola para os Jogos Escolares ou sua equipe para os torneios da comunidade.
            </p>
          </div>
        </section>

        <section className="bg-slate-50 py-16 md:py-20">
          <div className="container grid max-w-5xl gap-6 lg:grid-cols-[1fr_380px]">
            <ScrollReveal>
              <div className="rounded-xl border bg-card p-6 shadow-sm md:p-8">
                {user?.role && user.role !== "admin" && (
                  <div className="mb-6 rounded-md bg-primary/10 p-4 text-sm text-primary">
                    Logado como <strong>{user.name}</strong>. Você pode continuar cadastrando atletas na sua inscrição.
                  </div>
                )}

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
                    <strong>Fluxo:</strong> primeiro você conclui o cadastro de {inscriptionType === "jep" ? "escola" : "time"} e, em seguida, já adiciona os atletas com nome, CPF e identidade.
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
              </div>
            </ScrollReveal>

            <ScrollReveal delay={120}>
              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <h2 className="text-lg font-bold text-foreground">Atletas da Inscrição</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {currentRegistration
                    ? `${labels.title} vinculado a ${currentRegistration.tournamentTitle}.`
                    : "Conclua o cadastro inicial para liberar o cadastro dos jogadores."}
                </p>

                {!currentRegistration && (
                  <>
                    {registrationsQuery.data && registrationsQuery.data.length > 0 && (
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

                    {(!registrationsQuery.data || registrationsQuery.data.length === 0) && (
                      <div className="mt-6 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                        Após cadastrar a escola ou o time, o painel lateral libera a inclusão dos atletas.
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
                        Jogadores cadastrados ({currentRegistration.athletes.length})
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
