// ==========================================================================
// 1. REGISTRO DO SERVICE WORKER (PWA)
// ==========================================================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js')
      .then((reg) => console.log('Service Worker registrado com sucesso:', reg.scope))
      .catch((err) => console.error('Falha ao registrar o Service Worker:', err));
  });
}

// ==========================================================================
// 2. PROMPT DE INSTALAÇÃO DO PWA (INSTALÁVEL NO CELULAR/PC)
// ==========================================================================
let deferredPrompt;
const installBtn = document.getElementById('install-btn');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  
  if (installBtn) {
    installBtn.style.display = 'block';
  }
});

if (installBtn) {
  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`Resposta do usuário ao prompt de instalação: ${outcome}`);
    
    deferredPrompt = null;
    installBtn.style.display = 'none';
  });
}

// ==========================================================================
// 3. RECURSO DE HARDWARE: GEOLOCALIZAÇÃO (GPS DO DISPOSITIVO)
// ==========================================================================
const geoBtn = document.getElementById('geo-btn');
const geoOutput = document.getElementById('geo-output');

if (geoBtn && geoOutput) {
  geoBtn.addEventListener('click', () => {
    if (!('geolocation' in navigator)) {
      geoOutput.textContent = 'Geolocalização não é suportada neste navegador/dispositivo.';
      return;
    }

    geoOutput.textContent = 'Obtendo localização atual...';

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        geoOutput.innerHTML = `
          <strong>Localização obtida via GPS:</strong><br>
          Latitude: ${latitude.toFixed(4)}° | Longitude: ${longitude.toFixed(4)}°<br>
          <small>(Precisão estimada: ~${Math.round(accuracy)} metros)</small>
        `;
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            geoOutput.textContent = 'Permissão negada pelo usuário para acessar a localização.';
            break;
          case error.POSITION_UNAVAILABLE:
            geoOutput.textContent = 'Informações de localização indisponíveis no dispositivo.';
            break;
          case error.TIMEOUT:
            geoOutput.textContent = 'A requisição para obter a localização expirou.';
            break;
          default:
            geoOutput.textContent = 'Erro desconhecido ao obter a localização.';
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
}

// ==========================================================================
// 4. LÓGICA DE BUSCA DE ANIMES (JIKAN API COM FALLBACK AUTOMÁTICO PARA KITSU API)
// ==========================================================================
const searchBtn = document.getElementById('search-btn');
const searchInput = document.getElementById('search-input');
const resultsContainer = document.getElementById('results-container');

if (searchBtn && searchInput) {
  searchBtn.addEventListener('click', handleSearch);

  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  });
}

async function handleSearch() {
  const query = searchInput.value.trim();

  if (!query) {
    resultsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Por favor, digite o nome de um anime.</p>';
    return;
  }

  resultsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Buscando animes...</p>';

  try {
    // Tenta carregar pela API principal (Jikan)
    const jikanUrl = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=8`;
    const response = await fetch(jikanUrl);

    if (!response.ok) {
      throw new Error(`Jikan HTTP status: ${response.status}`);
    }

    const data = await response.json();
    
    // Converte resposta do Jikan para o padrão da aplicação
    const formattedAnimes = data.data.map((item) => ({
      title: item.title,
      image: item.images?.jpg?.image_url
    }));

    renderAnimeResults(formattedAnimes);

  } catch (jikanError) {
    console.warn('Jikan API indisponível ou bloqueada. Tentando API de fallback (Kitsu)...', jikanError);

    try {
      // Fallback: API Kitsu
      const kitsuUrl = `https://kitsu.io/api/edge/anime?filter[text]=${encodeURIComponent(query)}&page[limit]=8`;
      const kitsuResponse = await fetch(kitsuUrl);

      if (!kitsuResponse.ok) {
        throw new Error(`Kitsu HTTP status: ${kitsuResponse.status}`);
      }

      const kitsuData = await kitsuResponse.json();
      
      // Converte resposta da Kitsu para o padrão da aplicação
      const formattedAnimes = kitsuData.data.map((item) => ({
        title: item.attributes.canonicalTitle || item.attributes.titles.en_jp,
        image: item.attributes.posterImage?.small || item.attributes.posterImage?.original
      }));

      renderAnimeResults(formattedAnimes);

    } catch (kitsuError) {
      console.error('Falha em ambas as APIs:', kitsuError);
      resultsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #ff6b6b;">Servidores de busca temporariamente indisponíveis. Verifique sua conexão e tente novamente em instantes.</p>';
    }
  }
}

function renderAnimeResults(animes) {
  resultsContainer.innerHTML = '';

  if (!animes || animes.length === 0) {
    resultsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Nenhum anime encontrado.</p>';
    return;
  }

  animes.forEach((anime) => {
    const card = document.createElement('article');
    card.className = 'anime-card';
    card.innerHTML = `
      <img src="${anime.image || ''}" alt="${anime.title}" loading="lazy" />
      <h3>${anime.title}</h3>
    `;

    resultsContainer.appendChild(card);
  });
}
