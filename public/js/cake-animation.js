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
    const newSrc = '/public/images/cake-extinguished.png?t=' + Date.now();
    el.src = newSrc;
    allExtinguished = true;
    setTimeout(showCelebration, 500);
    return;
  }

    const newSrc = '/public/images/cake-extinguished.png?t=' + Date.now();
    el.src = newSrc;

    allExtinguished = true;
    setTimeout(showCelebration, 500);
}

function showCelebration() {
  const instructions = document.querySelector('.instructions');
  if (instructions) {
    instructions.textContent = '🎉 Yay! Happy Birthday! 🎉';
    instructions.style.color = '#051014';
    instructions.style.fontSize = '25px';
    instructions.style.fontWeight = 'bold';
  }
  
  // Confetti celebration
  celebrateWithConfetti();
}

function celebrateWithConfetti() {
  const confetti = ['🎈', '🎉', '🎊', '⭐', '✨', '🎂'];
  const pageHeight = document.documentElement.scrollHeight; // full page height
  
  for (let i = 0; i < 20; i++) {
    const emoji = document.createElement('div');
    emoji.textContent = confetti[Math.floor(Math.random() * confetti.length)];
    emoji.style.position = 'absolute'; // use absolute so it scrolls with page

    const container = document.querySelector('main') || document.body;
    const containerRect = container.getBoundingClientRect();
    const minX = containerRect.left + 20;
    const maxX = containerRect.right - 20;

    const leftPos = minX + Math.random() * (maxX - minX - 30);
    emoji.style.left = `${leftPos}px`;


    emoji.style.top = '-30px';
    emoji.style.fontSize = '30px';
    emoji.style.pointerEvents = 'none';
    
    // Randomized duration
    const duration = 2 + Math.random() * 1; // seconds
    
    emoji.style.transition = `transform ${duration}s linear, opacity ${duration}s linear`;
    document.body.appendChild(emoji);
    
    // Trigger the fall after adding to DOM
    requestAnimationFrame(() => {
      emoji.style.transform = `translateY(${pageHeight + 30}px)`; // fall to bottom
      emoji.style.opacity = '0';
    });
    
    // Remove after animation
    setTimeout(() => emoji.remove(), duration * 1000);
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
