-- SQL script to fix the media collection's uploadedBy relation
-- Run this in PocketBase's database if the UI won't let you update

-- First, check the current schema
SELECT name, type, options FROM _collections WHERE name = 'media';

-- Update the uploadedBy field to point to users collection
-- Note: This assumes the users collection ID is known
-- You may need to find it first with: SELECT id, name FROM _collections WHERE name = 'users';
