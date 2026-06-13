# Relatório Técnico — Frontend MiniModa (E-commerce)

> Data da análise: 2026-06-12  
> Analisado por: leitura estática de todos os arquivos de `src/`

---

## 1. Visão Geral

### Dependências principais (package.json)

| Pacote | Versão |
|---|---|
| react | ^19.2.6 |
| react-dom | ^19.2.6 |
| react-router-dom | ^7.17.0 |
| vite | ^8.0.12 |
| tailwindcss | ^4.3.0 |
| @tailwindcss/postcss | ^4.3.0 |
| axios | ^1.17.0 |
| lucide-react | ^1.17.0 |
| class-variance-authority | ^0.7.1 |
| clsx + tailwind-merge | ^2.1.1 / ^3.6.0 |
| @radix-ui/react-dialog | ^1.1.16 |
| @radix-ui/react-dropdown-menu | ^2.1.17 |
| @radix-ui/react-label | ^2.1.9 |
| @radix-ui/react-separator | ^1.1.9 |
| @radix-ui/react-slot | ^1.2.5 |

**Nota sobre shadcn/ui:** O projeto não instala shadcn/ui como pacote. Os componentes de UI foram construídos localmente usando Radix UI + CVA como base, seguindo o padrão shadcn/ui, mas sem o CLI ou o pacote `shadcn`.

### Estrutura de pastas (`src/`)

```
src/
├── assets/
│   ├── hero.png
│   ├── react.svg
│   └── vite.svg
├── lib/
│   └── utils.js
├── services/
│   ├── api.js
│   ├── authService.js
│   ├── cartService.js
│   ├── categoryService.js
│   ├── orderService.js
│   ├── productService.js
│   ├── adminCategoryService.js
│   ├── adminOrderService.js
│   └── adminProductService.js
├── context/
│   ├── AuthContext.jsx
│   └── CartContext.jsx
├── hooks/
│   ├── useAuth.js
│   └── useCart.js
├── utils/
│   ├── formatCurrency.js
│   └── formatDate.js
├── components/
│   ├── ui/
│   │   ├── badge.jsx
│   │   ├── button.jsx
│   │   ├── dropdown-menu.jsx
│   │   ├── input.jsx
│   │   ├── label.jsx
│   │   ├── sheet.jsx
│   │   └── skeleton.jsx
│   ├── layout/
│   │   ├── Footer.jsx
│   │   ├── Header.jsx
│   │   └── Layout.jsx
│   ├── common/
│   │   ├── CartDrawer.jsx
│   │   ├── ErrorMessage.jsx
│   │   ├── LoadingSpinner.jsx
│   │   └── ProductCard.jsx
│   └── admin/
│       ├── AdminLayout.jsx
│       ├── AdminRoute.jsx
│       └── AdminSidebar.jsx
├── pages/
│   ├── CartPage.jsx
│   ├── CheckoutPage.jsx
│   ├── HomePage.jsx
│   ├── LoginPage.jsx
│   ├── OrdersPage.jsx
│   ├── ProductDetailPage.jsx
│   ├── ProductsPage.jsx
│   ├── RegisterPage.jsx
│   └── admin/
│       ├── AdminCategoriesPage.jsx
│       ├── AdminDashboardPage.jsx
│       ├── AdminOrdersPage.jsx
│       ├── AdminProductFormPage.jsx
│       └── AdminProductsPage.jsx
├── App.jsx
├── index.css
└── main.jsx
```

### Contagem de arquivos por tipo

| Tipo | Quantidade |
|---|---|
| Páginas (loja) | 8 |
| Páginas (admin) | 5 |
| Componentes UI (Radix/CVA) | 7 |
| Componentes layout | 3 |
| Componentes comuns | 4 |
| Componentes admin | 3 |
| Hooks | 2 |
| Services / API | 9 |
| Contexts | 2 |
| Utils | 2 |

---

## 2. Rotas e Navegação

