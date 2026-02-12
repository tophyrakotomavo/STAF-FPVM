# MiM Sampana Manager 🏛️

**Fitantanana Fandaharam-potoana sy Fanasana — Multi-Church**

---

## 🏗️ Architecture

```
Multi-Church App
├── Super Admin        → mahita fiangonana rehetra, sampana, mpampiasa
├── Church Admin       → mahita ny fiangonana azony ihany
└── Leader (Sampana)   → manampiditra programa, manasa sampana, mamaly invitation
```

## 📦 Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + RLS)

---

## 🚀 Fomba fametrahana (Setup)

### 1. Supabase Project

1. Mandeha amin'ny [supabase.com](https://supabase.com) → mamorona project vaovao
2. Mandeha amin'ny **SQL Editor**
3. Copier ny votoatin'ny `supabase/schema.sql` → run

### 2. Environment Variables

Mamorona `.env.local` avy amin'ny `.env.local.example`:
```bash
cp .env.local.example .env.local
```

Fenoy ny values avy amin'ny Supabase Dashboard → Settings → API:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...   ← TSIA PUBLIC! Server-side ihany
```

### 3. Install & Run

```bash
npm install
npm run dev
```

Mandeha amin'ny [http://localhost:3000](http://localhost:3000)

### 4. Mamorona Super Admin voalohany

Ao amin'ny Supabase Dashboard → Authentication → Users → **Add user**:
- Email: `admin@mim.mg`
- Password: ny tianao

Avy eo ao amin'ny **SQL Editor**:
```sql
-- Replace 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' with the user's UUID from Auth
INSERT INTO profiles (id, full_name, email, role, church_id)
VALUES (
  'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  'Super Admin',
  'admin@mim.mg',
  'super_admin',
  NULL
);
```

---

## 📁 Structure ny Fichier

```
mim-sampana-manager/
├── app/
│   ├── api/
│   │   └── admin/create-user/route.ts   ← API mpamorona mpampiasa
│   ├── dashboard/
│   │   ├── layout.tsx                   ← Dashboard shell + Sidebar
│   │   ├── page.tsx                     ← Home / Stats
│   │   ├── churches/                    ← CRUD Fiangonana (super_admin)
│   │   ├── sampana/                     ← CRUD Sampana (admin)
│   │   ├── users/                       ← Mpampiasa (admin)
│   │   ├── programme/                   ← Programa ny Leader
│   │   ├── search/                      ← Recherche dispo
│   │   └── invitations/                 ← Fanasana (send + respond)
│   ├── login/page.tsx                   ← Login page
│   └── globals.css
├── components/
│   ├── Sidebar.tsx                      ← Navigation
│   └── InviteModal.tsx                  ← Modal fanasana
├── lib/
│   ├── supabase/
│   │   ├── client.ts                    ← Browser client
│   │   └── server.ts                    ← Server client
│   └── types.ts                         ← TypeScript types
├── middleware.ts                        ← Auth guard
└── supabase/
    └── schema.sql                       ← DB schema + RLS
```

---

## 🔐 Roles sy Fahazoan-dalana (Permissions)

| Action | Super Admin | Church Admin | Leader |
|--------|:-----------:|:------------:|:------:|
| Mahita fiangonana rehetra | ✅ | ❌ | ❌ |
| CRUD fiangonana | ✅ | ❌ | ❌ |
| CRUD sampana | ✅ | ✅ (ny azony) | ❌ |
| Mamorona mpampiasa | ✅ | ✅ (leader ihany) | ❌ |
| Mampiditra programa | ✅ | ❌ | ✅ (sampanany) |
| Manasa sampana | ✅ | ✅ | ✅ |
| Mamaly invitation | — | — | ✅ (sampanany) |

---

## 📨 Invitation Flow

```
Leader A (Ambohipo) mitady sampana dispo amin'ny 22 Fév
  → Mivoaka: Kanana ✅ DISPO, Ankaraobato ❌ MISY PROGRAMA
  → Tsindrio "Manasa" amin'i Kanana
  → Misy InviteModal → soratao hafatra → "Halefa"
  → Status: PENDING

Leader B (Kanana) → vao miditra Dashboard → misy notification
  → Mandeha amin'ny "Fanasana" → Tab "Tonga"
  → Mahita invitation avy amin'i Ambohipo ho an'ny 22 Fév
  → Tsindrio "Hamaly" → soratao fanamarihana → "Noraisina" na "Nandavana"
  → Status: ACCEPTED / REFUSED

Leader A → mahita ny valin'ny invitation amin'ny "Fanasana" → Tab "Nalefa"
```

---

## 🎨 Design Decisions

- **Violet/Purple theme** — manasongadina ny maha-fivavahana ny app
- **Playfair Display** — display font majestic
- **DM Sans** — body font clean & legible
- **Glass morphism** ao amin'ny login
- **Row Level Security** — ny data dia voaaro tsara

---

## 🔧 Customisation

### Hanampy sampana ho an'ny fiangonana vaovao

Aorian'ny namoronana fiangonana (amin'ny Churches page), mandeha amin'ny Sampana page → Hanampy sampana → Fidio ny fiangonana.

### Hanova loko ny sampana

Amin'ny Sampana page, ny color picker dia misy palette manomana. Azo ovaina ny `COLORS` array ao amin'ny `SampanaClient.tsx`.

### Hanampy maromaro sampana avy amin'ny SQL

```sql
INSERT INTO sampana (name, church_id, color) VALUES
  ('Ambohipo', 'church-uuid-here', '#7C3AED'),
  ('Kanana', 'church-uuid-here', '#059669');
```
# STAF-FPVM
