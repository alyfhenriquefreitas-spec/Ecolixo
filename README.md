# 🌿 EcoLixo Porto Velho - Sistema de Coleta de Lixo Eletrônico

> **SPEC Inicial Simplificada • Desenvolvimento de Sistemas**  
> Versão 1.0 | Projeto Escolar | Escopo: Cadastro, login e consulta de pontos de coleta em **Porto Velho - RO**.

O **EcoLixo Porto Velho** é uma aplicação completa desenvolvida para auxiliar os moradores de Porto Velho (capital de Rondônia) a encontrar pontos reais e oficiais de descarte sustentável de lixo eletrônico (e-lixo), permitindo que administradores mantenham a base de postos e materiais aceitos sempre atualizada.

---

## 📍 Pontos de Coleta Reais Cadastrados em Porto Velho - RO

| # | Nome do Ponto | Bairro / Região | Endereço Completo | Principais Materiais Aceitos |
| :- | :--- | :--- | :--- | :--- |
| **1** | **Prefeitura de Porto Velho (SESB / SEINFRA)** | Bairro Industrial | Rua Aparício Moraes, 3186 (Seg a Sex: 7h às 14h) | Celulares, Computadores, Monitores, Impressoras, Cabos e Eletroportáteis |
| **2** | **Central de Logística Reversa (CATANORTE)** | Bairro Vila Princesa | BR-364, KM 11 - Estrada da Rema, s/nº | Computadores, Servidores, Placas Eletrônicas, TVs, Linha Branca e Baterias Nobreak |
| **3** | **Porto Velho Shopping (Ecoponto ABREE)** | Bairro Flodoaldo Pontes Pinto | Av. Prefeito Chiquilito Soares, 1176 | Celulares, Tablets, Pilhas e Baterias Portáteis, Fones e Pequenos Eletrônicos |
| **4** | **SEMA (Sec. Municipal de Meio Ambiente)** | Centro | Rua General Osório, 81 | Celulares antigos, Pilhas/Baterias Domésticas, Carregadores e Cabos |
| **5** | **SEDAM (Sec. Estadual do Desenv. Ambiental)** | Bairro Pedrinhas | Av. Farquar, 2986 (Complexo Rio Madeira) | Computadores, Notebooks, Monitores e Campanhas Estaduais |
| **6** | **IFRO Campus Porto Velho Calama** | Bairro Flodoaldo Pontes Pinto | Av. Calama, 4985 | Computadores escolares, Placas de circuito, Fios, Teclados e Celulares |
| **7** | **Ponto Coletor de Pilhas e Baterias** | Bairro Nova Floresta (Zona Sul) | Av. Jatuarana, 4520 | Pilhas Alcalinas, Baterias de Celular e Baterias Recarregáveis |

---

## 🎯 Conformidade com a Especificação (SPEC)

### 1. Atores e Perfis
* **Visitante**: Criar conta (UC01), fazer login (UC02), consultar pontos e horários em Porto Velho.
* **Usuário Cadastrado**: Fazer login (UC02), pesquisar pontos por bairro/região (UC03), consultar endereço e materiais aceitos (UC04).
* **Administrador**: Fazer login (UC02), cadastrar pontos de coleta (UC05), atualizar pontos existentes (UC06), excluir postos desativados.

---

### 2. Mapeamento de Requisitos Funcionais (RF) e Casos de Uso (UC)
* **RF01 (UC01) — Criar Conta**: Visitante cria conta com nome, e-mail e senha. Tela: [`public/cadastro.html`](public/cadastro.html).
* **RF02 (UC02) — Fazer Login**: Autenticação com e-mail e senha para Usuário e Administrador. Tela: [`public/login.html`](public/login.html).
* **RF03 (UC03) — Pesquisar Pontos por Cidade / Bairro**: Busca ágil filtrada em Porto Velho. Telas: [`public/index.html`](public/index.html) e [`public/pontos.html`](public/pontos.html).
* **RF04 (UC04) — Consultar Detalhes**: Endereço completo, lista de materiais aceitos e rota no Google Maps. Modal interativo em [`public/pontos.html`](public/pontos.html).
* **RF05 (UC05) — Cadastrar Ponto**: Administrador autenticado grava no banco novo ponto. Tela: [`public/admin.html`](public/admin.html).
* **RF06 (UC06) — Atualizar Ponto**: Administrador autenticado edita dados de pontos existentes. Tela: [`public/admin.html`](public/admin.html).

---

### 3. Requisitos Não Funcionais (RNF)
* **RNF01**: Hash seguro de senhas com `bcryptjs` (salt rounds = 10).
* **RNF02**: Validação rigorosa de todos os formulários no servidor Node.js/Express.
* **RNF03**: Middleware `requireAdmin` protegendo cadastro e alteração de postos.
* **RNF04**: Layout totalmente responsivo para celulares e computadores.
* **RNF05**: Busca por bairros com resposta em milissegundos (< 3s).

---

## 🔑 Credenciais de Teste para Avaliação Escolar

| Perfil | E-mail | Senha |
| :--- | :--- | :--- |
| **Administrador** | `admin@ecolixo.com` | `admin123` |
| **Usuário Comum** | `usuario@ecolixo.com` | `usuario123` |

---

## 🚀 Como Abrir e Testar

### Modo Mais Fácil (2 Cliques no Windows):
Dê dois cliques no arquivo:
👉 [**`CLIQUE_AQUI_PARA_ABRIR_O_SITE.bat`**](CLIQUE_AQUI_PARA_ABRIR_O_SITE.bat)

### Pelo VS Code:
Abra a pasta `C:\Users\ecolixo` no VS Code, abra o arquivo [`public/index.html`](public/index.html) e clique em **"Open with Live Server"**.
