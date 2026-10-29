/*
 * IDB Programming: A3 — a musical instrument
 *
 * All of the code for your instrument goes in this file. It's split into sections:
 *   settings — the "fixed" parts of your program
 *   state    — the parts of your program that change over time
 *   sound    — the Tone.js instruments and effects
 *   update   — updates the state every 100ms, if necessary
 *   use      — uses the state to make sound and shapes every 100ms, if necessary
 *   controls — what happens when the player uses the pointer
 *   setup    — starts everything
 *
 * The pointer events change the state. update() and use() each run every
 * 100ms, in a loop:
 *   1. update: change the state, e.g. based on time or on the pointer's movement
 *   2. use:    make sound and move shapes, based on the state
 *
 * Shapes come from shape.js: createShape() makes one, and its methods
 * (setPosition, setSize, setColour ...) change it.
 *
 * Tone.js documentation: https://tonejs.github.io/docs/15.1.22/
 */

import { createShape } from "./shape.js";

// ---------- Settings ----------
// Settings variables should contain all of the "fixed" parts of your programs
// For example: which notes you can play, how fast things move, the tempo.
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

// ---------- State ----------
// State variables are the parts of your program that change over time.
// For example: where the pointer is, how fast it's moving, or whether a drone is on.
let lastX = 0;
let lastY = 0;
let lastTime = 0;

let currentOctave = 3;

let speeds = [];
// ---------- Sound ----------
// Make the instruments and plug them into the speakers.

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
); // can play several notes at once

function makeShape(shape, size, roundedness, hue, posX, posY) {
  shape.setSize(size);
  shape.setRoundedness(roundedness);
  shape.setColour(hue, 80, 50);
  shape.setPosition(posX, posY);
}

// ---------- Update ----------
// Update the state. This is called every 100ms.

function update() {
  setTimeout(update, 100); // call update() again in 100 milliseconds
}

// ---------- Use ----------
// Use the state to make sound and move shapes. This is called every 100ms.
let activeShapes = {};
const noteDuration = 1200;
const originalSize = 60;

function use() {
  const now = Date.now();
  for (let i in activeShapes) {
    let currentShape = activeShapes[i];
    let shape = currentShape.shape;
    const timeDiff = now - currentShape.press;

    if (timeDiff < noteDuration) {
      calculatePosition(shape, currentShape, timeDiff);
    } else {
      shape.setSize(originalSize);
      delete activeShapes[i];
    }
  }
  setTimeout(use, 100); // call use() again in 100 milliseconds
}

function calculatePosition(shape, currentShape, timeDiff) {
  let normTime = timeDiff / noteDuration;
  let currentSize = 90 - normTime * 30;
  shape.setSize(currentSize);

  let sizeNorm = currentSize / window.innerWidth;
  let originalNorm = originalSize / window.innerWidth;
  let centerX = currentShape.posX + originalNorm / 2;
  let centerY = 0.5 + originalNorm / 2;
  let newX = centerX - sizeNorm / 2;
  let newY = centerY - sizeNorm / 2;

  shape.setPosition(newX, newY);
}

// ---------- Controls (Event Handlers) ----------
// Runs every time the pointer goes down: a click, a tap or a pen touch.

function octaveSetting() {
  currentOctave = currentOctave + 1;
  if (currentOctave > 5) {
    currentOctave = 3;
  }
}

function playNote(note, shape, posX, i) {
  Tone.start(); // browsers only allow sound after the player has pressed something
  const now = Tone.now();
  synth.triggerAttackRelease(note, "1n", now);
  activeShapes[i] = { shape: shape, press: Date.now(), posX: posX };
}

function pointerMove(event) {
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
  let maxSpeed = 5;
  let normSpeed = Math.min(1, Math.max(0, average / maxSpeed));
  let volume = normSpeed * 20 - 20;
  synth.volume.rampTo(volume, 0.05);
  lastX = normX;
  lastY = normY;
  lastTime = now;
}

function distortionOn() {
  distortionEffect.distortion = 0.2;
  distortionEffect.wet.rampTo(1, 0.05);
}

function distortionOff() {
  distortionEffect.wet.rampTo(0, 0.05);
}

function vibratoOn() {
  vibratoEffect.frequency.value = 5;
  vibratoEffect.depth.value = 0.3;
  vibratoEffect.wet.rampTo(1, 0.05);
}

function vibratoOff() {
  vibratoEffect.wet.rampTo(0, 0.05);
}
// ---------- Setup ----------
// Setup is run once, at the start of the program. It sets everything up for us!
function setup() {
  update(); // start the update loop
  use(); // start the use loop

  // Example: a shape near the middle of the window. Replace it with your own.
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

  // Put your event listener code here
  shapeOctave.element.addEventListener("pointerdown", octaveSetting);

  shapeC.element.addEventListener("pointerdown", () =>
    playNote("C" + currentOctave, shapeC, 0.2, "noteC"),
  );
  shapeD.element.addEventListener("pointerdown", () =>
    playNote("D" + currentOctave, shapeD, 0.3, "noteD"),
  );
  shapeE.element.addEventListener("pointerdown", () =>
    playNote("E" + currentOctave, shapeE, 0.4, "noteE"),
  );
  shapeF.element.addEventListener("pointerdown", () =>
    playNote("F" + currentOctave, shapeF, 0.5, "noteF"),
  );
  shapeG.element.addEventListener("pointerdown", () =>
    playNote("G" + currentOctave, shapeG, 0.6, "noteG"),
  );
  shapeA.element.addEventListener("pointerdown", () =>
    playNote("A" + currentOctave, shapeA, 0.7, "noteA"),
  );
  shapeB.element.addEventListener("pointerdown", () =>
    playNote("B" + currentOctave, shapeB, 0.8, "noteB"),
  );

  window.addEventListener("pointermove", pointerMove);
  shapeDistortion.element.addEventListener("pointerenter", distortionOn);
  shapeDistortion.element.addEventListener("pointerleave", distortionOff);
  shapeVibrato.element.addEventListener("pointerenter", vibratoOn);
  shapeVibrato.element.addEventListener("pointerleave", vibratoOff);
}

setup(); // Always remember to call setup()!
