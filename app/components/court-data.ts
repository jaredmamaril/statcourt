// This file contains the data and types related to players and their stats for the different pages.

// Global components

// Future: fetching this data from an API or database for scalability and easier updates, especially if the player list grows significantly or if stats need to be updated frequently.
type PlayerStats = {
  ppg: number; // Points Per Game
  rpg: number; // Rebounds Per Game
  apg: number; // Assists Per Game
  fgPercent: number; // Field Goal Percentage
  threePercent: number; // Three Point Percentage
  ftPercent: number; // Free Throw Percentage
};

// Future: adding more stats or player attributes as needed, such as player position, team, or career highlights, to enhance the user experience and provide more comprehensive information about each player.
type Player = {
  id: number;
  name: string;
  image: string;
  team: string;
  position: string;
  jerseyNumber: number;
  stats: PlayerStats;
};

// Future: database for player data could be implemented with APIs
export const players: Player[] = [
  {
    id: 1,
    name: "LeBron James",
    image: "/temp-players/lebron-james.png",
    team: "LAL",
    position: "SF",
    jerseyNumber: 23,
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
    id: 2,
    name: "Michael Jordan",
    image: "/temp-players/michael-jordan.jpg",
    team: "CHI",
    position: "SG",
    jerseyNumber: 23,
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
    id: 3,
    name: "Kobe Bryant",
    image: "/temp-players/kobe-bryant.jpg",
    team: "LAL",
    position: "SG",
    jerseyNumber: 24,
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
    id: 4,
    name: "Stephen Curry",
    image: "/temp-players/stephen-curry.png",
    team: "GSW",
    position: "PG",
    jerseyNumber: 30,
    stats: {
      ppg: 24.2,
      rpg: 4.6,
      apg: 6.5,
      fgPercent: 47.7,
      threePercent: 43.3,
      ftPercent: 90.6,
    },
  },
  {
    id: 5,
    name: "Kevin Durant",
    image: "/temp-players/kevin-durant.png",
    team: "PHX",
    position: "SF",
    jerseyNumber: 35,
    stats: {
      ppg: 27.3,
      rpg: 7.0,
      apg: 4.4,
      fgPercent: 50.1,
      threePercent: 38.7,
      ftPercent: 88.4,
    },
  },
  {
    id: 6,
    name: "Shaquille O'Neal",
    image: "/temp-players/shaquille-oneal.png",
    team: "LAL",
    position: "C",
    jerseyNumber: 34,
    stats: {
      ppg: 23.7,
      rpg: 10.9,
      apg: 2.5,
      fgPercent: 58.2,
      threePercent: 4.5,
      ftPercent: 52.7,
    },
  },
  {
    id: 7,
    name: "Magic Johnson",
    image: "/temp-players/magic-johnson.png",
    team: "LAL",
    position: "PG",
    jerseyNumber: 32,
    stats: {
      ppg: 19.5,
      rpg: 7.2,
      apg: 11.2,
      fgPercent: 52.0,
      threePercent: 30.3,
      ftPercent: 84.8,
    },
  },
  {
    id: 8,
    name: "Larry Bird",
    image: "/temp-players/larry-bird.png",
    team: "BOS",
    position: "SF",
    jerseyNumber: 33,
    stats: {
      ppg: 24.3,
      rpg: 10.0,
      apg: 6.3,
      fgPercent: 49.6,
      threePercent: 37.6,
      ftPercent: 88.6,
    },
  },
  {
    id: 9,
    name: "Tim Duncan",
    image: "/temp-players/tim-duncan.png",
    team: "SAS",
    position: "PF",
    jerseyNumber: 21,
    stats: {
      ppg: 19.0,
      rpg: 10.8,
      apg: 3.0,
      fgPercent: 50.6,
      threePercent: 17.9,
      ftPercent: 69.6,
    },
  },
  {
    id: 10,
    name: "Hakeem Olajuwon",
    image: "/temp-players/hakeem-olajuwon.png",
    team: "HOU",
    position: "C",
    jerseyNumber: 34,
    stats: {
      ppg: 21.8,
      rpg: 11.1,
      apg: 2.5,
      fgPercent: 51.2,
      threePercent: 20.2,
      ftPercent: 71.2,
    },
  },
  {
    id: 11,
    name: "Wilt Chamberlain",
    image: "/temp-players/wilt-chamberlain.png",
    team: "LAL",
    position: "C",
    jerseyNumber: 13,
    stats: {
      ppg: 30.1,
      rpg: 22.9,
      apg: 4.4,
      fgPercent: 54.0,
      threePercent: 0.0,
      ftPercent: 51.1,
    },
  },
  {
    id: 12,
    name: "Giannis Antetokounmpo",
    image: "/temp-players/giannis-antetokounmpo.png",
    team: "MIL",
    position: "PF",
    jerseyNumber: 34,
    stats: {
      ppg: 23.4,
      rpg: 9.8,
      apg: 4.9,
      fgPercent: 54.5,
      threePercent: 28.7,
      ftPercent: 70.0,
    },
  },
  {
    id: 13,
    name: "Nikola Jokic",
    image: "/temp-players/nikola-jokic.png",
    team: "DEN",
    position: "C",
    jerseyNumber: 15,
    stats: {
      ppg: 21.1,
      rpg: 10.8,
      apg: 6.9,
      fgPercent: 55.7,
      threePercent: 35.0,
      ftPercent: 83.0,
    },
  },
];

// Components for court page

// Future: these max values could be dynamically calculated based on the player data or fetched from an API to ensure they remain accurate and relevant as new players are added or stats are updated.
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

// Future: this type can be expanded to include more stats or player attributes as needed, and can be used to structure the data for the radar chart or other visualizations on the court page.
export type RadarStatRow = {
  stat: string;
  playerOne: number;
  playerTwo: number;
  playerOneActual: number;
  playerTwoActual: number;
};

// Components for players page

// All unique teams in data

export const teams = Array.from(
  new Set(players.map((player) => player.team)),
).sort();
// All unique positions in data
const positionOrder = ["PG", "SG", "SF", "PF", "C"];
export const positions = positionOrder.filter((position) =>
  players.some((player) => player.position === position),
);

// Options to sort data from
type SortOption = {
  label: string;
  value: string;
};
export const sortOptions: SortOption[] = [
  { label: "None", value: "" },
  { label: "First Name", value: "first-name" },
  { label: "Last Name", value: "last-name" },
  { label: "Points", value: "ppg" },
  { label: "Rebounds", value: "rpg" },
  { label: "Assists", value: "apg" },
  { label: "Field Goal %", value: "fgPercent" },
  { label: "3 Point %", value: "threePercent" },
  { label: "Free Throw %", value: "ftPercent" },
];
