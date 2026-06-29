export type CareerLegacyInput = {
  mvp: number;
  finalsMvp: number;
  championships: number;
  allNbaFirst: number;
  allNbaSecond: number;
  allNbaThird: number;
  allStar: number;
  allDefenseFirst: number;
  allDefenseSecond: number;
  dpoy: number;
  seasons: number;
  games: number;
  careerPoints: number;
  careerRebounds: number;
  careerAssists: number;
  playoffGames: number;
  playoffPoints: number;
};

function clamp(value: number, max: number) {
  return Math.min(value, max);
}

function diminishing(count: number, firstValue: number, laterValue: number) {
  if (count <= 0) return 0;
  return firstValue + (count - 1) * laterValue;
}

export function calculateCareerLegacy(input: CareerLegacyInput) {
  const majorAwards =
    clamp(diminishing(input.mvp, 8, 4), 24) +
    clamp(diminishing(input.finalsMvp, 6, 3), 18) +
    clamp(input.dpoy * 4, 10);

  const leagueHonors =
    clamp(input.allNbaFirst * 2.2, 18) +
    clamp(input.allNbaSecond * 1.4, 10) +
    clamp(input.allNbaThird * 0.9, 7) +
    clamp(input.allStar * 0.55, 9) +
    clamp(input.allDefenseFirst * 1.3, 8) +
    clamp(input.allDefenseSecond * 0.8, 5);

  const championships = clamp(input.championships * 2.2, 11);

  const longevity =
    clamp(input.seasons * 0.45, 7) + clamp(input.games / 180, 6);

  const totals =
    clamp(input.careerPoints / 4500, 6) +
    clamp(input.careerRebounds / 3000, 3.5) +
    clamp(input.careerAssists / 2200, 3.5);

  const playoffs =
    clamp(input.playoffGames / 45, 4) + clamp(input.playoffPoints / 1500, 4);

  return Math.min(
    majorAwards + leagueHonors + championships + longevity + totals + playoffs,
    100,
  );
}
