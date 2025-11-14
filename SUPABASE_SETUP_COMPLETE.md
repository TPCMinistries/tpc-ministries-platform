# Complete Supabase Setup Guide for TPC Ministries

Run these SQL commands in your Supabase SQL Editor to complete the setup.

## 1. Storage Setup (tpc-media bucket)

### Create Storage Bucket and Set Policies

```sql
-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('tpc-media', 'tpc-media', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Public Read Access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'tpc-media' );

-- Policy: Authenticated Upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'tpc-media'
  AND auth.role() = 'authenticated'
);

-- Policy: Authenticated Update
CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'tpc-media'
  AND auth.role() = 'authenticated'
);

-- Policy: Authenticated Delete
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'tpc-media'
  AND auth.role() = 'authenticated'
);
```

## 2. Add Image Columns to Tables

```sql
-- Add image_url column to prophecies table
ALTER TABLE prophecies
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add image_url column to events table
ALTER TABLE events
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add thumbnail_url column to resources table
ALTER TABLE resources
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Add comments
COMMENT ON COLUMN prophecies.image_url IS 'URL to header/banner image for the prophecy post';
COMMENT ON COLUMN events.image_url IS 'URL to event banner/thumbnail image';
COMMENT ON COLUMN resources.thumbnail_url IS 'URL to resource thumbnail image';
```

## 3. Messages Table (if not already created)

```sql
-- Create messages table for two-way communication
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL,
  sender_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('member', 'admin')),
  recipient_id UUID REFERENCES members(id) ON DELETE CASCADE,
  recipient_type VARCHAR(20) NOT NULL CHECK (recipient_type IN ('member', 'admin')),
  subject VARCHAR(255),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);
CREATE INDEX idx_messages_unread ON messages(is_read) WHERE is_read = FALSE;
CREATE INDEX idx_messages_recipient_type ON messages(recipient_type);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Members can view their own messages"
  ON messages FOR SELECT
  USING (
    auth.uid() IN (SELECT user_id FROM members WHERE id = sender_id)
    OR auth.uid() IN (SELECT user_id FROM members WHERE id = recipient_id)
  );

CREATE POLICY "Members can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT user_id FROM members WHERE id = sender_id)
  );

CREATE POLICY "Users can mark messages as read"
  ON messages FOR UPDATE
  USING (
    auth.uid() IN (SELECT user_id FROM members WHERE id = recipient_id)
    OR recipient_type = 'admin'
  );
```

## Verification Steps

After running the above SQL:

### 1. Verify Storage Bucket
1. Go to **Storage** in Supabase Dashboard
2. You should see `tpc-media` bucket listed
3. Click on it and verify it's set to **Public**
4. Check the **Policies** tab to ensure all 4 policies are active

### 2. Verify Table Columns
Run this query to verify columns were added:
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('prophecies', 'events', 'resources')
AND column_name LIKE '%image%' OR column_name LIKE '%thumbnail%';
```

### 3. Verify Messages Table
```sql
SELECT COUNT(*) FROM messages;
-- Should return 0 (empty table, no errors)
```

## Folder Structure

The image upload system will automatically create these folders in the `tpc-media` bucket:
- `teachings/` - Teaching thumbnails
- `prophecies/` - Prophecy header images
- `events/` - Event banners
- `resources/` - Resource thumbnails
- `profiles/` - Member avatars
- `missions/` - Mission-related images

**No manual folder creation needed** - folders are created automatically on first upload.

## Testing the System

1. **Test Storage Upload**:
   - Go to `/admin/content` (Teachings Management)
   - Click "Add New Teaching"
   - Use the image upload component to upload a thumbnail
   - Verify the image appears and the URL is saved

2. **Test Media Library**:
   - Go to `/admin/media`
   - You should see your uploaded image in the grid
   - Click on it to view details
   - Test "Copy URL" button
   - Test delete functionality

3. **Test Messaging**:
   - As a member, go to `/member/messages`
   - Send a test message to leadership
   - As admin, go to `/admin/messages`
   - Verify you can see and reply to the message

## Troubleshooting

### Images not displaying?
- Check Storage bucket is set to **Public**
- Verify "Public Access" policy exists and is enabled
- Check browser console for 403 errors

### Upload failing?
- Verify user is authenticated
- Check "Authenticated users can upload" policy exists
- Ensure file is under 10MB (before compression)
- Check browser console for specific error messages

### Can't delete images?
- Verify "Authenticated users can delete" policy exists
- Check user is authenticated
- Make sure the file path is correct

## File Size Limits

- **Supabase limit**: 50MB per file (default)
- **App enforces**: 10MB max before compression
- **Images compressed to**: Max 2MB after upload
- **Max dimensions**: 2000px width/height (maintains aspect ratio)

## Security

- ✅ Only authenticated users can upload/modify/delete
- ✅ All uploaded files are publicly readable (required for web display)
- ✅ Filenames are randomized (prevents conflicts and information leakage)
- ✅ Old images automatically deleted when replaced
- ✅ RLS policies protect message data

## Complete! 🎉

Your TPC Ministries platform now has:
- ✅ Full image upload system with drag & drop
- ✅ Automatic image compression
- ✅ Media library for managing all uploads
- ✅ Image upload integrated into Teachings Management
- ✅ Two-way messaging system
- ✅ Proper security policies

Next steps:
1. Run the SQL commands above in Supabase
2. Test uploads in `/admin/content`
3. Check Media Library at `/admin/media`
4. Integrate image upload into Prophecy and Events forms as needed
