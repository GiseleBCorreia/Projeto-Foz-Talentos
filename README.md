# 🚀 Foz Talentos

> Plataforma de gerenciamento e divulgação de vagas de emprego, desenvolvida para conectar empresas e candidatos e facilitar a administração das oportunidades disponíveis.

---

## 💻 Sobre o Projeto

O **Foz Talentos** é uma plataforma web para publicação, consulta e gerenciamento de vagas de emprego.

O sistema possui um backend responsável pelo gerenciamento de vagas, categorias e administradores, além de autenticação e controle de acesso por diferentes níveis de permissão.

Entre as principais funcionalidades estão:

* Cadastro, edição e consulta de vagas;
* Ativação e desativação de vagas;
* Cadastro e gerenciamento de categorias;
* Autenticação de administradores com **JWT**;
* Controle de acesso por funções (**MASTER** e **EMPLOYEE**);
* Gerenciamento de administradores;
* Filtros de vagas por cargo, estado, categoria, modalidade, nível, tipo de contrato, faixa salarial e período de publicação;
* Paginação e ordenação dos resultados;
* Documentação da API através do **Swagger/OpenAPI**;
* Banco de dados MySQL hospedado em ambiente de produção.

### 🛠️ Tecnologias Utilizadas

**Backend**

* Java 21
* Spring Boot
* Spring Security
* Spring Data JPA
* JWT
* Maven

**Frontend**

* HTML5
* CSS3
* JavaScript

**Banco de Dados**

* MySQL

**Ferramentas e Infraestrutura**

* IntelliJ IDEA
* Visual Studio Code
* Git
* GitHub
* Railway para testes de deploy e integração
* Swagger / OpenAPI

### 🔐 Segurança

A API utiliza autenticação baseada em **JWT**.

Os administradores possuem diferentes níveis de acesso:

* **MASTER:** acesso completo ao gerenciamento administrativo;
* **EMPLOYEE:** acesso às funcionalidades administrativas permitidas para funcionários, sem acesso ao gerenciamento de administradores.

Endpoints protegidos exigem o envio do token JWT através do cabeçalho:

`Authorization: Bearer <token>`

## Criado por:

Caio - Backend

Alex - Tech Lead e conexão da api ao frontend

Gisele e Harley - Frontend

Angélica e Letícia - QAs
