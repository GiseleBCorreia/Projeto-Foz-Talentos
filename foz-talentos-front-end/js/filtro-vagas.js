/*
carrega html
*/
document.addEventListener("DOMContentLoaded", () => {

  /*
    Procura o campo de pesquisa da página.
  */
  const searchInput = document.getElementById("publicSearch");

  /*
    Procura o select de estados.
  */
  const stateFilter = document.getElementById("publicStateFilter");

  /*
    Procura o select de áreas de atuação.
  */
  const areaFilter = document.getElementById("publicAreaFilter");

  /*
    Procura o botão "Limpar filtros".
  */
  const clearFiltersButton = document.getElementById("clearFilters");

  /*
    Procura os checkboxes de modalidade
  */
  const modalidadeCheckboxes = document.querySelectorAll(
    ".modalidade-filter"
  );

  /*
    Procura os checkboxes do modelo de contrato
  */
  const contratoCheckboxes = document.querySelectorAll(
    ".contrato-filter"
  );

  /*
    Verifica se o botão foi encontrado.
  */
  if (!clearFiltersButton) {
    console.error('Botão com id "clearFilters" não foi encontrado.');
    return;
  }

  /*
   usuário clica em "Limpar filtros", tudo que tiver dentro dessa função vai ser executado
  */
  clearFiltersButton.addEventListener("click", () => {

    /*
      Percorre todos os checkboxes de modalidade
    */
    modalidadeCheckboxes.forEach((checkbox) => {

      /*
        checked = false = Desmarca
      */
      checkbox.checked = false;
    });

    /*
      Faz o mesmo para
      os checkboxes do modelo de contrato
    */
    contratoCheckboxes.forEach((checkbox) => {
      checkbox.checked = false;
    });

    /*
      Verifica se o select de estados existe
    */
    if (stateFilter) {

      /*
        volta pra Todos os estados
      */
      stateFilter.value = "";
    }

    /*
      Faz o mesmo pro select
      de área de atuação.
    */
    if (areaFilter) {
      areaFilter.value = "";
    }

    /*
      Verifica se o campo de pesquisa existe
    */
    if (searchInput) {

      /*
        Apaga todo o texto digitado pelo usuário
      */
      searchInput.value = "";
    }

    /*
      Dispara o "input".

    */
    searchInput?.dispatchEvent(
      new Event("input", {
        bubbles: true
      })
    );

    /*
      Dispara o "change"
      para o select dos estados.

    */
    stateFilter?.dispatchEvent(
      new Event("change", {
        bubbles: true
      })
    );

    /*
      o mesmo para o select
      de Área de atuação.
    */
    areaFilter?.dispatchEvent(
      new Event("change", {
        bubbles: true
      })
    );

    /*
      percorretodos checkboxes .
    */
    modalidadeCheckboxes.forEach((checkbox) => {

      /*
        evento "change".
      */
      checkbox.dispatchEvent(
        new Event("change", {
          bubbles: true
        })
      );
    });

    /*
      Repete exatamente mesmo processo
      p checkboxes d modelo de contrato.
    */
    contratoCheckboxes.forEach((checkbox) => {

      checkbox.dispatchEvent(
        new Event("change", {
          bubbles: true
        })
      );
    });

  });

});