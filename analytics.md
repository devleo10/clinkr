📊 Analytics Guide for Link Tracking SaaS

This document describes how to calculate analytics metrics from the Supabase schema.
All queries are Postgres-optimized (aggregation happens in the DB).

1. 🔎 Overview Metrics
1.1 Total Clicks
SELECT COUNT(*) AS total_clicks
FROM link_analytics
WHERE event_type = 'click';

1.2 Total Views
SELECT COUNT(*) AS total_views
FROM link_analytics
WHERE event_type = 'view';

1.3 Unique Visitors
SELECT COUNT(DISTINCT hashed_ip) AS unique_visitors
FROM link_analytics;

1.4 Conversion Rate

If using event_type = 'conversion':

SELECT 
  (COUNT(*) FILTER (WHERE event_type = 'conversion')::DECIMAL
   / NULLIF(COUNT(*) FILTER (WHERE event_type = 'view'), 0)) * 100 AS conversion_rate
FROM link_analytics;


If using conversion_events table:

SELECT 
  (COUNT(DISTINCT ce.id)::DECIMAL
   / NULLIF(COUNT(DISTINCT la.id), 0)) * 100 AS conversion_rate
FROM link_analytics la
LEFT JOIN conversion_events ce ON ce.short_code = la.short_code;

1.5 Average Time
SELECT AVG(duration_seconds) AS avg_time_seconds
FROM link_analytics
WHERE duration_seconds IS NOT NULL;

1.6 Change in Metrics (Clicks Example)

Compare latest 2 days:

WITH daily AS (
  SELECT DATE(created_at) AS day, COUNT(*) AS clicks
  FROM link_analytics
  WHERE event_type = 'click'
  GROUP BY day
  ORDER BY day DESC
  LIMIT 2
)
SELECT (MAX(clicks) - MIN(clicks)) AS change_in_clicks
FROM daily;


👉 Repeat for views, visitors, conversions, avg_time.

2. 🌍 Geography
2.1 Heatmap Data
SELECT lat, lng, COUNT(*) AS click_count
FROM link_analytics
WHERE lat IS NOT NULL AND lng IS NOT NULL
GROUP BY lat, lng;

2.2 Country Visits
SELECT country_code, COUNT(*) AS visits
FROM link_analytics
GROUP BY country_code
ORDER BY visits DESC;

2.3 Country Percentage
SELECT country_code,
       ROUND( (COUNT(*) * 100.0 / SUM(COUNT(*)) OVER()), 2) AS percentage
FROM link_analytics
GROUP BY country_code
ORDER BY percentage DESC;

3. 📱 Devices & Browsers
3.1 Device Type Count
SELECT device_type, COUNT(*) AS device_count
FROM link_analytics
GROUP BY device_type;

3.2 Device Type Percentage
SELECT device_type,
       ROUND( (COUNT(*) * 100.0 / SUM(COUNT(*)) OVER()), 2) AS percentage
FROM link_analytics
GROUP BY device_type;

3.3 Browser Count
SELECT browser, COUNT(*) AS browser_count
FROM link_analytics
GROUP BY browser;

3.4 Browser Percentage
SELECT browser,
       ROUND( (COUNT(*) * 100.0 / SUM(COUNT(*)) OVER()), 2) AS percentage
FROM link_analytics
GROUP BY browser;

4. 📈 Trends
4.1 Daily Clicks & Views
SELECT 
  DATE(created_at) AS day,
  COUNT(*) FILTER (WHERE event_type = 'click') AS clicks,
  COUNT(*) FILTER (WHERE event_type = 'view') AS views
FROM link_analytics
GROUP BY day
ORDER BY day;

5. 🗺️ Geography (Component-Level)
5.1 Filtered Analytics by Country/Region
SELECT region, country_code, COUNT(*) AS visits
FROM link_analytics
WHERE country_code = 'IN'  -- filter example
GROUP BY region, country_code
ORDER BY visits DESC;

5.2 Location Clusters (Lat/Lng)
SELECT lat, lng, COUNT(*) AS visit_count
FROM link_analytics
WHERE lat IS NOT NULL AND lng IS NOT NULL
GROUP BY lat, lng;

5.3 Location Click Count
SELECT country_code, COUNT(*) AS click_count
FROM link_analytics
WHERE event_type = 'click'
GROUP BY country_code;

5.4 Display Name (Region / Country)
SELECT CONCAT(region, ', ', country_code) AS display_name, COUNT(*) AS total
FROM link_analytics
GROUP BY region, country_code
ORDER BY total DESC;

6. 🚀 Example: Supabase JS Query (Daily Trends)
const { data, error } = await supabase.rpc('get_daily_trends'); 
// OR use raw SQL as shown above

if (error) console.error(error);

const dailyData = data.map(row => ({
  date: row.day,
  clicks: Number(row.clicks) || 0,
  views: Number(row.views) || 0,
}));


✅ With this doc in your codebase, you’ll never worry about Cursor hallucinating queries.
✅ Each feature → mapped to a direct SQL query.
✅ Easy to convert into Supabase RPC functions for even cleaner backend calls.

