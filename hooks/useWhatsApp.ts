import { useCallback } from "react";
import { toast } from "sonner";

export const useWhatsApp = (defaultMessage: string = "Hola") => {
  const openWhatsApp = useCallback((phone: string, message?: string) => {
    try {
      const cleanPhone = phone.replace(/\D/g, "");
      if (!cleanPhone) {
        toast.error("Número de telefone inválido");
        return;
      }
      const phoneWithCode = cleanPhone.startsWith("595") ? cleanPhone : `595${cleanPhone}`;
      const finalMessage = message || defaultMessage;
      const encodedMessage = encodeURIComponent(finalMessage);
      const whatsappUrl = `https://wa.me/${phoneWithCode}?text=${encodedMessage}`;
      const newWindow = window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      if (!newWindow) {
        toast.error("Por favor, permita pop-ups para abrir o WhatsApp");
      }
    } catch (error) {
      console.error("Error opening WhatsApp:", error);
      toast.error("Error al abrir WhatsApp");
    }
  }, [defaultMessage]);

  return { openWhatsApp };
};

