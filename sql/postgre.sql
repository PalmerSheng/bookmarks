-- 删除旧表（如果存在）
DROP TABLE IF EXISTS public.subreddit_data;

-- 创建新的subreddit数据表
create table public.subreddit_data (
    id text not null,
  subreddit text not null,
  display_name text null,
  title text null,
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
  constraint subreddit_data_pkey primary key (subreddit)
) TABLESPACE pg_default;

-- 索引优化
create index IF not exists idx_subreddit_data_subscribers on public.subreddit_data using btree (subscribers) TABLESPACE pg_default;

create index IF not exists idx_subreddit_data_last_updated on public.subreddit_data using btree (last_updated) TABLESPACE pg_default;

create index IF not exists idx_subreddit_data_hot_posts on public.subreddit_data using gin (hot_posts) TABLESPACE pg_default;