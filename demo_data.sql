-- Demo Data for Marketing Screenshots
-- This script inserts realistic demo data across all analytics components

-- First, let's get a user ID (you'll need to replace this with your actual user ID)
-- You can find your user ID in Supabase Auth > Users
-- For demo purposes, we'll use a placeholder that you need to replace

-- Replace 'YOUR_USER_ID_HERE' with your actual user ID from Supabase Auth
-- You can find it in: Supabase Dashboard > Authentication > Users

-- Demo shortened links
INSERT INTO public.shortened_links (short_code, original_url, title, user_id, clicks, created_at, description, tags) VALUES
('demo1', 'https://github.com/yourusername/awesome-project', 'My GitHub Project', 'YOUR_USER_ID_HERE', 1247, NOW() - INTERVAL '25 days', 'Check out my latest open source project', ARRAY['github', 'opensource', 'project']),
('demo2', 'https://youtube.com/watch?v=demo123', 'Product Demo Video', 'YOUR_USER_ID_HERE', 892, NOW() - INTERVAL '18 days', 'Watch our product in action', ARRAY['video', 'demo', 'product']),
('demo3', 'https://medium.com/@user/tech-trends-2024', 'Tech Trends 2024', 'YOUR_USER_ID_HERE', 634, NOW() - INTERVAL '12 days', 'Latest technology trends and predictions', ARRAY['tech', 'trends', '2024']),
('demo4', 'https://linkedin.com/in/yourprofile', 'LinkedIn Profile', 'YOUR_USER_ID_HERE', 445, NOW() - INTERVAL '8 days', 'Connect with me on LinkedIn', ARRAY['linkedin', 'networking', 'career']),
('demo5', 'https://yourwebsite.com/blog/post', 'Blog Post: Getting Started', 'YOUR_USER_ID_HERE', 321, NOW() - INTERVAL '5 days', 'Learn how to get started with our platform', ARRAY['blog', 'tutorial', 'getting-started']),
('demo6', 'https://calendly.com/yourname/meeting', 'Schedule a Meeting', 'YOUR_USER_ID_HERE', 278, NOW() - INTERVAL '3 days', 'Book a 30-minute consultation call', ARRAY['meeting', 'consultation', 'calendar']),
('demo7', 'https://docs.yourproject.com/api', 'API Documentation', 'YOUR_USER_ID_HERE', 156, NOW() - INTERVAL '1 day', 'Complete API reference and examples', ARRAY['api', 'docs', 'reference']),
('demo8', 'https://discord.gg/yourcommunity', 'Join Our Community', 'YOUR_USER_ID_HERE', 89, NOW() - INTERVAL '6 hours', 'Connect with other developers', ARRAY['discord', 'community', 'chat']);

-- Demo analytics data with realistic distribution
-- This creates 30 days of analytics data with proper device, browser, and location distribution

-- Generate analytics for the last 30 days
DO $$
DECLARE
    i INTEGER;
    j INTEGER;
    current_date TIMESTAMP;
    device_types TEXT[] := ARRAY['Mobile', 'Desktop', 'Tablet'];
    browsers TEXT[] := ARRAY['Chrome', 'Safari', 'Firefox', 'Edge', 'Opera'];
    countries TEXT[] := ARRAY['US', 'GB', 'CA', 'AU', 'DE', 'FR', 'JP', 'IN', 'BR', 'MX'];
    regions TEXT[] := ARRAY['California', 'New York', 'Texas', 'Florida', 'London', 'Ontario', 'Queensland', 'Bavaria', 'Île-de-France', 'Tokyo'];
    event_types TEXT[] := ARRAY['click', 'view'];
    short_codes TEXT[] := ARRAY['demo1', 'demo2', 'demo3', 'demo4', 'demo5', 'demo6', 'demo7', 'demo8'];
    lat_values FLOAT[] := ARRAY[37.7749, 40.7128, 29.7604, 25.7617, 51.5074, 43.6532, -27.4698, 48.1351, 48.8566, 35.6762];
    lng_values FLOAT[] := ARRAY[-122.4194, -74.0060, -95.3698, -80.1918, -0.1278, -79.3832, 153.0251, 11.5820, 2.3522, 139.6503];
    referrers TEXT[] := ARRAY['https://google.com', 'https://facebook.com', 'https://twitter.com', 'https://linkedin.com', 'https://reddit.com', 'direct', 'https://github.com', 'https://medium.com'];
    sources TEXT[] := ARRAY['social', 'search', 'direct', 'referral', 'email'];
