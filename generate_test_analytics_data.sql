-- Generate Sample Analytics Data for Testing Premium Dashboard
-- Run this in your Supabase SQL editor to create test data

-- Step 1: Get current user ID
DO $$
DECLARE
  current_user_id UUID;
  sample_short_codes TEXT[];
  device_types TEXT[] := ARRAY['mobile', 'desktop', 'tablet'];
  browsers TEXT[] := ARRAY['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera'];
  countries TEXT[] := ARRAY['US', 'CA', 'GB', 'DE', 'FR', 'AU', 'JP', 'BR', 'IN', 'CN'];
  i INTEGER;
  random_device TEXT;
  random_browser TEXT;
  random_country TEXT;
  random_lat FLOAT;
  random_lng FLOAT;
  random_date TIMESTAMP;
BEGIN
  -- Get the first user ID
  SELECT id INTO current_user_id FROM auth.users LIMIT 1;
  
  IF current_user_id IS NULL THEN
    RAISE NOTICE 'No users found. Please create a user first.';
    RETURN;
  END IF;
  
  RAISE NOTICE 'Generating sample analytics data for user: %', current_user_id;
  
  -- Get existing short codes for this user
  SELECT ARRAY_AGG(short_code) INTO sample_short_codes
  FROM shortened_links 
  WHERE user_id = current_user_id AND is_active = true;
  
  -- If no short codes exist, create some sample ones
  IF sample_short_codes IS NULL OR array_length(sample_short_codes, 1) = 0 THEN
    INSERT INTO shortened_links (short_code, original_url, title, user_id, created_at, is_active)
    VALUES 
      ('test1', 'https://example.com', 'Test Link 1', current_user_id, NOW() - INTERVAL '30 days', true),
      ('test2', 'https://google.com', 'Test Link 2', current_user_id, NOW() - INTERVAL '20 days', true),
      ('test3', 'https://github.com', 'Test Link 3', current_user_id, NOW() - INTERVAL '10 days', true);
    
    sample_short_codes := ARRAY['test1', 'test2', 'test3'];
    RAISE NOTICE 'Created sample short codes: %', sample_short_codes;
  END IF;
  
  -- Clear existing analytics data for this user
  DELETE FROM link_analytics WHERE user_id = current_user_id;
  DELETE FROM profile_views WHERE profile_id = current_user_id;
  
  -- Generate sample analytics data for the last 30 days
  FOR i IN 1..150 LOOP
    -- Random device type
    random_device := device_types[1 + floor(random() * array_length(device_types, 1))];
    
    -- Random browser
    random_browser := browsers[1 + floor(random() * array_length(browsers, 1))];
    
    -- Random country
    random_country := countries[1 + floor(random() * array_length(countries, 1))];
    
    -- Random coordinates (simplified)
    random_lat := -90 + (random() * 180);
    random_lng := -180 + (random() * 360);
    
    -- Random date within last 30 days
    random_date := NOW() - (random() * INTERVAL '30 days');
    
    -- Insert analytics record
    INSERT INTO link_analytics (
      user_id,
      link_url,
      short_code,
      device_type,
      browser,
      country_code,
      event_type,
      link_type,
      lat,
      lng,
      created_at
    ) VALUES (
      current_user_id,
      'https://example.com',
      sample_short_codes[1 + floor(random() * array_length(sample_short_codes, 1))],
      random_device,
      random_browser,
      random_country,
      'click',
      'shortened_link',
      random_lat,
      random_lng,
      random_date
    );
  END LOOP;
  
  -- Generate sample profile views
  FOR i IN 1..75 LOOP
    random_date := NOW() - (random() * INTERVAL '30 days');
    
    INSERT INTO profile_views (
      profile_id,
      viewer_hash,
      referrer,
      viewed_at
    ) VALUES (
      current_user_id,
      'viewer_' || i,
      'https://google.com',
      random_date
    );
  END LOOP;
  
  RAISE NOTICE 'Sample data generation completed!';
  RAISE NOTICE 'Generated 150 analytics records and 75 profile views';
END $$;

-- Step 2: Verify the data was created
SELECT 
  'Analytics Data Summary' as info,
  COUNT(*) as total_analytics_records,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT short_code) as unique_short_codes,
  COUNT(DISTINCT device_type) as unique_device_types,
  COUNT(DISTINCT browser) as unique_browsers
FROM link_analytics;

SELECT 
  'Profile Views Summary' as info,
  COUNT(*) as total_profile_views,
  COUNT(DISTINCT profile_id) as unique_profiles,
  COUNT(DISTINCT viewer_hash) as unique_viewers
FROM profile_views;

-- Step 3: Show device distribution
SELECT 
  'Device Distribution' as info,
  device_type,
  COUNT(*) as count,
  ROUND((COUNT(*) * 100.0 / SUM(COUNT(*)) OVER()), 1) as percentage
FROM link_analytics
GROUP BY device_type
ORDER BY count DESC;

-- Step 4: Show browser distribution
SELECT 
  'Browser Distribution' as info,
  browser,
  COUNT(*) as count,
  ROUND((COUNT(*) * 100.0 / SUM(COUNT(*)) OVER()), 1) as percentage
FROM link_analytics
GROUP BY browser
ORDER BY count DESC;
