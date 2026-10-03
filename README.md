# brutal brew

spa móvil activada por nfc para brutal brew. la experiencia combina una estética de brutalismo digital con artículos breves, playlists de spotify, una recompensa temporal y un muro comunitario compartido.

## overview

la pantalla principal guía al usuario a través de una experiencia editorial en formato carrusel:

- secuencia de arranque `brutal_os > inicializando...` durante 2 segundos;
- temporizador global de 5 minutos con desbloqueo de la recompensa `BRUTAL15`;
- zona inmersiva con 10 textos originales inspirados en series de televisión;
- carrusel horizontal infinito con soporte mobile-first y desktop;
- indicador de lectura: un artículo se marca como `> leído` después de 12 segundos;
- cita asociada al artículo activo;
- reproductor de spotify independiente y disponible desde el inicio para cada texto;
- playlists estables asociadas a cada serie;
- muro comunitario realtime con pseudónimo y mensajes de hasta 280 caracteres;
- botón fijo para reordenar por whatsapp.

el contenido editorial se encuentra en [data/brutalFeed.ts](./data/brutalFeed.ts). cada entrada implementa la interfaz `Article`:

```ts
interface Article {
  source: string;
  title: string;
  author: string;
  paragraphs: string[];
  quote: string;
  spotifyEmbedUrl: string;
}
```

## stack

- next.js 16
- react 19
- typescript
- tailwind css 4
- supabase para persistencia y realtime
- spotify embed player
- vercel como plataforma de despliegue

## requisitos

- node.js 20 o superior;
- npm;
- un proyecto de supabase si se quiere activar el muro compartido.

## desarrollo local

instala las dependencias:

```bash
npm install
```

crea `.env.local` a partir de [.env.example](./.env.example):

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

inicia el servidor:

```bash
npm run dev
```

abre [http://localhost:3000](http://localhost:3000).

## supabase

para activar el muro comunitario:

1. crea un proyecto en supabase;
2. abre **sql editor**;
3. ejecuta [supabase/community_messages.sql](./supabase/community_messages.sql);
4. configura las variables de entorno de `.env.local`;
5. reinicia el servidor de desarrollo.

el cliente usa únicamente la clave pública `anon`. no uses una `service_role` key en el navegador.

el esquema crea `public.community_messages`, habilita row level security y agrega la tabla a `supabase_realtime`. el muro muestra mensajes compartidos entre usuarios mediante eventos `insert`.

## comandos

```bash
npm run dev
npm run lint
npm run build
npm run start
```

antes de desplegar, ejecuta:

```bash
npm run lint
npm run build
```

## despliegue en vercel

importa el repositorio desde [vercel](https://vercel.com/new) y selecciona este proyecto. no necesitas un `vercel.json`: vercel detecta automáticamente la aplicación next.js.

en la configuración del proyecto de vercel agrega estas variables para los entornos **preview** y **production**:

```env
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

después de guardar las variables, vuelve a desplegar para que estén disponibles en el build y en el navegador.

## estructura principal

```text
data/
  brutalFeed.ts             # artículos, citas y playlists
src/
  app/
    page.tsx                # composición de la spa
    layout.tsx              # metadata y layout global
    globals.css             # estilos globales y tipografía
  components/
    BootSequence.tsx        # secuencia de arranque
    CommunityWall.tsx       # muro persistente y realtime
    HeaderTimer.tsx         # temporizador y recompensa
    ImmersionZone.tsx       # carrusel y progreso de lectura
    SpotifyPlayer.tsx       # reproductor expandible
    ReorderFAB.tsx          # cta de recompra
  hooks/
    useZeroAuth.ts          # identidad local anónima
  lib/
    supabase.ts             # cliente browser de supabase
supabase/
  community_messages.sql    # esquema y políticas del muro
```

## notas

- `useZeroAuth` genera un identificador local y un pseudónimo; no es autenticación real.
- el autoplay de spotify puede estar limitado por el navegador o por spotify.
- el contenido del muro es público bajo las políticas actuales de supabase; para producción se recomienda agregar moderación y rate limiting.