### Tabela de rotas (App.jsx)

| Caminho | Componente | Pública | Role exigida |
|---|---|---|---|
| `/` | HomePage | Sim | — |
| `/products` | ProductsPage | Sim | — |
| `/products/:id` | ProductDetailPage | Sim | — |
| `/cart` | CartPage | Não | USER (qualquer autenticado) |
| `/checkout` | CheckoutPage | Não | USER (qualquer autenticado) |
| `/orders` | OrdersPage | Não | USER (qualquer autenticado) |
| `/login` | LoginPage | Somente não-autenticados | — |
| `/register` | RegisterPage | Somente não-autenticados | — |
| `/admin` | AdminDashboardPage | Não | ADMIN |
| `/admin/products` | AdminProductsPage | Não | ADMIN |
| `/admin/products/new` | AdminProductFormPage | Não | ADMIN |
| `/admin/products/:id/edit` | AdminProductFormPage | Não | ADMIN |
| `/admin/categories` | AdminCategoriesPage | Não | ADMIN |
| `/admin/orders` | AdminOrdersPage | Não | ADMIN |
| `*` | Redirect → `/` | — | — |

### Como a proteção de rotas é implementada

São três componentes distintos, todos em `App.jsx` exceto `AdminRoute`:

**`ProtectedRoute`** (App.jsx:26-31): bloqueia usuários não autenticados. Se `isLoading` retorna `null` (evita flash de redirect). Se `!isAuthenticated` redireciona para `/login`.

**`PublicOnlyRoute`** (App.jsx:33-38): impede que usuários autenticados acessem `/login` e `/register`. Redireciona para `/`.

**`AdminRoute`** (components/admin/AdminRoute.jsx): verifica sequencialmente:
1. `isLoading` → retorna `null`
2. `!isAuthenticated` → redirect `/login`
3. `!isAdmin` → redirect `/`

A verificação de `isAdmin` deriva de `user.role === 'ADMIN'` (AuthContext.jsx:65), onde `role` é lida do payload do JWT.

### O que acontece quando um usuário USER acessa `/admin`

`AdminRoute` detecta `isAuthenticated = true` mas `isAdmin = false`, e executa `<Navigate to="/" replace />`. O usuário é silenciosamente redirecionado para a home sem mensagem de erro.

---

## 3. Autenticação e Estado

### Armazenamento do token JWT

Os tokens são armazenados em **`localStorage`**:
- `localStorage.setItem('accessToken', ...)` — api.js:9, AuthContext.jsx:43
- `localStorage.setItem('refreshToken', ...)` — AuthContext.jsx:44

### Anexação às requisições

Via **interceptor axios** centralizado em `api.js:8-14`:

```js
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

Todas as requisições que usam a instância `api` recebem o token automaticamente. Não há adição manual em chamadas individuais.

### Como o frontend lê os claims do token

`AuthContext.jsx` implementa decode manual do JWT via `atob()` do payload Base64:

```js
function decodeJWT(token) {
  const payload = token.split('.')[1]
  const decoded = JSON.parse(atob(payload))
  return decoded
}

function getUserFromToken(token) {
  const decoded = decodeJWT(token)
  return {
    id: decoded.sub || decoded.id,
    name: decoded.name || decoded.username,
    email: decoded.email,
    role: decoded.role || decoded.roles?.[0],
  }
}
```

Claims usados em: `isAdmin` (AuthContext), nome exibido no Header, role verificada pelo AdminRoute.

**Observação:** A decodificação não verifica a assinatura criptográfica do JWT — isso é esperado e correto para um frontend (a verificação é responsabilidade do backend). Porém, **a expiração (`exp`) também não é verificada** (ver seção 8, problema #2).

### O que acontece quando o token expira (tratamento de 401)

Existe um **interceptor de response** em `api.js:16-38`:

```js
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/auth/refresh`,
          { refreshToken }
        )
        // atualiza tokens e reenvia requisição original
        ...
        return api(originalRequest)
      } catch {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)
```

