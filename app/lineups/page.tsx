"use client";
import Image from "next/image";
import { players } from "../components/court-data";
import { useRef, useState } from "react";
import { Trophy, Flame, Brain, Shield, Target, Crown } from "lucide-react";

type LineupTab = "featured" | "builder";

const lineupTabs: { label: string; value: LineupTab }[] = [
  { label: "Featured Lineups", value: "featured" },
  { label: "Build Your Own", value: "builder" },
];

const lineupCards = [
  { title: "Greatest Teams", color: "#EFBF04", Icon: Trophy },
  { title: "Bucket Getters", color: "#EF4444", Icon: Flame },
  { title: "Floor Generals", color: "#3B82F6", Icon: Brain },
  { title: "Lockdown Squads", color: "#A855F7", Icon: Shield },
  { title: "Splash Squads", color: "#1bc2ec", Icon: Target },
  { title: "All-Time Teams", color: "#EFBF04", Icon: Crown },
];

const lineupGroups = {
  "Greatest Teams": ["1996 Bulls", "2017 Warriors", "1986 Celtics"],
  "Bucket Getters": [
    "Isolation Killers",
    "Three-Level Scorers",
    "Late-Game Closers",
  ],
  "Floor Generals": ["Pass First Legends", "Tempo Controllers", "Assist Kings"],
  "Lockdown Squads": [
    "All-Defense Unit",
    "Paint Protectors",
    "Perimeter Stoppers",
  ],
  "Splash Squads": [
    "Spacing Nightmare",
    "Deep Range Lineup",
    "Catch-and-Shoot Crew",
  ],
  "All-Time Teams": ["All-Time Lakers", "All-Time Bulls", "All-Time Warriors"],
};

const lineupDetails = {
  "1996 Bulls": {
    players: {
      PG: "Ron Harper",
      SG: "Michael Jordan",
      SF: "Scottie Pippen",
      PF: "Dennis Rodman",
      C: "Luc Longley",
    },
    overall: 98.2,
    archetype: "Championship Dynasty",
  },
  "2017 Warriors": {
    players: {
      PG: "Stephen Curry",
      SG: "Stephen Curry",
      SF: "Stephen Curry",
      PF: "Stephen Curry",
      C: "Stephen Curry",
    },
    overall: 97.6,
    archetype: "Spacing Superteam",
  },
  "1986 Celtics": {
    players: {
      PG: "Dennis Johnson",
      SG: "Danny Ainge",
      SF: "Larry Bird",
      PF: "Kevin McHale",
      C: "Robert Parish",
    },
    overall: 96.8,
    archetype: "Balanced Dynasty",
  },
};

const courtMarkerPositions = {
  PG: "left-1/2 ",
  SG: "left-[20%] top-8",
  SF: "left-[75%] bottom-6",
  PF: "left-[30%] top-60",
  C: "left-[65%] top-38",
};

function LineupMarker({
  position,
  name,
  className,
  color,
}: {
  position: string;
  name: string;
  className: string;
  color: string;
}) {
  const player = players.find((player) => player.name === name);

  return (
    <div className={`absolute -translate-x-1/2 text-center ${className}`}>
      {player && (
        <Image
          src={player.image}
          alt={player.name}
          width={72}
          height={72}
          className="mx-auto h-17.5 w-17.5 rounded-full object-cover"
        />
      )}

      <p className="mt-0.5 font-michroma text-[7px] text-white">{name}</p>

      <p className="font-michroma text-[6px]" style={{ color }}>
        {position}
      </p>
    </div>
  );
}

