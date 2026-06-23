"use client";

import type {
  LineupTab,
  LineupDetail,
  SavedLineup,
  NewSavedLineupInput,
} from "../components/lineups/shared/lineup-types";

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

import {
  EMPTY_LINEUP,
  getAvailableBuildPlayers,
  getCustomLineupOverall,
  getSelectedCustomPlayerSlots,
  type PlayerRevealMode,
} from "../components/lineups/builder/builder-lineup-helpers";

import { BuilderWorkspace } from "../components/lineups/builder/builder-workspace";

import {
  getFilteredSavedLineups,
  getSavedSortLabel,
} from "../components/lineups/saved/saved-lineup-filters";

import { LineupPageHeader } from "../components/lineups/shared/lineup-page-header";
import { SavedLineupsSection } from "../components/lineups/saved/saved-lineups-section";

import {
  LOAD_LINEUP_EXIT_DURATION,
  LOAD_LINEUP_PROGRESS_INTERVAL,
  LOAD_LINEUP_TOTAL_DURATION,
  loadLineupSteps,
  scoutLineupSteps,
} from "../components/lineups/scout/lineup-loading-steps";

import { NameLineupModal } from "../components/lineups/saved/name-lineup-modal";
import { DeleteLineupModal } from "../components/lineups/saved/delete-lineup-modal";
import { LineupDeletedModal } from "../components/lineups/saved/lineup-deleted-modal";
import { LineupSavedModal } from "../components/lineups/saved/lineup-saved-modal";
import { RenameLineupModal } from "../components/lineups/saved/rename-lineup-modal";
import { LoadingLineupModal } from "../components/lineups/scout/loading-lineup-modal";

import { getScoutReportDisplay } from "../components/lineups/scout/scout-report-display";
import { ScoutReportModal } from "../components/lineups/scout/scout-report-modal";

import { useAnimatedScoutOverall } from "../components/lineups/scout/use-animated-scout-overall";
import { useSavedLineups } from "../components/lineups/saved/use-saved-lineups";

import type { Position } from "../components/court-data";
import { useRef, useState } from "react";

import { useRouter } from "next/navigation";

