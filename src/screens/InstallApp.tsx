import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Download, Smartphone, Check, Share, MoreVertical } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallApp = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">Instalar App</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Hero Section */}
        <div className="text-center py-8">
          <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-lg">
            <Smartphone className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Instale o Fidelize
          </h2>
          <p className="text-muted-foreground">
            Tenha acesso rápido aos seus cartões fidelidade
          </p>
        </div>

        {/* Status Card */}
        {isInstalled ? (
          <Card className="p-6 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                <Check className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">App Instalado!</h3>
                <p className="text-sm text-muted-foreground">
                  O Fidelize já está na sua tela inicial
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <>
            {/* Install Button for Android/Chrome */}
            {deferredPrompt && (
              <Button
                onClick={handleInstall}
                className="w-full h-14 text-lg rounded-2xl"
                size="lg"
              >
                <Download className="w-5 h-5 mr-2" />
                Instalar Agora
              </Button>
            )}

            {/* iOS Instructions */}
            {isIOS && (
              <Card className="p-6 space-y-4">
                <h3 className="font-bold text-foreground flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-primary" />
                  Como instalar no iPhone/iPad
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">1</span>
                    </div>
                    <div>
                      <p className="font-medium">Toque no botão Compartilhar</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Share className="w-4 h-4" /> na barra do Safari
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">2</span>
                    </div>
                    <div>
                      <p className="font-medium">Role e toque em</p>
                      <p className="text-sm text-muted-foreground">
                        "Adicionar à Tela de Início"
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">3</span>
                    </div>
                    <div>
                      <p className="font-medium">Toque em "Adicionar"</p>
                      <p className="text-sm text-muted-foreground">
                        O app aparecerá na sua tela inicial
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Android Instructions (fallback) */}
            {!isIOS && !deferredPrompt && (
              <Card className="p-6 space-y-4">
                <h3 className="font-bold text-foreground flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-primary" />
                  Como instalar no Android
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">1</span>
                    </div>
                    <div>
                      <p className="font-medium">Toque no menu do navegador</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MoreVertical className="w-4 h-4" /> (três pontinhos)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">2</span>
                    </div>
                    <div>
                      <p className="font-medium">Selecione</p>
                      <p className="text-sm text-muted-foreground">
                        "Instalar app" ou "Adicionar à tela inicial"
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">3</span>
                    </div>
                    <div>
                      <p className="font-medium">Confirme a instalação</p>
                      <p className="text-sm text-muted-foreground">
                        O app aparecerá na sua tela inicial
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </>
        )}

        {/* Benefits */}
        <Card className="p-6 space-y-4">
          <h3 className="font-bold text-foreground">Vantagens do App</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-green-500" />
              <span className="text-sm">Acesso rápido pela tela inicial</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-green-500" />
              <span className="text-sm">Funciona offline</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-green-500" />
              <span className="text-sm">Carregamento mais rápido</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-green-500" />
              <span className="text-sm">Experiência de app nativo</span>
            </div>
          </div>
        </Card>

        {/* Back to Home */}
        <Button
          variant="outline"
          onClick={() => navigate("/")}
          className="w-full rounded-2xl"
        >
          Voltar para o App
        </Button>
      </main>
    </div>
  );
};

export default InstallApp;
