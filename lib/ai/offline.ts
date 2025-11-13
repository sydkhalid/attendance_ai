import { AIProvider, AIDetectionResult } from "./base";
import { loadOfflineModels } from "./offline-loader";
import * as faceapi from "@vladmandic/face-api";
import { Canvas, Image } from "canvas";

export default class OfflineAI implements AIProvider {
  async detectFaces(imageBuffer: Buffer): Promise<AIDetectionResult[]> {
    await loadOfflineModels();

    const img = new Image();
    img.src = imageBuffer;
    const canvas = new Canvas(img.width, img.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    const detections = await faceapi
      .detectAllFaces(canvas)
      .withFaceLandmarks()
      .withFaceDescriptors();

    // For now return only detection count
    return detections.map((d, index) => ({
      id: index + 1,
      name: `Face ${index + 1}`,
      confidence: 1.0,
    }));
  }
}
