import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getAppPlayerShareCardSources } from "../../components/player-data-source";
import {
  getPlayerShareCard,
  type PlayerShareCard,
  type PlayerShareCardMode,
} from "../../lib/player-share-card";
import { getMonogramColors } from "../../lib/share-card-colors";
import { statcourtThemes } from "../../lib/themes";

export const playerShareImageSize = { width: 1200, height: 630 };

const theme = statcourtThemes.courtDark;
const accentRgb = theme.accentRgb.split(" ").join(", ");
const mutedText = "rgba(248, 250, 252, 0.6)";

const positionLabels: Record<string, string> = {
  G: "Guard",
  F: "Forward",
  C: "Center",
};

async function loadMichroma() {
  try {
    return await readFile(
      join(process.cwd(), "assets/fonts/Michroma-Regular.ttf"),
    );
  } catch {
    return null;
  }
}

async function loadPlayerCard(slug: string, mode: PlayerShareCardMode) {
  try {
    return getPlayerShareCard(
      await getAppPlayerShareCardSources(mode),
      slug,
      mode,
    );
  } catch {
    return null;
  }
}

function getNameFontSize(name: string) {
  if (name.length > 20) return 42;
  if (name.length > 14) return 50;

  return 62;
}

function getTeamLabel(team: string) {
  return team === "FA" ? "Free Agent" : team;
}

function Monogram({
  initials,
  team,
}: {
  initials: string;
  team: string | null;
}) {
  // Team color with enough contrast on the dark card (see share-card-colors.ts).
  const colors = getMonogramColors(team, {
    background: theme.background,
    accent: theme.accent,
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 148,
        height: 148,
        flexShrink: 0,
        borderRadius: 74,
        background: colors.fill,
        border: "6px solid rgba(248, 250, 252, 0.85)",
        boxShadow: `0 0 0 6px ${colors.ring}`,
        color: colors.text,
        fontSize: initials.length > 1 ? 50 : 60,
      }}
    >
      {initials}
    </div>
  );
}

function OverallBadge({ overall }: { overall: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        flexShrink: 0,
        padding: "16px 22px",
        borderRadius: 14,
        border: `3px solid ${theme.accent}`,
        background: `rgba(${accentRgb}, 0.16)`,
      }}
    >
      <div style={{ display: "flex", fontSize: 58, color: theme.foreground }}>
        {overall}
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 4,
          fontSize: 22,
          letterSpacing: 4,
          color: theme.accent,
        }}
      >
        OVR
      </div>
    </div>
  );
}

function PlayerCard({ card }: { card: PlayerShareCard }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 32 }}>
        <Monogram initials={card.initials} team={card.team} />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            minWidth: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              padding: "9px 16px",
              borderRadius: 8,
              border: `2px solid rgba(${accentRgb}, 0.45)`,
              background: `rgba(${accentRgb}, 0.12)`,
              color: theme.accent,
              fontSize: 20,
              letterSpacing: 1.5,
              textTransform: "uppercase",
            }}
          >
            {card.profileLabel}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 18,
              fontSize: getNameFontSize(card.name),
              lineHeight: 1.1,
              textTransform: "uppercase",
              color: theme.foreground,
            }}
          >
            {card.name}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 14,
              fontSize: 24,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: mutedText,
            }}
          >
            {[
              card.team && getTeamLabel(card.team),
              positionLabels[card.position] ?? card.position,
            ]
              .filter(Boolean)
              .join(" · ")}
          </div>
          {(card.rankLabel ?? card.note) && (
            <div
              style={{
                display: "flex",
                marginTop: 10,
                fontSize: 22,
                letterSpacing: 1,
                textTransform: "uppercase",
                color: theme.accent,
              }}
            >
              {card.rankLabel ?? card.note}
            </div>
          )}
        </div>

        <OverallBadge overall={card.overall} />
      </div>

      <div style={{ display: "flex", gap: 20, marginTop: "auto" }}>
        {card.stats.map((stat) => (
          <div
            key={stat.label}
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              padding: "18px 24px",
              borderRadius: 12,
              border: `2px solid rgba(${accentRgb}, 0.3)`,
              background: `rgba(${accentRgb}, 0.08)`,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 20,
                letterSpacing: 2,
                color: mutedText,
              }}
            >
              {stat.label}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 6,
                fontSize: 50,
                color: theme.accent,
              }}
            >
              {stat.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FallbackCard() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 88,
          letterSpacing: 4,
          textTransform: "uppercase",
          color: theme.foreground,
        }}
      >
        StatCourt
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 24,
          fontSize: 26,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: mutedText,
        }}
      >
        NBA Player Analytics
      </div>
    </div>
  );
}

export async function renderPlayerShareImage(
  slug: string,
  mode: PlayerShareCardMode = "peak",
  headers?: HeadersInit,
) {
  const [card, michroma] = await Promise.all([
    loadPlayerCard(slug, mode),
    loadMichroma(),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          padding: "44px 60px 48px",
          background: `radial-gradient(circle at 85% 0%, rgba(${accentRgb}, 0.22), transparent 55%), ${theme.background}`,
          borderTop: `8px solid ${theme.accent}`,
          fontFamily: michroma ? "Michroma" : undefined,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            marginBottom: 30,
            fontSize: 20,
            letterSpacing: 3,
            textTransform: "uppercase",
          }}
        >
          <div style={{ display: "flex", color: "rgba(248, 250, 252, 0.5)" }}>
            statcourt.app
          </div>
        </div>

        {card ? <PlayerCard card={card} /> : <FallbackCard />}
      </div>
    ),
    {
      ...playerShareImageSize,
      headers,
      fonts: michroma
        ? [{ name: "Michroma", data: michroma, style: "normal", weight: 400 }]
        : undefined,
    },
  );
}
