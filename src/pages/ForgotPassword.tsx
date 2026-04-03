import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const { resetPassword, isLoading } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-2">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
            <Package className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">CheckFlow</h1>
        </div>

        <Card>
          {sent ? (
            <>
              <CardHeader className="items-center text-center">
                <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center mb-2">
                  <CheckCircle2 className="h-6 w-6 text-status-success" />
                </div>
                <CardTitle className="text-xl">E-mail enviado!</CardTitle>
                <CardDescription>
                  Enviamos as instruções de recuperação para <span className="font-medium text-foreground">{email}</span>
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Link to="/login" className="w-full">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="h-4 w-4" />
                    Voltar para o login
                  </Button>
                </Link>
              </CardFooter>
            </>
          ) : (
            <>
              <CardHeader className="space-y-1">
                <CardTitle className="text-xl">Recuperar senha</CardTitle>
                <CardDescription>Informe seu e-mail para receber as instruções de recuperação</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex-col gap-4">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Enviar instruções
                  </Button>
                  <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                    <ArrowLeft className="h-3 w-3" />
                    Voltar para o login
                  </Link>
                </CardFooter>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
