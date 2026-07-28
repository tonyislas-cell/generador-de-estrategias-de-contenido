create table if not exists public.usage_counter (
  id smallint primary key default 1,
  total bigint not null default 0,
  constraint usage_counter_single_row check (id = 1)
);

insert into public.usage_counter (id, total)
values (1, 0)
on conflict (id) do nothing;

alter table public.usage_counter enable row level security;

create policy "usage_counter_public_read"
  on public.usage_counter
  for select
  to anon, authenticated
  using (true);

-- Sin política de escritura directa sobre la tabla: el único camino para
-- incrementar es la función de abajo. Así nadie puede escribir un total
-- arbitrario desde el cliente, solo sumar uno de a la vez.

create or replace function public.increment_kit_usage()
returns void
language sql
security definer
set search_path = public
as $$
  update public.usage_counter set total = total + 1 where id = 1;
$$;

grant execute on function public.increment_kit_usage() to anon, authenticated;
