import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Store, Wallet } from "lucide-react";

const SignUp = () => {
  const navigate = useNavigate();
  const { signUp, currentUser } = useAuth();
  const { toast } = useToast();
  const [accountType, setAccountType] = useState<'customer' | 'business'>('customer');
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [storeName, setStoreName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.accountType === 'business') {
        navigate("/business-dashboard");
      } else {
        navigate("/");
      }
    }
  }, [currentUser, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    if (accountType === 'business' && !storeName.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, informe o nome da loja",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Senha fraca",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    const businessDetails = accountType === 'business' 
      ? { storeName: storeName.trim(), cnpj: cnpj.trim() || undefined }
      : undefined;

    const result = signUp(name.trim(), email.trim(), password, accountType, businessDetails);

    if (result.success) {
      toast({
        title: "Conta criada!",
        description: accountType === 'business' ? "Bem-vindo ao painel da loja" : "Bem-vindo ao Fidelize",
      });
      
      setTimeout(() => {
        navigate(accountType === 'business' ? "/business-dashboard" : "/");
      }, 300);
    } else {
      toast({
        title: "Erro no cadastro",
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
          <h1 className="text-4xl font-bold text-foreground mb-2">Criar Conta</h1>
          <p className="text-lg text-muted-foreground">Junte-se ao Fidelize</p>
        </div>

        <Card className="border-0 shadow-2xl rounded-3xl p-8">
          <Tabs value={accountType} onValueChange={(v) => setAccountType(v as 'customer' | 'business')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 h-12">
              <TabsTrigger value="customer" className="space-x-2">
                <UserPlus className="w-4 h-4" />
                <span>Cliente</span>
              </TabsTrigger>
              <TabsTrigger value="business" className="space-x-2">
                <Store className="w-4 h-4" />
                <span>Loja</span>
              </TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit} className="space-y-5">
              <TabsContent value="customer" className="space-y-5 mt-0">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base font-semibold">Nome completo</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    className="h-12 rounded-2xl"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base font-semibold">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="h-12 rounded-2xl"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-base font-semibold">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="h-12 rounded-2xl"
                    required
                  />
                </div>
              </TabsContent>

              <TabsContent value="business" className="space-y-5 mt-0">
                <div className="space-y-2">
                  <Label htmlFor="business-name" className="text-base font-semibold">Nome do responsável</Label>
                  <Input
                    id="business-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    className="h-12 rounded-2xl"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="store-name" className="text-base font-semibold">Nome da Loja</Label>
                  <Input
                    id="store-name"
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="Nome do estabelecimento"
                    className="h-12 rounded-2xl"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cnpj" className="text-base font-semibold">CNPJ (opcional)</Label>
                  <Input
                    id="cnpj"
                    type="text"
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                    placeholder="00.000.000/0000-00"
                    className="h-12 rounded-2xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business-email" className="text-base font-semibold">Email</Label>
                  <Input
                    id="business-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contato@loja.com"
                    className="h-12 rounded-2xl"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business-password" className="text-base font-semibold">Senha</Label>
                  <Input
                    id="business-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="h-12 rounded-2xl"
                    required
                  />
                </div>
              </TabsContent>

              <Button type="submit" className="w-full h-12 text-base rounded-2xl shadow-lg mt-6">
                Criar Conta
              </Button>
            </form>
          </Tabs>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">Já tem uma conta?</p>
            <Link 
              to="/login" 
              className="text-base font-semibold text-primary hover:underline"
            >
              Entrar agora
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SignUp;
