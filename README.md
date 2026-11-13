# 📦 EstoKit - Sistema de Gestão de Estoque

Aplicação Front-End desenvolvida em **Angular 22** para gerenciamento corporativo de estoques, movimentações, catálogo de produtos, fornecedores, ordens de compra e quadro de funcionários.

---

## 🎨 Identidade Visual e Experiência

- **Paleta de Cores:**
  - **Primária:** Branco (`#FFFFFF`, superfícies limpas e canvas suave)
  - **Secundária:** Tons de Marrom (`#62361E`, `#78482A`, `#4B2714`, degradê elegante)
- **Modo Escuro (Dark Mode):** Alternância instantânea via botão no cabeçalho com persistência em `localStorage`. Paleta com tons de café espresso e bronze escuro de alto contraste.
- **Tipografia:** Fonte **Inter** em toda a aplicação (Google Fonts).
- **Idioma:** Totalmente em **Português do Brasil (PT-BR)**.

---

## 🧭 Estrutura de Layout Persistente

O cabeçalho (`Navbar`) e o rodapé (`Footer`) permanecem **persistentes** durante toda a navegação:

- **Navbar (`EstoKit`):**
  - Logotipo e identidade da marca "EstoKit".
  - Links de navegação para todas as seções.
  - Indicador de perfil e acesso dinâmico (menu **Funcionários** exibido apenas para perfil `ADMIN`).
  - Botão de alternância de modo claro/escuro.
  - Painel do usuário logado e botão de encerramento de sessão (*Logout*).
- **Footer:**
  - Nome do autor: **Gabriel Assis**.
  - Ano de criação: **2026**.
  - Logotipo e nome da empresa: **EstoKit**.
  - Status do sistema e selos de conformidade.

---

## 📄 Páginas e Módulos Implementados

Todos os módulos utilizam estritamente os endpoints documentados em `docs/backend.md`:

| Módulo | Rota | Endpoints Integrados | Permissão |
| :--- | :--- | :--- | :--- |
| **Login** | `/login` | `POST /auth/login` | Pública |
| **Cadastro** | `/cadastro` | `POST /funcionarios/salvar` | Pública |
| **Estoque** | `/estoque` | `GET /estoques`, `GET /produtos`, `PUT /estoques/adicionar/{idProduto}?quantidade={qtd}`, `PUT /estoques/subtrair/{idProduto}?quantidade={qtd}` | `PADRAO`, `ADMIN` |
| **Produtos** | `/produtos` | `POST /produtos?quantidade={qtd}`, `GET /produtos`, `GET /produtos/nome/{nome}`, `GET /produtos/categoria/{categoriaNome}`, `PUT /produtos/{id}/inativar`, `PUT /produtos/{id}/ativar`, `DELETE /produtos/{id}` | `PADRAO`, `ADMIN` |
| **Categorias** | `/categorias` | `POST /categorias`, `GET /categorias`, `GET /categorias/ativas`, `GET /categorias/inativas`, `GET /categorias/nome/{nome}`, `PUT /categorias/{id}`, `DELETE /categorias/{id}` | `PADRAO`, `ADMIN` |
| **Fornecedores** | `/fornecedores` | `POST /fornecedores`, `GET /fornecedores`, `GET /fornecedores/nome/{nome}`, `PUT /fornecedores/{id}/nome?nome={novoNome}`, `PUT /fornecedores/{id}/inativar`, `PUT /fornecedores/{id}/ativar` | `PADRAO`, `ADMIN` |
| **Compras & Movimentações** | `/compras` | `POST /compras`, `GET /compras`, `PUT /compras/{id}/cancelar?idFuncionario={idFuncionario}`, `GET /movimentacoes/produto/{id}`, `GET /movimentacoes/funcionario/{id}` | `PADRAO`, `ADMIN` |
| **Funcionários** | `/funcionarios` | `POST /funcionarios/salvar`, `GET /funcionarios/todos`, `GET /funcionarios/buscanome/{nome}`, `PUT /funcionarios/atualizanome/{id}?nome={novoNome}`, `PUT /funcionarios/inativar/{id}`, `PUT /funcionarios/ativar/{id}` | **Exclusivo `ADMIN`** |

---

## 🔒 Segurança e Controle de Acesso (RBAC)

- **Guarda de Rotas (`AuthGuard`):** Garante que usuários não autenticados sejam redirecionados para a tela de login.
- **Guarda Administrativa (`AdminGuard`):** Protege a rota `/funcionarios`, bloqueando o acesso de colaboradores com perfil `PADRAO`.
- **Interceptor HTTP (`authInterceptor`):** Injeta o cabeçalho `Authorization: Bearer <token>` automaticamente em todas as requisições autenticadas e intercepta erros `401/403` para renovação de sessão.

---

## 🚀 Executando o Projeto

### Pré-requisitos
- Node.js (versão 20+)
- Backend Spring Boot em execução na porta `8080` (`http://localhost:8080`)

### Instalação e Execução
```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm start
# ou
ng serve
```

Acesse no navegador: `http://localhost:4200` (ou na porta configurada).

### Compilação para Produção
```bash
npm run build
```

### Testes Unitários
```bash
npm test -- --watch=false
```
