// Generates one tile of random grey noise and exposes it as the CSS variable
// --noise. Static, grain and "no signal" screens all animate this single image
// by jumping its background-position, which costs no per-frame JavaScript.
export function installNoiseTexture(size = 160) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const image = ctx.createImageData(size, size);
  for (let i = 0; i < image.data.length; i += 4) {
    const value = Math.random() * 255;
    image.data[i] = value;
    image.data[i + 1] = value;
    image.data[i + 2] = value;
    image.data[i + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);
  document.documentElement.style.setProperty("--noise", `url(${canvas.toDataURL()})`);
}
