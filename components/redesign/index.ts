// TPC Ministries Platform - Complete UX/UI Redesign Components
// =============================================================
// This module exports all redesigned components for both member and admin portals

// ==================
// UI COMPONENTS
// ==================

// Command Palette (Cmd+K search)
export { CommandMenu } from "@/components/ui/command-menu"
export { SearchTrigger } from "@/components/ui/search-trigger"

// Celebrations & Achievements
export { CelebrationModal, useCelebration, type CelebrationType } from "@/components/ui/celebration/celebration-modal"

// Prayer Components
export { PrayerButton } from "@/components/ui/prayer-button"

// Stats & Progress
export { QuickStats } from "@/components/ui/quick-stats"
export { StreakDisplay } from "@/components/ui/streak-display"

// Content Components
export { VerseCard } from "@/components/ui/verse-card"
export { SmartEmptyState } from "@/components/ui/smart-empty-state"

// Notifications & Activity
export { NotificationBell } from "@/components/ui/notification-bell"
export { ActivityFeedItem, ActivityFeed } from "@/components/ui/activity-feed-item"

// ==================
// MEMBER PORTAL
// ==================

// Navigation
export { MemberBottomNav } from "@/components/member/redesign/member-bottom-nav"

// Dashboard Tabs
export { TodayDashboard } from "@/components/member/redesign/today-dashboard"
export { GrowTab } from "@/components/member/redesign/grow-tab"
export { ConnectTab } from "@/components/member/redesign/connect-tab"
export { YouTab } from "@/components/member/redesign/you-tab"

// ==================
// ADMIN PORTAL
// ==================

// Navigation
export { AdminSimplifiedNav } from "@/components/admin/redesign/admin-simplified-nav"
export { AdminBottomNav } from "@/components/admin/redesign/admin-bottom-nav"

// Dashboard Components
export { NeedsAttentionPanel } from "@/components/admin/redesign/needs-attention-panel"
export { AdminQuickStats } from "@/components/admin/redesign/admin-quick-stats"

// ==================
// PROVIDERS
// ==================
export { CelebrationProvider } from "@/components/providers/celebration-provider"
