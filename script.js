import { createShape } from "./shape.js";

// ---------- Settings ----------
// Settings variables should contain all of the "fixed" parts of your programs

//creating all of the shapes
const shapeC = createShape();
const shapeD = createShape();
const shapeE = createShape();
const shapeF = createShape();
const shapeG = createShape();
const shapeA = createShape();
const shapeB = createShape();

const shapeOctave = createShape();
const shapeVibrato = createShape();
const shapeDistortion = createShape();

//objects containing all of the shapes and the info necessary for changing their state
const listOfNoteShapes = {
  noteC: { shape: shapeC, size: 60, posX: 0.2, posY: 0.5 },
  noteD: { shape: shapeD, size: 60, posX: 0.3, posY: 0.5 },
  noteE: { shape: shapeE, size: 60, posX: 0.4, posY: 0.5 },
  noteF: { shape: shapeF, size: 60, posX: 0.5, posY: 0.5 },
  noteG: { shape: shapeG, size: 60, posX: 0.6, posY: 0.5 },
  noteA: { shape: shapeA, size: 60, posX: 0.7, posY: 0.5 },
  noteB: { shape: shapeB, size: 60, posX: 0.8, posY: 0.5 },
};

const listOfEffectShapes = {
  octave: { shape: shapeOctave, originalColor: 320 },
  vibrato: { shape: shapeVibrato, originalColor: 200 },
  distortion: { shape: shapeDistortion, originalColor: 150 },
};

//constants in ms that are used in the use function
const noteDuration = 1200;
const effectDuration = 200;

// ---------- State ----------
// State variables are the parts of your program that change over time.
// For example: where the pointer is, how fast it's moving, or whether a drone is on.

//variables used in the pointermove function
let lastX = 0;
let lastY = 0;
let lastTime = 0;
let speeds = [];

let currentOctave = 3; //used in the octave function. the range of octaves is 3-5

//empty objects used for changing the state of the shapes
let activeShapes = {};
let activeOctave = {}; //only tracks the octave since the vibrato and distortion effects use pointerenter and pointerleave

// ---------- Sound ----------
// Make the instruments and plug them into the speakers.

//a synth and two effects
const distortionEffect = new Tone.Distortion({
  distortion: 0,
  wet: 0,
}).toDestination();

const vibratoEffect = new Tone.Vibrato({
  frequency: 0,
  depth: 0,
  wet: 0,
}).connect(distortionEffect);

const synth = new Tone.PolySynth(Tone.Synth, { volume: 0 }).connect(
  vibratoEffect,
);

// ---------- Update ----------
// Update the state. This is called every 100ms.
function update(currentShape, timeDiff) {
  let normTime = timeDiff / noteDuration;
  let newSize = currentShape.size + 30 - normTime * 30; //making the shape deflate over time while the note is playing

  //centering the shapes that change sizes so they dont move around
  let sizeNorm = newSize / window.innerWidth;
  let originalNorm = currentShape.size / window.innerWidth;
  let centerX = currentShape.posX + originalNorm / 2;
  let centerY = currentShape.posY + originalNorm / 2;
  let newX = centerX - sizeNorm / 2;
  let newY = centerY - sizeNorm / 2;

  return { newSize, newX, newY };
}

// ---------- Use ----------
// Use the state to make sound and move shapes. This is called every 100ms.
function use() {
  const now = Date.now();
  for (let i in activeShapes) {
    let currentShape = activeShapes[i];
    let shape = currentShape.shape; //getting the shape property out of the object
    const timeDiff = now - currentShape.pressTime; //measuring the duration of the note so that the animation is tied to the sound

    if (timeDiff < noteDuration) {
      let { newSize, newX, newY } = update(currentShape, timeDiff);

      shape.setSize(newSize);
      shape.setPosition(newX, newY);
    } else {
      //ensuring the shapes get back to their original state
      shape.setSize(currentShape.size);
      shape.setPosition(currentShape.posX, currentShape.posY);
      delete activeShapes[i]; //cleaning up the object so as to avoid clutter
    }
  }
  for (let j in activeOctave) {
    let currentEffectShape = activeOctave[j];
    let shape = currentEffectShape.shape;
    const timeDiff = now - currentEffectShape.pressTime; //making the color change only last 200 ms
    if (timeDiff < effectDuration) {
      shape.setColour(currentEffectShape.originalColor - 40, 80, 50);
    } else {
      shape.setColour(currentEffectShape.originalColor, 80, 50);
      delete activeOctave[j];
    }
  }
  setTimeout(use, 100); // call use() again in 100 milliseconds
}

