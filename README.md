# CarRental MVP - Marketplace de Locação de Carros

MVP de marketplace de locação de carros estilo Airbnb, conectando donos de carros e locatários.

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Supabase** (Auth + Postgres + RLS)
- **CSS puro** (sem bibliotecas externas)

## Setup Local

### 1. Configurar Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. No SQL Editor, execute o conteúdo de `supabase/schema.sql`
3. Em **Authentication > URL Configuration**, adicione `http://localhost:3000/api/auth/callback` nos Redirect URLs

### 2. Variáveis de ambiente

Copie o arquivo de exemplo e preencha com suas credenciais:

```bash
cp .env.local.example .env.local
```

Preencha:
- `NEXT_PUBLIC_SUPABASE_URL` - URL do seu projeto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Anon key do seu projeto

### 3. Instalar e rodar

```bash
npm install
npm run dev
```

Acesse http://localhost:3000

## Deploy na Vercel

### 1. Push para GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <seu-repo>
git push -u origin main
```

### 2. Deploy na Vercel

1. Acesse [vercel.com](https://vercel.com) e importe o repositório
2. Adicione as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy!

### 3. Configurar Supabase para produção

Em **Authentication > URL Configuration** no Supabase:
- Adicione `https://seu-dominio.vercel.app/api/auth/callback` nos Redirect URLs

## Estrutura de pastas

```
car-rental-mvp/
├── app/
│   ├── api/auth/callback/   # Callback do magic link
│   │   └── route.ts
│   ├── car/[id]/            # Detalhes do carro + reserva
│   │   └── page.tsx
│   ├── components/          # Componentes compartilhados
│   │   └── Navbar.tsx
│   ├── login/               # Página de login
│   │   └── page.tsx
│   ├── my-bookings/         # Reservas do locatário
│   │   └── page.tsx
│   ├── owner/               # Painel do proprietário
│   │   ├── bookings/
│   │   │   └── page.tsx     # Gerenciar reservas
│   │   └── page.tsx         # Gerenciar carros
│   ├── profile/             # Configuração de perfil
│   │   └── page.tsx
│   ├── globals.css           # Estilos globais
│   ├── layout.tsx            # Layout principal
│   └── page.tsx              # Home (busca de carros)
├── lib/
│   ├── supabase.ts          # Cliente Supabase (browser)
│   ├── supabase-server.ts   # Cliente Supabase (server)
│   └── types.ts             # Tipos TypeScript
├── supabase/
│   └── schema.sql           # SQL completo do banco
├── middleware.ts             # Middleware de sessão
└── README.md
```

## Funcionalidades

- Login por email (magic link)
- Perfis: owner ou renter
- Dono pode criar/gerenciar anúncios de carros
- Locatário pode buscar carros e solicitar reservas
- Dono pode aprovar/rejeitar reservas
- RLS para segurança dos dados
