# Eureka - Sistema de Preparação para Exames

## Visão Geral

Eureka é uma API RESTful de um sistema de preparação para exames, projetado para ajudar estudantes a se prepararem para avaliações provinciais e exames nacionais. O sistema permite o gerenciamento de disciplinas, avaliações, questões, respostas e estatísticas de desempenho dos estudantes.

## 📚 Documentação da API

### Swagger UI
- **URL**: `http://localhost:6199/api-docs`
- **Descrição**: Interface interativa para testar a API

### OpenAPI JSON
- **URL**: `http://localhost:6199/api-docs.json`
- **Descrição**: Especificação OpenAPI em formato JSON

### Documentação Detalhada
- **Arquivo**: `server/API_DOCUMENTATION.md`
- **Descrição**: Documentação completa com exemplos e guias de uso

## Tecnologias Utilizadas

* **Bun.js** : Ambiente de execução JavaScript server-side
* **Express** : Framework web para construir a API RESTful
* **MongoDB** : Banco de dados NoSQL para armazenamento de dados
* **Mongoose** : ODM (Object Data Modeling) para MongoDB
* **JWT** : Autenticação baseada em tokens
* **Zod** : Validação de esquemas
* **Jest** : Framework de testes
* **Supertest** : Biblioteca para testes de integração em APIs
* **TypeScript** : Linguagem com tipagem estática
* **Swagger/OpenAPI** : Documentação da API

## Estrutura do Projeto

