# desafio_staff

# 🚗 FixCar - Sistema de Checklist & Inspeção Veicular

Sistema completo para gestão e digitalização de inspeções veiculares automotivas, controle de entrada e retirada com assinatura digital, mapeamento visual de avarias em Blueprint de carroceria, registro fotográfico de evidências, painel gerencial com estatísticas e controle de acesso baseado em perfis (RBAC).

---

## ✨ Funcionalidades Principais

- 🔐 **Autenticação & RBAC**:
  - JWT com expiração de 1 hora e middleware global de proteção de rotas.
  - Perfis de acesso: `ADMIN`, `GESTOR` e `INSPETOR`.
- 📋 **Checklist Veicular Oficial**:
  - Formulário guiado em 5 etapas com validação estrita.
  - Mapeamento interativo de avarias na carroceria (Amassado `A`, Riscado `R`, Quebrado `X`, Faltante `F`).
  - Medidor de nível de combustível analógico e % de bateria LEV (Híbrido/Elétrico).
  - Status dos pneus, pertences deixados e itens obrigatórios.
  - Upload e galeria de evidências fotográficas da vistoria.
  - Coleta de assinatura digital na entrada e na retirada do veículo com data e hora validadas.
- 📄 **Emissão de Laudo Oficial**:
  - Visualização formatada idêntica ao documento de checklist físico oficial.
  - Totalmente compatível para impressão e exportação em PDF.
- 👥 **Gestão de Clientes e Veículos**:
  - Cadastro, edição e exclusão lógica (*soft delete* com `active: false`).
- 👤 **Gestão de Usuários (RBAC)**:
  - Criação de novos usuários com senha criptografada via bcrypt e exclusão lógica (*soft delete*).
- 📊 **Dashboard Gerencial**:
  - Métricas de inspeções em tempo real, distribuição gráfica de avarias e produtividade por inspetor.

---

## 🚀 Tecnologias Utilizadas

- **Frontend / Fullstack**: [Next.js 14](https://nextjs.org/) (App Router), React 18, TypeScript, Tailwind CSS, Lucide React
- **Backend / ORM**: Next.js API Routes, [Prisma ORM 5](https://www.prisma.io/)
- **Banco de Dados**: SQLite (`prisma/dev.db`) com arquivo de migrations
- **Segurança**: JSON Web Token (JWT), Bcrypt.js, Next.js Middleware

---

## 🛠️ Como Executar o Projeto Localmente

1. **Clone o repositório**:
   ```bash
   git clone git@github.com:PabloMarcondesGS/desafio_staff.git
   cd desafio_staff
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**:
   Crie o arquivo `.env` com base no exemplo:
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="desafio-staff-secret-key-super-secure-2026"
   JWT_EXPIRES_IN="1h"
   ```

4. **Execute as Migrações do Banco de Dados e Seed Inicial**:
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

6. Acesse no navegador: `http://localhost:3000`

---

## 👤 Credenciais Padrão de Acesso

| Perfil | E-mail | Senha |
| :--- | :--- | :--- |
| **Administrador** | `admin@fixcar.com` | `admin123` |
| **Gestor** | `gestor@fixcar.com` | `gestor123` |
| **Inspetor** | `inspetor@fixcar.com` | `inspetor123` |
