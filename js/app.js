const urlApi = "https://graphql.anilist.co";

const elementos = {
  formulario: document.querySelector("form"),
  campoBusca: document.querySelector("input"),
  mensagem: document.querySelector(".mensagem"),
  grade: document.querySelector(".grade-animes"),
  modal: document.querySelector("dialog"),
  conteudoModal: document.querySelector(".modal-conteudo"),
  fecharModal: document.querySelector(".fechar-modal")
};

let animesAtuais = [];

const consulta = `
  query ($termo: String) {
    Page(page: 1, perPage: 16) {
      media(search: $termo, type: ANIME, isAdult: false, sort: SEARCH_MATCH) {
        id
        title {
          romaji
          english
        }
        coverImage {
          extraLarge
          large
        }
        averageScore
        episodes
        format
        status
        description(asHtml: false)
        genres
        trailer {
          id
          site
        }
      }
    }
  }
`;

function protegerTexto(texto) {
  return String(texto || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function tituloDoAnime(anime) {
  return anime.title.english || anime.title.romaji || "Título não informado";
}

function notaDoAnime(anime) {
  return anime.averageScore ? (anime.averageScore / 10).toFixed(1) : "N/A";
}

function mostrarMensagem(texto, carregando = false) {
  elementos.mensagem.hidden = false;
  elementos.mensagem.innerHTML = carregando
    ? `<span class="spinner" aria-hidden="true"></span><p>${texto}</p>`
    : `<p>${texto}</p>`;
}

function esconderMensagem() {
  elementos.mensagem.hidden = true;
}

function criarCard(anime) {
  const titulo = protegerTexto(tituloDoAnime(anime));
  const imagem = anime.coverImage.extraLarge || anime.coverImage.large;
  const episodios = anime.episodes ? `${anime.episodes} episódios` : "Episódios não informados";

  return `
    <article class="card-anime">
      <div class="capa-anime">
        <img src="${imagem}" alt="Capa do anime ${titulo}" loading="lazy">
        <span class="nota"><span aria-hidden="true">★</span>${notaDoAnime(anime)}</span>
      </div>
      <div class="card-conteudo">
        <h2>${titulo}</h2>
        <p class="informacoes">${anime.format || "Anime"} · ${episodios}</p>
        <button class="detalhar" type="button" data-id="${anime.id}">Ver detalhes</button>
      </div>
    </article>
  `;
}

function exibirAnimes(animes) {
  if (!animes.length) {
    elementos.grade.innerHTML = "";
    mostrarMensagem("Nenhum anime foi encontrado com esse nome.");
    return;
  }

  elementos.grade.innerHTML = animes.map(criarCard).join("");
  esconderMensagem();
}

async function buscarAnimes(termo) {
  elementos.grade.innerHTML = "";
  mostrarMensagem("Buscando animes...", true);

  try {
    const resposta = await fetch(urlApi, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        query: consulta,
        variables: { termo }
      })
    });

    const dados = await resposta.json();

    if (!resposta.ok || dados.errors) {
      throw new Error("Não foi possível consultar a API.");
    }

    animesAtuais = dados.data.Page.media || [];
    exibirAnimes(animesAtuais);
  } catch (erro) {
    elementos.grade.innerHTML = "";
    mostrarMensagem("A busca não foi carregada. Tente novamente.");
  }
}

function abrirDetalhes(id) {
  const anime = animesAtuais.find((item) => item.id === Number(id));

  if (!anime) {
    return;
  }

  const titulo = protegerTexto(tituloDoAnime(anime));
  const imagem = anime.coverImage.extraLarge || anime.coverImage.large;
  const sinopse = protegerTexto(anime.description || "A sinopse deste anime não está disponível.");
  const generos = anime.genres.length
    ? anime.genres.map((genero) => `<span class="genero">${protegerTexto(genero)}</span>`).join("")
    : "<span class=\"genero\">Não informado</span>";
  const trailer = anime.trailer?.id && anime.trailer.site === "youtube"
    ? `<a class="link-trailer" href="https://www.youtube.com/watch?v=${anime.trailer.id}" target="_blank" rel="noopener noreferrer">Assistir trailer</a>`
    : "";

  elementos.conteudoModal.innerHTML = `
    <img class="modal-capa" src="${imagem}" alt="Capa do anime ${titulo}">
    <div class="modal-texto">
      <h2 id="modal-titulo">${titulo}</h2>
      <div class="modal-dados">
        <span>★ ${notaDoAnime(anime)}</span>
        <span>${anime.format || "Anime"}</span>
        <span>${anime.episodes ? `${anime.episodes} episódios` : "Episódios não informados"}</span>
        <span>${anime.status || "Status não informado"}</span>
      </div>
      <p class="sinopse">${sinopse}</p>
      <div class="lista-generos">${generos}</div>
      ${trailer}
    </div>
  `;

  elementos.modal.showModal();
}

elementos.formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();
  const termo = elementos.campoBusca.value.trim();

  if (termo) {
    buscarAnimes(termo);
  }
});

elementos.grade.addEventListener("click", (evento) => {
  const botao = evento.target.closest(".detalhar");

  if (botao) {
    abrirDetalhes(botao.dataset.id);
  }
});

elementos.fecharModal.addEventListener("click", () => elementos.modal.close());

elementos.modal.addEventListener("click", (evento) => {
  if (evento.target === elementos.modal) {
    elementos.modal.close();
  }
});
