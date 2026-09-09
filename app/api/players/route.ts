import { NextResponse } from "next/server";
import {
  getPlayerInsights,
  type Player,
  type PlayerStatProfile,
} from "@/app/components/court-data";
import { getAppPlayerPage } from "@/app/components/player-data-source";
import {
  checkRateLimit,
  createIpRateLimitRules,
  createRateLimitResponse,
} from "@/app/lib/rate-limit";
import { cleanText } from "@/app/lib/input-validation";

export const revalidate = 3600;

const DEFAULT_PLAYER_PAGE_SIZE = 500;
const MAX_PLAYER_PAGE_SIZE = 750;

function getPositiveIntegerParam(
  value: string | null,
  fallback: number,
  max: number,
) {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    return fallback;
  }

  return Math.min(parsedValue, max);
}

function serializeStatProfile(profile: PlayerStatProfile | undefined) {
  if (!profile) return undefined;

  return {
    profileType: profile.profileType,
    seasonLabel: profile.seasonLabel ?? null,
    games: profile.games ?? null,
    minutesPerGame: profile.minutesPerGame ?? null,
    ppg: profile.ppg ?? null,
    rpg: profile.rpg ?? null,
    apg: profile.apg ?? null,
    spg: profile.spg ?? null,
    bpg: profile.bpg ?? null,
    fgPercent: profile.fgPercent ?? null,
    threePercent: profile.threePercent ?? null,
    ftPercent: profile.ftPercent ?? null,
    threeMadePerGame: profile.threeMadePerGame ?? null,
    threeAttemptsPerGame: profile.threeAttemptsPerGame ?? null,
    freeThrowAttemptsPerGame: profile.freeThrowAttemptsPerGame ?? null,
  };
}

function serializePlayer(player: Player): Player {
  return {
    id: player.id,
    nbaId: player.nbaId,
    name: player.name,
    heightInches: player.heightInches,
    weightPounds: player.weightPounds,
    apiPosition: player.apiPosition,
    team: player.team,
    position: player.position,
    jerseyNumber: player.jerseyNumber,
    fallbackImage: player.fallbackImage,
    stats: {
      games: player.stats.games,
      ppg: player.stats.ppg,
      rpg: player.stats.rpg,
      apg: player.stats.apg,
      spg: player.stats.spg,
      bpg: player.stats.bpg,
      fgPercent: player.stats.fgPercent,
      threePercent: player.stats.threePercent,
      ftPercent: player.stats.ftPercent,
      threeMadePerGame: player.stats.threeMadePerGame,
      threeAttemptsPerGame: player.stats.threeAttemptsPerGame,
      freeThrowAttemptsPerGame: player.stats.freeThrowAttemptsPerGame,
    },
    ratings: {
      defense: player.ratings.defense,
      starPower: player.ratings.starPower,
      careerLegacy: player.ratings.careerLegacy,
    },
    statProfiles: {
      career: serializeStatProfile(player.statProfiles?.career),
      peak: serializeStatProfile(player.statProfiles?.peak),
      current: serializeStatProfile(player.statProfiles?.current),
    },
  };
}

export async function GET(request: Request) {
  const rateLimit = await checkRateLimit(
    createIpRateLimitRules(request, "players-api", {
      perMinute: 120,
      perDay: 2_000,
    }),
  );

  if (!rateLimit.allowed) {
    return createRateLimitResponse(rateLimit);
  }

  const { searchParams } = new URL(request.url);
  const view = cleanText(searchParams.get("view"), 40);
  const page = getPositiveIntegerParam(searchParams.get("page"), 1, 10_000);
  const limit = getPositiveIntegerParam(
    searchParams.get("limit"),
    DEFAULT_PLAYER_PAGE_SIZE,
    MAX_PLAYER_PAGE_SIZE,
  );
  const playerPage = await getAppPlayerPage(page, limit);
  const responsePlayers =
    view === "profile-lookup"
      ? playerPage.players.map((player) => ({
          name: player.name,
          nbaId: player.nbaId ?? null,
          team: player.team,
          position: player.position,
          fallbackImage: player.fallbackImage ?? null,
          archetype: getPlayerInsights(player, "career").archetype,
        }))
      : playerPage.players.map(serializePlayer);

  return NextResponse.json(
    {
      count: responsePlayers.length,
      total: playerPage.total,
      page,
      limit,
      hasMore: playerPage.hasMore,
      players: responsePlayers,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}
