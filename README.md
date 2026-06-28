# 🏠 Home Confort

Site e-commerce moderne pour la vente d'électronique, domotique et alimentation.

## Stack

- **Next.js 14** (App Router, SSR exclusif)
- **PostgreSQL** + **Prisma** ORM
- **Tailwind CSS** + **shadcn/ui**
- **NextAuth.js** (credentials)
- **next-intl** (FR/EN)
- **Framer Motion** (animations légères)
- **Docker** + **Docker Compose**

## Démarrage rapide

### Avec Docker (recommandé)

```bash
cp .env.example .env
# Éditer .env avec vos valeurs
docker compose up --build
```

L'application sera disponible sur http://localhost:3000

### En développement local

```bash
cp .env.example .env
# Démarrer PostgreSQL (Docker ou local)
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

## Comptes de test

| Email | Mot de passe | Rôle |
|-------|-------------|------|
| admin@homeconfort.com | Admin@2024! | SUPER_ADMIN |
| manager@homeconfort.com | Manager@2024! | ADMIN |
| staff@homeconfort.com | Staff@2024! | ADMIN |

Dashboard admin : http://localhost:3000/admin

## Variables d'environnement

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | URL PostgreSQL |
| `NEXTAUTH_SECRET` | Secret JWT (32+ chars) |
| `NEXTAUTH_URL` | URL de base du site |
| `WHATSAPP_ADMIN_NUMBER` | Numéro WhatsApp admin |
| `WHATSAPP_API_TOKEN` | Token API WhatsApp (360dialog ou Twilio) |
| `NEXT_PUBLIC_SITE_URL` | URL publique du site |

## Structure

```
app/[locale]/          → Pages publiques SSR (FR/EN)
app/admin/             → Dashboard admin (protégé)
app/api/               → API Route Handlers
actions/               → Server Actions
components/            → Composants React
lib/                   → Utilitaires serveur
prisma/                → Schéma + seed
messages/              → Traductions i18n
```

## Fonctionnalités

- 🛍️ Catalogue avec filtres, recherche, pagination
- 🛒 Panier cookie httpOnly (SSR)
- 💳 Checkout multi-étapes
- 📱 Notification WhatsApp à chaque commande
- 📊 Dashboard admin avec KPIs et graphiques
- 🌍 Bilingue FR/EN
- 🐳 Dockerisé, prêt production
