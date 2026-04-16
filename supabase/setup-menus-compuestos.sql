begin;

create table if not exists "CartaDigitalLM"."Menus" (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  nombre text not null,
  descripcion text null,
  activo boolean not null default true,
  publicado boolean not null default true,
  auto_publicacion boolean not null default false,
  orden integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists "CartaDigitalLM"."Menus_programacion" (
  id uuid primary key default gen_random_uuid(),
  menu_id uuid not null references "CartaDigitalLM"."Menus" (id) on delete cascade,
  weekday integer not null,
  activa boolean not null default true,
  orden integer not null default 0,
  created_at timestamptz not null default now(),
  constraint menus_programacion_weekday_chk check (weekday between 0 and 6)
);

create table if not exists "CartaDigitalLM"."Menus_campos" (
  id uuid primary key default gen_random_uuid(),
  menu_id uuid not null references "CartaDigitalLM"."Menus" (id) on delete cascade,
  nombre text not null,
  descripcion text null,
  activo boolean not null default true,
  permite_multiples boolean not null default true,
  orden integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists "CartaDigitalLM"."Menus_campos_platos" (
  id uuid primary key default gen_random_uuid(),
  menu_campo_id uuid not null references "CartaDigitalLM"."Menus_campos" (id) on delete cascade,
  plato_id text not null,
  precio_override numeric(10,2) null,
  notas text null,
  activo boolean not null default true,
  orden integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_menus_user_id
  on "CartaDigitalLM"."Menus" (user_id, orden);

create index if not exists idx_menus_programacion_menu_id
  on "CartaDigitalLM"."Menus_programacion" (menu_id, weekday, orden);

create index if not exists idx_menus_campos_menu_id
  on "CartaDigitalLM"."Menus_campos" (menu_id, orden);

create index if not exists idx_menus_campos_platos_campo_id
  on "CartaDigitalLM"."Menus_campos_platos" (menu_campo_id, orden);

grant select on table "CartaDigitalLM"."Menus" to anon, authenticated;
grant select on table "CartaDigitalLM"."Menus_programacion" to anon, authenticated;
grant select on table "CartaDigitalLM"."Menus_campos" to anon, authenticated;
grant select on table "CartaDigitalLM"."Menus_campos_platos" to anon, authenticated;

grant insert, update, delete on table "CartaDigitalLM"."Menus" to authenticated;
grant insert, update, delete on table "CartaDigitalLM"."Menus_programacion" to authenticated;
grant insert, update, delete on table "CartaDigitalLM"."Menus_campos" to authenticated;
grant insert, update, delete on table "CartaDigitalLM"."Menus_campos_platos" to authenticated;

alter table "CartaDigitalLM"."Menus" enable row level security;
alter table "CartaDigitalLM"."Menus_programacion" enable row level security;
alter table "CartaDigitalLM"."Menus_campos" enable row level security;
alter table "CartaDigitalLM"."Menus_campos_platos" enable row level security;

drop policy if exists menus_public_read on "CartaDigitalLM"."Menus";
create policy menus_public_read
on "CartaDigitalLM"."Menus"
for select
to anon, authenticated
using (
  coalesce(activo, true) = true
  and coalesce(publicado, true) = true
);

drop policy if exists menus_owner_select on "CartaDigitalLM"."Menus";
create policy menus_owner_select
on "CartaDigitalLM"."Menus"
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists menus_owner_insert on "CartaDigitalLM"."Menus";
create policy menus_owner_insert
on "CartaDigitalLM"."Menus"
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists menus_owner_update on "CartaDigitalLM"."Menus";
create policy menus_owner_update
on "CartaDigitalLM"."Menus"
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists menus_owner_delete on "CartaDigitalLM"."Menus";
create policy menus_owner_delete
on "CartaDigitalLM"."Menus"
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists menus_programacion_public_read on "CartaDigitalLM"."Menus_programacion";
create policy menus_programacion_public_read
on "CartaDigitalLM"."Menus_programacion"
for select
to anon, authenticated
using (
  exists (
    select 1
    from "CartaDigitalLM"."Menus" m
    where m.id = menu_id
      and coalesce(m.activo, true) = true
      and coalesce(m.publicado, true) = true
  )
);

drop policy if exists menus_programacion_owner_all on "CartaDigitalLM"."Menus_programacion";
create policy menus_programacion_owner_all
on "CartaDigitalLM"."Menus_programacion"
for all
to authenticated
using (
  exists (
    select 1
    from "CartaDigitalLM"."Menus" m
    where m.id = menu_id
      and m.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from "CartaDigitalLM"."Menus" m
    where m.id = menu_id
      and m.user_id = auth.uid()
  )
);

drop policy if exists menus_campos_public_read on "CartaDigitalLM"."Menus_campos";
create policy menus_campos_public_read
on "CartaDigitalLM"."Menus_campos"
for select
to anon, authenticated
using (
  exists (
    select 1
    from "CartaDigitalLM"."Menus" m
    where m.id = menu_id
      and coalesce(m.activo, true) = true
      and coalesce(m.publicado, true) = true
  )
);

drop policy if exists menus_campos_owner_all on "CartaDigitalLM"."Menus_campos";
create policy menus_campos_owner_all
on "CartaDigitalLM"."Menus_campos"
for all
to authenticated
using (
  exists (
    select 1
    from "CartaDigitalLM"."Menus" m
    where m.id = menu_id
      and m.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from "CartaDigitalLM"."Menus" m
    where m.id = menu_id
      and m.user_id = auth.uid()
  )
);

drop policy if exists menus_campos_platos_public_read on "CartaDigitalLM"."Menus_campos_platos";
create policy menus_campos_platos_public_read
on "CartaDigitalLM"."Menus_campos_platos"
for select
to anon, authenticated
using (
  exists (
    select 1
    from "CartaDigitalLM"."Menus_campos" mc
    join "CartaDigitalLM"."Menus" m on m.id = mc.menu_id
    where mc.id = menu_campo_id
      and coalesce(m.activo, true) = true
      and coalesce(m.publicado, true) = true
  )
);

drop policy if exists menus_campos_platos_owner_all on "CartaDigitalLM"."Menus_campos_platos";
create policy menus_campos_platos_owner_all
on "CartaDigitalLM"."Menus_campos_platos"
for all
to authenticated
using (
  exists (
    select 1
    from "CartaDigitalLM"."Menus_campos" mc
    join "CartaDigitalLM"."Menus" m on m.id = mc.menu_id
    where mc.id = menu_campo_id
      and m.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from "CartaDigitalLM"."Menus_campos" mc
    join "CartaDigitalLM"."Menus" m on m.id = mc.menu_id
    where mc.id = menu_campo_id
      and m.user_id = auth.uid()
  )
);

commit;
