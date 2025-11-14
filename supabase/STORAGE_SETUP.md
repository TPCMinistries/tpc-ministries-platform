# Supabase Storage Setup for TPC Ministries

## Step 1: Create Storage Bucket

1. Go to your Supabase Dashboard
2. Click on **Storage** in the left sidebar
3. Click **New bucket**
4. Enter bucket name: `tpc-media`
5. Set **Public bucket** to ON (allows public read access)
6. Click **Create bucket**

## Step 2: Set Up Storage Policies

After creating the bucket, set up the following policies:

### Policy 1: Public Read Access
Allows anyone to view/download images from the bucket.

```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'tpc-media' );
```

### Policy 2: Authenticated Upload
Allows authenticated users to upload files.

```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'tpc-media'
  AND auth.role() = 'authenticated'
);
```

### Policy 3: Authenticated Update
Allows authenticated users to update their uploaded files.

```sql
CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'tpc-media'
  AND auth.role() = 'authenticated'
);
```

### Policy 4: Authenticated Delete
Allows authenticated users to delete files.

```sql
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'tpc-media'
  AND auth.role() = 'authenticated'
);
```

## Step 3: Verify Bucket Configuration

1. Go to Storage > tpc-media
2. Click on the **Policies** tab
3. Verify all 4 policies are listed and enabled
4. Test by uploading a file manually through the dashboard

## Step 4: Folder Structure

The ImageUpload component will automatically organize files into these folders:
- `teachings/` - Thumbnail images for teaching content
- `prophecies/` - Header images for prophecy posts
- `events/` - Event banner/thumbnail images
- `resources/` - Resource thumbnails
- `profiles/` - Member profile avatars
- `missions/` - Mission-related images

No manual folder creation needed - folders are created automatically on first upload.

## Step 5: Get Your Storage URL

Your public storage URL format will be:
```
https://[your-project-ref].supabase.co/storage/v1/object/public/tpc-media/[folder]/[filename]
```

Replace `[your-project-ref]` with your actual Supabase project reference.

## Quick Setup via SQL Editor (Alternative)

You can also run this SQL in the Supabase SQL Editor to set everything up at once:

```sql
-- Create the storage bucket (if not created via UI)
INSERT INTO storage.buckets (id, name, public)
VALUES ('tpc-media', 'tpc-media', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'tpc-media' );

CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'tpc-media'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'tpc-media'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'tpc-media'
  AND auth.role() = 'authenticated'
);
```

## Troubleshooting

### Images not loading?
- Check that the bucket is set to **Public**
- Verify the "Public Access" policy exists
- Check browser console for CORS errors

### Upload failing?
- Verify user is authenticated
- Check the "Authenticated users can upload" policy exists
- Ensure file size is under 50MB (Supabase default limit)

### Can't delete old images?
- Verify the "Authenticated users can delete" policy exists
- Check that the user has permission to delete

## File Size Limits

- Default Supabase limit: **50MB per file**
- ImageUpload component limits: **10MB before compression, 2MB after**
- Images are automatically compressed to stay under 2MB
- Large images are resized to max 2000px width/height while maintaining aspect ratio

## Security Notes

- Only authenticated users can upload/modify/delete
- All uploaded files are publicly readable (required for displaying images on site)
- File names are randomized to prevent conflicts and expose less information
- Old images are automatically deleted when replaced
