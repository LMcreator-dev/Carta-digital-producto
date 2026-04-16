# Supabase

Esta carpeta concentra la configuracion real del backend para este repo.

## Estado actual

El frontend del proyecto esta preparado para trabajar con:

- schema principal: `CartaDigitalLM`
- schema `public` para RPCs
- tabla privada de perfil: `CartaDigitalLM.Perfil`
- tablas de carta: `CartaDigitalLM.Categorias` y `CartaDigitalLM.Menu`
- tablas de menus compuestos: `CartaDigitalLM.Menus`, `Menus_programacion`, `Menus_campos`, `Menus_campos_platos`
- vista publica: `CartaDigitalLM.Perfil_publico`
- bucket de storage: `imenu`

## Problemas ya detectados

### `permission denied for table Perfil`

Ese error en el admin significa que el usuario autenticado no tiene permisos SQL o no tiene policies RLS para leer y escribir su propia fila en `CartaDigitalLM.Perfil`.

El admin hace estas operaciones sobre `Perfil`:

- `select * where user_id = auth.uid()`
- `select user_id where user_id = auth.uid()`
- `insert`
- `update`

Por tanto necesitas las dos capas:

1. `GRANT` sobre la tabla.
2. Policies RLS owner-only.

El archivo [setup-carta-digital.sql](</c:/Users/Maestry/Desktop/iCreate LOCAL/iMenu/supabase/setup-carta-digital.sql>) deja esto listo.

### `permission denied for schema CartaDigitalLM`

Esto ocurre cuando falta:

- exponer `CartaDigitalLM` en `Settings > API > Exposed schemas`
- `grant usage on schema "CartaDigitalLM" to anon, authenticated`

### `Could not find the table CartaDigitalLM.Perfil_publico`

No existe la vista publica o no se ha hecho `grant select` sobre ella.

### `Could not find the function public.imenu_get_wifi_by_user`

La funcion RPC no existe en `public` o no tiene `grant execute`.

## Orden recomendado de configuracion

1. Verifica en Supabase API Settings que `CartaDigitalLM` esta expuesto.
2. Ejecuta [setup-carta-digital.sql](</c:/Users/Maestry/Desktop/iCreate LOCAL/iMenu/supabase/setup-carta-digital.sql>).
3. Ejecuta [setup-menus-compuestos.sql](</c:/Users/Maestry/Desktop/iCreate LOCAL/iMenu/supabase/setup-menus-compuestos.sql>) si quieres habilitar la cuarta pestana `Menus`.
4. Ejecuta [bar-tropical-template.sql](</c:/Users/Maestry/Desktop/iCreate LOCAL/iMenu/supabase/bar-tropical-template.sql>) si quieres cargar la demo.
5. Publica el repo para que GitHub Pages sirva `public/demo/bar-tropical`.

## Que deja configurado `setup-carta-digital.sql`

### Grants

- uso del schema `CartaDigitalLM` para `anon` y `authenticated`
- lectura publica de `Categorias`, `Menu` y `Perfil_publico`
- CRUD autenticado en `Perfil`, `Categorias` y `Menu`
- permisos sobre secuencias del schema para inserts desde el admin

### Vista publica

Crea o reemplaza:

```sql
"CartaDigitalLM"."Perfil_publico"
```

Incluye solo campos seguros:

- `user_id`
- `nombre`
- `portada_url`
- `telefono`
- `direccion`
- `reviews_url`
- `slug`
- `google_place_id`
- `wifi_name`
- `color_principal`
- `plato_imagen_default_url`
- `logo_url`
- `personalizacion_menu`

No expone:

- `wifi_pass`
- `wifi_pin`

### RLS

Deja estas reglas:

- `Perfil`: solo el owner autenticado puede seleccionar, insertar, actualizar y borrar su fila
- `Categorias`: `anon` puede leer solo activas; el owner autenticado tiene CRUD de sus filas
- `Menu`: `anon` puede leer solo activos; el owner autenticado tiene CRUD de sus filas

### RPCs

Define o actualiza en `public`:

- `public.imenu_get_wifi_by_user(uuid, text)`
- `public.imenu_set_wifi_pin(text)`

Nota: la implementacion actual usa `wifi_pin` en texto plano porque asi esta montada tu tabla `Perfil`. Mas adelante conviene migrarlo a hash.

## Tabla `Perfil` actualmente conocida

Segun el esquema compartido, `CartaDigitalLM.Perfil` contiene:

- `user_id` uuid pk
- `nombre`
- `portada_url`
- `telefono`
- `direccion`
- `reviews_url`
- `slug`
- `google_place_id`
- `wifi_name`
- `wifi_pass`
- `wifi_pin`
- `color_principal`
- `plato_imagen_default_url`
- `logo_url`
- `cuenta_id`
- `personalizacion_menu`

## Plantilla demo `Bar Tropical`

El seed [bar-tropical-template.sql](</c:/Users/Maestry/Desktop/iCreate LOCAL/iMenu/supabase/bar-tropical-template.sql>) hace esto:

- garantiza que exista la fila de `Perfil`
- actualiza branding y portada demo
- reemplaza la carta actual del usuario demo
- crea 8 categorias
- inserta 40 platos
- asigna imagenes demo desde `public/demo/bar-tropical`
- asigna alergenos usando las keys reales del repo en `/alergenos`

### Keys de alergenos usadas

- `gluten`
- `lacteos`
- `huevos`
- `pescado`
- `crustaceos`
- `moluscos`
- `sesamo`
- `frutos_secos`

## Storage

Si el admin sube imagenes, el bucket `imenu` necesita permisos y policies. El enfoque mas simple para este repo es:

- permitir uso del schema `storage` a `authenticated`
- permitir operar sobre `storage.objects` y `storage.buckets`
- restringir por carpeta `auth.uid() || '/%'`

Si quieres, esto se puede separar luego en otro SQL dedicado a storage.

## Archivos utiles

- [setup-carta-digital.sql](</c:/Users/Maestry/Desktop/iCreate LOCAL/iMenu/supabase/setup-carta-digital.sql>)
- [setup-menus-compuestos.sql](</c:/Users/Maestry/Desktop/iCreate LOCAL/iMenu/supabase/setup-menus-compuestos.sql>)
- [bar-tropical-template.sql](</c:/Users/Maestry/Desktop/iCreate LOCAL/iMenu/supabase/bar-tropical-template.sql>)
