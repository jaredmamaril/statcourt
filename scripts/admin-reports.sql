begin;

alter table public.user_reports
alter column status set default 'open';

update public.user_reports
set status = 'open'
where status is null
   or status not in ('open', 'reviewed', 'resolved', 'dismissed');

do $$
declare
  status_constraint_name text;
begin
  select constraint_name
  into status_constraint_name
  from information_schema.check_constraints
  where constraint_schema = 'public'
    and constraint_name in (
      select constraint_name
      from information_schema.constraint_column_usage
      where table_schema = 'public'
        and table_name = 'user_reports'
        and column_name = 'status'
    )
  limit 1;

  if status_constraint_name is not null then
    execute format(
      'alter table public.user_reports drop constraint %I',
      status_constraint_name
    );
  end if;
end $$;

alter table public.user_reports
add constraint user_reports_status_check
check (status in ('open', 'reviewed', 'resolved', 'dismissed'));

commit;
