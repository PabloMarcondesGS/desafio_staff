import {
  isValidDateBR,
  isValidTime,
  maskDateBR,
  maskTime,
  formatCategoryName,
} from '@/lib/validators';

describe('🛠️ Módulo de Validações e Formatadores (src/lib/validators.ts)', () => {
  describe('isValidDateBR', () => {
    it('deve aceitar datas válidas no formato DD/MM/AAAA', () => {
      expect(isValidDateBR('11/08/2026')).toBe(true);
      expect(isValidDateBR('01/01/2024')).toBe(true);
      expect(isValidDateBR('31/12/2025')).toBe(true);
    });

    it('deve aceitar corretamente o dia 29 de fevereiro em anos bissextos', () => {
      expect(isValidDateBR('29/02/2024')).toBe(true); // 2024 é bissexto
      expect(isValidDateBR('29/02/2020')).toBe(true); // 2020 é bissexto
    });

    it('deve rejeitar o dia 29 de fevereiro em anos não bissextos', () => {
      expect(isValidDateBR('29/02/2023')).toBe(false); // 2023 NÃO é bissexto
      expect(isValidDateBR('29/02/2025')).toBe(false); // 2025 NÃO é bissexto
    });

    it('deve rejeitar dias inexistentes nos meses (ex: 31 de abril, 30 de fevereiro)', () => {
      expect(isValidDateBR('31/04/2026')).toBe(false); // Abril tem 30 dias
      expect(isValidDateBR('30/02/2024')).toBe(false); // Fevereiro nunca tem 30 dias
      expect(isValidDateBR('32/01/2026')).toBe(false); // Dia 32 não existe
    });

    it('deve rejeitar meses inválidos (< 1 ou > 12)', () => {
      expect(isValidDateBR('15/00/2026')).toBe(false);
      expect(isValidDateBR('15/13/2026')).toBe(false);
    });

    it('deve rejeitar formatos incorretos ou textos inválidos', () => {
      expect(isValidDateBR('2026-08-11')).toBe(false);
      expect(isValidDateBR('11/8/2026')).toBe(false);
      expect(isValidDateBR('data_invalida')).toBe(false);
      expect(isValidDateBR('')).toBe(false);
    });
  });

  describe('isValidTime', () => {
    it('deve aceitar horários válidos no formato HH:MM (00:00 a 23:59)', () => {
      expect(isValidTime('00:00')).toBe(true);
      expect(isValidTime('08:30')).toBe(true);
      expect(isValidTime('14:45')).toBe(true);
      expect(isValidTime('23:59')).toBe(true);
    });

    it('deve rejeitar horas inválidas (>= 24)', () => {
      expect(isValidTime('24:00')).toBe(false);
      expect(isValidTime('25:30')).toBe(false);
    });

    it('deve rejeitar minutos inválidos (>= 60)', () => {
      expect(isValidTime('12:60')).toBe(false);
      expect(isValidTime('10:99')).toBe(false);
    });

    it('deve rejeitar formatos incompletos ou texto', () => {
      expect(isValidTime('8:30')).toBe(false);
      expect(isValidTime('14:3')).toBe(false);
      expect(isValidTime('hora')).toBe(false);
      expect(isValidTime('')).toBe(false);
    });
  });

  describe('Máscaras Dinâmicas (maskDateBR e maskTime)', () => {
    it('deve formatar data progressivamente durante a digitação', () => {
      expect(maskDateBR('11')).toBe('11');
      expect(maskDateBR('1108')).toBe('11/08');
      expect(maskDateBR('11082026')).toBe('11/08/2026');
      expect(maskDateBR('11082026999')).toBe('11/08/2026'); // Limite de 8 dígitos
    });

    it('deve formatar horário progressivamente durante a digitação', () => {
      expect(maskTime('14')).toBe('14');
      expect(maskTime('1430')).toBe('14:30');
      expect(maskTime('143099')).toBe('14:30'); // Limite de 4 dígitos
    });
  });

  describe('formatCategoryName', () => {
    it('deve remover underscores e formatar categorias corretamente', () => {
      expect(formatCategoryName('TAMPAS_FLUIDOS_OUTROS')).toBe('TAMPAS FLUIDOS - OUTROS');
      expect(formatCategoryName('FRENTE_LATERAIS')).toBe('FRENTE / LATERAIS');
      expect(formatCategoryName('ESTATICO')).toBe('INSPEÇÃO ESTÁTICA');
      expect(formatCategoryName('RODAGEM')).toBe('TESTE DE RODAGEM');
      expect(formatCategoryName('INTERNO')).toBe('INTERNO');
      expect(formatCategoryName('TRASEIRA')).toBe('TRASEIRA');
    });

    it('deve formatar categorias desconhecidas substituindo _ por espaço', () => {
      expect(formatCategoryName('OUTRA_CATEGORIA_TESTE')).toBe('OUTRA CATEGORIA TESTE');
    });

    it('deve retornar string vazia para entrada nula ou indefinida', () => {
      expect(formatCategoryName('')).toBe('');
    });
  });
});
