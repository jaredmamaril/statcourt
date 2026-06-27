from nba_api.stats.endpoints import commonallplayers


def sql_string(value):
    if value is None:
        return "null"

    value = str(value)

    if value == "" or value.lower() == "nan":
        return "null"

    return "'" + value.replace("'", "''") + "'"


def sql_int(value):
    if value is None:
        return "null"

    value = str(value)

    if value == "" or value.lower() == "nan":
        return "null"

    return value


all_players = commonallplayers.CommonAllPlayers(
    is_only_current_season=0,
    league_id="00",
    season="2023-24",
)

df = all_players.common_all_players.get_data_frame()


for _, row in df.iterrows():
    print(f"""
insert into public.player_directory (
  nba_id,
  name,
  from_year,
  to_year,
  roster_status,
  team,
  player_code,
  imported_at
)
values (
  {sql_int(row["PERSON_ID"])},
  {sql_string(row["DISPLAY_FIRST_LAST"])},
  {sql_int(row["FROM_YEAR"])},
  {sql_int(row["TO_YEAR"])},
  {sql_string(row["ROSTERSTATUS"])},
  {sql_string(row["TEAM_ABBREVIATION"])},
  {sql_string(row["PLAYERCODE"])},
  now()
)
on conflict (nba_id)
do update set
  name = excluded.name,
  from_year = excluded.from_year,
  to_year = excluded.to_year,
  roster_status = excluded.roster_status,
  team = excluded.team,
  player_code = excluded.player_code,
  imported_at = now();
""")