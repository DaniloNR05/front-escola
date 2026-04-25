import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CalendarDays, Users } from "lucide-react";
import heroImage from "@/assets/hero-sports.jpg";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img src={heroImage} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 hero-gradient opacity-85" />
      </div>

      <div className="container relative z-10 flex flex-col items-center py-24 text-center md:py-32 lg:py-40">
        <div
          className="section-fade-in"
          style={{ animationDelay: "0.1s" }}
        >
          <span className="mb-4 inline-block rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary-foreground">
            Edição 2026
          </span>
        </div>

        <h1
          className="section-fade-in mx-auto max-w-3xl text-4xl font-extrabold leading-[1.08] text-primary-foreground md:text-5xl lg:text-6xl text-balance"
          style={{ animationDelay: "0.2s" }}
        >
          Porteirinha Joga
        </h1>

        <p
          className="section-fade-in mx-auto mt-5 max-w-xl text-base text-primary-foreground/80 md:text-lg text-pretty"
          style={{ animationDelay: "0.35s" }}
        >
          A plataforma oficial de competições esportivas de Porteirinha. Acompanhe os Jogos Escolares (JEP) e os torneios da comunidade.
        </p>

        <div
          className="section-fade-in mt-8 flex flex-col gap-3 sm:flex-row"
          style={{ animationDelay: "0.5s" }}
        >
          <Link to="/campeonatos">
            <Button size="lg" variant="hero" className="min-w-[180px] bg-primary-foreground/20 border border-primary-foreground/30 text-primary-foreground backdrop-blur hover:bg-primary-foreground/30">
              <CalendarDays className="mr-2 h-4 w-4" />
              Ver Campeonatos
            </Button>
          </Link>
          <Link to="/inscricao">
            <Button size="lg" variant="outline" className="min-w-[180px] border-primary-foreground/30 text-white hover:bg-primary-foreground/10 hover:text-white bg-transparent">
              <Users className="mr-2 h-4 w-4" />
              Portal de Inscrições
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div
          className="section-fade-in mt-14 grid grid-cols-3 gap-8 md:gap-16"
          style={{ animationDelay: "0.65s" }}
        >
          {[
            { value: "8", label: "Modalidades" },
            { value: "32", label: "Escolas" },
            { value: "1.200+", label: "Atletas" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-extrabold tabular-nums text-primary-foreground md:text-3xl">
                {stat.value}
              </div>
              <div className="mt-0.5 text-xs text-primary-foreground/70 md:text-sm">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
