// Sliders/Pickers/Etc
const octavesSlider     = document.getElementById("octavesSlider")     as HTMLInputElement;
const lacunaritySlider  = document.getElementById("lacunaritySlider")  as HTMLInputElement;
const persistenceSlider = document.getElementById("persistenceSlider") as HTMLInputElement;
const scaleSlider       = document.getElementById("scaleSlider")       as HTMLInputElement;
const speedSlider       = document.getElementById("speedSlider")       as HTMLInputElement;
const colourPicker      = document.getElementById("colorPicker")       as HTMLInputElement;
const seedInput         = document.getElementById("seedInput")         as HTMLInputElement;
const bgColourPicker    = document.getElementById("bgColorPicker")     as HTMLInputElement;
const asciiInput        = document.getElementById("asciiInput")        as HTMLTextAreaElement;

// Slider/Picker/etc values
const octavesVal         = document.getElementById("octavesVal")        as HTMLSpanElement;
const lacunarityVal      = document.getElementById("lacunarityVal")     as HTMLSpanElement;
const persistenceVal     = document.getElementById("persistenceVal")    as HTMLSpanElement;
const scaleVal           = document.getElementById("scaleVal")          as HTMLSpanElement;
const speedVal           = document.getElementById("speedVal")          as HTMLSpanElement;

// Defaults
let octaves             = parseInt(octavesSlider.value,    10)  || 5;
let lacunarity          = parseFloat(lacunaritySlider.value)    || 2.0;
let persistence         = parseFloat(persistenceSlider.value)   || 0.8;
let scale               = parseFloat(scaleSlider.value)         || 0.005;
let speed               = parseFloat(speedSlider.value)         || 0.10;
let colour              = colourPicker.value                    || "#6428B4";
let seed                = parseFloat(seedInput.value)           || 0.124;
let bgColour            = bgColourPicker.value                  || "#000000";
let asciiChars          = asciiInput.value                      ||
[
  ' ', '.', ':', '-', '=', '+', '*',
  'I', 'J', 'L', 'T', 'F', '1',
  'H', 'E', 'A', 'Y', 'Z', 'V',
  'C', 'U', 'X', 'K', '2', '3', '4',
  'S', '5', '7', '9', '6', 'B',
  'N', 'D', 'O', 'P', 'Q', 'G',
  'M', '8', '0', 'W', '@', '%', '#'
]; //.:!/[124508KG


octavesVal.textContent     = String(octaves);
lacunarityVal.textContent  = lacunarity.toFixed(1);
persistenceVal.textContent = persistence.toFixed(2);
scaleVal.textContent       = scale.toFixed(3);
speedVal.textContent       = speed.toFixed(2);

// UPDATE VARIABLES WHEN CONTROLS CHANGE

// Octaves
octavesSlider.addEventListener("input", () => {
  octaves = parseInt(octavesSlider.value, 10);
  octavesVal.textContent = String(octaves);
});

// Lacunarity
lacunaritySlider.addEventListener("input", () => {
  lacunarity = parseFloat(lacunaritySlider.value);
  lacunarityVal.textContent = lacunarity.toFixed(1);
});

// Persistence
persistenceSlider.addEventListener("input", () => {
  persistence = parseFloat(persistenceSlider.value);
  persistenceVal.textContent = persistence.toFixed(2);
});

// Scale
scaleSlider.addEventListener("input", () => {
  scale = parseFloat(scaleSlider.value);
  scaleVal.textContent = scale.toFixed(3);
});

// Speed
speedSlider.addEventListener("input", () => {
  speed = parseFloat(speedSlider.value);
  speedVal.textContent = speed.toFixed(2);
});

// Colour picker
colourPicker.addEventListener("input", () => {
  colour = colourPicker.value;
});

// Seed
seedInput.addEventListener("input", () => {
  const v = parseFloat(seedInput.value);
  if (!isNaN(v)) {
    seed = v;
  }
});

// Background colour picker
bgColourPicker.addEventListener("input", () => {
  bgColour = bgColourPicker.value;
  document.body.style.backgroundColor = bgColour;
});

// ASCII text stuff
asciiInput.addEventListener("input", () => {
  asciiChars = asciiInput.value.split("");
});


//
// NORMAL CODE FROM PERSONAL SITES:
//
const canvas = document.getElementById('asciiCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');

const charWidth = 8;
const charHeight = 12;
let cols: number, rows: number;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  cols = Math.floor(canvas.width / charWidth);
  rows = Math.floor(canvas.height / charHeight);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

//
// Hash and Perlin noise to animate:
//

function hash(x: number, y: number) {
  let h = 13 * x + y * 13331 + x * y * 2 + seed * 971;
  h = Math.sin(h) * 43758.5453;
  return h - Math.floor(h);
  // 2D hash function for procedural noise generation;
  // uses prime multipliers (13, 13331, 971) and sine transformation to produce deterministic pseudo-random values between 0-1.
}

function smooth(t: number) {
  return t * t * t * (t * (t * 6 - 15) + 10);
  // smoothstep algo - https://en.wikipedia.org/wiki/Smoothstep#Variations
  // smooths out the transitions in the noise
}

function noise(x: number, y: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;

  const xs = smooth(xf);
  const ys = smooth(yf);

  const tl = hash(xi, yi);
  const tr = hash(xi + 1, yi);
  const bl = hash(xi, yi + 1);
  const br = hash(xi + 1, yi + 1);

  const top = tr * xs + tl * (1 - xs);
  const bottom = br * xs + bl * (1 - xs);

  return bottom * ys + top * (1 - ys);
  // simplified perlin noise generator
}


function fbm(x: number, y: number, octaves = 5, lacunarity = 2, persistence = 0.8) {
  // octaves = noise layers
    // lower means more "predicatable" shapes
  // lacunarity = increase in frequency per layer
    // lower means layers are more similar in scale (less fine detail)
  // persistance = decrease in amplitude per octave
    // lower means higher octaves contribute less (smoother overall)

  let amplitude = 1;
  let frequency = 1;
  let value = 0;
  let max = 0;

  for (let i = 0; i < octaves; i++) {
    value += amplitude * noise(x * frequency, y * frequency);
    max += amplitude;
    amplitude *= persistence;
    frequency *= lacunarity;
  }

  return value / max;
  // fractal brownian motion - https://en.wikipedia.org/wiki/Fractional_Brownian_motion
  // builds detail in the noise by layering many 'smoother' patterns and outputting the average for any given coordanite
}

let lastTime = 0;

function animate(time: number) {
  const now = time / 1000;

  if(!ctx){
    console.error("Canvas context is not available");
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = colour;
  ctx.font = `${charHeight}px monospace`;
  ctx.textBaseline = "top";

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const val1 = fbm(x * scale, y * scale, octaves, lacunarity, persistence);
      const val2 = fbm(
        x * scale + now * speed * 0.3,
        y * scale + now * speed * 0.2,
        octaves, lacunarity, persistence
      );
      const combined = val1 * 0.6 + val2 * 0.4;
      const contrastVal = Math.pow(combined, 2);
      const index = Math.floor(contrastVal * (asciiChars.length - 1));
      const char = asciiChars[index];

      ctx.fillText(char, x * charWidth, y * charHeight);
    }
  }

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
