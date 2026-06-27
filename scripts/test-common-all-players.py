from nba_api.stats.endpoints import commonallplayers


all_players = commonallplayers.CommonAllPlayers(
    is_only_current_season=0,
    league_id="00",
    season="2023-24",
)

df = all_players.common_all_players.get_data_frame()

match = df[df["DISPLAY_FIRST_LAST"].str.contains("Joki", case=False, na=False)]

print(match[[
    "PERSON_ID",
    "DISPLAY_FIRST_LAST",
    "FROM_YEAR",
    "TO_YEAR",
    "ROSTERSTATUS",
    "TEAM_ABBREVIATION",
    "PLAYERCODE",
]])