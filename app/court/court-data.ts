type PlayerStats = {
  ppg: number; // Points Per Game
  rpg: number; // Rebounds Per Game
  apg: number; // Assists Per Game
  fgPercent: number; // Field Goal Percentage
  threePercent: number; // Three Point Percentage
  ftPercent: number; // Free Throw Percentage
};

type Player = {
  value: string;
  label: string;
  image: string;
  stats: PlayerStats;
};

export const players: Player[] = [
  {
    value: "lebron-james",
    label: "LeBron James",
    image: "/temp-players/lebron-james.png",
    stats: {
      ppg: 27.0,
      rpg: 7.4,
      apg: 8.3,
      fgPercent: 50.4,
      threePercent: 34.5,
      ftPercent: 73.4,
    },
  },
  {
    value: "michael-jordan",
    label: "Michael Jordan",
    image: "/temp-players/michael-jordan.jpg",
    stats: {
      ppg: 30.1,
      rpg: 6.2,
      apg: 3.4,
      fgPercent: 49.7,
      threePercent: 37.9,
      ftPercent: 83.5,
    },
  },
  {
    value: "kobe-bryant",
    label: "Kobe Bryant",
    image: "/temp-players/kobe-bryant.jpg",
    stats: {
      ppg: 25.0,
      rpg: 5.2,
      apg: 4.7,
      fgPercent: 44.7,
      threePercent: 32.9,
      ftPercent: 83.7,
    },
  },
  {
    value: "stephen-curry",
    label: "Stephen Curry",
    image: "/temp-players/stephen-curry.png",
    stats: {
      ppg: 24.2,
      rpg: 4.6,
      apg: 6.5,
      fgPercent: 47.7,
      threePercent: 43.3,
      ftPercent: 90.6,
    },
  },
];

export const statMaxValues = {
  ppg: 35,
  rpg: 15,
  apg: 12,
  fgPercent: 65,
  threePercent: 45,
  ftPercent: 95,
};

export function normalizeStat(value: number, max: number) {
  return Math.min((value / max) * 100, 100);
}

export type RadarStatRow = {
  stat: string;
  playerOne: number;
  playerTwo: number;
  playerOneActual: number;
  playerTwoActual: number;
};
