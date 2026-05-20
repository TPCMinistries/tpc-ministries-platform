-- The /my-prophecies member page expects 4 columns on prophecies that didn't
-- exist (themes, audio_url, video_url, is_featured). The page also queried
-- non-existent columns prophecy_type, status, and user_id. The column name
-- bugs are fixed in code (prophecy_type → type; published filter replaces
-- status; recipient_id (FK → members.id) replaces user_id). This migration
-- adds the 4 UI columns so the page can render audio/video/featured prophecies
-- once content is created. Table currently has 0 rows so this is purely additive.

alter table public.prophecies
  add column if not exists themes text,
  add column if not exists audio_url text,
  add column if not exists video_url text,
  add column if not exists is_featured boolean default false;