Fluxo: 401 recebido → tenta refresh → se OK, reenvia a requisição original com novo token → se falha, limpa localStorage e redireciona para `/login` via `window.location.href` (hard redirect, não React Router).

### Gerenciamento de estado global

**React Context puro** — sem Zustand, Redux ou prop drilling.

- **AuthContext**: gerencia `user`, `isAuthenticated`, `isAdmin`, `isLoading`; expõe `login`, `register`, `logout`.
- **CartContext**: gerencia `cart`, `itemCount`, `isLoading`; expõe `addToCart`, `removeFromCart`, `updateQuantity`, `clearCart`, `fetchCart`. Depende do `AuthContext` via `useContext` para saber se deve buscar o carrinho.

Providers aninhados em `App.jsx`: `<AuthProvider><CartProvider>`.

---

## 4. Comunicação com a API

### Organização das chamadas

Existe uma **camada de services centralizada** em `src/services/`. Nenhuma chamada de API é feita diretamente nos componentes — todos os componentes importam um service.

Os services são divididos em:
- **Loja**: `authService`, `productService`, `categoryService`, `cartService`, `orderService`
- **Admin**: `adminProductService`, `adminCategoryService`, `adminOrderService`

Ambas as camadas usam a mesma instância `api` de `api.js` (axios com interceptors). Há duplicação de endpoints: `adminProductService.getAll()` chama `/products` — o mesmo endpoint que `productService.getAll()`.

### URL base da API

Definida via variável de ambiente:

```js
// api.js:4
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
})
```

O `.env` contém `VITE_API_URL=http://localhost:8080`. O fallback hardcoded `'http://localhost:8080'` aparece **em dois lugares** em api.js (linhas 4 e 24), sendo que na linha 24 é usado em uma chamada `axios.post()` direta (fora da instância configurada), o que contorna os interceptors.

### Tratamento de erros

O padrão de tratamento é **consistente entre páginas**:

```js
try {
  await someService.action()
} catch (err) {
  const msg = err.response?.data?.message || err.response?.data || 'Mensagem fallback'
  setError(typeof msg === 'string' ? msg : 'Mensagem fallback')
} finally {
  setIsLoading(false)
}
```

Estados de loading são gerenciados em todas as páginas. Feedback de erro é exibido via componente `ErrorMessage`.

**Exceção:** `HomePage.jsx:33-36` usa `.catch(() => {})` silencioso para erros de produtos e categorias — se a API falhar, a página fica vazia sem mensagem ao usuário.

---

## 5. Componentes e Padrões

### Componentes maiores que 200 linhas

| Arquivo | Linhas |
|---|---|
| `pages/admin/AdminProductFormPage.jsx` | 491 |
| `pages/admin/AdminOrdersPage.jsx` | 219 |

Os demais ficam abaixo de 200 linhas. `ProductDetailPage.jsx` (190 linhas) e `CartPage.jsx` (157 linhas) são os maiores da loja.

### Lógica duplicada entre componentes

**`STATUS_CONFIG`** duplicado em dois arquivos com conteúdo idêntico:

```js
// OrdersPage.jsx:12-18
const STATUS_CONFIG = {
  PENDING:   { label: 'Pendente',  variant: 'warning'     },
  PAID:      { label: 'Pago',      variant: 'info'        },
  ...
}
// AdminOrdersPage.jsx:10-16 — idêntico
```

**Padrão de extração de erro de response** repetido literalmente em 7+ arquivos:
```js
err.response?.data?.message || err.response?.data || 'fallback'
```

**Skeletons de grade de produtos** duplicados entre `HomePage.jsx` e `ProductsPage.jsx` com estrutura idêntica.

**Endpoints duplicados:** `adminProductService.getAll()` e `productService.getAll()` chamam o mesmo endpoint `/products` — serviços separados para o mesmo recurso.

