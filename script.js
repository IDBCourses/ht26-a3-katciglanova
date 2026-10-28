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

const shapeKey = createShape();
const shapeVibrato = createShape();
const shapeDistortion = createShape();

// ---------- State ----------
// State variables are the parts of your program that change over time.
// For example: where the pointer is, how fast it's moving, or whether a drone is on.
let lastX = 0;
let lastY = 0;
let lastTime = 0;

let speeds = [];
// ---------- Sound ----------
// Make the instruments and plug them into the speakers.
const synth = new Tone.PolySynth(Tone.Synth, { volume: 0 }).toDestination(); // can play several notes at once

// ---------- Update ----------
// Update the state. This is called every 100ms.
function update() {
  setTimeout(update, 100); // call update() again in 100 milliseconds
}

// ---------- Use ----------
// Use the state to make sound and move shapes. This is called every 100ms.
function use() {
  setTimeout(use, 100); // call use() again in 100 milliseconds
}

// ---------- Controls (Event Handlers) ----------
// Runs every time the pointer goes down: a click, a tap or a pen touch.
function playNote(note) {
  Tone.start(); // browsers only allow sound after the player has pressed something
  const now = Tone.now();
  synth.triggerAttackRelease(note, "1n", now);
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
  console.log(normSpeed * 20 - 20);
  lastX = normX;
  lastY = normY;
  lastTime = now;
}

function makeShape(shape, size, roundedness, hue, posX, posY) {
  shape.setSize(size);
  shape.setRoundedness(roundedness);
  shape.setColour(hue, 80, 50);
  shape.setPosition(posX, posY);
}

// ---------- Setup ----------
// Setup is run once, at the start of the program. It sets everything up for us!
function setup() {
  update(); // start the update loop
  use(); // start the use loop

  // Example: a shape near the middle of the window. Replace it with your own.
  makeShape(shapeC, 60, 0, 0, 0.2, 0.5);
  makeShape(shapeD, 60, 0, 20, 0.3, 0.5);
  makeShape(shapeE, 60, 0, 60, 0.4, 0.5);
  makeShape(shapeF, 60, 0, 90, 0.5, 0.5);
  makeShape(shapeG, 60, 0, 170, 0.6, 0.5);
  makeShape(shapeA, 60, 0, 220, 0.7, 0.5);
  makeShape(shapeB, 60, 0, 290, 0.8, 0.5);

  makeShape(shapeKey, 60, 1, 320, 0.5, 0.6);
  makeShape(shapeVibrato, 60, 1, 200, 0.4, 0.7);
  makeShape(shapeDistortion, 60, 1, 150, 0.6, 0.7);

  // Put your event listener code here
  shapeC.element.addEventListener("pointerdown", () => playNote("C4"));
  shapeD.element.addEventListener("pointerdown", () => playNote("D4"));
  shapeE.element.addEventListener("pointerdown", () => playNote("E4"));
  shapeF.element.addEventListener("pointerdown", () => playNote("F4"));
  shapeG.element.addEventListener("pointerdown", () => playNote("G4"));
  shapeA.element.addEventListener("pointerdown", () => playNote("A4"));
  shapeB.element.addEventListener("pointerdown", () => playNote("B4"));
  window.addEventListener("pointermove", pointerMove);
}

setup(); // Always remember to call setup()!
