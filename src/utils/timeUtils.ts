// Tipos para configuração de horários
export interface MealSchedule {
  [key: string]: {
    start: number; // hora de início (0-23)
    end: number;   // hora de fim (0-23)
  };
}

export interface TimeConfig {
  mealSchedule: MealSchedule;
  timezone?: string;
}

// Configuração padrão de horários (customizável)
export const DEFAULT_MEAL_SCHEDULE: MealSchedule = {
  'Café da manhã': { start: 6, end: 10 },
  'Lanche da manhã': { start: 10, end: 12 },
  'Almoço': { start: 12, end: 14 },
  'Lanche da tarde': { start: 14, end: 17 },
  'Jantar': { start: 17, end: 20 },
  'Ceia': { start: 20, end: 23 }
};

// Configuração padrão
export const DEFAULT_TIME_CONFIG: TimeConfig = {
  mealSchedule: DEFAULT_MEAL_SCHEDULE,
  timezone: 'America/Sao_Paulo'
};

/**
 * Obtém a hora atual
 */
export const getCurrentHour = (): number => {
  return new Date().getHours();
};

/**
 * Obtém o dia da semana atual em português
 */
export const getCurrentDayOfWeek = (): string => {
  const days = [
    'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
    'Quinta-feira', 'Sexta-feira', 'Sábado'
  ];
  return days[new Date().getDay()];
};

/**
 * Determina qual refeição está ativa no momento
 */
export const getCurrentMeal = (config: TimeConfig = DEFAULT_TIME_CONFIG): string | null => {
  const currentHour = getCurrentHour();
  
  for (const [mealName, schedule] of Object.entries(config.mealSchedule)) {
    if (currentHour >= schedule.start && currentHour < schedule.end) {
      return mealName;
    }
  }
  
  return null;
};

/**
 * Determina qual será a próxima refeição
 */
export const getNextMeal = (config: TimeConfig = DEFAULT_TIME_CONFIG): string | null => {
  const currentHour = getCurrentHour();
  const meals = Object.entries(config.mealSchedule);
  
  // Ordena as refeições por horário de início
  const sortedMeals = meals.sort((a, b) => a[1].start - b[1].start);
  
  // Encontra a próxima refeição
  for (const [mealName, schedule] of sortedMeals) {
    if (currentHour < schedule.start) {
      return mealName;
    }
  }
  
  // Se não há próxima refeição hoje, retorna a primeira de amanhã
  return sortedMeals[0]?.[0] || null;
};

/**
 * Calcula quanto tempo falta para a próxima refeição
 */
export const getTimeUntilNextMeal = (config: TimeConfig = DEFAULT_TIME_CONFIG): {
  hours: number;
  minutes: number;
  totalMinutes: number;
} => {
  const currentHour = getCurrentHour();
  const currentMinute = new Date().getMinutes();
  const nextMeal = getNextMeal(config);
  
  if (!nextMeal) {
    return { hours: 0, minutes: 0, totalMinutes: 0 };
  }
  
  const nextMealStart = config.mealSchedule[nextMeal].start;
  let hoursUntil = nextMealStart - currentHour;
  let minutesUntil = -currentMinute;
  
  // Ajusta para o próximo dia se necessário
  if (hoursUntil <= 0) {
    hoursUntil += 24;
  }
  
  if (minutesUntil < 0) {
    hoursUntil -= 1;
    minutesUntil += 60;
  }
  
  return {
    hours: hoursUntil,
    minutes: minutesUntil,
    totalMinutes: hoursUntil * 60 + minutesUntil
  };
};

/**
 * Formata o tempo restante de forma legível
 */
export const formatTimeRemaining = (hours: number, minutes: number): string => {
  if (hours === 0) {
    return `${minutes}min`;
  }
  
  if (minutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${minutes}min`;
};

/**
 * Verifica se é um horário de refeição
 */
export const isMealTime = (config: TimeConfig = DEFAULT_TIME_CONFIG): boolean => {
  return getCurrentMeal(config) !== null;
};

/**
 * Obtém todas as refeições do dia em ordem cronológica
 */
export const getMealsInOrder = (config: TimeConfig = DEFAULT_TIME_CONFIG): string[] => {
  const meals = Object.entries(config.mealSchedule);
  return meals
    .sort((a, b) => a[1].start - b[1].start)
    .map(([mealName]) => mealName);
};

/**
 * Obtém informações completas sobre o estado atual do tempo
 */
export const getTimeInfo = (config: TimeConfig = DEFAULT_TIME_CONFIG) => {
  const currentMeal = getCurrentMeal(config);
  const nextMeal = getNextMeal(config);
  const timeUntilNext = getTimeUntilNextMeal(config);
  
  return {
    currentHour: getCurrentHour(),
    currentDay: getCurrentDayOfWeek(),
    currentMeal,
    nextMeal,
    timeUntilNext,
    isMealTime: currentMeal !== null,
    formattedTimeRemaining: formatTimeRemaining(timeUntilNext.hours, timeUntilNext.minutes)
  };
}; 