### Uso de `useEffect`: problemas identificados

**Fetch sem AbortController / cleanup** — todos os `useEffect` que fazem requisições HTTP não cancelam a operação ao desmontar o componente. Exemplos:

```js
// HomePage.jsx:30-40
useEffect(() => {
  productService.getAll()
    .then((data) => setProducts(data.slice(0, 8)))
    .catch(() => {})
    .finally(() => setLoadingProducts(false))
  // sem retorno de cleanup
}, [])
```

O mesmo padrão ocorre em: `ProductsPage.jsx:20-28`, `ProductDetailPage.jsx:31-38`, `OrdersPage.jsx:83-88`, `AdminDashboardPage.jsx:34-43`, `AdminProductsPage.jsx:16-21`, `AdminCategoriesPage.jsx:23-29`, `AdminOrdersPage.jsx:154-159`, `AdminProductFormPage.jsx:55-57` e `AdminProductFormPage.jsx:60-73`.

Em React 19 (concurrent mode), isso pode resultar em `setState` chamado após unmount, causando avisos e potencial comportamento incorreto.

**Dependências ausentes em `useEffect`:** Nenhum caso grave identificado — os efeitos de fetch usam `[]` (correto para chamada única) ou dependências explícitas.

### Listas renderizadas sem key ou com index como key

Skeletons usam `key={i}` (índice) em múltiplos locais — `HomePage.jsx:82`, `ProductsPage.jsx:91`, `AdminProductsPage.jsx:63`, `AdminCategoriesPage.jsx:109`, `AdminOrdersPage.jsx:176`. Isso é **aceitável** pois são elementos estáticos e não reordenados.

Listas de dados reais usam `key` estável: `key={product.id}`, `key={cat.id}`, `key={order.id}`, `key={item.id}` — correto.

---

## 6. Painel Admin

### Telas e funcionalidades disponíveis em `/admin`

| Rota | Funcionalidade |
|---|---|
| `/admin` | Dashboard com contadores (produtos ativos, categorias, pedidos) e breakdowns de status |
| `/admin/products` | Listagem de todos os produtos com status ativo/inativo, ação de editar e desativar |
| `/admin/products/new` | Formulário de criação de produto |
| `/admin/products/:id/edit` | Formulário de edição + CRUD de variantes (tamanho, preço, estoque) |
| `/admin/categories` | Criação e exclusão de categorias |
| `/admin/orders` | Listagem de pedidos com expansão de itens e transição de status inline |

### CRUD de produtos

- **Formulários controlados** com `useState` (sem react-hook-form ou zod)
- **Validação no frontend**: `validateProduct()` e `validateVariant()` em `AdminProductFormPage.jsx:15-29`
- Criação de produto redireciona para o modo de edição (`/admin/products/:id/edit`) — variantes só podem ser adicionadas após criação
- Edição de variantes: inline na tabela (edição, confirmação, cancelamento), sem formulário separado

### CRUD de pedidos

- Listagem com expansão de itens por linha
- Transição de status via `<select>` com opções geradas por `STATUS_TRANSITIONS` (AdminOrdersPage.jsx:18-24) — máquina de estados simples no frontend
- Sem paginação — todos os pedidos carregados de uma vez

### Inconsistências entre loja e admin

1. **Layout completamente diferente**: a loja usa `Header + Footer + main`; o admin usa sidebar lateral + `Outlet`. Não há problema funcional, mas são padrões visuais desconexos.

2. **`adminProductService.delete()` realiza soft delete**: o método se chama `delete` mas a API faz desativação (o frontend atualiza `active: false` ao invés de remover o item da lista). O nome é enganoso. Na `AdminProductsPage`, o botão é chamado "Desativar", mas o service usa `.delete()`.

3. **`adminProductService` e `productService` duplicam endpoints**: `getAll()` e `getById()` chamam os mesmos endpoints, mas são objetos separados.

