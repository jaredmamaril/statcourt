"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthPrompt } from "../components/auth/auth-prompt";
import { useAuthUser } from "../lib/use-auth-user";
import {
  type DefaultPlayerView,
  useUserSettings,
} from "../lib/use-user-settings";
import { logUserActivity } from "../components/user-activity";
import { DatabaseErrorState } from "../components/loading/database-error-state";
import { DatabaseLoadingState } from "../components/loading/database-loading-state";
import {
  players as fallbackPlayers,
  type LineupSlot,
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
  getLineupsAfterSave,
} from "../components/lineups/saved/saved-lineup-list-helpers";
import { clearSavedBuilderDraft } from "../components/players/player-storage";

import { LoadingLineupModal } from "../components/lineups/scout/loading-lineup-modal";
import { getScoutReportDisplay } from "../components/lineups/scout/scout-report-display";
import { ScoutReportModal } from "../components/lineups/scout/scout-report-modal";
import {
  LOAD_LINEUP_EXIT_DURATION,
  LOAD_LINEUP_PROGRESS_INTERVAL,
  LOAD_LINEUP_TOTAL_DURATION,
  SCOUT_LINEUP_PROGRESS_INTERVAL,
  loadLineupSteps,
  scoutLineupSteps,
} from "../components/lineups/scout/lineup-loading-steps";

const statProfileLabels: Record<PlayerStatProfileMode | "all", string> = {
  all: "All Profiles",
  career: "Career",
  peak: "3-Year Peak",
  current: "Latest Season",
};

function getPreferredBuilderSlots(player: Player): LineupSlot[] {
  if (player.position === "G") return ["PG", "SG"];
  if (player.position === "F") return ["SF", "PF"];

  return ["C", "PF"];
}

