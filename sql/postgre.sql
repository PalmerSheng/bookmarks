-- 删除旧表（如果存在）
DROP TABLE IF EXISTS public.subreddit_top;

-- 创建新的subreddit数据表
create table public.subreddit_top (
    id text not null,
  subreddit text not null,
  display_name text null,
  title text null,
  title_zh text null,
  description text null,
  subscribers integer null default 0,
  active_users integer null default 0,
  created_utc bigint null,
  subreddit_type text null,
  public_description text null,
  icon_img text null,
  banner_img text null,
  hot_posts jsonb null,
  is_default boolean null default false,
  last_updated timestamp with time zone null default now(),
  created_at timestamp with time zone null default now(),
  constraint subreddit_top_pkey primary key (subreddit)
) TABLESPACE pg_default;

-- 索引优化
create index IF not exists idx_subreddit_top_subscribers on public.subreddit_top using btree (subscribers) TABLESPACE pg_default;

create index IF not exists idx_subreddit_top_last_updated on public.subreddit_top using btree (last_updated) TABLESPACE pg_default;

create index IF not exists idx_subreddit_top_hot_posts on public.subreddit_top using gin (hot_posts) TABLESPACE pg_default;

-- 为is_default字段添加索引
create index IF not exists idx_subreddit_top_is_default on public.subreddit_top using btree (is_default) TABLESPACE pg_default;

-- 创建新的subreddit数据表
create table public.sys_config (
    id text not null,
  biz_code text not null,
  data jsonb null,
  last_updated timestamp with time zone null default now(),
  created_at timestamp with time zone null default now(),
  constraint sys_config_pkey primary key (biz_code)
) TABLESPACE pg_default;


INSERT INTO public.sys_config (id, biz_code, data)
VALUES (gen_random_uuid()::text, 'reddit_default_subreddits', '{"subreddits":["saas","technology"]}');

-- 插入默认的subreddit记录，设置is_default为true
INSERT INTO public.subreddit_top (id, subreddit, display_name, title, is_default, created_at, last_updated)
VALUES 
  ('saas', 'saas', 'saas', 'SaaS - Software as a Service', true, now(), now()),
  ('technology', 'technology', 'technology', 'Technology', true, now(), now())
ON CONFLICT (subreddit) DO UPDATE SET 
  is_default = EXCLUDED.is_default,
  last_updated = now();

-- 如果需要设置其他已存在的subreddit为默认，可以使用以下语句：
-- UPDATE public.subreddit_top SET is_default = true WHERE subreddit IN ('your_subreddit_name');