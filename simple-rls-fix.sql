-- Simple fix for profile creation issue
-- This temporarily disables RLS to allow profile creation, then re-enables it with proper policies

-- Step 1: Temporarily disable RLS
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Create a simple policy that allows authenticated users to manage their own profiles
CREATE POLICY "Users can manage their own profiles" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- Step 3: Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
