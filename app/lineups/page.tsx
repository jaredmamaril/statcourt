"use client";

import { useState } from "react";
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

export default function Lineups() {
  const [activeTab, setActiveTab] = useState<LineupTab>("featured");

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
                      className="grid min-h-36 cursor-pointer grid-cols-[1fr_auto] items-center gap-6 rounded-md border bg-black/30 p-4 text-left"
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

                          <h2
                            className="font-michroma text-sm"
                            style={{ color: card.color }}
                          >
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
                        className="self-center rounded-md border px-4 py-3 font-michroma text-xs uppercase transition hover:brightness-150"
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
