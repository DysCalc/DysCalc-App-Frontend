create view public.student_details as
select
  p.id,
  u.email,
  u.raw_user_meta_data ->> 'full_name'::text as full_name,
  u.raw_user_meta_data ->> 'avatar_url'::text as avatar_url,
  p.nickname,
  p.date_of_birth,
  p.sex
from
  profiles p
  join auth.users u on u.id = p.id
where
  u.raw_user_meta_data ->> 'role'::text = 'STUDENT'::text;
