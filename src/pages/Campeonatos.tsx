import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { useTournaments } from "@/hooks/use-tournaments";
import { CalendarDays, MapPin, Users, Trophy } from "lucide-react";
import { Link } from "react-router-dom";

const statusColor: Record<string, string> = {
  "Em andamento": "bg-primary text-primary-foreground",
  "Inscrições abertas": "bg-secondary text-secondary-foreground",
  "Em breve": "bg-muted text-muted-foreground",
  Encerrado: "bg-muted text-muted-foreground",
};

function formatDate(date: string) {
  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
}

export default function Campeonatos() {
  const tournamentsQuery = useTournaments();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Header */}
        <section className="hero-gradient py-16 md:py-20">
          <div className="container text-center">
            <h1 className="section-fade-in text-3xl font-extrabold text-primary-foreground md:text-4xl text-balance">
              Campeonatos
            </h1>
            <p className="section-fade-in mx-auto mt-3 max-w-md text-primary-foreground/80 text-pretty" style={{ animationDelay: "0.15s" }}>
              Todos os torneios escolares e da comunidade em um so lugar.
            </p>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="container">
            {tournamentsQuery.isLoading && (
              <p className="text-center text-muted-foreground">Carregando campeonatos...</p>
            )}

            {tournamentsQuery.isError && (
              <p className="text-center text-destructive">Nao foi possivel carregar os campeonatos.</p>
            )}

            {tournamentsQuery.isSuccess && tournamentsQuery.data.length === 0 && (
              <p className="text-center text-muted-foreground">Nenhum campeonato cadastrado ate o momento.</p>
            )}

            {tournamentsQuery.isSuccess && tournamentsQuery.data.length > 0 && (
              <div className="grid gap-5 md:grid-cols-2">
                {tournamentsQuery.data.map((tournament, i) => (
                  <ScrollReveal key={tournament.id} delay={i * 80}>
                    <div className="rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span
                            className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusColor[tournament.status] ?? statusColor["Em breve"]}`}
                          >
                            {tournament.status}
                          </span>
                          <h3 className="mt-3 text-lg font-bold text-foreground">{tournament.title}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">{tournament.modality}</p>
                        </div>
                        <Trophy className="mt-1 h-5 w-5 shrink-0 text-primary" />
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4" />
                          {formatDate(tournament.startDate)}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {tournament.location}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {tournament.teams} equipes
                        </div>
                      </div>

                      {tournament.status === "Inscrições abertas" && (
                        <Link to="/inscricao">
                          <Button size="sm" className="mt-5 w-full">
                            Ir para inscricoes
                          </Button>
                        </Link>
                      )}
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