4. **Sem edição de categoria**: `adminCategoryService` tem `create` e `delete`, mas não `update`. Não há tela de edição de categorias.

5. **Sem paginação em nenhuma tela admin**: todos os recursos são carregados integralmente.

---

## 7. Qualidade

### Console.logs esquecidos / código comentado / imports não usados

- **Console.logs**: nenhum encontrado.
- **Código comentado**: comentários de seção em `AdminProductFormPage.jsx` (linhas 75, 108, 141, 179, 196, 227, 306) e `App.jsx` (linhas 43, 90). São comentários de organização, não código desabilitado.
- **Imports não usados**: nenhum encontrado nos arquivos analisados.

### Variáveis de ambiente

| Item | Onde está |
|---|---|
| `VITE_API_URL=http://localhost:8080` | `.env` |
| `'http://localhost:8080'` (fallback) | `api.js:4` |
| `'http://localhost:8080'` (segundo fallback) | `api.js:24` |

O `.env` contém o valor de desenvolvimento. Não há `.env.example` ou `.env.production` no repositório.

### Acessibilidade básica

- **Imagens sem `alt`**: o projeto não usa `<img>` para produtos — as imagens são SVG inline de placeholder (sem `alt`, mas semanticamente neutros). Não há imagens reais de produto implementadas.
- **Botões sem texto ou aria-label**: os botões de quantidade (`+`/`-`) em `CartPage.jsx:98,105` possuem `aria-label="Diminuir"` e `aria-label="Aumentar"`. Botão remover tem `aria-label="Remover"`. Botão hamburger tem `aria-label="Menu"`. AdminSidebar close tem `aria-label="Fechar menu"`.
- **`<select>` de status do pedido** em `AdminOrdersPage.jsx:90` tem `aria-label="Alterar status"`. ✓
- **Não encontrado**: botões icon em `AdminProductFormPage.jsx` (Pencil, Trash2, Check, X) **não têm `aria-label`** (linhas 366, 372, 400, 405).

### Responsividade

- Loja: todas as páginas usam breakpoints (`sm:`, `md:`, `lg:`). Grade de produtos vai de 2 colunas (mobile) a 4 (desktop).
- Header: menu hamburger para mobile implementado.
- Admin: sidebar colapsável via overlay para mobile implementado em `AdminLayout.jsx`.
- `CartPage.jsx:82`: elemento com `style={{ width: '72px' }}` inline, que escapa do sistema de Tailwind mas não quebra o layout.
- Aparente cobertura responsiva básica em todas as telas.

---

## 8. Pontos de Atenção

Ordenados por gravidade (1 = mais grave):

### 1. Token JWT armazenado em `localStorage` — vulnerabilidade XSS

**Arquivo**: `api.js:9`, `AuthContext.jsx:43-44`

`localStorage` é acessível por qualquer JavaScript da página. Um ataque XSS bem-sucedido pode exfiltrar o `accessToken` e o `refreshToken`. O padrão recomendado para aplicações que requerem segurança elevada é usar cookies `HttpOnly`.

```js
// api.js:9 — token exposto a XSS
const token = localStorage.getItem('accessToken')
```

### 2. Token não valida `exp` na inicialização

**Arquivo**: `AuthContext.jsx:32-39`

Ao carregar a aplicação, o `AuthContext` lê o token do `localStorage` e decodifica os claims, mas **não verifica se o campo `exp` (expiração) já passou**. Um token expirado no `localStorage` faz o usuário parecer autenticado até a próxima requisição falhar com 401.

```js
useEffect(() => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    const userData = getUserFromToken(token)  // sem verificação de exp
    setUser(userData)
  }
  setIsLoading(false)
}, [])
```

### 3. Chamada de refresh bypassa a instância `api` configurada

**Arquivo**: `api.js:24`

A chamada de refresh usa `axios.post()` diretamente, duplicando a URL base como string hardcoded em vez de usar a instância `api`. Isso contorna os interceptors e duplica a configuração.

