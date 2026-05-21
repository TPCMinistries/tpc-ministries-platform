-- Revoke EXECUTE from anon and authenticated on 23 SECURITY DEFINER functions
-- that no client code calls via .rpc(). These are either:
--   - trigger handlers (handle_new_user, log_role_change, etc.) — fired by
--     postgres, never client-callable
--   - RLS helpers (is_admin, is_tpc_admin, current_user_has_role) — called by
--     postgres during policy evaluation, not by clients
--   - admin/cron functions (cleanup_expired_insights, run_prophecy_scheduler,
--     get_admin_unread_counts) — server-side only
--   - RPCs that exist but aren't wired to any UI yet
--
-- Service role keeps execute (bypass via superuser). check_email_exists is
-- left alone — the signup form calls it via .rpc().
-- Supabase advisor: anon_security_definer_function_executable + authenticated_*.

revoke execute on function public.auto_subscribe_new_member()                                     from anon, authenticated;
revoke execute on function public.calculate_engagement_score(uuid)                                from anon, authenticated;
revoke execute on function public.cleanup_expired_insights()                                      from anon, authenticated;
revoke execute on function public.complete_challenge_day(uuid, integer, text)                     from anon, authenticated;
revoke execute on function public.current_user_has_role(character varying)                        from anon, authenticated;
revoke execute on function public.get_admin_unread_counts()                                       from anon, authenticated;
revoke execute on function public.get_collection_progress(uuid, uuid)                             from anon, authenticated;
revoke execute on function public.get_member_profile_stats(uuid)                                  from anon, authenticated;
revoke execute on function public.get_streak_stats(uuid)                                          from anon, authenticated;
revoke execute on function public.get_unread_voice_count()                                        from anon, authenticated;
revoke execute on function public.handle_new_user()                                               from anon, authenticated;
revoke execute on function public.increment_play_count(uuid)                                      from anon, authenticated;
revoke execute on function public.is_admin()                                                      from anon, authenticated;
revoke execute on function public.is_tpc_admin()                                                  from anon, authenticated;
revoke execute on function public.join_challenge(uuid)                                            from anon, authenticated;
revoke execute on function public.log_community_activity(uuid, character varying, character varying, text, jsonb, boolean) from anon, authenticated;
revoke execute on function public.log_role_change()                                               from anon, authenticated;
revoke execute on function public.mark_voice_message_read(uuid)                                   from anon, authenticated;
revoke execute on function public.record_activity(uuid, text, text)                               from anon, authenticated;
revoke execute on function public.run_prophecy_scheduler()                                        from anon, authenticated;
revoke execute on function public.trigger_update_streak()                                         from anon, authenticated;
revoke execute on function public.update_member_streak(uuid)                                      from anon, authenticated;
revoke execute on function public.use_streak_freeze(uuid, text)                                   from anon, authenticated;
