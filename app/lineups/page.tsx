"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthPrompt } from "../components/auth/auth-prompt";
import { mockUser as user } from "../lib/mock-auth";
import { DatabaseErrorState } from "../components/loading/database-error-state";
import { DatabaseLoadingState } from "../components/loading/database-loading-state";
import {
  players as fallbackPlayers,
  type Player,
} from "../components/court-data";
import type { PlayerStatProfileMode } from "../components/player-ratings";

import type {
  LineupTab,
  LineupDetail,
  SavedLineup,
} from "../components/lineups/shared/lineup-types";
import { LineupPageHeader } from "../components/lineups/shared/lineup-page-header";

import {
  lineupPositions,
  lineupDetails,
  type LineupCategory,
  type LineupName,
} from "../components/lineups/featured/featured-lineups";

import {
  getLineupAchievements,
  getLineupCategoryColor,
  getLineupNamesForCategory,
} from "../components/lineups/featured/featured-lineup-helpers";
import { FeaturedLineupCategoryGrid } from "../components/lineups/featured/featured-lineup-category-grid";
import { FeaturedLineupDetail } from "../components/lineups/featured/featured-lineup-detail";

import { BuilderIntro } from "../components/lineups/builder/builder-intro";
import { BuilderWorkspace } from "../components/lineups/builder/builder-workspace";
import { useLineupBuilder } from "../components/lineups/builder/use-lineup-builder";

import {
  getFilteredSavedLineups,
  getSavedSortLabel,
} from "../components/lineups/saved/saved-lineup-filters";
import { SavedLineupsSection } from "../components/lineups/saved/saved-lineups-section";
import { useSavedLineups } from "../components/lineups/saved/use-saved-lineups";
import { NameLineupModal } from "../components/lineups/saved/name-lineup-modal";
import { DeleteLineupModal } from "../components/lineups/saved/delete-lineup-modal";
import { LineupDeletedModal } from "../components/lineups/saved/lineup-deleted-modal";
import { LineupSavedModal } from "../components/lineups/saved/lineup-saved-modal";
import { RenameLineupModal } from "../components/lineups/saved/rename-lineup-modal";
import { OverwriteLineupModal } from "../components/lineups/saved/overwrite-lineup-modal";
import { SavedLineupsEmptyState } from "../components/lineups/saved/saved-lineups-empty-state";
import {
  createSavedLineup,
  createSavedLineupInput,
} from "../components/lineups/saved/create-saved-lineup";
import {
  getLineupNameConflict,
  getLineupsAfterDelete,
  getLineupsAfterRename,
} from "../components/lineups/saved/saved-lineup-list-helpers";

import { LoadingLineupModal } from "../components/lineups/scout/loading-lineup-modal";
import { getScoutReportDisplay } from "../components/lineups/scout/scout-report-display";
import { ScoutReportModal } from "../components/lineups/scout/scout-report-modal";
import { runLineupLoadingSequence } from "../components/lineups/scout/run-lineup-loading-sequence";
import { useAnimatedScoutOverall } from "../components/lineups/scout/use-animated-scout-overall";
import {
  LOAD_LINEUP_EXIT_DURATION,
  LOAD_LINEUP_PROGRESS_INTERVAL,
  LOAD_LINEUP_TOTAL_DURATION,
  loadLineupSteps,
  scoutLineupSteps,
} from "../components/lineups/scout/lineup-loading-steps";

const statProfileLabels: Record<PlayerStatProfileMode | "all", string> = {
  all: "All Profiles",
  career: "Career",
  peak: "3-Year Peak",
  current: "Latest Season",
};

type OverwriteLineupRequest =
  | {
      type: "save";
      existingLineup: SavedLineup;
      nextName: string;
    }
  | {
      type: "rename";
      existingLineup: SavedLineup;
      lineupId: string;
      nextName: string;
    };

