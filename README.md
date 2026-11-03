# Honeysuckle Pub website (Vue 3)

Public website + staff admin for honeysucklepub.com. Vue 3, Vite, Pinia, Vuetify (admin only),
pdf.js (menu reader). Deployed on Vercel; all content comes from the Rails API on Render.

## Run on your computer

Needs Node 20 or newer.

```bash
npm install
npm run dev        # http://localhost:5173
```

`npm run dev` uses the API on your computer (`http://localhost:3002/api/v1`, set in `.env.development`),
so start the API first (see the API README). To use the live API instead, create `.env.development.local`:

```
VITE_API_BASE_URL=https://api.honeysucklepub.com/api/v1
```

Staff area: http://localhost:5173/login

## Deploy
Push to the branch Vercel deploys from. Optional env var on Vercel:
`VITE_API_BASE_URL` (defaults to `https://api.honeysucklepub.com/api/v1`).

## Pages and where their content is managed

| Page | Route | Managed in |
|---|---|---|
| Home | `/` | Settings (name, tagline), Events (tonight / this week), Branches, Media (featured photos) |
| Branches | `/branches` | Admin → Branches |
| Venue | `/branches/:slug` | Admin → Branches (details + Page sections), Events & Line-ups, Media (photos for that branch) |
| Bar-X | `/bar-x` | the Bar-X venue in Admin → Branches (its story, offer, cocktails are in "Page sections") |
| What's on | `/whats-on` | Admin → Events & Line-ups |
| Menu | `/menu` | Admin → Menu → Menu PDFs |

Retired pages redirect: `/live-sports` → `/whats-on`, `/contact` → footer contacts,
`/register` and `/member/*` → home.

## Menus
Each menu is shown in the site's own PDF reader (`src/components/site/PdfReader.vue`, works on
phones) from the copy stored by the API, with **Download PDF** served by the API. A menu with
only a Google Drive link is shown in Google's viewer until a copy is stored
(Admin → Menu → Menu PDFs → "Copy from link" or "Upload PDF").

## Photos
Until a venue has a photo it shows the Honeysuckle logo (never a stock photo). In
Admin → Branches → Edit → **Upload** (cover photo), or Admin → Media → Add Media → **Upload photo**
(gallery; pick the branch). Uploaded photos are stored by the API.

## Code map
- `src/stores/site.store.js`: every public API call, shared by all pages
- `src/views/public/`: Home, Branches, Venue (also Bar-X), What's on, Menu
- `src/components/site/`: header, footer, page header, venue photo, PDF reader
- `src/components/admin/`: upload button, repeatable rows editor
- `src/assets/styles/site.css`: public design system (classes prefixed `hs-`)
- `index.html` declares Vuetify's CSS layer order first; keep it, or admin buttons and inputs lose their sizes