function getRequestedBuilderProfile(
  value: string | null,
): PlayerStatProfileMode | null {
  if (value === "career" || value === "peak" || value === "current") {
    return value;
  }

  return null;
}

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
  const { user } = useAuthUser();
  const { settings, isLoadingSettings } = useUserSettings();

  // Refs and routing
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab");
  const initialBuilderPlayer = searchParams.get("player");
  const lineupSectionRef = useRef<HTMLDivElement>(null);
  const builderStartPlayerConsumedRef = useRef("");
  const hasAppliedDefaultBuilderViewRef = useRef(false);

  // Page state
  const [activeTab, setActiveTab] = useState<LineupTab>(
    initialTab === "builder" || initialTab === "saved" ? initialTab : "featured",
  );
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(true);
  const [playerLoadError, setPlayerLoadError] = useState("");
  const [builderDisplayView, setBuilderDisplayView] =
    useState<DefaultPlayerView>("cards");

  useEffect(() => {
    if (isLoadingSettings || hasAppliedDefaultBuilderViewRef.current) return;

    const timeoutId = window.setTimeout(() => {
      setBuilderDisplayView(settings.defaultPlayerView);
      hasAppliedDefaultBuilderViewRef.current = true;
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [isLoadingSettings, settings.defaultPlayerView]);

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
  const [shouldScrollToFeaturedDetail, setShouldScrollToFeaturedDetail] =
    useState(false);

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
  const [lineupPendingLoad, setLineupPendingLoad] =
    useState<SavedLineup | null>(null);

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
  const deferredSavedLineupSearch = useDeferredValue(savedLineupSearch);

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
    buildPlayerSearch,
    setBuildPlayerSearch,
    builderStatProfile,
    setBuilderStatProfile,
    playerRevealMode,
    setPlayerRevealMode,
    selectedCustomPlayerSlots,
    averageLineupRating,
    scoutLineupRating,
    builderLineupRating,
    availableBuildPlayers,
    selectedLineupCount,
    isLineupComplete,
    hasExistingDraft,
    pickBuildPlayer,
    placeBuildPlayer,
    moveBuildPlayer,
    removeBuildPlayer,
    resetDraft,
    startNewDraft,
    continueDraft,
  } = useLineupBuilder({
    players,
    lineupPositions,
    defaultStatProfile: settings.defaultStatMode,
    isDefaultStatProfileReady: !isLoadingSettings,
    initialHasStartedBuilder:
      initialTab === "builder" && Boolean(initialBuilderPlayer),
  });

  const builderPlayerName = searchParams.get("player");
  const requestedBuilderSlot = searchParams.get("slot") as LineupSlot | null;
  const requestedBuilderProfile = getRequestedBuilderProfile(
    searchParams.get("profile"),
  );
  const customLineupRef = useRef(customLineup);

  useEffect(() => {
    customLineupRef.current = customLineup;
  }, [customLineup]);

  useEffect(() => {
    if (!builderPlayerName || players.length === 0) return;

    const builderStartKey = `${builderPlayerName}:${requestedBuilderSlot ?? ""}:${requestedBuilderProfile ?? ""}`;

    if (builderStartPlayerConsumedRef.current === builderStartKey) return;

    const builderPlayer = players.find(
      (player) => player.name === builderPlayerName,
    );

    if (!builderPlayer) return;

    builderStartPlayerConsumedRef.current = builderStartKey;

    const preferredSlots = getPreferredBuilderSlots(builderPlayer);
    const currentLineup = customLineupRef.current;
    const openPreferredSlot = preferredSlots.find(
      (slot) => currentLineup[slot] === "",
    );
    const openAnySlot = lineupPositions.find(
      (slot) => currentLineup[slot] === "",
    );
    const requestedTargetSlot =
      requestedBuilderSlot && lineupPositions.includes(requestedBuilderSlot)
        ? requestedBuilderSlot
        : null;
    const targetSlot =
      requestedTargetSlot ?? openPreferredSlot ?? openAnySlot ?? preferredSlots[0];

    const frameId = requestAnimationFrame(() => {
      setActiveTab("builder");
      setHasStartedBuilder(true);
      setActiveBuildPosition(targetSlot);
      setBuildPlayerSearch("");
      if (requestedBuilderProfile) {
        setBuilderStatProfile(requestedBuilderProfile);
      }
      setPlayerRevealMode("instant");
      setCustomLineup((currentLineup) => ({
        ...currentLineup,
        [targetSlot]: builderPlayer.name,
      }));

      router.replace("/lineups?tab=builder", { scroll: false });
    });

    return () => cancelAnimationFrame(frameId);
  }, [
    builderPlayerName,
    players,
    requestedBuilderProfile,
    requestedBuilderSlot,
    router,
    setActiveBuildPosition,
    setBuildPlayerSearch,
    setBuilderStatProfile,
    setCustomLineup,
    setHasStartedBuilder,
    setPlayerRevealMode,
  ]);

  const scoutStatProfile =
    scoutedSavedLineup?.statProfile ?? builderStatProfile;

  // Scout report data
  const scoutDisplay = useMemo(
    () =>
      getScoutReportDisplay({
        selectedCustomPlayerSlots,
        scoutedSavedLineup,
        statProfileMode: scoutStatProfile,
      }),
    [selectedCustomPlayerSlots, scoutedSavedLineup, scoutStatProfile],
  );

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
  } = scoutDisplay;

  // Featured lineup data
  const selectedCategoryColor = getLineupCategoryColor(selectedLineupCategory);

  const selectedLineup: LineupDetail | null = selectedLineupName
    ? lineupDetails[selectedLineupName]
    : null;

  const selectedLineupAchievements = getLineupAchievements(selectedLineup);

  const selectedLineupNames = getLineupNamesForCategory(selectedLineupCategory);

  // Saved lineup derived data
  const filteredSavedLineups = useMemo(
    () =>
      getFilteredSavedLineups({
        savedLineups,
        savedLineupSearch: deferredSavedLineupSearch,
        savedLineupSort,
        savedLineupProfileFilter,
        savedLineupTierFilter,
        savedLineupArchetypeFilter,
      }),
    [
      savedLineups,
      deferredSavedLineupSearch,
      savedLineupSort,
      savedLineupProfileFilter,
      savedLineupTierFilter,
      savedLineupArchetypeFilter,
    ],
  );

  // Page display values
  const shouldShowTopText =
    activeTab === "featured" || activeTab === "saved" || hasStartedBuilder;

  const savedSortLabel = getSavedSortLabel(savedLineupSort);
  const savedProfileLabel = statProfileLabels[savedLineupProfileFilter];
  const scoutStatProfileLabel = statProfileLabels[scoutStatProfile];

  // Scout report animation
  const displayedScoutOverall = scoutScores.overall;

  // Page actions
  useEffect(() => {
    if (!shouldScrollToFeaturedDetail || !selectedLineupCategory) return;

    let animationFrameId = 0;
    let isCancelled = false;

    const scrollTimer = window.setTimeout(() => {
      animationFrameId = window.requestAnimationFrame(() => {
        const lineupSection = lineupSectionRef.current;

        if (!lineupSection) return;

        const targetTop =
          lineupSection.getBoundingClientRect().top + window.scrollY - 78;

        const startTop = window.scrollY;
        const endTop = Math.max(targetTop, 0);
        const distance = endTop - startTop;
        const duration = 850;
        const startTime = performance.now();

        if (settings.reducedMotion) {
          window.scrollTo(0, endTop);
          setShouldScrollToFeaturedDetail(false);
          return;
        }

        function easeInOutCubic(progress: number) {
          return progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        }

        function scrollStep(currentTime: number) {
          if (isCancelled) return;

          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easedProgress = easeInOutCubic(progress);

          window.scrollTo(0, startTop + distance * easedProgress);

          if (progress < 1) {
            animationFrameId = window.requestAnimationFrame(scrollStep);
            return;
          }

          setShouldScrollToFeaturedDetail(false);
        }

        animationFrameId = window.requestAnimationFrame(scrollStep);
      });
    }, 80);

    return () => {
      isCancelled = true;
      window.clearTimeout(scrollTimer);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [
    selectedLineupCategory,
    settings.reducedMotion,
    shouldScrollToFeaturedDetail,
  ]);

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
    setShouldScrollToFeaturedDetail(true);
  }

  function viewPlayerCard(playerName: string) {
    router.push(`/players/${encodeURIComponent(playerName)}`);
  }

  // Builder actions
  function scoutDraftLineup() {
    setScoutedSavedLineup(null);
    setIsScoutingLineup(true);
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

    const nextLineupName =
      lineupName.trim() || `Lineup ${savedLineups.length + 1}`;

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
      isPublic: false,
      badges: scoutReport.badges,
    });

    const newLineup = createSavedLineup(newLineupInput);

    updateSavedLineups(
      getLineupsAfterSave(savedLineups, newLineup, overwriteLineupId),
    );
    void logUserActivity({
      user,
      activityType: "save_lineup",
      label: `${overwriteLineupId ? "Updated" : "Saved"} lineup ${newLineup.name}`,
      href: "/lineups?tab=saved",
      metadata: {
        lineupId: overwriteLineupId ?? newLineup.id,
        lineupName: newLineup.name,
        statProfile: newLineup.statProfile,
        overall: newLineup.overall,
      },
    });
    clearSavedBuilderDraft();
    resetDraft();
  }

  function requestSaveLineup(lineupName: string) {
    const nextLineupName =
      lineupName.trim() || `Lineup ${savedLineups.length + 1}`;
    const existingLineup = getLineupNameConflict(savedLineups, nextLineupName);

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
      const deletedLineup = savedLineups.find((lineup) => lineup.id === lineupId);

      updateSavedLineups(getLineupsAfterDelete(savedLineups, lineupId));
      if (deletedLineup) {
        void logUserActivity({
          user,
          activityType: "delete_lineup",
          label: `Deleted lineup ${deletedLineup.name}`,
          href: "/lineups?tab=saved",
          metadata: {
            lineupId,
            lineupName: deletedLineup.name,
          },
        });
      }
      onDeleted?.();
    });
  }

  function renameSavedLineup(lineupId: string, newName: string) {
    requireAuth("Sign in to rename saved lineups", () => {
      const renamedLineup = savedLineups.find((lineup) => lineup.id === lineupId);

      updateSavedLineups(
        getLineupsAfterRename(savedLineups, lineupId, newName),
      );
      if (renamedLineup) {
        void logUserActivity({
          user,
          activityType: "save_lineup",
          label: `Renamed lineup ${renamedLineup.name} to ${newName}`,
          href: "/lineups?tab=saved",
          metadata: {
            lineupId,
            previousName: renamedLineup.name,
            nextName: newName,
          },
        });
      }
    });
  }

  function toggleSavedLineupPublic(lineup: SavedLineup) {
    requireAuth("Sign in to update lineup visibility", () => {
      const nextIsPublic = !lineup.isPublic;

      updateSavedLineups(
        savedLineups.map((savedLineup) =>
          savedLineup.id === lineup.id
            ? {
                ...savedLineup,
                isPublic: nextIsPublic,
              }
            : savedLineup,
        ),
      );

      void logUserActivity({
        user,
        activityType: "save_lineup",
        label: `${nextIsPublic ? "Published" : "Privatized"} lineup ${lineup.name}`,
        href: "/lineups?tab=saved",
        metadata: {
          lineupId: lineup.id,
          lineupName: lineup.name,
          isPublic: nextIsPublic,
        },
      });
    });
  }

  function requestRenameSavedLineup(lineupId: string, newName: string) {
    const lineupToRename = savedLineups.find(
      (lineup) => lineup.id === lineupId,
    );
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
    setLineupPendingLoad(null);
  }

  function loadSavedLineup(lineup: SavedLineup) {
    setLineupPendingLoad(lineup);
    setIsLoadingSavedLineup(true);
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
          <section
            key="featured"
            className="min-h-[calc(100vh-140px)] animate-[pageEnter_220ms_ease-out_both]"
          >
            <FeaturedLineupCategoryGrid
              selectedLineupCategory={selectedLineupCategory}
              onSelectCategory={selectFeaturedLineupCategory}
            />

            {selectedLineupCategory ? (
              <div
                ref={lineupSectionRef}
                className="mt-4 min-h-136 scroll-mt-24 lg:mt-8 lg:min-h-168"
              >
                {isLoadingPlayers ? (
                  <DatabaseLoadingState
                    title="Loading Featured Players"
                    description="Syncing lineup headshots and profiles..."
                  />
                ) : playerLoadError ? (
                  <DatabaseErrorState
                    title="Featured Players Limited"
                    description="Showing fallback player data for featured lineups."
                  />
                ) : (
                  <FeaturedLineupDetail
                    players={players}
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
              </div>
            ) : null}
          </section>
        )}

        {activeTab === "builder" && (
          <section
            key="builder"
            className="min-h-[calc(100vh-140px)] animate-[pageEnter_220ms_ease-out_both]"
          >
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
                  displayView={builderDisplayView}
                  availableBuildPlayers={availableBuildPlayers}
                  averageLineupRating={averageLineupRating}
                  scoutLineupRating={scoutLineupRating}
                  isLineupComplete={isLineupComplete}
                  selectedLineupCount={selectedLineupCount}
                  playerRevealMode={playerRevealMode}
                  onSelectPosition={setActiveBuildPosition}
                  onSearchChange={setBuildPlayerSearch}
                  onStatProfileChange={setBuilderStatProfile}
                  onDisplayViewChange={setBuilderDisplayView}
                  onPickPlayer={pickBuildPlayer}
                  onPlacePlayer={placeBuildPlayer}
                  onMovePlayer={moveBuildPlayer}
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
                onTogglePublicLineup={toggleSavedLineupPublic}
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
            <div className="mx-auto mt-6 max-w-75 animate-[pageEnter_220ms_ease-out_both] rounded-lg border border-[#1bc2ec]/35 bg-[#06131d]/80 p-3.5 text-center shadow-[0_0_22px_rgba(27,194,236,0.14)] lg:mt-16 lg:max-w-md lg:p-6 lg:shadow-[0_0_28px_rgba(27,194,236,0.16)]">
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
          displayedScoutOverall={displayedScoutOverall}
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
          existingProfileLabel={
            statProfileLabels[
              lineupPendingOverwrite.existingLineup.statProfile ?? "career"
            ]
          }
          nextProfileLabel={
            statProfileLabels[
              lineupPendingOverwrite.type === "save"
                ? builderStatProfile
                : (lineupPendingRename?.statProfile ?? "career")
            ]
          }
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
          statProfileLabel={statProfileLabels[builderStatProfile]}
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
          steps={loadLineupSteps}
          totalDuration={LOAD_LINEUP_TOTAL_DURATION}
          progressInterval={LOAD_LINEUP_PROGRESS_INTERVAL}
          exitDuration={LOAD_LINEUP_EXIT_DURATION}
          onComplete={() => {
            if (lineupPendingLoad) {
              applyLoadedLineup(lineupPendingLoad);
            }
          }}
        />
      )}

      {isScoutingLineup && (
        <LoadingLineupModal
          steps={scoutLineupSteps}
          totalDuration={2400}
          progressInterval={SCOUT_LINEUP_PROGRESS_INTERVAL}
          exitDuration={300}
          onComplete={() => {
            setIsScoutingLineup(false);
            setIsScoutOpen(true);
          }}
        />
      )}
    </main>
  );
}
