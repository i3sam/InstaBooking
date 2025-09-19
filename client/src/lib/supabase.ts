import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client for authentication and storage
export const supabase = (() => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('Missing Supabase environment variables. Some features may not work properly.');
    // Return a stub client to prevent runtime errors
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        signInWithPassword: () => Promise.resolve({ data: { user: null }, error: new Error('Supabase not configured') }),
        signUp: () => Promise.resolve({ data: { user: null }, error: new Error('Supabase not configured') }),
        signOut: () => Promise.resolve({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: null }, error: null })
      },
      storage: {
        from: () => ({
          upload: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
          getPublicUrl: () => ({ data: { publicUrl: '' } })
        })
      }
    } as any;
  }
  
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  });
})();

// File upload utility
export const uploadFile = async (file: File, bucket: string = 'logos', folder: string = '') => {
  try {
    // First ensure bucket exists on server-side
    const bucketResponse = await fetch('/api/storage/ensure-bucket', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ bucketName: bucket })
    });

    if (!bucketResponse.ok) {
      const errorData = await bucketResponse.json();
      throw new Error(errorData.message || 'Failed to ensure bucket exists');
    }

    // Upload file using server-side endpoint (bypasses RLS issues)
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', bucket);
    formData.append('folder', folder);

    const uploadResponse = await fetch('/api/storage/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      throw new Error(errorData.message || 'Upload failed');
    }

    const result = await uploadResponse.json();
    return result;

  } catch (error) {
    console.error('Error uploading file:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
};
