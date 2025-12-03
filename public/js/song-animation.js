document.addEventListener("DOMContentLoaded", () => {
  const song = document.querySelector(".song");

  song.addEventListener("click", () => {
    song.classList.toggle("flipped");
  });
});