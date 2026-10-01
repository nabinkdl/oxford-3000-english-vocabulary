create table if not exists public.user_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  checked_ids text[] not null default '{}',
  starred_ids text[] not null default '{}',
  quiz_stats jsonb not null default '{"quizzesPlayed":0,"totalQuestionsAnswered":0,"totalCorrect":0,"bestStreak":0,"currentStreak":0,"lastPlayedTimestamp":0,"recentScores":[]}'::jsonb,
  meaning_language text not null default 'ne',
  updated_at timestamptz not null default now()
);

alter table public.user_progress enable row level security;

grant select, insert, update on table public.user_progress to authenticated;

drop policy if exists "Users can read their own progress" on public.user_progress;
create policy "Users can read their own progress"
  on public.user_progress for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own progress" on public.user_progress;
create policy "Users can insert their own progress"
  on public.user_progress for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own progress" on public.user_progress;
create policy "Users can update their own progress"
  on public.user_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
