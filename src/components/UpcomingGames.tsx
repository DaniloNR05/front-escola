import { CalendarDays, MapPin, Clock } from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";

const games = [
  {
    id: 1,
    sport: "Futsal",
    teamA: "E.M. Padre João",
    teamB: "E.E. Antônio Carlos",
    date: "28 Mar 2026",
    time: "14:00",
    location: "Ginásio Municipal",
    phase: "Quartas de Final",
  },
  {
    id: 2,
    sport: "Vôlei",
    teamA: "E.M. São José",
    teamB: "E.E. Prof. Darcy",
    date: "29 Mar 2026",
    time: "09:30",
    location: "Quadra Poliesportiva",
    phase: "Semifinal",
  },
  {
    id: 3,
    sport: "Basquete 3x3",
    teamA: "E.M. Boa Vista",
    teamB: "E.M. Jardim Primavera",
    date: "31 Mar 2026",
    time: "16:00",
    location: "Praça de Esportes",
    phase: "Fase de Grupos",
  },
];

export function UpcomingGames() {
  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <ScrollReveal>
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-extrabold text-foreground md:text-4xl text-balance">
              Próximos Jogos
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground text-pretty">
              Acompanhe a programação e não perca nenhuma partida.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid gap-4 md:grid-cols-3">
          {games.map((game, i) => (
            <ScrollReveal key={game.id} delay={i * 80}>
              <div className="group relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
                <div className="mb-3 flex items-center justify-between">
                  <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                    {game.sport}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {game.phase}
                  </span>
                </div>

                <div className="my-5 flex items-center justify-center gap-4 text-center">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground leading-tight">{game.teamA}</p>
                  </div>
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-xs font-bold text-muted-foreground">
                    VS
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground leading-tight">{game.teamB}</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {game.date}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" />
                    {game.time}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5" />
                    {game.location}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
