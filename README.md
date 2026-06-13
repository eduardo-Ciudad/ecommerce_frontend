# 🛍️ E-commerce Full Stack

Aplicação de e-commerce completa com painel administrativo, desenvolvida como projeto de portfólio. Backend em Java com Spring Boot e frontend em React + Vite.

---

## 🚀 Tecnologias

### Backend
- **Java 17** + **Spring Boot 3**
- **Spring Security** com autenticação **JWT**
- **PostgreSQL** + **Flyway** (migrations)
- **Docker**

### Frontend
- **React** + **Vite**
- **Tailwind CSS v4**
- **shadcn/ui**

---

## ✨ Funcionalidades

### Loja
- Listagem e filtragem de produtos
- Carrinho de compras
- Fluxo de checkout
- Autenticação de clientes (registro / login)

### Painel Admin (`/admin`)
- Gestão de produtos (CRUD)
- Gestão de pedidos
- Controle de acesso por roles (`ADMIN` / `USER`)

---

## 🏗️ Arquitetura

```
ecommerce/
├── backend/          # Spring Boot API REST
│   ├── src/
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   ├── model/
│   │   ├── dto/
│   │   └── security/
│   └── Dockerfile
└── frontend/         # React + Vite
    ├── src/
    │   ├── pages/
    │   ├── components/
    │   └── services/
    └── ...
```

---

## ⚙️ Como rodar localmente

### Pré-requisitos
- Java 17+
- Node.js 18+
- Docker e Docker Compose

### 1. Clone o repositório
```bash
git clone https://github.com/educiudad/ecommerce.git
cd ecommerce
```

### 2. Suba o banco com Docker
```bash
docker-compose up -d
```

### 3. Backend
```bash
cd backend
./mvnw spring-boot:run
```

A API estará disponível em `http://localhost:8080`.

### 4. Frontend
```bash
cd frontend
npm install
npm run dev
```

O frontend estará disponível em `http://localhost:5173`.

---

## 🔐 Variáveis de ambiente

Crie um arquivo `.env` na raiz do backend com:

```env
DB_URL=jdbc:postgresql://localhost:5432/ecommerce
DB_USERNAME=seu_usuario
DB_PASSWORD=sua_senha
JWT_SECRET=sua_chave_secreta
```

---

## 👨‍💻 Autor

**Eduardo** — [GitHub](https://github.com/eduardoCiudad) · [LinkedIn](https://linkedin.com/in/educiudad)