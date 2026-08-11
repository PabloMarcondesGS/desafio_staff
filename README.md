# 🚗 FixCar - Sistema de Inspeção e Checklist Veicular

Sistema completo fullstack para gestão, parametrização e digitalização de inspeções veiculares automotivas, controle de entrada e saída com assinatura digital, mapeamento interativo de avarias em Blueprint de carroceria, galeria de evidências fotográficas, dashboard analítico e controle de acesso baseado em perfis (RBAC).

---

## 📋 Tabela de Conformidade dos Requisitos

| Requisito | Atendimento no Projeto | Onde encontrar no código |
| :--- | :--- | :--- |
| **Frontend em React.js** | ✅ Sim (Next.js 14 App Router, React 18, Tailwind CSS, Lucide React) | `src/app/`, `src/components/`, `src/contexts/` |
| **Backend em Node.js** | ✅ Sim (Next.js API Routes / Runtime Node.js) | `src/app/api/`, `src/lib/`, `src/middleware.ts` |
| **Banco de Dados & Justificativa** | ✅ Sim (Banco Relacional SQLite com Prisma ORM + Migrations) | `prisma/schema.prisma`, `prisma/migrations/` |
| **API REST Organizada e Documentada** | ✅ Sim (Endpoints RESTful estruturados por recurso e documentados) | `src/app/api/**/route.ts` |
| **Validação de Dados (Front & Back)** | ✅ Sim (Validação de formato DD/MM/AAAA, HH:MM, campos obrigatórios e sanitização) | `src/app/inspecoes/nova/page.tsx`, `src/app/api/**` |
| **Tratamento Adequado de Erros** | ✅ Sim (Contexto unificado de erros/alertas, Toasts visuais e respostas HTTP padronizadas) | `src/contexts/FeedbackContext.tsx`, `src/lib/errorHandler.ts` |
| **Organização em Camadas / Módulos** | ✅ Sim (Separação clara: UI Components, Business Logic, Contexts, Libs, API Routes, Database Layer) | `src/components/`, `src/contexts/`, `src/lib/`, `src/app/api/` |
| **Upload de Arquivos** | ✅ Sim (Armazenamento local persistido em `/public/uploads` com suporte a Multipart e Base64) | `src/app/api/upload/route.ts`, `public/uploads/` |
| **README com Instruções Claras** | ✅ Sim (Passo a passo de instalação, comandos, variáveis de ambiente e perfis de teste) | `README.md` |

---

## 🗄️ Justificativa da Escolha do Banco de Dados

Para este projeto, foi escolhido um **Banco de Dados Relacional (SQLite gerenciado via Prisma ORM)** pelas seguintes razões técnicas e de negócio:

1. **Integridade Referencial Estrita**:
   - Um checklist veicular possui forte relação hierárquica entre entidades: `Client` (1) ➔ `Vehicle` (N) ➔ `Inspection` (N) ➔ `InspectionAnswer` (N), `DamageMarking` (N) e `InspectionPhoto` (N).
   - As chaves estrangeiras (`Foreign Keys`) com regras de integridade e transações atômicas (`$transaction`) garantem que laudos e evidências nunca fiquem órfãos ou inconsistentes.
2. **Portabilidade e Execução Descomplicada**:
   - O SQLite não requer instalação e configuração de servidores externos pesados de banco de dados para avaliação e execução do projeto, operando com alta performance e confiabilidade em qualquer ambiente.
3. **Evolução de Esquema com Migrations**:
   - O uso do Prisma ORM permitiu versionamento seguro do banco de dados através de arquivos SQL de migração (`prisma/migrations/`), permitindo transição facilitada para PostgreSQL ou MySQL em produção apenas alterando o provider no `schema.prisma`.

---

## 🌐 Documentação da API REST

Todas as rotas da API (exceto o login) são protegidas por autenticação via **Header `Authorization: Bearer <token_jwt>`** ou cookie de sessão.

