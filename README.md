# Fórum Flow

Uma aplicação de fórum/dúvidas construída com React, TypeScript, Tailwind CSS e Supabase.

## 🚀 Funcionalidades

- ✅ Autenticação de usuários com Supabase
- ✅ Sistema de postagem de dúvidas
- ✅ Comentários e respostas
- ✅ Sistema de notificações em tempo real
- ✅ Painel administrativo
- ✅ Upload de avatar
- ✅ Design responsivo com sidebar mobile
- ✅ Modo escuro/claro
- ✅ Markdown support

## 🛠️ Tecnologias

- **React 18** + **TypeScript**
- **Vite** (build tool)
- **Tailwind CSS** (estilização)
- **shadcn/ui** (componentes UI)
- **Supabase** (backend, autenticação e banco de dados)
- **React Router DOM v6** (roteamento)

## 📦 Instalação Local

1. Clone o repositório:
```bash
git clone https://github.com/flutterflowbrasil/forumflow.git
cd forumflow
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:

Crie um arquivo `.env` na raiz do projeto:
```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

4. Execute os triggers SQL no Supabase:

No Supabase SQL Editor, execute o arquivo `supabase-notifications-triggers.sql`

5. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

O app estará disponível em `http://localhost:8080`

## 🌐 Deploy no Vercel

### Via Dashboard (Recomendado)

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em "Add New" → "Project"
3. Importe o repositório do GitHub: `flutterflowbrasil/forumflow`
4. Configure as variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Clique em "Deploy"

### Via CLI

```bash
# Instale a CLI do Vercel
npm install -g vercel

# Faça login
vercel login

# Deploy
vercel
```

**Importante:** Configure as variáveis de ambiente no painel do Vercel antes de fazer o deploy.

## 📁 Estrutura do Projeto

```
src/
├── components/      # Componentes reutilizáveis
│   ├── ui/         # Componentes shadcn/ui
│   ├── auth/       # Componentes de autenticação
│   └── layout/     # Header, Sidebar, MainLayout
├── pages/          # Páginas da aplicação
├── providers/      # Context providers (Auth, Duvida, Theme, Sidebar)
├── hooks/          # Custom hooks
├── integrations/   # Integração com Supabase
└── lib/           # Utilitários
```

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Build de produção
- `npm run preview` - Preview do build de produção
- `npm run lint` - Executa ESLint

## 📝 Supabase Setup

### Tabelas Necessárias

- `profiles` - Perfis de usuários
- `duvidas` - Posts/dúvidas
- `comments` - Comentários
- `categories` - Categorias
- `notifications` - Notificações

### RLS Policies

Certifique-se de configurar as políticas de Row Level Security (RLS) adequadamente.

### Triggers

Os triggers para notificações automáticas estão no arquivo `supabase-notifications-triggers.sql`

## 🔐 Segurança

- As credenciais do Supabase estão protegidas no arquivo `.env` (não commitado)
- RLS habilitado em todas as tabelas
- Rotas protegidas com autenticação
- Rotas administrativas com verificação de role

## 📄 Licença

MIT

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.
