import confetti from "canvas-confetti";

/**
 * Serviço de animações de confete
 * Centraliza todas as animações de celebração
 */
export class ConfettiService {
  /**
   * Animação padrão de confete
   */
  static celebrate() {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }

  /**
   * Animação de confete contínua (para completar cartão)
   */
  static celebrateComplete() {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  }

  /**
   * Animação suave de confete (para adicionar pontos)
   */
  static celebratePoints() {
    confetti({
      particleCount: 50,
      spread: 50,
      origin: { y: 0.7 },
      colors: ['#2563EB', '#60A5FA', '#93C5FD'],
    });
  }
}
