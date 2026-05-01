create or replace function public.validate_educational_jsonb_array(arr jsonb[])
returns boolean
language plpgsql
as $$
declare
  item jsonb;
begin
  -- array must not be null
  if arr is null then
    return false;
  end if;

  foreach item in array arr loop

    -- must be an object
    if jsonb_typeof(item) <> 'object' then
      return false;
    end if;

    -- required keys
    if not (item ? 'program' and item ? 'school' and item ? 'year') then
      return false;
    end if;

    -- types must be string
    if jsonb_typeof(item->'program') <> 'string' then
      return false;
    end if;

    if jsonb_typeof(item->'school') <> 'string' then
      return false;
    end if;

    if jsonb_typeof(item->'year') <> 'string' then
      return false;
    end if;

    -- enforce YYYY-YYYY format
    if not (item->>'year' ~ '^[0-9]{4}-[0-9]{4}$') then
      return false;
    end if;

  end loop;

  return true;
end;
$$;

alter table public.educator
add constraint check_undergrad_format
check (public.validate_educational_jsonb_array(undergrad));

alter table public.educator
add constraint check_masters_format
check (
  masters is null
  or public.validate_educational_jsonb_array(masters)
);

alter table public.educator
add constraint check_doctorate_format
check (
  doctorate is null
  or public.validate_educational_jsonb_array(doctorate)
);