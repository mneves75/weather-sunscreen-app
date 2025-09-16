export type ForecastDetail = {
  day: string;
  temp: number;
  humidity: number;
  summary: string;
  icon: string;
  hourly: Array<{ hour: string; temp: number; uv: number }>;
};

export const weeklyForecast: ForecastDetail[] = [
  {
    day: 'Hoje',
    temp: 26,
    humidity: 60,
    summary: 'Calor com poucas nuvens, ideal para atividades ao ar livre.',
    icon: '☀️',
    hourly: [
      { hour: '08:00', temp: 22, uv: 2 },
      { hour: '12:00', temp: 26, uv: 7 },
      { hour: '16:00', temp: 25, uv: 5 },
    ],
  },
  {
    day: 'Amanhã',
    temp: 24,
    humidity: 68,
    summary: 'Temperatura levemente mais baixa com brisa suave.',
    icon: '🌤️',
    hourly: [
      { hour: '08:00', temp: 20, uv: 1 },
      { hour: '12:00', temp: 24, uv: 6 },
      { hour: '16:00', temp: 23, uv: 4 },
    ],
  },
  {
    day: 'Dia 3',
    temp: 22,
    humidity: 72,
    summary: 'Entrada de frente fria leve trazendo céu parcialmente nublado.',
    icon: '⛅',
    hourly: [
      { hour: '08:00', temp: 19, uv: 1 },
      { hour: '12:00', temp: 22, uv: 4 },
      { hour: '16:00', temp: 21, uv: 3 },
    ],
  },
  {
    day: 'Dia 4',
    temp: 20,
    humidity: 78,
    summary: 'Chance de garoa no fim da tarde, leve queda de temperatura.',
    icon: '🌦️',
    hourly: [
      { hour: '08:00', temp: 18, uv: 1 },
      { hour: '12:00', temp: 20, uv: 3 },
      { hour: '16:00', temp: 19, uv: 2 },
    ],
  },
  {
    day: 'Dia 5',
    temp: 23,
    humidity: 65,
    summary: 'Retorno do sol com umidade confortável.',
    icon: '🌤️',
    hourly: [
      { hour: '08:00', temp: 20, uv: 2 },
      { hour: '12:00', temp: 23, uv: 6 },
      { hour: '16:00', temp: 22, uv: 4 },
    ],
  },
  {
    day: 'Dia 6',
    temp: 25,
    humidity: 58,
    summary: 'Tarde quente com possibilidade de vento moderado.',
    icon: '☀️',
    hourly: [
      { hour: '08:00', temp: 21, uv: 2 },
      { hour: '12:00', temp: 25, uv: 7 },
      { hour: '16:00', temp: 24, uv: 5 },
    ],
  },
  {
    day: 'Dia 7',
    temp: 27,
    humidity: 55,
    summary: 'Domingo de calor intenso, hidratação recomendada.',
    icon: '🌞',
    hourly: [
      { hour: '08:00', temp: 23, uv: 3 },
      { hour: '12:00', temp: 27, uv: 8 },
      { hour: '16:00', temp: 26, uv: 6 },
    ],
  },
];
