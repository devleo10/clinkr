-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.conversion_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  short_code character varying NOT NULL,
  event_type text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT conversion_events_pkey PRIMARY KEY (id),
  CONSTRAINT conversion_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT conversion_events_short_code_fkey FOREIGN KEY (short_code) REFERENCES public.shortened_links(short_code)
);
CREATE TABLE public.link_analytics (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  link_url text NOT NULL,
  hashed_ip text,
  referrer text,
  device_type text,
  browser text,
  country_code text,
  region text,
  event_type text DEFAULT 'click'::text,
  created_at timestamp with time zone DEFAULT now(),
  lat double precision,
  lng double precision,
  short_code character varying,
  link_type character varying DEFAULT 'shortened_link'::character varying,
  source character varying DEFAULT 'direct'::character varying,
  session_id uuid,
  duration_seconds integer,
  extra_metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT link_analytics_pkey PRIMARY KEY (id),
  CONSTRAINT link_analytics_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.profile_views (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  viewer_hash text NOT NULL,
  viewed_at timestamp with time zone DEFAULT now(),
  referrer text,
  CONSTRAINT profile_views_pkey PRIMARY KEY (id),
  CONSTRAINT profile_views_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  username text NOT NULL UNIQUE,
  bio text,
  profile_picture text,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.shortened_links (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  short_code character varying NOT NULL UNIQUE,
  original_url text NOT NULL,
  title character varying,
  user_id uuid,
  clicks integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone,
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  description text,
  tags ARRAY,
  password text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  order_index integer DEFAULT 0,
  CONSTRAINT shortened_links_pkey PRIMARY KEY (id),
  CONSTRAINT shortened_links_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);