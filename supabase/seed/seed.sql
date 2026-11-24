-- Seed baseline modules matching PRD and frontend demo
INSERT INTO public.modules (code, title, subject, institution_type)
VALUES
    ('MAT2611', 'Linear Algebra II & Matrix Methods', 'Mathematics', 'University'),
    ('COS1511', 'Introduction to Programming I', 'Computer Science', 'University'),
    ('ECS1501', 'Economics IA: Microeconomics', 'Economics', 'University'),
    ('ENG1501', 'Foundations in English Literary Studies', 'English', 'College'),
    ('BNK2601', 'Bank Management', 'Banking', 'College')
ON CONFLICT (code) DO NOTHING;

