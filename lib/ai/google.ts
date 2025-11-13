import { AIProvider, AIDetectionResult } from "./base";

export default class GoogleAI implements AIProvider {
  async detectFaces(imageBuffer: Buffer): Promise<AIDetectionResult[]> {
    // Actual Vision API will be added later
    return [
      { id: 0, name: "Google Vision Placeholder", confidence: 1.0 }
    ];
  }
}
