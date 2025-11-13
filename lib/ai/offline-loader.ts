import * as faceapi from "@vladmandic/face-api";
import { Canvas, Image, ImageData } from "canvas";
import path from "path";

let modelsLoaded = false;

// Patch environment
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

export async function loadOfflineModels() {
  if (modelsLoaded) return;

  const modelPath = path.join(process.cwd(), "public", "models");

  await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);

  modelsLoaded = true;
  console.log("✔ Offline AI models loaded");
}
