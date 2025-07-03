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
  last_updated timestamp with time zone null default now(),
  created_at timestamp with time zone null default now(),
  constraint subreddit_top_pkey primary key (subreddit)
) TABLESPACE pg_default;

-- 索引优化
create index IF not exists idx_subreddit_top_subscribers on public.subreddit_top using btree (subscribers) TABLESPACE pg_default;

create index IF not exists idx_subreddit_top_last_updated on public.subreddit_top using btree (last_updated) TABLESPACE pg_default;

create index IF not exists idx_subreddit_top_hot_posts on public.subreddit_top using gin (hot_posts) TABLESPACE pg_default;


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