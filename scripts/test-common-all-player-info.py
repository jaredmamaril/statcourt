from nba_api.stats.endpoints import commonplayerinfo

info = commonplayerinfo.CommonPlayerInfo(player_id=76003)
df = info.common_player_info.get_data_frame()

print(df[[
    "DISPLAY_FIRST_LAST",
    "TEAM_ABBREVIATION",
    "TEAM_NAME",
    "FROM_YEAR",
    "TO_YEAR",
    "JERSEY",
    "POSITION",
]])