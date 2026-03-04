-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
-- Drop existing policies to avoid "already exists" errors
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON profiles;

CREATE POLICY "Public profiles are viewable by everyone." ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create posts table
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content JSONB NOT NULL,
  content_html TEXT,
  cover_image TEXT,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  published BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS for posts
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Posts policies
DROP POLICY IF EXISTS "Anyone can read published posts." ON posts;
DROP POLICY IF EXISTS "Users can read their own posts." ON posts;
DROP POLICY IF EXISTS "Users can create posts." ON posts;
DROP POLICY IF EXISTS "Users can update their own posts." ON posts;
DROP POLICY IF EXISTS "Users can delete their own posts." ON posts;

CREATE POLICY "Anyone can read published posts." ON posts
  FOR SELECT USING (published = true);

CREATE POLICY "Users can read their own posts." ON posts
  FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "Users can create posts." ON posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own posts." ON posts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own posts." ON posts
  FOR DELETE USING (auth.uid() = author_id);

-- Storage setup
-- Note: Replace 'public' with 'true' if the dashboard doesn't reflect it
INSERT INTO storage.buckets (id, name, public) 
VALUES ('covers', 'covers', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('editor-images', 'editor-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for covers
DROP POLICY IF EXISTS "Public Access to Covers" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Users can upload covers" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own covers" ON storage.objects;

CREATE POLICY "Public Access to Covers" ON storage.objects
  FOR SELECT USING (bucket_id = 'covers');

CREATE POLICY "Authenticated Users can upload covers" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'covers' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own covers" ON storage.objects
  FOR UPDATE USING (bucket_id = 'covers' AND auth.role() = 'authenticated');

-- Storage policies for editor-images
DROP POLICY IF EXISTS "Public Access to Editor Images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Users can upload editor images" ON storage.objects;

CREATE POLICY "Public Access to Editor Images" ON storage.objects
  FOR SELECT USING (bucket_id = 'editor-images');

CREATE POLICY "Authenticated Users can upload editor images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'editor-images' AND auth.role() = 'authenticated');

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on sign up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Backfill existing users (Run this if you have existing users who don't have profiles)
INSERT INTO public.profiles (id, email, username)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'username', split_part(email, '@', 1))
FROM auth.users
ON CONFLICT (id) DO NOTHING;
