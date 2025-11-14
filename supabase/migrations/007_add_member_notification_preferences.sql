-- Add notification preference columns to members table
ALTER TABLE members
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS sms_notifications BOOLEAN DEFAULT true;

-- Add comment
COMMENT ON COLUMN members.email_notifications IS 'Whether member wants to receive email notifications';
COMMENT ON COLUMN members.sms_notifications IS 'Whether member wants to receive SMS notifications';
