import { ScrollReveal } from "./ScrollReveal";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const modalities = [
  { name: "Futsal", emoji: "⚽", teams: 16 },
  { name: "Vôlei", emoji: "🏐", teams: 12 },
  { name: "Basquete 3x3", emoji: "🏀", teams: 10 },
  { name: "Basquete", emoji: "🏀", teams: 8 },
  { name: "Vôlei de Praia", emoji: "🏖️", teams: 8 },
  { name: "Handebol", emoji: "🤾", teams: 10 },
  { name: "Tênis de Mesa", emoji: "🏓", teams: 14 },
  { name: "Atletismo", emoji: "🏃", teams: 20 },
];

export function ModalitiesShowcase() {
  return (
    <section className="bg-surface-sunken py-20 md:py-28">
      <div className="container">
        <ScrollReveal>
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-extrabold text-foreground md:text-4xl text-balance">
              Modalidades Esportivas
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground text-pretty">
              Diversas categorias para todos os talentos esportivos da cidade.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:gap-4">
          {modalities.map((mod, i) => (
            <ScrollReveal key={mod.name} delay={i * 60}>
              <div className="group flex flex-col items-center rounded-xl border bg-card p-5 text-center shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
                <span className="text-3xl">{mod.emoji}</span>
                <h3 className="mt-3 text-sm font-bold text-foreground">{mod.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground tabular-nums">{mod.teams} equipes</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={500}>
          <div className="mt-10 text-center">
            <Link to="/modalidades">
              <Button variant="outline" className="group">
                Ver todas as modalidades
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