**eureka/**

**├── server/                    		# Backend API**

**│   ├── config/               	# Configurações do projeto**

**│   ├── controllers/         	# Controladores da aplicação**

**│   ├── middlewares/      	# Middlewares personalizados**

**│   ├── models/               	# Modelos do banco de dados**

**│   ├── routes/               	# Rotas da API**

**│   ├── schemas/              	# Esquemas de validação (Zod)**

**│   └── API_DOCUMENTATION.md  	# Documentação da API**

**├── mobile/                   		# Aplicação React Native**

**├── web/                      		# Aplicações Next.js**

**│   ├── admin-dashboard/      	# Dashboard administrativo**

**│   └── client/               	# Cliente web**

**├── test/                     		# Testes**

**│   ├── fixtures/             	# Dados de teste fixos**

**│   └── integration/          	# Testes de integração**

**└── .env                      		# Variáveis de ambiente**

## Principais Recursos

### Usuários e Autenticação

* Registro e login de usuários
* Tipos de usuários: ADMIN, PROFESSOR e NORMAL
* Autenticação via JWT
* Gerenciamento de perfil

### Disciplinas

* CRUD completo de disciplinas
* Pesquisa por código e nome
* Associação com avaliações

### Avaliações

* Suporte para Avaliações Provinciais (AP) e Exames Nacionais
* Agrupamento por disciplina, ano, classe e trimestre/época
* Estatísticas de avaliações

### Questões

* Gerenciamento de questões de múltipla escolha
* Alternativas corretas e explicações
* Importação em massa de questões
* Associação com avaliações

### Estudantes

* CRUD de estudantes
* Organização por classe (11ª e 12ª)
* Histórico de respostas e estatísticas

### Respostas e Estatísticas

* Registro de respostas dos estudantes
* Inserção em massa de respostas
* Estatísticas de desempenho por estudante e disciplina
* Tempo de resposta e percentuais de acerto

### Quizzes

* Geração de quizzes baseados em avaliações
* Ativação/desativação de quizzes
* Acompanhamento de desempenho

## Instalação

1. Clone o repositório:

   **git clone ** https://github.com/Badfox16/eureka.git

   **cd eureka**
2. Instale as dependências:

   **bun install**
3. Configure as variáveis de ambiente:

   * Crie um arquivo [.env](vscode-file://vscode-app/c:/Users/user/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html) na raiz do projeto
   * Defina as variáveis necessárias:

     **PORT=6199**

     **MONGODB_URI=mongodb://localhost:27017/eureka**

     **JWT_SECRET=seu_segredo_jwt**
4. Iniciar o servidor de desenvolvimento:

   **bun run dev**
5. Acessar a documentação:

   **http://localhost:6199/api-docs**

## Testes

Execute os testes com:

**bun test**

Para executar testes com cobertura:

**bun run test:coverage**

NB - eu estava cansado e com preguiça na reta final então os testes agr estão uma autêntica confusão, n vão funcionar e precisarão de muita refatoração

## Endpoints da API

### Autenticação

* `POST /api/v1/auth/login` - Login de usuário
* `POST /api/v1/auth/register` - Registro de usuário
* `POST /api/v1/auth/refresh` - Renovar token
* `POST /api/v1/auth/logout` - Logout
* `GET /api/v1/auth/me` - Perfil do usuário autenticado

### Disciplinas

* `GET /api/v1/disciplinas` - Listar todas as disciplinas
* `GET /api/v1/disciplinas/:id` - Obter disciplina por ID
* `GET /api/v1/disciplinas/search` - Pesquisar disciplinas
* `POST /api/v1/disciplinas` - Criar disciplina (requer ADMIN)
* `PUT /api/v1/disciplinas/:id` - Atualizar disciplina
* `DELETE /api/v1/disciplinas/:id` - Remover disciplina

### Avaliações

* `GET /api/v1/avaliacoes` - Listar avaliações
* `GET /api/v1/avaliacoes/:id` - Obter avaliação por ID
* `GET /api/v1/avaliacoes/search` - Pesquisar avaliações
* `GET /api/v1/avaliacoes/estatisticas` - Estatísticas de avaliações
* `POST /api/v1/avaliacoes` - Criar avaliação
* `PUT /api/v1/avaliacoes/:id` - Atualizar avaliação
* `DELETE /api/v1/avaliacoes/:id` - Remover avaliação

### Questões

* `GET /api/v1/questoes` - Listar questões
* `GET /api/v1/questoes/:id` - Obter questão por ID
* `GET /api/v1/questoes/search` - Pesquisar questões
* `POST /api/v1/questoes` - Criar questão
* `POST /api/v1/questoes/importar/:avaliacaoId` - Importar questões em massa
* `PUT /api/v1/questoes/:id` - Atualizar questão
* `DELETE /api/v1/questoes/:id` - Remover questão

### Estudantes

* `GET /api/v1/estudantes` - Listar estudantes
* `GET /api/v1/estudantes/:id` - Obter estudante por ID
* `GET /api/v1/estudantes/:id/respostas` - Obter respostas do estudante
* `GET /api/v1/estudantes/:id/estatisticas` - Estatísticas do estudante
* `POST /api/v1/estudantes` - Criar estudante
* `PUT /api/v1/estudantes/:id` - Atualizar estudante
* `DELETE /api/v1/estudantes/:id` - Remover estudante

### Respostas

* `GET /api/v1/respostas` - Listar respostas
* `GET /api/v1/respostas/:id` - Obter resposta por ID
* `GET /api/v1/respostas/estatisticas` - Estatísticas de respostas
* `POST /api/v1/respostas` - Criar resposta
* `POST /api/v1/respostas/batch` - Criar respostas em massa
* `PUT /api/v1/respostas/:id` - Atualizar resposta
* `DELETE /api/v1/respostas/:id` - Remover resposta

### Quizzes

* `GET /api/v1/quizzes` - Listar quizzes
* `GET /api/v1/quizzes/:id` - Obter quiz por ID
* `POST /api/v1/quizzes` - Criar quiz
* `PUT /api/v1/quizzes/:id` - Atualizar quiz
* `DELETE /api/v1/quizzes/:id` - Remover quiz
* `PATCH /api/v1/quizzes/:id/toggle-status` - Ativar/desativar quiz

## Contribuição

1. Faça um fork do repositório
2. Crie sua branch de recurso (`git checkout -b feature/novo-recurso`)
3. Faça commit das suas alterações (`git commit -am 'Adiciona novo recurso'`)
4. Faça push para a branch (`git push origin feature/novo-recurso`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT.