BEGIN
    -- Loop through each day for the last 30 days
    FOR i IN 0..29 LOOP
        current_date := NOW() - (i * INTERVAL '1 day');
        
        -- Generate 20-80 events per day (more recent days have more activity)
        FOR j IN 1..(20 + (29-i) * 2) LOOP
            INSERT INTO public.link_analytics (
                user_id,
                link_url,
                hashed_ip,
                referrer,
                device_type,
                browser,
                country_code,
                region,
                event_type,
                created_at,
                lat,
                lng,
                short_code,
                link_type,
                source,
                session_id,
                duration_seconds,
                extra_metadata
            ) VALUES (
                'YOUR_USER_ID_HERE',
                'https://example.com/demo',
                'demo_ip_' || (j % 100),
                referrers[1 + (j % array_length(referrers, 1))],
                device_types[1 + (j % array_length(device_types, 1))],
                browsers[1 + (j % array_length(browsers, 1))],
                countries[1 + (j % array_length(countries, 1))],
                regions[1 + (j % array_length(regions, 1))],
                event_types[1 + (j % array_length(event_types, 1))],
                current_date + (random() * INTERVAL '23 hours 59 minutes'),
                lat_values[1 + (j % array_length(lat_values, 1))] + (random() - 0.5) * 0.1,
                lng_values[1 + (j % array_length(lng_values, 1))] + (random() - 0.5) * 0.1,
                short_codes[1 + (j % array_length(short_codes, 1))],
                'shortened_link',
                sources[1 + (j % array_length(sources, 1))],
                gen_random_uuid(),
                CASE 
                    WHEN event_types[1 + (j % array_length(event_types, 1))] = 'view' THEN 15 + (random() * 120)::INTEGER
                    ELSE NULL
                END,
                '{"demo": true, "campaign": "marketing_screenshots"}'::jsonb
            );
        END LOOP;
    END LOOP;
END $$;

-- Demo conversion events
INSERT INTO public.conversion_events (user_id, short_code, event_type, created_at) VALUES
('YOUR_USER_ID_HERE', 'demo1', 'signup', NOW() - INTERVAL '20 days'),
('YOUR_USER_ID_HERE', 'demo1', 'signup', NOW() - INTERVAL '18 days'),
('YOUR_USER_ID_HERE', 'demo1', 'signup', NOW() - INTERVAL '15 days'),
('YOUR_USER_ID_HERE', 'demo2', 'purchase', NOW() - INTERVAL '16 days'),
('YOUR_USER_ID_HERE', 'demo2', 'purchase', NOW() - INTERVAL '14 days'),
('YOUR_USER_ID_HERE', 'demo3', 'form_submit', NOW() - INTERVAL '10 days'),
('YOUR_USER_ID_HERE', 'demo3', 'form_submit', NOW() - INTERVAL '8 days'),
('YOUR_USER_ID_HERE', 'demo4', 'signup', NOW() - INTERVAL '6 days'),
('YOUR_USER_ID_HERE', 'demo5', 'purchase', NOW() - INTERVAL '4 days'),
('YOUR_USER_ID_HERE', 'demo6', 'meeting_booked', NOW() - INTERVAL '2 days'),
('YOUR_USER_ID_HERE', 'demo7', 'api_signup', NOW() - INTERVAL '1 day'),
('YOUR_USER_ID_HERE', 'demo8', 'community_join', NOW() - INTERVAL '4 hours');

-- Demo profile views
INSERT INTO public.profile_views (profile_id, viewer_hash, viewed_at, referrer) VALUES
('YOUR_USER_ID_HERE', 'demo_viewer_1', NOW() - INTERVAL '25 days', 'https://google.com'),
('YOUR_USER_ID_HERE', 'demo_viewer_2', NOW() - INTERVAL '22 days', 'https://linkedin.com'),
('YOUR_USER_ID_HERE', 'demo_viewer_3', NOW() - INTERVAL '20 days', 'direct'),
('YOUR_USER_ID_HERE', 'demo_viewer_4', NOW() - INTERVAL '18 days', 'https://twitter.com'),
('YOUR_USER_ID_HERE', 'demo_viewer_5', NOW() - INTERVAL '15 days', 'https://github.com'),
('YOUR_USER_ID_HERE', 'demo_viewer_6', NOW() - INTERVAL '12 days', 'https://medium.com'),
('YOUR_USER_ID_HERE', 'demo_viewer_7', NOW() - INTERVAL '10 days', 'direct'),
('YOUR_USER_ID_HERE', 'demo_viewer_8', NOW() - INTERVAL '8 days', 'https://reddit.com'),
('YOUR_USER_ID_HERE', 'demo_viewer_9', NOW() - INTERVAL '5 days', 'https://facebook.com'),
('YOUR_USER_ID_HERE', 'demo_viewer_10', NOW() - INTERVAL '3 days', 'direct'),
('YOUR_USER_ID_HERE', 'demo_viewer_11', NOW() - INTERVAL '1 day', 'https://discord.com'),
('YOUR_USER_ID_HERE', 'demo_viewer_12', NOW() - INTERVAL '6 hours', 'direct');

-- Update profile with demo data
UPDATE public.profiles SET 
    username = 'demo_user',
    bio = 'Building amazing products and sharing insights about technology, startups, and digital marketing. Follow for daily tips!',
    updated_at = NOW()
WHERE id = 'YOUR_USER_ID_HERE';

-- Instructions for use:
-- 1. Replace 'YOUR_USER_ID_HERE' with your actual user ID from Supabase Auth
-- 2. Run this script in Supabase SQL Editor
-- 3. This will create 30 days of realistic demo data
-- 4. All analytics components will show meaningful data for screenshots
-- 5. Data includes proper device distribution, browser stats, geographic data, and conversion events
