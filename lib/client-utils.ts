// Função para formatar C.I.N (agrupa de 3 em 3 com pontos)
export const formatCIN = (value: string) => {
  if (!value) return "";
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 3) return numbers;
  const formatted = numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return formatted;
};

// Função para formatar telefone paraguaio (0986 381-491)
export const formatPhone = (value: string) => {
  if (!value) return "";
  const numbers = value.replace(/\D/g, "");
  const limited = numbers.slice(0, 10);
  
  if (limited.length <= 4) return limited;
  if (limited.length <= 7) {
    return `${limited.slice(0, 4)} ${limited.slice(4)}`;
  }
  return `${limited.slice(0, 4)} ${limited.slice(4, 7)}-${limited.slice(7)}`;
};

// Função para remover formatação do C.I.N (salva apenas números no banco)
export const unformatCIN = (value: string) => {
  return value.replace(/\D/g, "");
};

// Função para remover formatação do telefone
export const unformatPhone = (value: string) => {
  return value.replace(/\D/g, "");
};