```js
// api.js:24 — axios direto, não a instância configurada
const response = await axios.post(
  `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/auth/refresh`,
  { refreshToken }
)
```

### 4. `adminOrderService.updateStatus` envia string JSON raw como body

**Arquivo**: `services/adminOrderService.js:6-9`

```js
updateStatus: (id, status) =>
  api.put(`/orders/${id}/status`, status, {
    headers: { 'Content-Type': 'application/json' },
  })
```

`status` é uma string (ex: `"PAID"`). Ao serializar como JSON, o body enviado é `"PAID"` (string JSON) e não `{"status":"PAID"}` (objeto JSON). Dependendo do backend, isso pode causar erros de parsing ou comportamento inesperado.

### 5. Todos os `useEffect` de fetch não fazem cleanup

**Arquivos**: `HomePage.jsx:30`, `ProductsPage.jsx:20`, `ProductDetailPage.jsx:31`, `OrdersPage.jsx:83`, `AdminDashboardPage.jsx:34`, `AdminProductsPage.jsx:16`, `AdminCategoriesPage.jsx:23`, `AdminOrdersPage.jsx:154`, `AdminProductFormPage.jsx:55,60`

Nenhum dos efeitos de fetch usa `AbortController`. Em navegação rápida, requisições em voo podem tentar atualizar estado de componentes já desmontados. Em React 19 (modo concorrente), isso é mais propenso a causar problemas.

```js
// Padrão usado em todas as páginas — sem cleanup:
useEffect(() => {
  someService.getAll().then(setData).catch(...).finally(...)
}, [])
// Deveria retornar: return () => controller.abort()
```

### 6. `STATUS_CONFIG` duplicado entre loja e admin

**Arquivos**: `pages/OrdersPage.jsx:12-18`, `pages/admin/AdminOrdersPage.jsx:10-16`

Objeto idêntico com labels e variantes de badge duplicado. Se um novo status for adicionado no backend, precisa ser atualizado em dois lugares.

### 7. Fallback com `Date.now()` como ID de variante

**Arquivo**: `AdminProductFormPage.jsx:130`

```js
} else {
  setVariants(prev => [...prev, { ...payload, id: Date.now(), ... }])
}
```

Se a API não retornar o objeto criado no formato esperado, o frontend cria uma variante local com `id: Date.now()`. Esse ID fictício pode conflitar com IDs reais e torna a lista de variantes inconsistente até o próximo reload.

### 8. Erros de carregamento silenciosos na HomePage

**Arquivo**: `HomePage.jsx:33-36`

```js
productService.getAll()
  .then((data) => setProducts(data.slice(0, 8)))
  .catch(() => {})  // erro silenciado
  .finally(() => setLoadingProducts(false))
```

Falha na API de produtos ou categorias resulta em página vazia sem qualquer mensagem ao usuário. Contrasta com todas as outras páginas que exibem `ErrorMessage`.

### 9. Nome enganoso: `adminProductService.delete()` é soft delete

**Arquivo**: `services/adminProductService.js:8`, `pages/admin/AdminProductsPage.jsx:27-35`

O service expõe um método chamado `delete`, mas o comportamento real é desativação (o frontend atualiza `active: false` no estado local após a chamada). Um desenvolvedor que leia o service sem ver o componente pode assumir que é uma exclusão real.

### 10. Botões icon sem `aria-label` no formulário de variantes

**Arquivo**: `pages/admin/AdminProductFormPage.jsx:365-379` (modo de edição inline)

Os botões de confirmar (✓) e cancelar (✗) edição de variante são `Button size="icon"` com apenas um ícone interno e **sem `aria-label`**. Inacessíveis para leitores de tela.

```jsx
<Button size="icon" variant="ghost" onClick={handleUpdateVariant}>
  <Check className="h-3.5 w-3.5" />  {/* sem aria-label */}
</Button>
```
