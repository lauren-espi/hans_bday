document.addEventListener('DOMContentLoaded', () => {
    const introImg = document.querySelector('.song-intro');

    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    introImg.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - introImg.getBoundingClientRect().left;
        offsetY = e.clientY - introImg.getBoundingClientRect().top;
        introImg.style.transition = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        // Calculate position relative to container
        const containerRect = introImg.parentElement.getBoundingClientRect();
        const x = e.clientX - offsetX - containerRect.left;
        const y = e.clientY - offsetY - containerRect.top;

        // Apply transform freely, even outside container
        introImg.style.transform = `translate(${x}px, ${y}px)`;
    });

    document.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        introImg.style.transition = 'transform 0.2s ease';
        introImg.style.zIndex = 2; 
    });
});



// document.addEventListener("DOMContentLoaded", () => {
//   const song = document.querySelector('.song');

//   song.addEventListener('click', () => {
//     song.classList.toggle('flipped');
//   });

// });