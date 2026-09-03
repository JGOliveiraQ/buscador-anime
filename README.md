# 🎌 Buscador de Anime PWA

Aplicação web desenvolvida para busca e consulta de animes, adaptada como **Progressive Web App (PWA)**, responsiva para dispositivos móveis e integrada ao recurso de hardware (GPS) do dispositivo.

---

## 🚀 Funcionalidades

* **PWA Instalável:** Pode ser adicionado à tela inicial em dispositivos Android, iOS e Desktop.
* **Funcionamento Offline:** Gerenciado por *Service Worker* (`sw.js`) com estratégia de cache estático.
* **Recurso de Hardware:** Acesso à **Geolocalização / GPS** do dispositivo via `navigator.geolocation`.
* **Interface Responsiva:** Adaptação fluida para celulares, tablets e monitores (CSS Grid e Flexbox).
* **Busca com Fallback Automático:** Consulta a API do **Jikan (MyAnimeList)** com alternância automática para a **Kitsu API** em caso de indisponibilidade.

---

## 🛠️ Tecnologias Utilizadas

* **HTML5:** Estrutura semântica e acessível.
* **CSS3:** Design responsivo, variáveis CSS e tema escuro.
* **JavaScript (ES6+):** Manipulação do DOM, Fetch API e consumo de rotas assíncronas.
* **Service Worker & Web App Manifest:** Recursos de PWA e suporte offline.

---

## 📁 Estrutura do Projeto

/
├── css/
│   └── style.css          # Estilos globais e responsividade
├── js/
│   └── app.js             # Lógica do PWA, consumo das APIs e GPS
├── icons/
│   └── icon.svg           # Ícone vetorial do app
├── index.html             # Página principal da aplicação
├── manifest.webmanifest   # Configurações do PWA (ícones, cores, display)
├── sw.js                  # Service Worker (gerenciamento de cache)
└── README.md              # Documentação do repositório


---

## 💻 Como Executar e Testar

1. **Servidor Local:**
   * Clone este repositório:
     ```bash
     git clone [https://github.com/JGOliveiraQ/buscador-anime.git](https://github.com/JGOliveiraQ/buscador-anime.git)
     ```
   * Abra o projeto no VS Code e rode com a extensão **Live Server** (necessário pois Service Workers exigem protocolo HTTP/HTTPS).

2. **Instalação do PWA:**
   * Acesse a aplicação no navegador (Chrome, Edge ou Safari).
   * Clique no botão **"Instalar App"** no cabeçalho ou selecione a opção no menu do próprio navegador.

3. **Geolocalização (GPS):**
   * Na seção *Recurso do Dispositivo*, clique em **"Obter Minha Localização"** e conceda a permissão de GPS solicitada pelo navegador.