### 🔐 Autenticação
- `POST /api/auth/login` - Autentica usuário e retorna JWT com validade de 1 hora.
- `GET /api/auth/me` - Retorna dados e permissões do usuário logado.

### 📋 Inspeções e Vistorias
- `GET /api/inspections` - Lista vistorias com suporte a filtros (status, inspetor, termo de busca).
- `POST /api/inspections` - Criação atômica de nova vistoria completa (respostas, avarias, fotos, assinaturas).
- `GET /api/inspections/:id` - Retorna laudo completo de uma vistoria.
- `PUT /api/inspections/:id` - Atualiza dados ou registra saída do veículo com assinatura do cliente.
- `DELETE /api/inspections/:id` - Exclui vistoria (restrito a `ADMIN` e `GESTOR`).

### 👥 Clientes
- `GET /api/clients` - Lista clientes ativos (suporte a busca por nome, documento e telefone).
- `POST /api/clients` - Cadastra novo cliente.
- `GET /api/clients/:id` - Detalhes do cliente e histórico de veículos.
- `PUT /api/clients/:id` - Atualiza dados cadastrais.
- `DELETE /api/clients/:id` - Exclusão lógica (*Soft Delete* com `active: false`).

### 🚗 Veículos
- `GET /api/vehicles` - Lista veículos ou busca por placa específica.
- `POST /api/vehicles` - Cadastra novo veículo vinculado a um cliente.

### 👤 Usuários (Controle RBAC)
- `GET /api/users` - Lista usuários do sistema (exclusivo `ADMIN`).
- `POST /api/users` - Cria novo usuário com senha criptografada via bcrypt (exclusivo `ADMIN`).
- `GET /api/users/:id` - Consulta dados de usuário por ID (exclusivo `ADMIN`).
- `PUT /api/users/:id` - Atualiza dados/perfis ou redefine senha (exclusivo `ADMIN`).
- `DELETE /api/users/:id` - Soft Delete de usuário com proteção contra auto-exclusão (exclusivo `ADMIN`).

### ⚙️ Checklist & Uploads
- `GET /api/checklist-items` - Lista itens de parametrização do checklist oficial.
- `POST /api/checklist-items` - Cadastra novo item de inspeção (exclusivo `ADMIN`).
- `POST /api/upload` - Processa upload de fotos e assinaturas digitais, salvando em `/public/uploads`.
- `GET /api/dashboard/stats` - Retorna indicadores analíticos e distribuição gráfica de avarias.

---

## 🛠️ Como Executar o Projeto Localmente

### 1. Pré-requisitos
- Node.js 18+ instalado
- Git instalado

### 2. Passo a Passo

```bash
# 1. Clone o repositório
git clone git@github.com:PabloMarcondesGS/desafio_staff.git
cd desafio_staff

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente (.env)
# O projeto já inclui valores padrão prontos para uso local:
# DATABASE_URL="file:./dev.db"
# JWT_SECRET="desafio-staff-secret-key-super-secure-2026"
# JWT_EXPIRES_IN="1h"

# 4. Execute as Migrações do Banco de Dados
npx prisma migrate dev

# 5. Execute o Seed inicial para carregar dados e usuários de teste
node prisma/seed.js

# 6. Inicie o servidor de desenvolvimento
npm run dev
```

Abra seu navegador em: **`http://localhost:3000`**

---

## 🔑 Credenciais Padrão para Testes

| Perfil | E-mail | Senha | Nível de Acesso |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@fixcar.com` | `admin123` | Acesso total: vistoria, gestão de usuários, parametrização, exclusão |
| **Gestor** | `gestor@fixcar.com` | `gestor123` | Acesso gerencial: visualização de laudos, clientes, veículos, dashboard |
| **Inspetor** | `inspetor@fixcar.com` | `inspetor123` | Operacional: execução de vistorias, registro de avarias, laudos e fotos |
