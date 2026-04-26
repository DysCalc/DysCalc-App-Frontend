-- Migration: create educator_details view
-- Joins educators, auth.users, profiles, and classrooms
-- to expose a flat, queryable view for educator data.

CREATE OR REPLACE VIEW public.educator_details AS
SELECT
    e.id,
    u.email,
    u.raw_user_meta_data->>'full_name' AS full_name,
    u.raw_user_meta_data->>'avatar_url' AS avatar_url,
    p.nickname,
    COUNT(c.id) AS classroom_count
FROM public.educator e
JOIN auth.users u ON u.id = e.id
LEFT JOIN public.profiles p ON p.id = e.id
LEFT JOIN public.classrooms c ON c.educator_id = e.id
GROUP BY e.id, u.email, u.raw_user_meta_data, p.nickname;

-- Grant read access to authenticated users
GRANT SELECT ON public.educator_details TO authenticated;
