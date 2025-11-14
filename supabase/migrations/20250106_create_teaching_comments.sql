-- Create teaching_comments table
CREATE TABLE IF NOT EXISTS teaching_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teaching_id UUID NOT NULL REFERENCES teachings(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Create indexes
CREATE INDEX idx_teaching_comments_teaching ON teaching_comments(teaching_id);
CREATE INDEX idx_teaching_comments_member ON teaching_comments(member_id);
CREATE INDEX idx_teaching_comments_created ON teaching_comments(created_at DESC);

-- Enable RLS
ALTER TABLE teaching_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Anyone can read non-deleted comments
CREATE POLICY "Anyone can read non-deleted comments"
    ON teaching_comments FOR SELECT
    USING (is_deleted = FALSE);

-- Authenticated users can insert their own comments
CREATE POLICY "Members can create comments"
    ON teaching_comments FOR INSERT
    WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM members WHERE id = teaching_comments.member_id
        )
    );

-- Users can update their own comments
CREATE POLICY "Members can update own comments"
    ON teaching_comments FOR UPDATE
    USING (
        auth.uid() IN (
            SELECT user_id FROM members WHERE id = teaching_comments.member_id
        )
    );

-- Users can delete (soft delete) their own comments
CREATE POLICY "Members can delete own comments"
    ON teaching_comments FOR UPDATE
    USING (
        auth.uid() IN (
            SELECT user_id FROM members WHERE id = teaching_comments.member_id
        )
    );

-- Add comment count to teachings table (optional)
ALTER TABLE teachings
ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;

-- Create function to update comment count
CREATE OR REPLACE FUNCTION update_teaching_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.is_deleted = FALSE THEN
        UPDATE teachings
        SET comments_count = comments_count + 1
        WHERE id = NEW.teaching_id;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.is_deleted = FALSE AND NEW.is_deleted = TRUE THEN
            UPDATE teachings
            SET comments_count = GREATEST(comments_count - 1, 0)
            WHERE id = NEW.teaching_id;
        ELSIF OLD.is_deleted = TRUE AND NEW.is_deleted = FALSE THEN
            UPDATE teachings
            SET comments_count = comments_count + 1
            WHERE id = NEW.teaching_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_teaching_comments_count ON teaching_comments;
CREATE TRIGGER trigger_update_teaching_comments_count
    AFTER INSERT OR UPDATE ON teaching_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_teaching_comments_count();
