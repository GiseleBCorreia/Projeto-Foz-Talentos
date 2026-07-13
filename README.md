# Foz Talentos — versão com páginas separadas

Páginas principais:
- index.html — Início
- sobre.html — Sobre
- servicos.html — Serviços
- vagas.html — Vagas
- contato.html — Contato

Páginas de detalhes:
- vaga-123.html
- vaga-124.html
- vaga-125.html
- vaga-126.html

Para usar:
1. Extraia o arquivo ZIP.
2. Abra index.html.
3. Substitua 5545999999999 pelo número real do WhatsApp.
4. Personalize textos, contatos, vagas e imagens.


## Logo oficial

A logo enviada foi recortada e salva em:

`img/logo-foz-talentos.png`

Ela já está aplicada no cabeçalho e no rodapé de todas as páginas.


## Correção da logo

- Logo do cabeçalho reduzida para não aumentar a altura do menu.
- Fundo branco removido.
- Criada uma versão transparente própria para o rodapé escuro.


## Login administrativo no front-end

Foi adicionada a página:

`admin-login.html`

O link `Login ADM` aparece no menu de todas as páginas.

Esta versão contém somente a interface visual. O formulário ainda não valida usuário e senha, pois essa parte depende do back-end.


## Correção aplicada em todas as páginas

- O rodapé agora fica separado do conteúdo em todas as páginas.
- A Home recebeu espaço extra por causa do `transform: translateY(45px)` do card de valores.
- O `body` usa Flexbox para manter o rodapé corretamente posicionado.
- O seletor `.copyright` foi corrigido.
- Foram ajustadas as páginas Início, Sobre, Serviços, Vagas, Contato, Login ADM e detalhes das vagas.


## Versão final corrigida

- Pasta `img` adicionada ao projeto.
- Logo do cabeçalho restaurada em todas as páginas.
- Logo própria para o rodapé escuro criada e aplicada.
- Caminhos das imagens padronizados.
- Espaçamento entre conteúdo e rodapé corrigido em todas as páginas.
- Tamanhos das logos ajustados para desktop e celular.
