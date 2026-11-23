-- StudySync Initial Database Schema (v1.4)
-- Enforces: roles, institution types (College/University), modules, module requests,
-- rooms (20-capacity target), timer, live status tags (max 60 chars),
-- persistent creation-ordered checklist, and text-only forum posts.

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
    institution_type VARCHAR(20) CHECK (institution_type IN ('College', 'University')),
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 2. Modules Catalogue Table
CREATE TABLE IF NOT EXISTS public.modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(30) NOT NULL UNIQUE,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    institution_type VARCHAR(20) NOT NULL DEFAULT 'University' CHECK (institution_type IN ('College', 'University')),
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 3. Student Active Modules Enrolment Table
CREATE TABLE IF NOT EXISTS public.student_modules (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    PRIMARY KEY (user_id, module_id)
);

-- 4. Module Requests Table
CREATE TABLE IF NOT EXISTS public.module_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    code VARCHAR(30) NOT NULL,
    title TEXT,
    institution_type VARCHAR(20) NOT NULL DEFAULT 'University' CHECK (institution_type IN ('College', 'University')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 5. Study Rooms Table
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE RESTRICT,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL DEFAULT 'Study Session',
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    closed_at TIMESTAMPTZ
);

-- 6. Room Participants Table (Active seats in a room)
CREATE TABLE IF NOT EXISTS public.room_participants (
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    PRIMARY KEY (room_id, user_id)
);

-- 7. Live Study-Status Tags Table (1 to 60 characters plain text per PRD FR-STATUS-04)
CREATE TABLE IF NOT EXISTS public.study_statuses (
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status VARCHAR(60) NOT NULL CHECK (char_length(trim(status)) >= 1 AND char_length(trim(status)) <= 60),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    PRIMARY KEY (room_id, user_id)
);

-- 8. Synchronized Room Timer Table
CREATE TABLE IF NOT EXISTS public.room_timers (
    room_id UUID PRIMARY KEY REFERENCES public.rooms(id) ON DELETE CASCADE,
    phase VARCHAR(10) NOT NULL DEFAULT 'focus' CHECK (phase IN ('focus', 'break')),
    phase_duration_minutes INT NOT NULL DEFAULT 50 CHECK (phase_duration_minutes > 0),
    phase_end_at TIMESTAMPTZ,
    is_running BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 9. Shared Checklist Items Table
CREATE TABLE IF NOT EXISTS public.checklist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 10. Module Forum Posts Table (Text-only with Edited indicator support)
CREATE TABLE IF NOT EXISTS public.forum_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (char_length(trim(content)) > 0),
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    edited_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_modules_institution ON public.modules(institution_type);
CREATE INDEX IF NOT EXISTS idx_student_modules_user ON public.student_modules(user_id);
CREATE INDEX IF NOT EXISTS idx_module_requests_user ON public.module_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_module_requests_status ON public.module_requests(status);
CREATE INDEX IF NOT EXISTS idx_rooms_module ON public.rooms(module_id);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON public.rooms(status);
CREATE INDEX IF NOT EXISTS idx_checklist_room ON public.checklist_items(room_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_forum_posts_module ON public.forum_posts(module_id, created_at DESC);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_timers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;

-- Helper function to check if the current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies: Profiles
CREATE POLICY "Public profiles are readable by authenticated users"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- RLS Policies: Modules
CREATE POLICY "Modules are viewable by all authenticated users"
    ON public.modules FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Only admins can manage modules"
    ON public.modules FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- RLS Policies: Student Modules (Enrolments)
CREATE POLICY "Students can view their own enrolments"
    ON public.student_modules FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Students can manage their own enrolments"
    ON public.student_modules FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- RLS Policies: Module Requests
CREATE POLICY "Students can view their own module requests; admins can view all"
    ON public.module_requests FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Students can create module requests"
    ON public.module_requests FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only admins can update module requests"
    ON public.module_requests FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- RLS Policies: Rooms
CREATE POLICY "Rooms are viewable by authenticated users"
    ON public.rooms FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Only admins can create or modify rooms"
    ON public.rooms FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- RLS Policies: Room Participants
CREATE POLICY "Room participants are viewable by authenticated users"
    ON public.room_participants FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can manage their own room participation"
    ON public.room_participants FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- RLS Policies: Study Statuses
CREATE POLICY "Study statuses viewable by authenticated users"
    ON public.study_statuses FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can manage their own study status"
    ON public.study_statuses FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- RLS Policies: Room Timers
CREATE POLICY "Room timers viewable by authenticated users"
    ON public.room_timers FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Only admins can control room timers"
    ON public.room_timers FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- RLS Policies: Checklist Items
-- Viewable by anyone if room exists
CREATE POLICY "Checklist items viewable by authenticated users"
    ON public.checklist_items FOR SELECT
    TO authenticated
    USING (true);

-- Insert: allowed if room is OPEN
CREATE POLICY "Participants can add checklist items to open rooms"
    ON public.checklist_items FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = created_by AND
        EXISTS (
            SELECT 1 FROM public.rooms
            WHERE id = room_id AND status = 'open'
        )
    );

-- Update: creator or admin can update, but ONLY if room is OPEN
CREATE POLICY "Creator or admin can update items in open rooms"
    ON public.checklist_items FOR UPDATE
    TO authenticated
    USING (
        (auth.uid() = created_by OR public.is_admin()) AND
        EXISTS (
            SELECT 1 FROM public.rooms
            WHERE id = room_id AND status = 'open'
        )
    )
    WITH CHECK (
        (auth.uid() = created_by OR public.is_admin()) AND
        EXISTS (
            SELECT 1 FROM public.rooms
            WHERE id = room_id AND status = 'open'
        )
    );

-- Delete: creator or admin can delete if room is OPEN
CREATE POLICY "Creator or admin can delete items in open rooms"
    ON public.checklist_items FOR DELETE
    TO authenticated
    USING (
        (auth.uid() = created_by OR public.is_admin()) AND
        EXISTS (
            SELECT 1 FROM public.rooms
            WHERE id = room_id AND status = 'open'
        )
    );

-- RLS Policies: Forum Posts
CREATE POLICY "Forum posts viewable by authenticated users"
    ON public.forum_posts FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can create forum posts"
    ON public.forum_posts FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can edit their own forum posts"
    ON public.forum_posts FOR UPDATE
    TO authenticated
    USING (auth.uid() = author_id)
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Admins or authors can delete forum posts"
    ON public.forum_posts FOR DELETE
    TO authenticated
    USING (auth.uid() = author_id OR public.is_admin());

