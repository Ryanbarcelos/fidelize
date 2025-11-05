/**
 * Serviço de validação de PIN
 * Centraliza toda lógica relacionada a PIN de lojas
 */
export class PinService {
  /**
   * Valida se um PIN tem formato correto (4 dígitos)
   */
  static isValidFormat(pin: string): boolean {
    return pin.length === 4 && /^\d{4}$/.test(pin);
  }

  /**
   * Verifica se o PIN fornecido corresponde ao PIN da loja
   */
  static validatePin(inputPin: string, storePin: string): boolean {
    return inputPin === storePin;
  }

  /**
   * Formata entrada para aceitar apenas números
   */
  static formatInput(value: string): string {
    return value.replace(/\D/g, "");
  }

  /**
   * Valida PIN para adicionar pontos
   */
  static validateForAddPoints(inputPin: string, storePin: string): {
    valid: boolean;
    error?: string;
  } {
    if (!inputPin) {
      return { valid: false, error: "Digite o PIN da loja" };
    }

    if (!this.isValidFormat(inputPin)) {
      return { valid: false, error: "PIN deve ter 4 dígitos" };
    }

    if (!this.validatePin(inputPin, storePin)) {
      return { valid: false, error: "PIN incorreto" };
    }

    return { valid: true };
  }
}
