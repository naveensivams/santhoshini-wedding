-- ================================================================
-- Santhoshini's Wedding Planner — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ================================================================

-- ---------------------------------------------------------------
-- 1. PROFILES (extends auth.users)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT,
  phone       TEXT,
  avatar_url  TEXT,
  role        TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member', 'volunteer')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on new signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    CASE WHEN (SELECT COUNT(*) FROM public.profiles) = 0 THEN 'admin' ELSE 'member' END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------
-- 2. TASKS
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tasks (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id           TEXT,
  title              TEXT NOT NULL,
  description        TEXT,
  category           TEXT,
  assigned_to        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  priority           TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Critical','High','Medium','Low')),
  due_date           DATE,
  status             TEXT NOT NULL DEFAULT 'Not Started' CHECK (status IN ('Not Started','In Progress','Waiting','Blocked','Completed','Cancelled')),
  completion_percent INTEGER DEFAULT 0,
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------
-- 3. BOOKINGS
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id          TEXT,
  event_name        TEXT,
  vendor_name       TEXT,
  category          TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'Not Booked' CHECK (status IN ('Not Booked','Enquired','Negotiating','Booked','Confirmed','Cancelled')),
  booking_date      DATE,
  contract_signed   BOOLEAN DEFAULT FALSE,
  advance_paid      NUMERIC(12,2) DEFAULT 0,
  balance_due       NUMERIC(12,2) DEFAULT 0,
  final_payment_due DATE,
  contact_name      TEXT,
  contact_phone     TEXT,
  trial_scheduled   BOOLEAN DEFAULT FALSE,
  trial_date        DATE,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------
-- 4. BUDGET ENTRIES
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS budget_entries (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id     TEXT,
  event_name   TEXT,
  description  TEXT NOT NULL,
  category     TEXT,
  amount       NUMERIC(12,2) NOT NULL DEFAULT 0,
  type         TEXT NOT NULL DEFAULT 'Expense' CHECK (type IN ('Budget','Expense','Advance','Payment')),
  date         DATE NOT NULL DEFAULT CURRENT_DATE,
  vendor_name  TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------
-- 5. SHOPPING ITEMS
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS shopping_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      TEXT,
  event_name    TEXT,
  name          TEXT NOT NULL,
  category      TEXT,
  quantity      INTEGER DEFAULT 1,
  budget_amount NUMERIC(12,2),
  actual_price  NUMERIC(12,2),
  store         TEXT,
  status        TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','Purchased')),
  assigned_to   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------
-- 6. GUESTS
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS guests (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  phone            TEXT,
  email            TEXT,
  side             TEXT NOT NULL DEFAULT 'Bride' CHECK (side IN ('Bride','Groom','Both')),
  "group"          TEXT DEFAULT 'Family',
  rsvp_status      TEXT NOT NULL DEFAULT 'Pending' CHECK (rsvp_status IN ('Pending','Confirmed','Declined')),
  invitation_sent  BOOLEAN DEFAULT FALSE,
  food_preference  TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------
-- 7. VENDORS
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vendors (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  phone       TEXT,
  email       TEXT,
  category    TEXT NOT NULL,
  rating      INTEGER CHECK (rating BETWEEN 1 AND 5),
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------
-- 8. TODO ITEMS (quick to-do list)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS todo_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text        TEXT NOT NULL,
  done        BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- ROW LEVEL SECURITY (RLS) — authenticated users only
-- ================================================================
ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks          ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings       ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests         ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors        ENABLE ROW LEVEL SECURITY;
ALTER TABLE todo_items     ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read/write everything
CREATE POLICY "auth_all" ON profiles       FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON tasks          FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON bookings       FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON budget_entries FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON shopping_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON guests         FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON vendors        FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON todo_items     FOR ALL TO authenticated USING (true) WITH CHECK (true);
