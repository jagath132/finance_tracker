-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy for inserting avatar files (authenticated users can upload to their own folder)
CREATE POLICY "Users can upload their own avatar" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy for selecting avatar files (authenticated users can view their own and public)
CREATE POLICY "Users can view avatars" ON storage.objects
FOR SELECT USING (
    bucket_id = 'avatars'
    AND (
        auth.role() = 'authenticated'
        OR bucket_id IN (
            SELECT id FROM storage.buckets WHERE public = true
        )
    )
);

-- Policy for updating avatar files (authenticated users can update their own)
CREATE POLICY "Users can update their own avatar" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy for deleting avatar files (authenticated users can delete their own)
CREATE POLICY "Users can delete their own avatar" ON storage.objects
FOR DELETE USING (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);