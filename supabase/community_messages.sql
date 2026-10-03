create table if not exists public.community_messages (
  id uuid primary key default gen_random_uuid(),
  brutal_uuid text not null check (char_length(brutal_uuid) between 1 and 100),
  handle text not null check (char_length(handle) between 1 and 32),
  texto text not null check (char_length(texto) between 1 and 280),
  created_at timestamptz not null default now()
);

alter table public.community_messages enable row level security;

create policy "community messages are readable"
  on public.community_messages
  for select
  to anon, authenticated
  using (true);

create policy "community messages are insertable"
  on public.community_messages
  for insert
  to anon, authenticated
  with check (
    char_length(brutal_uuid) between 1 and 100
    and char_length(handle) between 1 and 32
    and char_length(texto) between 1 and 280
  );

alter publication supabase_realtime add table public.community_messages;