export default function Lineups() {
  // Refs and routing
  const router = useRouter();
  const searchParams = useSearchParams();
  const lineupSectionRef = useRef<HTMLDivElement>(null);

  // Page state
  const [activeTab, setActiveTab] = useState<LineupTab>("featured");
  const [players, setPlayers] = useState<Player[]>(fallbackPlayers);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(true);
  const [playerLoadError, setPlayerLoadError] = useState("");

  useEffect(() => {
    const tab = searchParams.get("tab");

    if (tab === "featured" || tab === "builder" || tab === "saved") {
      const frameId = requestAnimationFrame(() => setActiveTab(tab));

      return () => cancelAnimationFrame(frameId);
    }
  }, [searchParams]);

  useEffect(() => {
    let isActive = true;

    async function loadPlayers() {
      try {
        setIsLoadingPlayers(true);
        setPlayerLoadError("");

        const response = await fetch("/api/players");

        if (!response.ok) {
          throw new Error("Failed to load players");
        }

        const data = (await response.json()) as {
          players?: Player[];
        };

        if (isActive && data.players && data.players.length > 0) {
          setPlayers(data.players);
        }
      } catch (error) {
        console.error("Failed to load lineup players", error);

        if (isActive) {
          setPlayers(fallbackPlayers);
          setPlayerLoadError("Could not load lineup player database.");
        }
      } finally {
        if (isActive) {
          setIsLoadingPlayers(false);
        }
      }
    }

    loadPlayers();

    return () => {
      isActive = false;
    };
  }, []);

  // Featured lineup state
  const [selectedLineupCategory, setSelectedLineupCategory] = useState<
    LineupCategory | ""
  >("");
  const [selectedLineupName, setSelectedLineupName] = useState<LineupName | "">(
    "",
  );
  const [hoveredLineupPlayer, setHoveredLineupPlayer] = useState("");

  // Modal state
  const [isScoutOpen, setIsScoutOpen] = useState(false);
  const [isNamingLineup, setIsNamingLineup] = useState(false);
  const [lineupNameInput, setLineupNameInput] = useState("");
  const [lineupPendingDelete, setLineupPendingDelete] =
    useState<SavedLineup | null>(null);
  const [isLineupDeletedOpen, setIsLineupDeletedOpen] = useState(false);
  const [lineupPendingRename, setLineupPendingRename] =
    useState<SavedLineup | null>(null);
  const [renameLineupInput, setRenameLineupInput] = useState("");
  const [lineupPendingOverwrite, setLineupPendingOverwrite] =
    useState<OverwriteLineupRequest | null>(null);
  const [isLineupSavedOpen, setIsLineupSavedOpen] = useState(false);
  const [scoutedSavedLineup, setScoutedSavedLineup] =
    useState<SavedLineup | null>(null);
  const [isLoadingSavedLineup, setIsLoadingSavedLineup] = useState(false);
  const [isScoutingLineup, setIsScoutingLineup] = useState(false);

  // Animations
  const [loadLineupStep, setLoadLineupStep] = useState(0);
  const [loadLineupProgress, setLoadLineupProgress] = useState(0);
  const [isLoadLineupExiting, setIsLoadLineupExiting] = useState(false);
  const [scoutLineupStep, setScoutLineupStep] = useState(0);
  const [scoutLineupProgress, setScoutLineupProgress] = useState(0);
  const [isScoutLineupExiting, setIsScoutLineupExiting] = useState(false);

  // Saved lineup state
  const { savedLineups, updateSavedLineups } = useSavedLineups();
  const [savedLineupSearch, setSavedLineupSearch] = useState("");
  const [savedLineupSort, setSavedLineupSort] = useState("highestOvr");
  const [savedLineupProfileFilter, setSavedLineupProfileFilter] = useState<
    PlayerStatProfileMode | "all"
  >("all");
  const [savedLineupTierFilter] = useState("");
  const [savedLineupArchetypeFilter] = useState("");
  const [openSavedDropdown, setOpenSavedDropdown] = useState<string | null>(
    null,
  );

  // Auth
  const [authPromptMessage, setAuthPromptMessage] = useState("");
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  // Builder state and derived data
  const {
    hasStartedBuilder,
    setHasStartedBuilder,
    customLineup,
    setCustomLineup,
    activeBuildPosition,
    setActiveBuildPosition,
    hoveredBuildPlayer,
    setHoveredBuildPlayer,
    buildPlayerSearch,
    setBuildPlayerSearch,
    builderStatProfile,
    setBuilderStatProfile,
    playerRevealMode,
    setPlayerRevealMode,
    selectedCustomPlayerSlots,
    builderLineupRating,
    availableBuildPlayers,
    selectedLineupCount,
    isLineupComplete,
    hasExistingDraft,
    pickBuildPlayer,
    removeBuildPlayer,
    resetDraft,
    startNewDraft,
    continueDraft,
  } = useLineupBuilder({ players, lineupPositions });

  const scoutStatProfile =
    scoutedSavedLineup?.statProfile ?? builderStatProfile;

  // Scout report data
  const {
    scoutReport,
    lineupArchetype,
    lineupTier,
    scoutArchetypeColor,
    scoutTierColor,
    scoutSummary,
    teamIdentity,
    lineupStrengths,
    lineupWeaknesses,
    lineupTradeoff,
    xFactorName,
    xFactorDescription,
    similarLineup,
    similarToDescription,
    similarLineupMatches,
    courtBalance,
    courtBalanceDescription,
    courtBalanceColor,
    teamGrades,
    scoutScores,
    scoutReason,
    lineupBadges,
  } = getScoutReportDisplay({
    selectedCustomPlayerSlots,
    scoutedSavedLineup,
    statProfileMode: scoutStatProfile,
  });

  // Featured lineup data
  const selectedCategoryColor = getLineupCategoryColor(selectedLineupCategory);

  const selectedLineup: LineupDetail | null = selectedLineupName
    ? lineupDetails[selectedLineupName]
    : null;

  const selectedLineupAchievements = getLineupAchievements(selectedLineup);

  const selectedLineupNames = getLineupNamesForCategory(selectedLineupCategory);

  // Saved lineup derived data
  const filteredSavedLineups = getFilteredSavedLineups({
    savedLineups,
    savedLineupSearch,
    savedLineupSort,
    savedLineupProfileFilter,
    savedLineupTierFilter,
    savedLineupArchetypeFilter,
  });

  // Page display values
  const shouldShowTopText =
    activeTab === "featured" || activeTab === "saved" || hasStartedBuilder;

  const savedSortLabel = getSavedSortLabel(savedLineupSort);
  const savedProfileLabel = statProfileLabels[savedLineupProfileFilter];
  const scoutStatProfileLabel = statProfileLabels[scoutStatProfile];

  // Scout report animation
  const displayedScoutOverall = scoutScores.overall;

  const animatedScoutOverall = useAnimatedScoutOverall(
    isScoutOpen,
    displayedScoutOverall,
  );

  // Page actions
  function changeTab(tab: LineupTab) {
    setActiveTab(tab);

    if (tab === "featured") {
      router.replace("/lineups", { scroll: false });
    } else {
      router.replace(`/lineups?tab=${tab}`, { scroll: false });
    }

    if (tab === "builder") {
      setHasStartedBuilder(false);
    }
  }

  function selectFeaturedLineupCategory(
    category: LineupCategory,
    featuredLineup: LineupName | null,
  ) {
    setSelectedLineupCategory(category);
    setSelectedLineupName(featuredLineup ?? "");

    setTimeout(() => {
      lineupSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 150);
  }

  function viewPlayerCard(playerName: string) {
    router.push(`/players?player=${encodeURIComponent(playerName)}`);
  }

  // Builder actions
  function scoutDraftLineup() {
    setScoutedSavedLineup(null);
    setIsScoutingLineup(true);
    setScoutLineupStep(0);
    setScoutLineupProgress(0);
    setIsScoutLineupExiting(false);

    runLineupLoadingSequence({
      totalDuration: 2400,
      progressInterval: 40,
      exitDuration: 300,
      steps: scoutLineupSteps,
      onStepChange: setScoutLineupStep,
      onProgressChange: (progressAmount) => {
        setScoutLineupProgress((currentProgress) =>
          Math.min(currentProgress + progressAmount, 100),
        );
      },
      onStartExit: () => {
        setScoutLineupProgress(100);
        setIsScoutLineupExiting(true);
      },
      onComplete: () => {
        setIsScoutingLineup(false);
        setIsScoutLineupExiting(false);
        setIsScoutOpen(true);
      },
    });
  }

  // Auth
  function requireAuth(message: string, action: () => void) {
    if (!user) {
      setAuthPromptMessage(message);
      setShowAuthPrompt(true);
      return;
    }

    action();
  }

  // Saved lineup actions
  function saveLineup(lineupName: string, overwriteLineupId?: string) {
    if (!builderLineupRating) return;

    const nextLineupName = lineupName.trim() || `Lineup ${savedLineups.length + 1}`;

    const newLineupInput = createSavedLineupInput({
      name: nextLineupName,
      statProfile: builderStatProfile,
      players: customLineup,
      overall: scoutReport.scores.overall,
      summary: scoutSummary,
      tier: lineupTier,
      archetype: lineupArchetype,
      teamIdentity,
      strengths: lineupStrengths,
      weaknesses: lineupWeaknesses,
      tradeoff: lineupTradeoff,
      grades: teamGrades,
      scores: scoutReport.scores,
      xFactorName,
      xFactorDescription,
      similarTo: similarLineup,
      similarToDescription,
      similarLineupMatches,
      courtBalance,
      courtBalanceDescription,
      badges: scoutReport.badges,
    });

    const newLineup = createSavedLineup(newLineupInput);

    const nextLineups = [
      newLineup,
      ...savedLineups.filter((lineup) => lineup.id !== overwriteLineupId),
    ];

    updateSavedLineups(nextLineups);
  }

  function requestSaveLineup(lineupName: string) {
    const nextLineupName = lineupName.trim() || `Lineup ${savedLineups.length + 1}`;
    const existingLineup = getLineupNameConflict(
      savedLineups,
      nextLineupName,
    );

    if (existingLineup) {
      setLineupPendingOverwrite({
        type: "save",
        existingLineup,
        nextName: nextLineupName,
      });
      return;
    }

    saveLineup(nextLineupName);
    setIsNamingLineup(false);
    setIsScoutOpen(false);
    setIsLineupSavedOpen(true);
  }

  function deleteSavedLineup(lineupId: string, onDeleted?: () => void) {
    requireAuth("Sign in to delete saved lineups", () => {
      updateSavedLineups(getLineupsAfterDelete(savedLineups, lineupId));
      onDeleted?.();
    });
  }

  function renameSavedLineup(lineupId: string, newName: string) {
    requireAuth("Sign in to rename saved lineups", () => {
      updateSavedLineups(
        getLineupsAfterRename(savedLineups, lineupId, newName),
      );
    });
  }

  function requestRenameSavedLineup(lineupId: string, newName: string) {
    const lineupToRename = savedLineups.find((lineup) => lineup.id === lineupId);
    const nextLineupName = newName.trim() || lineupToRename?.name;

    if (!nextLineupName) return;

    const existingLineup = getLineupNameConflict(
      savedLineups,
      nextLineupName,
      lineupId,
    );

    if (existingLineup) {
      setLineupPendingOverwrite({
        type: "rename",
        existingLineup,
        lineupId,
        nextName: nextLineupName,
      });
      return;
    }

    renameSavedLineup(lineupId, nextLineupName);
    setLineupPendingRename(null);
    setRenameLineupInput("");
  }

  function confirmLineupOverwrite() {
    if (!lineupPendingOverwrite) return;

    if (lineupPendingOverwrite.type === "save") {
      saveLineup(
        lineupPendingOverwrite.nextName,
        lineupPendingOverwrite.existingLineup.id,
      );
      setIsNamingLineup(false);
      setIsScoutOpen(false);
      setIsLineupSavedOpen(true);
    } else {
      renameSavedLineup(
        lineupPendingOverwrite.lineupId,
        lineupPendingOverwrite.nextName,
      );
      setLineupPendingRename(null);
      setRenameLineupInput("");
    }

    setLineupPendingOverwrite(null);
  }

  function applySavedLineupPlayers(lineup: SavedLineup) {
    setCustomLineup(lineup.players);
  }

  function applyLoadedLineup(lineup: SavedLineup) {
    setPlayerRevealMode("savedLoad");
    setBuilderStatProfile(lineup.statProfile ?? "career");
    applySavedLineupPlayers(lineup);
    setActiveTab("builder");
    setHasStartedBuilder(true);
    setActiveBuildPosition("PG");
    setIsScoutOpen(false);
    setIsNamingLineup(false);
    setScoutedSavedLineup(null);
    setIsLoadingSavedLineup(false);
    setIsLoadLineupExiting(false);
  }

  function loadSavedLineup(lineup: SavedLineup) {
    setIsLoadingSavedLineup(true);
    setLoadLineupStep(0);
    setLoadLineupProgress(0);
    setIsLoadLineupExiting(false);

    runLineupLoadingSequence({
      totalDuration: LOAD_LINEUP_TOTAL_DURATION,
      progressInterval: LOAD_LINEUP_PROGRESS_INTERVAL,
      exitDuration: LOAD_LINEUP_EXIT_DURATION,
      steps: loadLineupSteps,
      onStepChange: setLoadLineupStep,
      onProgressChange: (progressAmount) => {
        setLoadLineupProgress((currentProgress) =>
          Math.min(currentProgress + progressAmount, 100),
        );
      },
      onStartExit: () => {
        setLoadLineupProgress(100);
        setIsLoadLineupExiting(true);
      },
      onComplete: () => {
        applyLoadedLineup(lineup);
      },
    });
  }

  function scoutSavedLineup(lineup: SavedLineup) {
    setScoutedSavedLineup(lineup);
    setBuilderStatProfile(lineup.statProfile ?? "career");
    applySavedLineupPlayers(lineup);
    setIsScoutOpen(true);
  }

  return (
    <main className="min-h-screen overflow-x-hidden text-white">
      <section className="mx-auto w-full max-w-7xl px-3 pb-12 lg:px-6">
        <LineupPageHeader
          activeTab={activeTab}
          shouldShowTopText={shouldShowTopText}
          onTabChange={changeTab}
        />

        {activeTab === "featured" && (
          <section className="min-h-[calc(100vh-140px)]">
            <FeaturedLineupCategoryGrid
              onSelectCategory={selectFeaturedLineupCategory}
            />

            {selectedLineupCategory && (
              <FeaturedLineupDetail
                lineupSectionRef={lineupSectionRef}
                selectedLineupCategory={selectedLineupCategory}
                selectedLineupName={selectedLineupName}
                selectedLineup={selectedLineup}
                selectedLineupNames={selectedLineupNames}
                selectedLineupAchievements={selectedLineupAchievements}
                selectedCategoryColor={selectedCategoryColor}
                hoveredLineupPlayer={hoveredLineupPlayer}
                onSelectLineup={setSelectedLineupName}
                onHoverPlayer={setHoveredLineupPlayer}
                onViewCard={viewPlayerCard}
              />
            )}
          </section>
        )}

        {activeTab === "builder" && (
          <section className="min-h-[calc(100vh-140px)]">
            {!hasStartedBuilder ? (
              <BuilderIntro
                hasExistingDraft={hasExistingDraft}
                onStartNewDraft={startNewDraft}
                onContinueDraft={continueDraft}
              />
            ) : isLoadingPlayers ? (
              <DatabaseLoadingState
                title="Loading Lineup Players"
                description="Syncing draft board profiles..."
              />
            ) : (
              <>
                {playerLoadError && (
                  <DatabaseErrorState
                    title="Lineup Players Unavailable"
                    description="Showing fallback draft board data."
                  />
                )}

                <BuilderWorkspace
                  players={players}
                  lineupPositions={lineupPositions}
                  activeBuildPosition={activeBuildPosition}
                  customLineup={customLineup}
                  buildPlayerSearch={buildPlayerSearch}
                  builderStatProfile={builderStatProfile}
                  availableBuildPlayers={availableBuildPlayers}
                  builderLineupRating={builderLineupRating}
                  isLineupComplete={isLineupComplete}
                  selectedLineupCount={selectedLineupCount}
                  hoveredBuildPlayer={hoveredBuildPlayer}
                  playerRevealMode={playerRevealMode}
                  onSelectPosition={setActiveBuildPosition}
                  onSearchChange={setBuildPlayerSearch}
                  onStatProfileChange={setBuilderStatProfile}
                  onPickPlayer={pickBuildPlayer}
                  onHoverPlayer={setHoveredBuildPlayer}
                  onRemovePlayer={removeBuildPlayer}
                  onScoutLineup={scoutDraftLineup}
                  onViewCard={viewPlayerCard}
                />
              </>
            )}
          </section>
        )}

        {activeTab === "saved" &&
          (user ? (
            savedLineups.length > 0 ? (
              <SavedLineupsSection
                savedLineups={savedLineups}
                filteredSavedLineups={filteredSavedLineups}
                savedLineupSearch={savedLineupSearch}
                savedLineupSort={savedLineupSort}
                savedLineupProfileFilter={savedLineupProfileFilter}
                savedSortLabel={savedSortLabel}
                savedProfileLabel={savedProfileLabel}
                openSavedDropdown={openSavedDropdown}
                isLoadingPlayers={isLoadingPlayers}
                onSearchChange={setSavedLineupSearch}
                onToggleSortDropdown={() =>
                  setOpenSavedDropdown(
                    openSavedDropdown === "sort" ? null : "sort",
                  )
                }
                onToggleProfileDropdown={() =>
                  setOpenSavedDropdown(
                    openSavedDropdown === "profile" ? null : "profile",
                  )
                }
                onSelectSort={(value) => {
                  setSavedLineupSort(value);
                  setOpenSavedDropdown(null);
                }}
                onSelectProfile={(value) => {
                  setSavedLineupProfileFilter(value);
                  setOpenSavedDropdown(null);
                }}
                onSetActiveTab={setActiveTab}
                onSetHasStartedBuilder={setHasStartedBuilder}
                onLoadLineup={loadSavedLineup}
                onScoutLineup={scoutSavedLineup}
                onRenameLineup={(lineup) => {
                  setLineupPendingRename(lineup);
                  setRenameLineupInput(lineup.name);
                }}
                onDeleteLineup={setLineupPendingDelete}
              />
            ) : (
              <SavedLineupsEmptyState
                onBuildLineup={() => {
                  setActiveTab("builder");
                  setHasStartedBuilder(false);
                }}
              />
            )
          ) : (
            <div className="mx-auto mt-6 max-w-75 rounded-lg border border-[#1bc2ec]/35 bg-[#06131d]/80 p-3.5 text-center shadow-[0_0_22px_rgba(27,194,236,0.14)] lg:mt-16 lg:max-w-md lg:p-6 lg:shadow-[0_0_28px_rgba(27,194,236,0.16)]">
              <p className="font-michroma text-[10px] uppercase text-white lg:text-lg">
                Sign in to view saved lineups
              </p>

              <p className="mt-2 font-michroma text-[7px] leading-relaxed text-white/45 lg:mt-3 lg:text-[10px]">
                Your saved teams will appear here once you create an account.
              </p>

              <button
                type="button"
                onClick={() => router.push("/signin")}
                className="mt-3 rounded-md border border-[#1bc2ec]/50 bg-[#1bc2ec]/10 px-3 py-2 font-michroma text-[7px] uppercase text-[#1bc2ec] transition hover:bg-[#1bc2ec]/20 hover:text-white lg:mt-5 lg:px-4 lg:py-3 lg:text-[10px]"
              >
                Sign In
              </button>
            </div>
          ))}
      </section>

      {isScoutOpen && (
        <ScoutReportModal
          players={players}
          lineupPositions={lineupPositions}
          customLineup={customLineup}
          scoutScores={scoutScores}
          scoutArchetypeColor={scoutArchetypeColor}
          scoutSummary={scoutSummary}
          statProfileLabel={scoutStatProfileLabel}
          animatedScoutOverall={animatedScoutOverall}
          lineupTier={lineupTier}
          scoutTierColor={scoutTierColor}
          lineupBadges={lineupBadges}
          lineupArchetype={lineupArchetype}
          scoutReason={scoutReason}
          teamIdentity={teamIdentity}
          lineupStrengths={lineupStrengths}
          lineupWeaknesses={lineupWeaknesses}
          lineupTradeoff={lineupTradeoff}
          teamGrades={teamGrades}
          xFactorName={xFactorName}
          xFactorDescription={xFactorDescription}
          similarLineup={similarLineup}
          similarToDescription={similarToDescription}
          courtBalance={courtBalance}
          courtBalanceDescription={courtBalanceDescription}
          courtBalanceColor={courtBalanceColor}
          onClose={() => {
            setIsScoutOpen(false);
            setScoutedSavedLineup(null);
          }}
          onSaveLineup={() => {
            requireAuth("Sign in to save this lineup", () => {
              setLineupNameInput("");
              setIsNamingLineup(true);
            });
          }}
        />
      )}

      {isNamingLineup && (
        <NameLineupModal
          lineupNameInput={lineupNameInput}
          onChangeName={setLineupNameInput}
          onCancel={() => setIsNamingLineup(false)}
          onSave={() => {
            requestSaveLineup(lineupNameInput);
          }}
        />
      )}

      {showAuthPrompt && (
        <AuthPrompt
          title={authPromptMessage}
          description="Create an account to save lineups, rename builds, and access them later."
          onClose={() => setShowAuthPrompt(false)}
        />
      )}

      {lineupPendingDelete && (
        <DeleteLineupModal
          lineup={lineupPendingDelete}
          onCancel={() => setLineupPendingDelete(null)}
          onConfirm={() => {
            deleteSavedLineup(lineupPendingDelete.id, () => {
              setLineupPendingDelete(null);
              setIsLineupDeletedOpen(true);
            });
          }}
        />
      )}

      {lineupPendingRename && (
        <RenameLineupModal
          lineup={lineupPendingRename}
          renameLineupInput={renameLineupInput}
          onChangeName={setRenameLineupInput}
          onCancel={() => {
            setLineupPendingRename(null);
            setRenameLineupInput("");
          }}
          onSave={() => {
            requestRenameSavedLineup(lineupPendingRename.id, renameLineupInput);
          }}
        />
      )}

      {lineupPendingOverwrite && (
        <OverwriteLineupModal
          existingLineup={lineupPendingOverwrite.existingLineup}
          nextName={lineupPendingOverwrite.nextName}
          actionLabel={
            lineupPendingOverwrite.type === "save"
              ? "Overwrite Save"
              : "Overwrite Name"
          }
          onCancel={() => setLineupPendingOverwrite(null)}
          onConfirm={confirmLineupOverwrite}
        />
      )}

      {isLineupDeletedOpen && (
        <LineupDeletedModal onClose={() => setIsLineupDeletedOpen(false)} />
      )}

      {isLineupSavedOpen && (
        <LineupSavedModal
          onViewSaved={() => {
            setIsLineupSavedOpen(false);
            setActiveTab("saved");
          }}
          onBuildAnother={() => {
            setIsLineupSavedOpen(false);
            setActiveTab("builder");
            resetDraft();
            setHasStartedBuilder(true);
          }}
        />
      )}

      {isLoadingSavedLineup && (
        <LoadingLineupModal
          isExiting={isLoadLineupExiting}
          steps={loadLineupSteps}
          currentStep={loadLineupStep}
          progress={loadLineupProgress}
        />
      )}

      {isScoutingLineup && (
        <LoadingLineupModal
          isExiting={isScoutLineupExiting}
          steps={scoutLineupSteps}
          currentStep={scoutLineupStep}
          progress={scoutLineupProgress}
        />
      )}
    </main>
  );
}
