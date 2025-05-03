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
  overflow: hidden;
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
  overflow: hidden;
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

#preload-text div {
  display: block;
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
  pointer-events: none;
}
.preload-bubble:nth-child(2n) {
  background-color: var(--accent2);
  animation-duration: 7s;
  opacity: 0.5;
}
.preload-bubble:nth-child(3n) {
  background-color: var(--primary);
  opacity: 0.4;
  animation-duration: 8s;
}
.preload-bubble:nth-child(4n) {
  background-color: var(--accent1);
  opacity: 0.7;
  animation-duration: 5s;
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
  <div id="preload-text"></div>
  ${Array.from({ length: 12 }).map(() => '<div class="preload-bubble"></div>').join('')}
</div>
`;
document.body.insertAdjacentHTML('afterbegin', preloadHTML);

// ==== 3. JavaScript funcional ====
const preloadContainer = document.getElementById('preload-container');
const preloadTextContainer = document.getElementById('preload-text');
const bubbles = document.querySelectorAll('.preload-bubble');

const line1 = "PSICÓLOGA";
const line2 = "Bruna Leoncio";

function createAnimatedText(text, delayOffset) {
  const div = document.createElement('div');
  text.split('').forEach((char, i) => {
    const span = document.createElement('span');
    span.textContent = char;
    span.style.animationDelay = `${delayOffset + i * 0.05}s`;
    div.appendChild(span);
  });
  return div;
}

function randomizeBubbles() {
  bubbles.forEach(bubble => {
    bubble.style.left = `${Math.random() * 100}vw`;
    bubble.style.setProperty('--random-x', (Math.random() - 0.5) * 2);
    bubble.style.animationDelay = `${Math.random() * 3}s`;
    bubble.style.animationDuration = `${6 + (Math.random() * 3 - 1.5)}s`;
  });
}

function hidePreloader() {
  preloadContainer.classList.add('hidden');
  setTimeout(() => {
    preloadContainer.remove();
    document.body.style.overflow = '';
  }, 500);
}

document.body.style.overflow = 'hidden';
randomizeBubbles();
preloadTextContainer.appendChild(createAnimatedText(line1, 0));
preloadTextContainer.appendChild(createAnimatedText(line2, line1.length * 0.05));
setTimeout(hidePreloader, 3500);
