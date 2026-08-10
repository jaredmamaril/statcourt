begin;

create table if not exists public.security_events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  event_name text not null,
  severity text not null,
  user_id uuid null,
  route text null,
  action text null,
  outcome text not null,
  reason_code text null,
  request_id text null,
  client_hash text null,
  metadata jsonb not null default '{}'::jsonb,

  constraint security_events_severity_check
    check (severity in ('low', 'medium', 'high', 'critical')),
  constraint security_events_outcome_check
    check (outcome in ('success', 'blocked', 'failed')),
  constraint security_events_event_name_length
    check (char_length(event_name) between 1 and 80),
  constraint security_events_reason_code_length
    check (reason_code is null or char_length(reason_code) <= 80),
  constraint security_events_action_length
    check (action is null or char_length(action) <= 80),
  constraint security_events_route_length
    check (route is null or char_length(route) <= 160),
  constraint security_events_request_id_length
    check (request_id is null or char_length(request_id) <= 120),
  constraint security_events_client_hash_length
    check (client_hash is null or char_length(client_hash) <= 128)
);

create index if not exists security_events_created_at_idx
on public.security_events using btree (created_at desc);

create index if not exists security_events_user_created_at_idx
on public.security_events using btree (user_id, created_at desc);

create index if not exists security_events_event_created_at_idx
on public.security_events using btree (event_name, created_at desc);

alter table public.security_events enable row level security;

drop policy if exists "StatCourt deny public security event access"
on public.security_events;

-- No anon/authenticated policies are created. Only service-role server code can
-- write/read this table because service role bypasses RLS.

commit;
