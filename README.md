# Eureka - Sistema de Preparação para Exames

## Visão Geral

Eureka é uma API RESTful de um sistema de preparação para exames, projetado para ajudar estudantes a se prepararem para avaliações provinciais e exames nacionais. O sistema permite o gerenciamento de disciplinas, avaliações, questões, respostas e estatísticas de desempenho dos estudantes.

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

## Estrutura do Projeto

**eureka/**

**├── src/                      		# Código fonte**

│   ├── config/               	# Configurações do projeto

│   ├── controllers/         	# Controladores da aplicação

│   ├── middlewares/      	# Middlewares personalizados

│   ├── models/               	# Modelos do banco de dados

**│   ├── routes/               	# Rotas da API**

│   └── schemas/              	# Esquemas de validação (Zod)

**├── test/                     		# Testes**

│   ├── fixtures/             	# Dados de teste fixos

│   └── integration/          	# Testes de integração

└── .env                      		# Variáveis de ambiente

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

   **npm install**
3. Configure as variáveis de ambiente:

   * Crie um arquivo [.env](vscode-file://vscode-app/c:/Users/user/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html) na raiz do projeto
   * Defina as variáveis necessárias:

     **PORT=6199**

     **MONGODB_URI=mongodb://localhost:27017/eureka**

     **JWT_SECRET=seu_segredo_jwt**
4. Iniciar o servidor de desenvolvimento:

   **npm run dev**

## Testes

Execute os testes com:

**npm test**

Para executar testes com cobertura:

**npm run test:coverage**

NB - eu estava cansado e com preguiça na reta final então os testes agr estão uma autêntica confusão, n vão funcionar e precisarão de muita refatoração

## Endpoints da API

### Autenticação

* `POST /api/usuarios/register` - Registro de usuário
* `POST /api/usuarios/login` - Login de usuário
* `GET /api/usuarios/profile` - Perfil do usuário autenticado

### Disciplinas

* `GET /api/disciplinas` - Listar todas as disciplinas
* `GET /api/disciplinas/:id` - Obter disciplina por ID
* `GET /api/disciplinas/search` - Pesquisar disciplinas
* `POST /api/disciplinas` - Criar disciplina (requer ADMIN)
* `PUT /api/disciplinas/:id` - Atualizar disciplina
* `DELETE /api/disciplinas/:id` - Remover disciplina

### Avaliações

* `GET /api/avaliacoes` - Listar avaliações
* `GET /api/avaliacoes/:id` - Obter avaliação por ID
* `GET /api/avaliacoes/search` - Pesquisar avaliações
* `GET /api/avaliacoes/estatisticas` - Estatísticas de avaliações
* `POST /api/avaliacoes` - Criar avaliação
* `PUT /api/avaliacoes/:id` - Atualizar avaliação
* `DELETE /api/avaliacoes/:id` - Remover avaliação

### Questões

* `GET /api/questoes` - Listar questões
* `GET /api/questoes/:id` - Obter questão por ID
* `GET /api/questoes/search` - Pesquisar questões
* `POST /api/questoes` - Criar questão
* `POST /api/questoes/importar/:avaliacaoId` - Importar questões em massa
* `PUT /api/questoes/:id` - Atualizar questão
* `DELETE /api/questoes/:id` - Remover questão

### Estudantes

* `GET /api/estudantes` - Listar estudantes
* `GET /api/estudantes/:id` - Obter estudante por ID
* `GET /api/estudantes/:id/respostas` - Obter respostas do estudante
* `GET /api/estudantes/:id/estatisticas` - Estatísticas do estudante
* `POST /api/estudantes` - Criar estudante
* `PUT /api/estudantes/:id` - Atualizar estudante
* `DELETE /api/estudantes/:id` - Remover estudante

### Respostas

* `GET /api/respostas` - Listar respostas
* `GET /api/respostas/:id` - Obter resposta por ID
* `GET /api/respostas/estatisticas` - Estatísticas de respostas
* `POST /api/respostas` - Criar resposta
* `POST /api/respostas/batch` - Criar respostas em massa
* `PUT /api/respostas/:id` - Atualizar resposta
* `DELETE /api/respostas/:id` - Remover resposta

### Quizzes

* `GET /api/quizzes` - Listar quizzes
* `GET /api/quizzes/:id` - Obter quiz por ID
* `POST /api/quizzes` - Criar quiz
* `PUT /api/quizzes/:id` - Atualizar quiz
* `DELETE /api/quizzes/:id` - Remover quiz
* `PATCH /api/quizzes/:id/toggle-status` - Ativar/desativar quiz

## Contribuição

1. Faça um fork do repositório
2. Crie sua branch de recurso (`git checkout -b feature/novo-recurso`)
3. Faça commit das suas alterações (`git commit -am 'Adiciona novo recurso'`)
4. Faça push para a branch (`git push origin feature/novo-recurso`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT.
