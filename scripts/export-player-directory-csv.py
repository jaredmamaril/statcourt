from nba_api.stats.endpoints import commonallplayers

from pipeline_common import current_nba_season

# Roster status is relative to the season requested, so always ask for the current one.
all_players = commonallplayers.CommonAllPlayers(
    is_only_current_season=0,
    league_id="00",
    season=current_nba_season(),
)

df = all_players.common_all_players.get_data_frame()

output = df.rename(columns={
    "PERSON_ID": "nba_id",
    "DISPLAY_FIRST_LAST": "name",
    "FROM_YEAR": "from_year",
    "TO_YEAR": "to_year",
    "ROSTERSTATUS": "roster_status",
    "TEAM_ABBREVIATION": "team",
    "PLAYERCODE": "player_code",
})

output = output[[
    "nba_id",
    "name",
    "from_year",
    "to_year",
    "roster_status",
    "team",
    "player_code",
]]

output.to_csv("scripts/player-directory.csv", index=False, encoding="utf-8")