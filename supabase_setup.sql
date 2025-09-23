-- Supabase migration script to replace Drizzle/PostgreSQL with native Supabase
-- This sets up all tables, RLS policies, and realtime subscriptions

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT,
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    membership_status TEXT DEFAULT 'free',
    membership_plan TEXT,
    membership_expires TIMESTAMP WITH TIME ZONE
);

-- Pages table
CREATE TABLE IF NOT EXISTS pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES profiles(id),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    tagline TEXT,
    logo_url TEXT,
    primary_color TEXT DEFAULT '#2563eb',
    theme TEXT DEFAULT 'Ocean Blue',
    background_type TEXT DEFAULT 'gradient',
    background_value TEXT DEFAULT 'blue',
    font_family TEXT DEFAULT 'inter',
    calendar_link TEXT,
    location_link TEXT,
    faqs JSONB DEFAULT '[]',
    accept_reviews TEXT DEFAULT 'true',
    business_hours JSONB DEFAULT '{"monday":"9:00-17:00","tuesday":"9:00-17:00","wednesday":"9:00-17:00","thursday":"9:00-17:00","friday":"9:00-17:00","saturday":"Closed","sunday":"Closed"}',
    contact_phone TEXT,
    contact_email TEXT,
    business_address TEXT,
    cancellation_policy TEXT,
    show_business_hours TEXT DEFAULT 'true',
    show_contact_info TEXT DEFAULT 'true',
    data JSONB,
    published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Demo pages table
CREATE TABLE IF NOT EXISTS demo_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES profiles(id),
    data JSONB NOT NULL,
    convert_token TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL,
    price NUMERIC NOT NULL,
    currency TEXT DEFAULT 'USD' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
    owner_id UUID REFERENCES profiles(id),
    service_id UUID REFERENCES services(id),
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT NOT NULL,
    date DATE NOT NULL,
    time TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    rating INTEGER NOT NULL,
    review_text TEXT,
    is_approved TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments demo table
CREATE TABLE IF NOT EXISTS payments_demo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    plan TEXT,
    amount NUMERIC,
    status TEXT,
    paypal_order_id TEXT,
    paypal_payment_id TEXT,
    meta JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES profiles(id),
    plan_id TEXT NOT NULL,
    plan_name TEXT NOT NULL,
    status TEXT NOT NULL,
    currency TEXT DEFAULT 'USD' NOT NULL,
    amount NUMERIC NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE,
    next_billing_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pages_owner_id ON pages(owner_id);
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_services_page_id ON services(page_id);
CREATE INDEX IF NOT EXISTS idx_appointments_page_id ON appointments(page_id);
CREATE INDEX IF NOT EXISTS idx_appointments_owner_id ON appointments(owner_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_reviews_page_id ON reviews(page_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments_demo ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: Users can select and update their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);
    
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Pages: Owners can CRUD their pages, public can view published pages
CREATE POLICY "Page owners can view their pages" ON pages
    FOR SELECT USING (auth.uid() = owner_id);
    
CREATE POLICY "Public can view published pages" ON pages
    FOR SELECT USING (published = true);
    
CREATE POLICY "Page owners can insert pages" ON pages
    FOR INSERT WITH CHECK (auth.uid() = owner_id);
    
CREATE POLICY "Page owners can update their pages" ON pages
    FOR UPDATE USING (auth.uid() = owner_id);
    
CREATE POLICY "Page owners can delete their pages" ON pages
    FOR DELETE USING (auth.uid() = owner_id);

-- Demo Pages: Users can manage their own demo pages
CREATE POLICY "Users can view own demo pages" ON demo_pages
    FOR SELECT USING (auth.uid() = owner_id OR owner_id IS NULL);
    
CREATE POLICY "Users can insert demo pages" ON demo_pages
    FOR INSERT WITH CHECK (auth.uid() = owner_id OR owner_id IS NULL);
    
CREATE POLICY "Users can update own demo pages" ON demo_pages
    FOR UPDATE USING (auth.uid() = owner_id OR owner_id IS NULL);
    
CREATE POLICY "Users can delete own demo pages" ON demo_pages
    FOR DELETE USING (auth.uid() = owner_id OR owner_id IS NULL);

-- Services: Page owners can CRUD services, public can view for published pages
CREATE POLICY "Page owners can manage services" ON services
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM pages 
            WHERE pages.id = services.page_id 
            AND pages.owner_id = auth.uid()
        )
    );
    
CREATE POLICY "Public can view services for published pages" ON services
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pages 
            WHERE pages.id = services.page_id 
            AND pages.published = true
        )
    );

-- Appointments: Page owners can view/update, public can insert bookings
CREATE POLICY "Page owners can view appointments" ON appointments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pages 
            WHERE pages.id = appointments.page_id 
            AND pages.owner_id = auth.uid()
        )
    );
    
CREATE POLICY "Page owners can update appointments" ON appointments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM pages 
            WHERE pages.id = appointments.page_id 
            AND pages.owner_id = auth.uid()
        )
    );
    
CREATE POLICY "Public can book appointments" ON appointments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM pages 
            WHERE pages.id = appointments.page_id 
            AND pages.published = true
        )
    );

-- Reviews: Public can submit reviews, page owners can approve
CREATE POLICY "Public can view approved reviews" ON reviews
    FOR SELECT USING (is_approved = 'approved');
    
CREATE POLICY "Public can submit reviews" ON reviews
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM pages 
            WHERE pages.id = reviews.page_id 
            AND pages.published = true 
            AND pages.accept_reviews = 'true'
        )
    );
    
CREATE POLICY "Page owners can manage reviews" ON reviews
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM pages 
            WHERE pages.id = reviews.page_id 
            AND pages.owner_id = auth.uid()
        )
    );

-- Payments: Users can view own payments
CREATE POLICY "Users can view own payments" ON payments_demo
    FOR SELECT USING (auth.uid() = user_id);

-- Subscriptions: Users can view own subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- Enable Realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE pages;
ALTER PUBLICATION supabase_realtime ADD TABLE services;

-- Create a function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant minimal necessary permissions (RLS policies will enforce access control)
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant specific table permissions (RLS policies will restrict actual access)
GRANT SELECT, INSERT ON profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON pages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON demo_pages TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON services TO authenticated;
GRANT SELECT, INSERT ON appointments TO anon, authenticated;
GRANT UPDATE ON appointments TO authenticated;
GRANT SELECT, INSERT ON reviews TO anon, authenticated;
GRANT UPDATE ON reviews TO authenticated;
GRANT SELECT ON payments_demo TO authenticated;
GRANT SELECT ON subscriptions TO authenticated;

-- Grant sequence usage for ID generation
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;