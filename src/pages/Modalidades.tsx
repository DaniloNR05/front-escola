import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ScrollReveal } from "@/components/ScrollReveal";

const modalities = [
  { name: "Futsal", emoji: "⚽", description: "Competição em quadra coberta, equipes de 5 jogadores.", categories: ["Sub-12", "Sub-14", "Sub-17"] },
  { name: "Vôlei", emoji: "🏐", description: "Jogo em quadra indoor, equipes de 6 jogadores.", categories: ["Sub-14", "Sub-17"] },
  { name: "Vôlei de Praia", emoji: "🏖️", description: "Duplas na areia, formato eliminatório.", categories: ["Sub-14", "Sub-17"] },
  { name: "Basquete 3x3", emoji: "🏀", description: "Meia-quadra, equipes de 3 jogadores. Formato dinâmico e rápido.", categories: ["Sub-14", "Sub-17"] },
  { name: "Basquete Tradicional", emoji: "🏀", description: "Quadra inteira, equipes de 5 jogadores.", categories: ["Sub-17"] },
  { name: "Handebol", emoji: "🤾", description: "Equipes de 7 jogadores, esporte de contato.", categories: ["Sub-14", "Sub-17"] },
  { name: "Tênis de Mesa", emoji: "🏓", description: "Individual e duplas, formato mata-mata.", categories: ["Sub-12", "Sub-14", "Sub-17"] },
  { name: "Atletismo", emoji: "🏃", description: "Provas de corrida, salto e arremesso.", categories: ["Sub-12", "Sub-14", "Sub-17"] },
];

export default function Modalidades() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="hero-gradient py-16 md:py-20">
          <div className="container text-center">
            <h1 className="section-fade-in text-3xl font-extrabold text-primary-foreground md:text-4xl text-balance">
              Modalidades Esportivas
            </h1>
            <p className="section-fade-in mx-auto mt-3 max-w-md text-primary-foreground/80 text-pretty" style={{ animationDelay: "0.15s" }}>
              Conheça cada esporte disponível nos Jogos Escolares.
            </p>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="container grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {modalities.map((mod, i) => (
              <ScrollReveal key={mod.name} delay={i * 70}>
                <div className="flex flex-col rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md h-full">
                  <span className="text-4xl">{mod.emoji}</span>
                  <h3 className="mt-3 text-lg font-bold text-foreground">{mod.name}</h3>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground text-pretty">{mod.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {mod.categories.map((cat) => (
                      <span key={cat} className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
