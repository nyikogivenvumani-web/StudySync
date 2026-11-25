-- Test accounts for StudySync (development / demo ONLY — delete before real users).
-- Run in the Supabase SQL editor. Safe to re-run.
-- Passwords are bcrypt-hashed by pgcrypto; the signup trigger creates the profile row.

create extension if not exists pgcrypto;

do $$
declare
  u record;
  uid uuid;
begin
  for u in
    select * from (values
      ('admin@studysync.test',    'Admin#Test2026',   'Test Admin',    'admin',   'University'),
      ('student@studysync.test',  'Student#Test2026', 'Test Student',  'student', 'University'),
      ('student2@studysync.test', 'Student#Test2026', 'Second Student','student', 'College')
    ) as t(email, pw, full_name, role, inst)
  loop
    select id into uid from auth.users where email = u.email;
    if uid is null then
      uid := gen_random_uuid();
      insert into auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
        confirmation_token, email_change, email_change_token_new, recovery_token
      ) values (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
        u.email, crypt(u.pw, gen_salt('bf')), now(),
        '{"provider":"email","providers":["email"]}',
        jsonb_build_object('full_name', u.full_name), now(), now(), '', '', '', ''
      );
      insert into auth.identities (
        id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
      ) values (
        gen_random_uuid(), uid, uid::text,
        jsonb_build_object('sub', uid::text, 'email', u.email, 'email_verified', true),
        'email', now(), now(), now()
      );
    end if;

    insert into public.profiles (id, full_name, role, institution_type)
    values (uid, u.full_name, u.role, u.inst)
    on conflict (id) do update
      set role = excluded.role, full_name = excluded.full_name, institution_type = excluded.institution_type;
  end loop;
end $$;

select u.email, p.role from auth.users u join public.profiles p on p.id = u.id
where u.email like '%@studysync.test';
