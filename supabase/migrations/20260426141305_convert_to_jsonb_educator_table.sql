-- =========================================
-- 0. Safety: drop old constraints if any
-- =========================================

alter table public.educator
drop constraint if exists check_undergrad_format,
drop constraint if exists check_masters_format,
drop constraint if exists check_doctorate_format,
drop constraint if exists educator_undergrad_check,
drop constraint if exists educator_masters_check,
drop constraint if exists educator_doctorate_check;

-- =========================================
-- 1. Create validator function
-- =========================================

create or replace function public.validate_education_jsonb(obj jsonb)
returns boolean
language plpgsql
as $$
begin
  if obj is null then
    return false;
  end if;

  if jsonb_typeof(obj) <> 'object' then
    return false;
  end if;

  if not (obj ? 'program' and obj ? 'school' and obj ? 'year') then
    return false;
  end if;

  if jsonb_typeof(obj->'program') <> 'string' then
    return false;
  end if;

  if jsonb_typeof(obj->'school') <> 'string' then
    return false;
  end if;

  if jsonb_typeof(obj->'year') <> 'string' then
    return false;
  end if;

  if not (obj->>'year' ~ '^[0-9]{4}-[0-9]{4}$') then
    return false;
  end if;

  return true;
end;
$$;

-- =========================================
-- 2. Convert jsonb[] → jsonb (take first element)
-- =========================================

alter table public.educator
  alter column undergrad type jsonb using undergrad[1],
  alter column masters type jsonb using masters[1],
  alter column doctorate type jsonb using doctorate[1];

-- =========================================
-- 3. Auto-fix bad data (so constraint won’t fail)
-- =========================================

update public.educator
set undergrad = jsonb_build_object(
  'program', coalesce(undergrad->>'program', 'Unknown'),
  'school', coalesce(undergrad->>'school', 'Unknown'),
  'year', case
    when undergrad->>'year' ~ '^[0-9]{4}-[0-9]{4}$'
      then undergrad->>'year'
    else '2000-2004'
  end
)
where not public.validate_education_jsonb(undergrad);

update public.educator
set masters = jsonb_build_object(
  'program', coalesce(masters->>'program', 'Unknown'),
  'school', coalesce(masters->>'school', 'Unknown'),
  'year', case
    when masters->>'year' ~ '^[0-9]{4}-[0-9]{4}$'
      then masters->>'year'
    else '2000-2004'
  end
)
where masters is not null
  and not public.validate_education_jsonb(masters);

update public.educator
set doctorate = jsonb_build_object(
  'program', coalesce(doctorate->>'program', 'Unknown'),
  'school', coalesce(doctorate->>'school', 'Unknown'),
  'year', case
    when doctorate->>'year' ~ '^[0-9]{4}-[0-9]{4}$'
      then doctorate->>'year'
    else '2000-2004'
  end
)
where doctorate is not null
  and not public.validate_education_jsonb(doctorate);

-- =========================================
-- 4. Add constraints safely
-- =========================================

alter table public.educator
  add constraint educator_undergrad_check
  check (public.validate_education_jsonb(undergrad));

alter table public.educator
  add constraint educator_masters_check
  check (
    masters is null or public.validate_education_jsonb(masters)
  );

alter table public.educator
  add constraint educator_doctorate_check
  check (
    doctorate is null or public.validate_education_jsonb(doctorate)
  );

-- =========================================
-- 5. Optional: add indexes
-- =========================================

create index if not exists idx_educator_undergrad_gin
on public.educator using gin (undergrad);

create index if not exists idx_educator_masters_gin
on public.educator using gin (masters);

create index if not exists idx_educator_doctorate_gin
on public.educator using gin (doctorate);