export default function Lineups() {
  const router = useRouter();
  const lineupSectionRef = useRef<HTMLDivElement>(null);

  // Tabs
  const [activeTab, setActiveTab] = useState<LineupTab>("featured");

  // Featured lineups
  const [selectedLineupCategory, setSelectedLineupCategory] = useState<
    LineupCategory | ""
  >("");
  const [selectedLineupName, setSelectedLineupName] = useState<LineupName | "">(
    "",
  );
  const [hoveredLineupPlayer, setHoveredLineupPlayer] = useState("");

  // Builder
  const [hasStartedBuilder, setHasStartedBuilder] = useState(false);
  const [customLineup, setCustomLineup] =
    useState<Record<Position, string>>(EMPTY_LINEUP);
  const [activeBuildPosition, setActiveBuildPosition] =
    useState<Position>("PG");
  const [hoveredBuildPlayer, setHoveredBuildPlayer] = useState("");
  const [buildPlayerSearch, setBuildPlayerSearch] = useState("");

  // Saved lineups
  const { savedLineups, updateSavedLineups } = useSavedLineups();
  const [savedLineupSearch, setSavedLineupSearch] = useState("");
  const [savedLineupSort, setSavedLineupSort] = useState("highestOvr");
  const [savedLineupTierFilter, setSavedLineupTierFilter] = useState("");
  const [savedLineupArchetypeFilter, setSavedLineupArchetypeFilter] =
    useState("");
  const [openSavedDropdown, setOpenSavedDropdown] = useState<string | null>(
    null,
  );

  // Modals
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
  const [playerRevealMode, setPlayerRevealMode] =
    useState<PlayerRevealMode>("instant");

  // Builder derived data
  const selectedCustomPlayerSlots = getSelectedCustomPlayerSlots(
    customLineup,
    lineupPositions,
  );

  const selectedCustomPlayers = selectedCustomPlayerSlots.map(
    (slot) => slot.player,
  );

  const customLineupOverall = getCustomLineupOverall(selectedCustomPlayerSlots);

  const activePositionPlayerName = customLineup[activeBuildPosition];

  const availableBuildPlayers = getAvailableBuildPlayers({
    buildPlayerSearch,
    activeBuildPosition,
    activePositionPlayerName,
    selectedCustomPlayers,
  });

  const selectedLineupCount = selectedCustomPlayers.length;

  const isLineupComplete = selectedLineupCount === lineupPositions.length;

  const hasExistingDraft = lineupPositions.some(
    (position) => customLineup[position] !== "",
  );

  // Scout report values
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

  // Featured lineup display values
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

  // Actions
  function changeTab(tab: LineupTab) {
    setActiveTab(tab);

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

  function scoutDraftLineup() {
    setScoutedSavedLineup(null);
    setIsScoutingLineup(true);
    setScoutLineupStep(0);
    setScoutLineupProgress(0);
    setIsScoutLineupExiting(false);

    const totalDuration = 2400;
    const progressInterval = 40;
    const exitDuration = 300;
    const stepDuration = totalDuration / scoutLineupSteps.length;

    scoutLineupSteps.forEach((_, index) => {
      window.setTimeout(() => {
        setScoutLineupStep(index);
      }, index * stepDuration);
    });

    const progressTimer = window.setInterval(() => {
      setScoutLineupProgress((currentProgress) => {
        const nextProgress =
          currentProgress + 100 / (totalDuration / progressInterval);

        return Math.min(nextProgress, 100);
      });
    }, progressInterval);

    window.setTimeout(() => {
      window.clearInterval(progressTimer);

      setScoutLineupProgress(100);
      setIsScoutLineupExiting(true);

      window.setTimeout(() => {
        setIsScoutingLineup(false);
        setIsScoutLineupExiting(false);
        setIsScoutOpen(true);
      }, exitDuration);
    }, totalDuration);
  }

  // Builder actions
  function pickBuildPlayer(playerName: string) {
    setPlayerRevealMode("instant");

    setCustomLineup((prev) => ({
      ...prev,
      [activeBuildPosition]: playerName,
    }));
  }

  function removeBuildPlayer(position: Position) {
    setCustomLineup((prev) => ({
      ...prev,
      [position]: "",
    }));
  }

  function resetDraft() {
    setCustomLineup(EMPTY_LINEUP);
    setActiveBuildPosition("PG");
    setBuildPlayerSearch("");
  }

  function startNewDraft() {
    resetDraft();
    setHasStartedBuilder(true);
  }

  function continueDraft() {
    setBuildPlayerSearch("");
    setHasStartedBuilder(true);
  }

  // Saved lineup actions
  function saveLineup(lineupName: string) {
    if (!customLineupOverall) return;

    const newLineupInput: NewSavedLineupInput = {
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
    };

    const newLineup: SavedLineup = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...newLineupInput,
    };

    const nextLineups = [newLineup, ...savedLineups];

    updateSavedLineups(nextLineups);
  }

  function deleteSavedLineup(lineupId: string) {
    const nextLineups = savedLineups.filter((lineup) => lineup.id !== lineupId);

    updateSavedLineups(nextLineups);
  }

  function renameSavedLineup(lineupId: string, newName: string) {
    const nextLineups = savedLineups.map((lineup) =>
      lineup.id === lineupId
        ? {
            ...lineup,
            name: newName.trim() || lineup.name,
          }
        : lineup,
    );

    updateSavedLineups(nextLineups);
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

    const stepDuration = LOAD_LINEUP_TOTAL_DURATION / loadLineupSteps.length;

    loadLineupSteps.forEach((_, index) => {
      window.setTimeout(() => {
        setLoadLineupStep(index);
      }, index * stepDuration);
    });

    const progressTimer = window.setInterval(() => {
      setLoadLineupProgress((currentProgress) => {
        const nextProgress =
          currentProgress +
          100 / (LOAD_LINEUP_TOTAL_DURATION / LOAD_LINEUP_PROGRESS_INTERVAL);

        return Math.min(nextProgress, 100);
      });
    }, LOAD_LINEUP_PROGRESS_INTERVAL);

    window.setTimeout(() => {
      window.clearInterval(progressTimer);

      setLoadLineupProgress(100);
      setIsLoadLineupExiting(true);

      window.setTimeout(() => {
        applyLoadedLineup(lineup);
      }, LOAD_LINEUP_EXIT_DURATION);
    }, LOAD_LINEUP_TOTAL_DURATION);
  }

  function scoutSavedLineup(lineup: SavedLineup) {
    setScoutedSavedLineup(lineup);
    applySavedLineupPlayers(lineup);
    setIsScoutOpen(true);
  }

  // Navigation
  function viewPlayerCard(playerName: string) {
    router.push(`/players?player=${encodeURIComponent(playerName)}`);
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

        {activeTab === "saved" && (
          <SavedLineupsSection
            savedLineups={savedLineups}
            filteredSavedLineups={filteredSavedLineups}
            savedLineupSearch={savedLineupSearch}
            savedLineupSort={savedLineupSort}
            savedSortLabel={savedSortLabel}
            openSavedDropdown={openSavedDropdown}
            onSearchChange={setSavedLineupSearch}
            onToggleDropdown={() =>
              setOpenSavedDropdown(openSavedDropdown === "sort" ? null : "sort")
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
        )}
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
            setLineupNameInput("");
            setIsNamingLineup(true);
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

      {lineupPendingDelete && (
        <DeleteLineupModal
          lineup={lineupPendingDelete}
          onCancel={() => setLineupPendingDelete(null)}
          onConfirm={() => {
            deleteSavedLineup(lineupPendingDelete.id);
            setLineupPendingDelete(null);
            setIsLineupDeletedOpen(true);
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
