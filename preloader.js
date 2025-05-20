// ==== 1. Injetar o CSS (variáveis + preloader + animações) ====
const preloadStyle = `
:root {
  --primary: #5C4033;
  --secondary: #F5E6D3;
  --text: #2C1810;
  --accent1: #FFE4E1;
  --accent2: #E8F3E8;
  --white: #FFFFFF;
}

body {
  margin: 0;
  font-family: 'Montserrat', sans-serif;
  background-color: var(--white);
}

#preload-container {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background-color: var(--secondary);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  z-index: 9999;
  transition: opacity 0.5s ease, visibility 0.5s ease;
}

#preload-container.hidden {
  opacity: 0;
  visibility: hidden;
}

#preload-text {
  text-align: center;
  line-height: 1.2;
  position: relative;
  pointer-events: none;
  user-select: none;
}

#preload-text span {
  display: inline-block;
  color: var(--primary);
  font-size: clamp(2em, 8vw, 5em);
  opacity: 0;
  transform: translateY(20px) rotate(10deg);
  animation: assemble 1.5s ease-out forwards;
}

@keyframes assemble {
  to {
    opacity: 1;
    transform: translateY(0) rotate(0);
  }
}

.preload-bubble {
  position: absolute;
  bottom: -50px;
  width: clamp(10px, 3vw, 30px);
  height: clamp(10px, 3vw, 30px);
  background-color: var(--accent1);
  border-radius: 50%;
  opacity: 0.6;
  animation: floatUp 6s ease-in infinite;
}

@keyframes floatUp {
  0% {
    transform: translateY(0) translateX(0) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-50vh) translateX(calc(var(--random-x) * 100px)) scale(1.1);
    opacity: 0.5;
  }
  100% {
    transform: translateY(-100vh) translateX(calc(var(--random-x) * 200px)) scale(0.9);
    opacity: 0;
  }
}
`;
const styleTag = document.createElement('style');
styleTag.textContent = preloadStyle;
document.head.appendChild(styleTag);

// ==== 2. Injetar HTML do Preloader ====
const preloadHTML = `
<div id="preload-container">
  <div id="preload-text">
    <span>PSICÓLOGA</span>
    <span>Bruna Leoncio</span>
  </div>
  ${Array.from({ length: 12 }).map(() => '<div class="preload-bubble"></div>').join('')}
</div>
`;
document.body.insertAdjacentHTML('afterbegin', preloadHTML);

// ==== 3. JavaScript funcional ====
const preloadContainer = document.getElementById('preload-container');

function hidePreloader() {
  preloadContainer.classList.add('hidden');
  setTimeout(() => {
    preloadContainer.remove();
    document.body.style.overflow = ''; // Restaura o scroll
    console.log('Preloader removido e scroll restaurado.'); // Log para verificar
  }, 500); // Tempo para ocultar o preloader
}

// Define um tempo mínimo de 3 segundos para o preloader
const minDisplayTime = 3000; // 3 segundos
let loadTime = 0;

// Registra o tempo de início
const startTime = Date.now();

// Adiciona um evento para ocultar o preloader quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  loadTime = Date.now() - startTime; // Calcula o tempo de carregamento
  if (loadTime < minDisplayTime) {
    setTimeout(hidePreloader, minDisplayTime - loadTime); // Aguarda o tempo restante
  } else {
    hidePreloader(); // Oculta imediatamente se já passou de 3 segundos
  }
});
