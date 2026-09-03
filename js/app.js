// 1. Registro do Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js')
      .then((reg) => console.log('Service Worker registrado:', reg.scope))
      .catch((err) => console.error('Erro no Service Worker:', err));
  });
}

// 2. Prompt de Instalação PWA
let deferredPrompt;
const installBtn = document.getElementById('install-btn');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (installBtn) installBtn.style.display = 'block';
});

if (installBtn) {
  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installBtn.style.display = 'none';
  });
}

// 3. Recurso de Hardware: Geolocalização (GPS)
const geoBtn = document.getElementById('geo-btn');
const geoOutput = document.getElementById('geo-output');

if (geoBtn && geoOutput) {
  geoBtn.addEventListener('click', () => {
    if (!('geolocation' in navigator)) {
      geoOutput.textContent = 'Geolocalização não suportada neste dispositivo.';
      return;
    }

    geoOutput.textContent = 'Obtendo localização...';

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        geoOutput.innerHTML = `
          <strong>GPS Ativo:</strong><br>
          Lat: ${latitude.toFixed(4)}° | Lon: ${longitude.toFixed(4)}°<br>
          <small>(Precisão: ~${Math.round(accuracy)}m)</small>
        `;
      },
      (error) => {
        geoOutput.textContent = 'Permissão de GPS negada ou indisponível.';
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
}

// 4. Lógica de Busca com Headers Corretos
const searchBtn = document.getElementById('search-btn');
const searchInput = document.getElementById('search-input');
const resultsContainer = document.getElementById('results-container');

if (searchBtn && searchInput) {
  searchBtn.addEventListener('click', handleSearch);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
  });
}

async function handleSearch() {
  const query = searchInput.value.trim();

  if (!query) {
    resultsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Digite o nome de um anime.</p>';
    return;
  }

  resultsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Buscando animes...</p>';

  // Tentativa 1: Jikan API
  try {
    const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=8`);
    if (!res.ok) throw new Error('Falha no Jikan');
    
    const data = await res.json();
    const formatted = data.data.map(item => ({
      title: item.title,
      image: item.images?.jpg?.image_url
    }));

    if (formatted.length > 0) {
      renderAnimeResults(formatted);
      return;
    }
  } catch (err) {
    console.warn('Jikan falhou, tentando Kitsu API...', err);
  }

  // Tentativa 2: Kitsu API (Fallback)
  try {
    const res = await fetch(`https://kitsu.io/api/edge/anime?filter[text]=${encodeURIComponent(query)}&page[limit]=8`, {
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json'
      }
    });

    if (!res.ok) throw new Error('Falha no Kitsu');

    const data = await res.json();
    const formatted = data.data.map(item => ({
      title: item.attributes.canonicalTitle || item.attributes.titles.en_jp,
      image: item.attributes.posterImage?.small || item.attributes.posterImage?.original
    }));

    renderAnimeResults(formatted);
  } catch (err) {
    console.error('Ambas as APIs falharam:', err);
    resultsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #ff6b6b;">Erro ao carregar os animes. Tente novamente em alguns segundos.</p>';
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