export default function Lineups() {
  const [activeTab, setActiveTab] = useState<LineupTab>("featured");
  const [selectedLineupCategory, setSelectedLineupCategory] = useState("");
  const lineupSectionRef = useRef<HTMLDivElement>(null);
  const [selectedLineupName, setSelectedLineupName] = useState("");

  const selectedCategoryColor =
    lineupCards.find((card) => card.title === selectedLineupCategory)?.color ??
    "#1bc2ec";

  return (
    <main className="min-h-screen overflow-x-hidden text-white">
      <section className="mx-auto w-full max-w-6xl px-6 pb-12">
        <div className="mt-8 flex w-full items-end justify-center gap-2 overflow-x-auto border-b border-[#1bc2ec]/30 pb-0">
          {lineupTabs.map((tab) => {
            const isActive = activeTab === tab.value;

            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={`min-w-48 cursor-pointer rounded-t-md border border-b-0 px-4 font-michroma text-xs uppercase tracking-wide transition-all duration-200 ${
                  isActive
                    ? "border-[#1bc2ec]/70 bg-[#1bc2ec]/20 py-4 text-[#1bc2ec]"
                    : "border-white/10 bg-black/30 py-2.5 text-white/50 hover:border-white/30 hover:text-white/80"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="rounded-b-md border border-t-0 border-[#1bc2ec]/50 bg-black/25 p-4">
          {activeTab === "featured" && (
            <div>
              <h1 className="font-michroma text-sm uppercase tracking-wide text-white text-center">
                Featured Lineups
              </h1>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                {lineupCards.map((card) => {
                  const Icon = card.Icon;

                  return (
                    <button
                      key={card.title}
                      type="button"
                      onClick={() => {
                        setSelectedLineupCategory(card.title);

                        const firstLineup =
                          lineupGroups[
                            card.title as keyof typeof lineupGroups
                          ][0];

                        setSelectedLineupName(firstLineup);

                        setTimeout(() => {
                          lineupSectionRef.current?.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          });
                        }, 150);
                      }}
                      className="grid min-h-36 grid-cols-[1fr_auto] items-center gap-6 rounded-md border bg-black/30 p-4 text-left"
                      style={{
                        borderColor: `${card.color}80`,
                      }}
                    >
                      <div className="flex flex-col justify-center">
                        <div className="flex items-center gap-2">
                          <Icon
                            size={20}
                            strokeWidth={2}
                            style={{ color: card.color }}
                          />

                          <h2 className="font-michroma text-sm">
                            {card.title}
                          </h2>
                        </div>

                        <p className="mt-3 font-michroma text-xs leading-relaxed text-white/35">
                          Featured:
                        </p>

                        <p className="mt-3 font-michroma text-[10px] leading-relaxed text-white/35">
                          Lineups:
                        </p>
                      </div>

                      <span
                        className="cursor-pointer self-end rounded-md border px-4 py-3 font-michroma text-xs uppercase transition hover:brightness-150"
                        style={{
                          color: card.color,
                          borderColor: `${card.color}80`,
                          backgroundColor: `${card.color}18`,
                        }}
                      >
                        Explore
                      </span>
                    </button>
                  );
                })}
              </div>
              {selectedLineupCategory && (
                <div
                  ref={lineupSectionRef}
                  className="scroll-mt-24 mt-8 rounded-md border border-white/10 bg-black/25 p-4"
                >
                  <h2
                    className="border-b pb-3 text-center font-michroma text-sm uppercase tracking-wide text-white"
                    style={{ borderColor: `${selectedCategoryColor}55` }}
                  >
                    {selectedLineupCategory}
                  </h2>

                  <div className="mt-5 grid gap-6 lg:grid-cols-[220px_1fr]">
                    {/* Left lineup buttons */}
                    <div className="flex flex-col gap-2">
                      {lineupGroups[
                        selectedLineupCategory as keyof typeof lineupGroups
                      ].map((lineupName) => (
                        <button
                          key={lineupName}
                          type="button"
                          onClick={() => setSelectedLineupName(lineupName)}
                          className={`rounded-md border px-4 py-3 text-left font-michroma text-xs transition ${
                            selectedLineupName === lineupName
                              ? "bg-black/30"
                              : "border-white/10 bg-black/30 text-white/60 hover:text-white"
                          }`}
                          style={
                            selectedLineupName === lineupName
                              ? {
                                  color: selectedCategoryColor,
                                  borderColor: `${selectedCategoryColor}99`,
                                  backgroundColor: `${selectedCategoryColor}18`,
                                }
                              : undefined
                          }
                        >
                          {lineupName}
                        </button>
                      ))}
                    </div>

                    {/* Right selected lineup card */}
                    <div
                      className="min-h-96 rounded-md border bg-black/30 p-5"
                      style={{ borderColor: `${selectedCategoryColor}55` }}
                    >
                      {selectedLineupName &&
                      selectedLineupName in lineupDetails ? (
                        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
                          {/* Left text column */}
                          <div>
                            <h3 className="font-michroma text-sm uppercase tracking-wide text-white">
                              {selectedLineupName}
                            </h3>

                            <div className="mt-5 grid gap-2">
                              {Object.entries(
                                lineupDetails[
                                  selectedLineupName as keyof typeof lineupDetails
                                ].players,
                              ).map(([position, playerName]) => (
                                <div
                                  key={position}
                                  className="grid grid-cols-[40px_1fr] gap-3 font-michroma text-xs"
                                >
                                  <span
                                    style={{ color: selectedCategoryColor }}
                                  >
                                    {position}
                                  </span>
                                  <span className="text-white/80">
                                    {playerName}
                                  </span>
                                </div>
                              ))}
                            </div>

                            <p className="mt-5 font-michroma text-xs text-white">
                              OVR:{" "}
                              <span style={{ color: selectedCategoryColor }}>
                                {
                                  lineupDetails[
                                    selectedLineupName as keyof typeof lineupDetails
                                  ].overall
                                }
                              </span>
                            </p>

                            <div className="mt-5">
                              <p className="font-michroma text-[10px] uppercase text-white/40">
                                Archetype
                              </p>
                              <p
                                className="mt-1 font-michroma text-xs"
                                style={{ color: selectedCategoryColor }}
                              >
                                {
                                  lineupDetails[
                                    selectedLineupName as keyof typeof lineupDetails
                                  ].archetype
                                }
                              </p>
                            </div>
                          </div>

                          {/* Right court column */}
                          <div className="relative min-h-96 overflow-hidden rounded-md bg-transparent">
                            {/* Half court boundary */}
                            <div className="absolute inset-x-8 inset-y-6 " />

                            {/* Three point arc */}
                            <div
                              className="absolute left-1/2 bottom-6 h-[68%] w-[70%] -translate-x-1/2 rounded-t-full border-t border-l border-r"
                              style={{
                                borderColor: `${selectedCategoryColor}40`,
                              }}
                            />

                            {/* Paint */}
                            <div
                              className="absolute left-1/2 bottom-6 h-36 w-24 -translate-x-1/2 border"
                              style={{
                                borderColor: `${selectedCategoryColor}40`,
                              }}
                            />

                            {/* Free throw semicircle */}
                            <div
                              className="absolute left-1/2 bottom-42 h-12 w-24 -translate-x-1/2 rounded-t-full border-t border-l border-r"
                              style={{
                                borderColor: `${selectedCategoryColor}40`,
                              }}
                            />

                            {/* Hoop */}
                            <div
                              className="absolute left-1/2 bottom-11 h-3 w-3 -translate-x-1/2 rounded-full border"
                              style={{
                                borderColor: `${selectedCategoryColor}80`,
                              }}
                            />

                            {/* Backboard */}
                            <div
                              className="absolute left-1/2 bottom-11 h-px w-14 -translate-x-1/2"
                              style={{
                                backgroundColor: `${selectedCategoryColor}80`,
                              }}
                            />

                            {Object.entries(
                              lineupDetails[
                                selectedLineupName as keyof typeof lineupDetails
                              ].players,
                            ).map(([position, playerName]) => (
                              <LineupMarker
                                key={position}
                                position={position}
                                name={playerName}
                                color={selectedCategoryColor}
                                className={
                                  courtMarkerPositions[
                                    position as keyof typeof courtMarkerPositions
                                  ]
                                }
                              />
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="font-michroma text-xs text-white/40">
                          Choose a lineup with saved details to view the court.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "builder" && (
            <div>
              <h1 className="font-michroma text-sm uppercase tracking-wide text-white text-center">
                Build Your Own
              </h1>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
