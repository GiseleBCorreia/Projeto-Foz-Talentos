# Foz Talentos — Front-end

## Arquivos principais
- `admin-login.html`: login demonstrativo.
- `admin-painel.html`: cadastro, edição, exclusão, busca e filtro de vagas.
- `vagas.html`: listagem pública das vagas ativas.
- `js/vagas-service.js`: camada temporária de armazenamento em `localStorage`.

## Login de demonstração
- E-mail: `admin@foztalentos.com.br`
- Senha: `admin123`

Este login não é seguro e deve ser substituído pela autenticação do back-end.

## Integração futura
A pessoa responsável pelo back-end poderá substituir os métodos de `VagasService` por chamadas `fetch()` para a API, preservando o restante da interface.

## Imagens
Adicione na pasta `img/`:
- `logo-foz-talentos.png`
- `logo-foz-talentos-rodape.png`
