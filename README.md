# BoothBuzz Admin

Vite + React admin portal — wired to `boothbuzz-api` via a Supabase-compatible client (`src/lib/supabase.ts`).

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

Runs at http://localhost:5173 — set `VITE_API_URL` to your API base, e.g. `http://172.31.3.44:3001/api/v1`.

Login calls `POST …/admin/auth/login`; the API must return a `token` in the JSON (Bearer auth). Cookies alone do not work cross-origin from the browser.

## Login (seed)

| Role | Email | Password |
|------|-------|----------|
| Super admin | `admin@boothbuzz.in` | `admin123` |
| Org admin | `orgadmin@boothbuzz.in` | `admin123` |

Auth uses httpOnly cookie `boothbuzz_admin_token` — no Supabase.

## Notes

- Legacy Supabase calls in pages are shimmed to REST — no `@supabase/supabase-js`.
- Billing, POs, and societies return empty/stub data until full schema migration.
