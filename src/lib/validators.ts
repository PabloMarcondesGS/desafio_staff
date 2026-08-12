/**
 * 🛠️ UTILITÁRIOS DE VALIDAÇÃO E FORMATAÇÃO (FIXCAR)
 * Funções puras para validação de datas brasileiras, horários e categorias.
 */

/**
 * Valida se a string representa uma data válida no formato brasileiro DD/MM/AAAA.
 * Verifica dia, mês, ano e anos bissextos.
 */
export function isValidDateBR(str: string): boolean {
  if (!str || typeof str !== 'string') return false;
  const match = str.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return false;

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  if (year < 1900 || year > 2100) return false;

  const d = new Date(year, month - 1, day);
  return (
    d.getFullYear() === year &&
    d.getMonth() === month - 1 &&
    d.getDate() === day
  );
}

/**
 * Valida se a string representa um horário válido no formato HH:MM (00:00 a 23:59).
 */
export function isValidTime(str: string): boolean {
  if (!str || typeof str !== 'string') return false;
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(str.trim());
}

/**
 * Aplica máscara de data brasileira DD/MM/AAAA dinamicamente conforme digitação.
 */
export function maskDateBR(val: string): string {
  let clean = val.replace(/\D/g, '').slice(0, 8);
  if (clean.length > 4) {
    return `${clean.slice(0, 2)}/${clean.slice(2, 4)}/${clean.slice(4)}`;
  } else if (clean.length > 2) {
    return `${clean.slice(0, 2)}/${clean.slice(2)}`;
  }
  return clean;
}

/**
 * Aplica máscara de horário HH:MM dinamicamente conforme digitação.
 */
export function maskTime(val: string): string {
  let clean = val.replace(/\D/g, '').slice(0, 4);
  if (clean.length > 2) {
    return `${clean.slice(0, 2)}:${clean.slice(2)}`;
  }
  return clean;
}

/**
 * Formata os identificadores de categoria para exibição amigável ao usuário sem underscores.
 */
export function formatCategoryName(cat: string): string {
  if (!cat) return '';
  switch (cat) {
    case 'INTERNO':
      return 'INTERNO';
    case 'FRENTE_LATERAIS':
      return 'FRENTE / LATERAIS';
    case 'TRASEIRA':
      return 'TRASEIRA';
    case 'TAMPAS_FLUIDOS_OUTROS':
      return 'TAMPAS FLUIDOS - OUTROS';
    case 'ESTATICO':
      return 'INSPEÇÃO ESTÁTICA';
    case 'RODAGEM':
      return 'TESTE DE RODAGEM';
    default:
      return cat.replace(/_/g, ' ');
  }
}
