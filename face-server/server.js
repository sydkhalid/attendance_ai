import express from "express";
import cors from "cors";
import * as faceapi from "@vladmandic/face-api";
import { Canvas, Image, ImageData } from "canvas";
import fs from "fs/promises";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

async function loadModels() {
  const modelPath = path.join(process.cwd(), "public/models");
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
  console.log("AI models loaded");
}

await loadModels();

app.post("/detect", async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64)
      return res.status(400).json({ error: "Image missing" });

    const imgBuffer = Buffer.from(imageBase64.split(",")[1], "base64");

    const img = new Image();
    img.src = imgBuffer;

    const canvas = new Canvas(img.width, img.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    const detections = await faceapi
      .detectAllFaces(canvas)
      .withFaceLandmarks()
      .withFaceDescriptors();

    return res.json({
      success: true,
      faces: detections.length,
      descriptors: detections.map(d => Array.from(d.descriptor)),
    });

  } catch (err) {
    console.error("DETECT API ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
});

app.listen(4000, () =>
  console.log("Face server running on http://localhost:4000")
);
