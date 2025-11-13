export interface AIDetectionResult {
  id?: number;
  name?: string;
  confidence?: number;
}

export interface AIProvider {
  detectFaces(imageBuffer: Buffer): Promise<AIDetectionResult[]>;
}
