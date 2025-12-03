import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Wallet, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      if (currentUser.accountType === 'business') {
        navigate("/business-dashboard");
      } else {
        navigate("/");
      }
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    const result = await login(email, password);
    
    if (result.success) {
      toast({
        title: "Bem-vindo!",
        description: "Login realizado com sucesso",
      });
      
      // Smooth transition to home
      setTimeout(() => {
        navigate("/");
      }, 300);
    } else {
      toast({
        title: "Erro no login",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <div className={`w-full max-w-md transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Wallet className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Fidelize</h1>
          <p className="text-lg text-muted-foreground">Sua Carteira de Fidelidade</p>
        </div>

        <Card className="border-0 shadow-2xl rounded-3xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-semibold">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-2xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-base font-semibold">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-2xl"
              />
            </div>

            <Button type="submit" className="w-full h-12 text-base rounded-2xl shadow-lg mt-6">
              Entrar
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">Ainda não tem conta?</p>
            <Link 
              to="/signup" 
              className="text-base font-semibold text-primary hover:underline"
            >
              Criar conta grátis
            </Link>
          </div>

          {/* Install App Button */}
          <div className="mt-6 pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => navigate("/install")}
              className="w-full h-11 rounded-2xl"
            >
              <Download className="w-4 h-4 mr-2" />
              Instalar App no Celular
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
