-- Follow-up to 20260520_revoke_function_execute.sql: the previous REVOKE FROM
-- anon, authenticated didn't actually take effect because both roles inherit
-- EXECUTE via PUBLIC role membership. Revoke from PUBLIC directly and grant
-- explicitly to service_role.

revoke execute on function public.auto_subscribe_new_member() from public;
revoke execute on function public.calculate_engagement_score(uuid) from public;
revoke execute on function public.cleanup_expired_insights() from public;
revoke execute on function public.complete_challenge_day(uuid, integer, text) from public;
revoke execute on function public.current_user_has_role(character varying) from public;
revoke execute on function public.get_admin_unread_counts() from public;
revoke execute on function public.get_collection_progress(uuid, uuid) from public;
revoke execute on function public.get_member_profile_stats(uuid) from public;
revoke execute on function public.get_streak_stats(uuid) from public;
revoke execute on function public.get_unread_voice_count() from public;
revoke execute on function public.handle_new_user() from public;
revoke execute on function public.increment_play_count(uuid) from public;
revoke execute on function public.is_admin() from public;
revoke execute on function public.is_tpc_admin() from public;
revoke execute on function public.join_challenge(uuid) from public;
revoke execute on function public.log_community_activity(uuid, character varying, character varying, text, jsonb, boolean) from public;
revoke execute on function public.log_role_change() from public;
revoke execute on function public.mark_voice_message_read(uuid) from public;
revoke execute on function public.record_activity(uuid, text, text) from public;
revoke execute on function public.run_prophecy_scheduler() from public;
revoke execute on function public.trigger_update_streak() from public;
revoke execute on function public.update_member_streak(uuid) from public;
revoke execute on function public.use_streak_freeze(uuid, text) from public;

-- service_role keeps EXECUTE for server-side admin operations
grant execute on function public.auto_subscribe_new_member() to service_role;
grant execute on function public.calculate_engagement_score(uuid) to service_role;
grant execute on function public.cleanup_expired_insights() to service_role;
grant execute on function public.complete_challenge_day(uuid, integer, text) to service_role;
grant execute on function public.current_user_has_role(character varying) to service_role;
grant execute on function public.get_admin_unread_counts() to service_role;
grant execute on function public.get_collection_progress(uuid, uuid) to service_role;
grant execute on function public.get_member_profile_stats(uuid) to service_role;
grant execute on function public.get_streak_stats(uuid) to service_role;
grant execute on function public.get_unread_voice_count() to service_role;
grant execute on function public.handle_new_user() to service_role;
grant execute on function public.increment_play_count(uuid) to service_role;
grant execute on function public.is_admin() to service_role;
grant execute on function public.is_tpc_admin() to service_role;
grant execute on function public.join_challenge(uuid) to service_role;
grant execute on function public.log_community_activity(uuid, character varying, character varying, text, jsonb, boolean) to service_role;
grant execute on function public.log_role_change() to service_role;
grant execute on function public.mark_voice_message_read(uuid) to service_role;
grant execute on function public.record_activity(uuid, text, text) to service_role;
grant execute on function public.run_prophecy_scheduler() to service_role;
grant execute on function public.trigger_update_streak() to service_role;
grant execute on function public.update_member_streak(uuid) to service_role;
grant execute on function public.use_streak_freeze(uuid, text) to service_role;

-- The 3 helpers (is_admin, is_tpc_admin, current_user_has_role) are referenced
-- by RLS policies (kenya_trip_*, members staff update). Authenticated callers
-- need EXECUTE for those policies to evaluate without erroring. Anon doesn't
-- need them — anon users hitting admin tables are denied regardless.
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_tpc_admin() to authenticated;
grant execute on function public.current_user_has_role(character varying) to authenticated;
