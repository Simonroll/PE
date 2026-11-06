create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null,
  author text not null,
  pages integer not null,
  status text not null default 'To Read',
  created_at timestamptz not null default now(),
  constraint books_title_check check (btrim(title) <> '' and char_length(title) <= 80),
  constraint books_author_check check (btrim(author) <> '' and char_length(author) <= 60),
  constraint books_pages_check check (pages between 1 and 5000),
  constraint books_status_check check (status in ('To Read', 'Reading', 'Finished'))
);

create index if not exists books_user_created_idx on public.books (user_id, created_at desc);

alter table public.books enable row level security;

revoke all on public.books from anon;
revoke all on public.books from authenticated;
grant select, insert, delete on public.books to authenticated;
grant update (status) on public.books to authenticated;

drop policy if exists "books_select_own" on public.books;
drop policy if exists "books_insert_own" on public.books;
drop policy if exists "books_update_own" on public.books;
drop policy if exists "books_delete_own" on public.books;

create policy "books_select_own" on public.books
  for select to authenticated
  using (auth.uid() = user_id);

create policy "books_insert_own" on public.books
  for insert to authenticated
  with check (auth.uid() = user_id);

create policy "books_update_own" on public.books
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "books_delete_own" on public.books
  for delete to authenticated
  using (auth.uid() = user_id);
