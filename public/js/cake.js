// Blow Detection and Cake Image Swap

let audioContext = null;
let analyser = null;
let dataArray = null;
let animationId = null;
let allExtinguished = false;

async function initAudio() {
  try {
    // Request microphone access
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // Create audio context and analyser
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    
    dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    // Start monitoring for blow
    monitorBlow();
  } catch (err) {
    console.error('Microphone access denied or not available:', err);
    alert('Please enable microphone access to play this game!');
  }
}

function monitorBlow() {
  animationId = requestAnimationFrame(monitorBlow);
  
  analyser.getByteFrequencyData(dataArray);
  
  // Calculate average frequency energy (detecting low-frequency blow)
  let sum = 0;
  for (let i = 0; i < dataArray.length; i++) {
    sum += dataArray[i];
  }
  const average = sum / dataArray.length;
  
  // Threshold for detecting a blow (adjust sensitivity here, 0-255 scale)
  const blowThreshold = 80;
  
  if (average > blowThreshold && !allExtinguished) {
    extinguishCake();
  }
}

function extinguishCake() {
  const el = document.getElementById('cake-media');
  if (!el) return;

  console.log('[cake] extinguish triggered, element:', el);

  // If this is a <video> element
  if (el.tagName && el.tagName.toLowerCase() === 'video') {
    el.classList.add('fade-out');
    setTimeout(() => {
      try {
        const oldSources = el.querySelectorAll('source');
        oldSources.forEach(s => s.remove());
        const src = document.createElement('source');
        src.src = '/public/videos/cake-extinguished.mp4';
        src.type = 'video/mp4';
        el.appendChild(src);
        el.loop = false;
        el.muted = false;
        el.load();
        el.play().catch(() => {});
        el.classList.remove('fade-out');
        el.classList.add('fade-in', 'celebration');
      } catch (e) {
        console.error('Error swapping video source', e);
      }
      allExtinguished = true;
      setTimeout(showCelebration, 500);
    }, 300);
    return;
  }

  // Image element (or other) fallback: swap `src` on the same element
  el.classList.add('fade-out');
  setTimeout(() => {
    // add cache-buster to force reload
    const newSrc = '/public/images/cake-extinguished.png?t=' + Date.now();
    el.src = newSrc;
    el.classList.remove('fade-out');
    el.classList.add('fade-in', 'celebration');
    allExtinguished = true;
    setTimeout(showCelebration, 500);
  }, 300);
}

function showCelebration() {
  const instructions = document.querySelector('.instructions');
  if (instructions) {
    instructions.textContent = '🎉 You did it! Happy Birthday! 🎉';
    instructions.style.color = '#3F6E3C';
    instructions.style.fontSize = '24px';
    instructions.style.fontWeight = 'bold';
  }
  
  // Confetti celebration
  celebrateWithConfetti();
}

function celebrateWithConfetti() {
  // Simple confetti effect by creating floating emoji
  const confetti = ['🎈', '🎉', '🎊', '⭐', '✨', '🎂'];
  
  for (let i = 0; i < 20; i++) {
    const emoji = document.createElement('div');
    emoji.textContent = confetti[Math.floor(Math.random() * confetti.length)];
    emoji.style.position = 'fixed';
    emoji.style.left = Math.random() * 100 + '%';
    emoji.style.top = '-30px';
    emoji.style.fontSize = '30px';
    emoji.style.pointerEvents = 'none';
    emoji.style.animation = `fall ${2 + Math.random() * 1}s linear forwards`;
    document.body.appendChild(emoji);
    
    // Remove after animation
    setTimeout(() => emoji.remove(), 3000);
  }
}

// Add CSS animation for confetti
const style = document.createElement('style');
style.textContent = `
  @keyframes fall {
    to {
      transform: translateY(100vh) rotate(360deg);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Start audio detection when page loads
window.addEventListener('DOMContentLoaded', () => {
  // Prompt user to start (browsers require user interaction for mic access)
  const startBtn = document.querySelector('.instructions');
  if (startBtn) {
    startBtn.style.cursor = 'pointer';
    startBtn.addEventListener('click', initAudio);
  }
  
  // Also auto-start after a short delay
  setTimeout(initAudio, 500);
});
