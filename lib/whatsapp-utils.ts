import { toast } from "sonner";

/**
 * Abre o WhatsApp Web/App com um número de telefone e mensagem pré-definida
 * @param phone - Número de telefone (com ou sem formatação)
 * @param message - Mensagem padrão (opcional, padrão: "Hola")
 */
export const openWhatsApp = (phone: string, message: string = "Hola"): void => {
  try {
    // Remove formatação e espaços
    const cleanPhone = phone.replace(/\D/g, "");
    if (!cleanPhone) {
      toast.error("Número de telefone inválido");
      return;
    }
    // Adiciona código do Paraguai se não tiver
    const phoneWithCode = cleanPhone.startsWith("595") ? cleanPhone : `595${cleanPhone}`;
    // Codifica a mensagem para URL
    const encodedMessage = encodeURIComponent(message);
    // Abre WhatsApp em nova aba
    const whatsappUrl = `https://wa.me/${phoneWithCode}?text=${encodedMessage}`;
    const newWindow = window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    if (!newWindow) {
      toast.error("Por favor, permita pop-ups para abrir o WhatsApp");
    }
  } catch (error) {
    console.error("Error opening WhatsApp:", error);
    toast.error("Error al abrir WhatsApp");
  }
};

