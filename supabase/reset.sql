-- Clean up / Reset Database
-- Run this to drop all tables before running schema.sql

DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
