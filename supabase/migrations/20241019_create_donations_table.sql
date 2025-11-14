-- Create donations table
CREATE TABLE IF NOT EXISTS public.donations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  amount DECIMAL(10, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('general', 'missions', 'leadership')),
  frequency TEXT NOT NULL CHECK (frequency IN ('once', 'monthly')),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  donor_email TEXT,
  donor_name TEXT DEFAULT 'Anonymous',
  stripe_session_id TEXT,
  stripe_payment_intent TEXT,
  stripe_invoice_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS donations_user_id_idx ON public.donations(user_id);
CREATE INDEX IF NOT EXISTS donations_created_at_idx ON public.donations(created_at DESC);
CREATE INDEX IF NOT EXISTS donations_stripe_subscription_id_idx ON public.donations(stripe_subscription_id);

-- Enable Row Level Security
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own donations
CREATE POLICY "Users can view own donations"
  ON public.donations
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Policy: Service role can insert donations (for webhook)
CREATE POLICY "Service role can insert donations"
  ON public.donations
  FOR INSERT
  WITH CHECK (true);

-- Policy: Service role can update donations (for webhook)
CREATE POLICY "Service role can update donations"
  ON public.donations
  FOR UPDATE
  USING (true);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_donations_updated_at
  BEFORE UPDATE ON public.donations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
