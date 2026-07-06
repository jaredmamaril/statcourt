"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthPrompt } from "../components/auth/auth-prompt";
import { mockUser as user } from "../lib/mock-auth";

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
import {
  createSavedLineup,
  createSavedLineupInput,
} from "../components/lineups/saved/create-saved-lineup";
import {
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

export default function Lineups() {
  // Refs and routing
  const router = useRouter();
  const searchParams = useSearchParams();
  const lineupSectionRef = useRef<HTMLDivElement>(null);

  // Page state
  const [activeTab, setActiveTab] = useState<LineupTab>("featured");
  useEffect(() => {
    const tab = searchParams.get("tab");

    if (tab === "featured" || tab === "builder" || tab === "saved") {
      setActiveTab(tab);
    }
  }, [searchParams]);

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
  const [savedLineupTierFilter, setSavedLineupTierFilter] = useState("");
  const [savedLineupArchetypeFilter, setSavedLineupArchetypeFilter] =
    useState("");
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
    playerRevealMode,
    setPlayerRevealMode,
    selectedCustomPlayerSlots,
    customLineupOverall,
    availableBuildPlayers,
    selectedLineupCount,
    isLineupComplete,
    hasExistingDraft,
    pickBuildPlayer,
    removeBuildPlayer,
    resetDraft,
    startNewDraft,
    continueDraft,
  } = useLineupBuilder({ lineupPositions });

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
    savedLineupTierFilter,
    savedLineupArchetypeFilter,
    lineupPositions,
  });

  // Page display values
  const shouldShowTopText =
    activeTab === "featured" || activeTab === "saved" || hasStartedBuilder;

  const savedSortLabel = getSavedSortLabel(savedLineupSort);

  // Scout report animation
  const displayedScoutOverall =
    scoutedSavedLineup?.overall ?? customLineupOverall;

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
  function saveLineup(lineupName: string) {
    if (!customLineupOverall) return;

    const newLineupInput = createSavedLineupInput({
      name: lineupName.trim() || `Lineup ${savedLineups.length + 1}`,
      players: customLineup,
      overall: customLineupOverall,
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

    const nextLineups = [newLineup, ...savedLineups];

    updateSavedLineups(nextLineups);
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

  function applySavedLineupPlayers(lineup: SavedLineup) {
    setCustomLineup(lineup.players);
  }

  function applyLoadedLineup(lineup: SavedLineup) {
    setPlayerRevealMode("savedLoad");
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
    applySavedLineupPlayers(lineup);
    setIsScoutOpen(true);
  }

  return (
    <main className="min-h-screen overflow-x-hidden text-white">
      <section className="mx-auto w-full max-w-7xl px-6 pb-12">
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
            ) : (
              <BuilderWorkspace
                lineupPositions={lineupPositions}
                activeBuildPosition={activeBuildPosition}
                customLineup={customLineup}
                buildPlayerSearch={buildPlayerSearch}
                availableBuildPlayers={availableBuildPlayers}
                customLineupOverall={customLineupOverall}
                isLineupComplete={isLineupComplete}
                selectedLineupCount={selectedLineupCount}
                hoveredBuildPlayer={hoveredBuildPlayer}
                playerRevealMode={playerRevealMode}
                onSelectPosition={setActiveBuildPosition}
                onSearchChange={setBuildPlayerSearch}
                onPickPlayer={pickBuildPlayer}
                onHoverPlayer={setHoveredBuildPlayer}
                onRemovePlayer={removeBuildPlayer}
                onScoutLineup={scoutDraftLineup}
                onViewCard={viewPlayerCard}
              />
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
                savedSortLabel={savedSortLabel}
                openSavedDropdown={openSavedDropdown}
                onSearchChange={setSavedLineupSearch}
                onToggleDropdown={() =>
                  setOpenSavedDropdown(
                    openSavedDropdown === "sort" ? null : "sort",
                  )
                }
                onSelectSort={(value) => {
                  setSavedLineupSort(value);
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
              <div className="mx-auto mt-16 max-w-md rounded-lg border border-[#1bc2ec]/35 bg-[#06131d]/80 p-6 text-center shadow-[0_0_28px_rgba(27,194,236,0.16)]">
                <p className="font-michroma text-lg uppercase text-white">
                  No saved lineups yet
                </p>

                <p className="mt-3 font-michroma text-[10px] leading-relaxed text-white/45">
                  Build your first lineup and save it to your court.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("builder");
                    setHasStartedBuilder(false);
                    router.replace("/lineups?tab=builder", { scroll: false });
                  }}
                  className="mt-5 rounded-md border border-[#1bc2ec]/50 bg-[#1bc2ec]/10 px-4 py-3 font-michroma text-[10px] uppercase text-[#1bc2ec] transition hover:bg-[#1bc2ec]/20 hover:text-white"
                >
                  Build Lineup
                </button>
              </div>
            )
          ) : (
            <div className="mx-auto mt-16 max-w-md rounded-lg border border-[#1bc2ec]/35 bg-[#06131d]/80 p-6 text-center shadow-[0_0_28px_rgba(27,194,236,0.16)]">
              <p className="font-michroma text-lg uppercase text-white">
                Sign in to view saved lineups
              </p>

              <p className="mt-3 font-michroma text-[10px] leading-relaxed text-white/45">
                Your saved teams will appear here once you create an account.
              </p>

              <button
                type="button"
                onClick={() => router.push("/signin")}
                className="mt-5 rounded-md border border-[#1bc2ec]/50 bg-[#1bc2ec]/10 px-4 py-3 font-michroma text-[10px] uppercase text-[#1bc2ec] transition hover:bg-[#1bc2ec]/20 hover:text-white"
              >
                Sign In
              </button>
            </div>
          ))}
      </section>

      {isScoutOpen && (
        <ScoutReportModal
          lineupPositions={lineupPositions}
          customLineup={customLineup}
          scoutScores={scoutScores}
          scoutArchetypeColor={scoutArchetypeColor}
          scoutSummary={scoutSummary}
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
            saveLineup(lineupNameInput);
            setIsNamingLineup(false);
            setIsScoutOpen(false);
            setIsLineupSavedOpen(true);
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
            renameSavedLineup(lineupPendingRename.id, renameLineupInput);
            setLineupPendingRename(null);
            setRenameLineupInput("");
          }}
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
