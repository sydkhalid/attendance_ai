import { AIProvider, AIDetectionResult } from "./base";

export default class FaceIOAI implements AIProvider {
  async detectFaces(imageBuffer: Buffer): Promise<AIDetectionResult[]> {
    return [
      { id: 0, name: "FaceIO Placeholder", confidence: 1.0 }
    ];
  }
}
