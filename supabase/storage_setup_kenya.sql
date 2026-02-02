-- Kenya Trip Document Storage Setup
-- Run this in Supabase SQL Editor (storage operations require different permissions)

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'kenya-trip-documents',
  'kenya-trip-documents',
  false,
  10485760, -- 10MB
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for authenticated users

-- Users can upload their own documents
CREATE POLICY "Users can upload own documents to kenya-trip-documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'kenya-trip-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can view their own documents
CREATE POLICY "Users can view own documents in kenya-trip-documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'kenya-trip-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can update their own documents
CREATE POLICY "Users can update own documents in kenya-trip-documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'kenya-trip-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete their own documents
CREATE POLICY "Users can delete own documents in kenya-trip-documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'kenya-trip-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Admins can access all documents
CREATE POLICY "Admins full access to kenya-trip-documents"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'kenya-trip-documents' AND
  EXISTS (
    SELECT 1 FROM public.members
    WHERE user_id = auth.uid()
    AND (is_admin = true OR role IN ('admin', 'staff'))
  )
);
