import { AIProvider, AIDetectionResult } from "./base";

export default class AWSAI implements AIProvider {
  async detectFaces(imageBuffer: Buffer): Promise<AIDetectionResult[]> {
    return [
      { id: 0, name: "AWS Rekognition Placeholder", confidence: 1.0 }
    ];
  }
}
