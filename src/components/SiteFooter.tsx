import { Trophy } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t bg-surface-sunken">
      <div className="container py-10">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <span className="font-bold text-foreground">Porteirinha Joga</span>
          </div>
          <p className="max-w-md text-sm text-muted-foreground text-pretty">
            Secretaria Municipal de Esportes e Lazer — Prefeitura Municipal de Porteirinha, Minas Gerais.
          </p>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Prefeitura de Porteirinha. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
