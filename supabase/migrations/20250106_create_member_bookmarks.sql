-- Create member_bookmarks table for tracking bookmarked content
CREATE TABLE IF NOT EXISTS member_bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    teaching_id UUID NOT NULL REFERENCES teachings(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure a member can only bookmark a teaching once
    UNIQUE(member_id, teaching_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_member_bookmarks_member_id ON member_bookmarks(member_id);
CREATE INDEX IF NOT EXISTS idx_member_bookmarks_teaching_id ON member_bookmarks(teaching_id);
CREATE INDEX IF NOT EXISTS idx_member_bookmarks_created_at ON member_bookmarks(created_at DESC);

-- Enable RLS
ALTER TABLE member_bookmarks ENABLE ROW LEVEL SECURITY;

-- Create policy for members to manage their own bookmarks
CREATE POLICY "Members can view their own bookmarks"
    ON member_bookmarks
    FOR SELECT
    USING (auth.uid() IN (
        SELECT user_id FROM members WHERE id = member_bookmarks.member_id
    ));

CREATE POLICY "Members can insert their own bookmarks"
    ON member_bookmarks
    FOR INSERT
    WITH CHECK (auth.uid() IN (
        SELECT user_id FROM members WHERE id = member_bookmarks.member_id
    ));

CREATE POLICY "Members can delete their own bookmarks"
    ON member_bookmarks
    FOR DELETE
    USING (auth.uid() IN (
        SELECT user_id FROM members WHERE id = member_bookmarks.member_id
    ));

-- Add comment
COMMENT ON TABLE member_bookmarks IS 'Stores bookmarked teachings for members';
