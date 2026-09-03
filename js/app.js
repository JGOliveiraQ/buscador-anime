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
  // Impede que o navegador exiba o banner automático padrão
  e.preventDefault();
  deferredPrompt = e;
  
  // Exibe o botão de instalação customizado na página
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
// 4. LÓGICA DE BUSCA DE ANIMES (JIKAN API V4)
// ==========================================================================
const searchBtn = document.getElementById('search-btn');
const searchInput = document.getElementById('search-input');
const resultsContainer = document.getElementById('results-container');

if (searchBtn && searchInput) {
  searchBtn.addEventListener('click', handleSearch);

  // Permite buscar pressionando a tecla "Enter" no teclado
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
    const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=8`);
    
    if (!response.ok) {
      throw new Error('Erro na resposta da API');
    }

    const data = await response.json();
    renderAnimeResults(data.data);
  } catch (error) {
    console.error('Erro na busca de animes:', error);
    resultsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #ff6b6b;">Erro ao carregar os animes. Verifique sua conexão e tente novamente.</p>';
  }
}

function renderAnimeResults(animes) {
  resultsContainer.innerHTML = '';

  if (!animes || animes.length === 0) {
    resultsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Nenhum anime encontrado.</p>';
    return;
  }

  animes.forEach((anime) => {
    const imageUrl = anime.images?.jpg?.image_url || '';
    
    const card = document.createElement('article');
    card.className = 'anime-card';
    card.innerHTML = `
      <img src="${imageUrl}" alt="${anime.title}" loading="lazy" />
      <h3>${anime.title}</h3>
    `;

    resultsContainer.appendChild(card);
  });
}