// ---------- Controls (Event Handlers) ----------
// Runs every time the pointer goes down: a click, a tap or a pen touch.
function pointerMove(event) {
  //tracking how fast the pointer is moving on average
  let normX = event.clientX / window.innerWidth;
  let normY = event.clientY / window.innerHeight;
  let now = Date.now();
  let distance = Math.hypot(normX - lastX, normY - lastY);
  let seconds = (now - lastTime) / 1000;
  if (seconds <= 0) return;
  let speed = distance / seconds;
  speeds.push(speed);

  if (speeds.length > 10) {
    speeds.shift();
  }
  let total = 0;
  for (let i = 0; i < speeds.length; i++) {
    total = total + speeds[i];
  }
  let average = total / speeds.length;
  let maxSpeed = 5; //making the volume loudest when the average speed is five
  let normSpeed = Math.min(1, Math.max(0, average / maxSpeed)); //normalizing the speed between 0 and 1 so that its easier to map onto the volume
  let volume = normSpeed * 20 - 20;
  synth.volume.rampTo(volume, 0.05);

  //saving the coordinates and timing for comparison with new data
  lastX = normX;
  lastY = normY;
  lastTime = now;
}

function playNote(note, i) {
  Tone.start();
  const now = Tone.now();
  synth.triggerAttackRelease(note, "1n", now);

  let newActiveShape = listOfNoteShapes[i]; //adding the object data to a new object that is used in the update and use functions
  activeShapes[i] = {
    shape: newActiveShape.shape,
    pressTime: Date.now(),
    size: newActiveShape.size,
    posX: newActiveShape.posX,
    posY: newActiveShape.posY,
  };
}

function octaveSetting(i) {
  currentOctave = currentOctave + 1;
  if (currentOctave > 5) {
    currentOctave = 3;
  }
  let newActiveEffect = listOfEffectShapes["octave"];
  activeOctave[i] = {
    shape: newActiveEffect.shape,
    originalColor: newActiveEffect.originalColor,
    pressTime: Date.now(),
  };
}

function vibratoOn() {
  vibratoEffect.frequency.value = 5;
  vibratoEffect.depth.value = 0.3;
  vibratoEffect.wet.rampTo(1, 0.05);

  let effect = listOfEffectShapes["vibrato"];
  effect.shape.setColour(effect.originalColor - 40, 90, 60); //changing the color directly in the function
}

function vibratoOff() {
  vibratoEffect.wet.rampTo(0, 0.05);
  let effect = listOfEffectShapes["vibrato"];
  effect.shape.setColour(effect.originalColor, 80, 50);
}

function distortionOn() {
  distortionEffect.distortion = 0.2;
  distortionEffect.wet.rampTo(1, 0.05);
  let effect = listOfEffectShapes["distortion"];
  effect.shape.setColour(effect.originalColor - 40, 90, 60);
}

function distortionOff() {
  distortionEffect.wet.rampTo(0, 0.05);
  let effect = listOfEffectShapes["distortion"];
  effect.shape.setColour(effect.originalColor, 80, 50);
}

//a function for making shapes to debulk the setup function
function makeShape(shape, size, roundedness, hue, posX, posY) {
  shape.setSize(size);
  shape.setRoundedness(roundedness);
  shape.setColour(hue, 80, 50);
  shape.setPosition(posX, posY);
}

// ---------- Setup ----------
// Setup is run once, at the start of the program. It sets everything up for us!
function setup() {
  use(); // start the use loop

  //formatting the shapes
  makeShape(shapeC, 60, 0.1, 0, 0.2, 0.5);
  makeShape(shapeD, 60, 0.1, 20, 0.3, 0.5);
  makeShape(shapeE, 60, 0.1, 60, 0.4, 0.5);
  makeShape(shapeF, 60, 0.1, 90, 0.5, 0.5);
  makeShape(shapeG, 60, 0.1, 170, 0.6, 0.5);
  makeShape(shapeA, 60, 0.1, 220, 0.7, 0.5);
  makeShape(shapeB, 60, 0.1, 290, 0.8, 0.5);

  makeShape(shapeOctave, 60, 1, 320, 0.5, 0.6);
  makeShape(shapeVibrato, 60, 1, 200, 0.4, 0.7);
  makeShape(shapeDistortion, 60, 1, 150, 0.6, 0.7);

  //all functions are called with different event listeners
  shapeOctave.element.addEventListener("pointerdown", () =>
    octaveSetting("octave"),
  );

  shapeC.element.addEventListener("pointerdown", () =>
    playNote("C" + currentOctave, "noteC"),
  );
  shapeD.element.addEventListener("pointerdown", () =>
    playNote("D" + currentOctave, "noteD"),
  );
  shapeE.element.addEventListener("pointerdown", () =>
    playNote("E" + currentOctave, "noteE"),
  );
  shapeF.element.addEventListener("pointerdown", () =>
    playNote("F" + currentOctave, "noteF"),
  );
  shapeG.element.addEventListener("pointerdown", () =>
    playNote("G" + currentOctave, "noteG"),
  );
  shapeA.element.addEventListener("pointerdown", () =>
    playNote("A" + currentOctave, "noteA"),
  );
  shapeB.element.addEventListener("pointerdown", () =>
    playNote("B" + currentOctave, "noteB"),
  );

  window.addEventListener("pointermove", pointerMove);

  shapeDistortion.element.addEventListener("pointerenter", distortionOn);
  shapeDistortion.element.addEventListener("pointerleave", distortionOff);
  shapeVibrato.element.addEventListener("pointerenter", vibratoOn);
  shapeVibrato.element.addEventListener("pointerleave", vibratoOff);
}

setup();
