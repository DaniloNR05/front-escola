import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { login } from "@/services/auth";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login: persistLogin } = useAuth();

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (user) => {
      persistLogin(user);
      toast.success("Login realizado com sucesso.");
      navigate(user.role === "admin" ? "/admin" : "/inscricao");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center py-16 md:py-20">
        <div className="container grid max-w-4xl gap-6 lg:grid-cols-[1fr_320px]">
          <ScrollReveal>
            <div className="rounded-xl border bg-card p-6 shadow-sm md:p-8">
              <div className="mb-6 text-center">
                <h1 className="text-2xl font-extrabold text-foreground">Entrar</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Acesse o painel para administrar campeonatos ou continuar as inscricoes.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seuemail@exemplo.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    required
                  />
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loginMutation.isPending}>
                  {loginMutation.isPending ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={120}>
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-bold text-foreground">Como acessar</h2>
              <div className="mt-4 space-y-4 text-sm text-muted-foreground">
                <div className="rounded-lg border p-4">
                  <div className="font-semibold text-foreground">Professor / Capitao</div>
                  <p className="mt-1">
                    Depois de fazer a inscricao inicial, entre com o e-mail cadastrado e use o CPF informado como senha inicial.
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="font-semibold text-foreground">Administrador</div>
                  <p className="mt-1">E-mail: admin@porteirinhajoga.com</p>
                  <p>Senha: admin123</p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
