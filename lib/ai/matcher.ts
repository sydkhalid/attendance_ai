import * as faceapi from "@vladmandic/face-api";

/**
 * Calculate Euclidean distance between two face embeddings
 */
export function faceDistance(descriptor1: number[], descriptor2: number[]) {
  let sum = 0;
  for (let i = 0; i < descriptor1.length; i++) {
    const diff = descriptor1[i] - descriptor2[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

/**
 * Find best match from student list
 */
export function findBestMatch(
  detectedEmbedding: number[],
  students: { id: number; name: string; embedding: any }[]
) {
  let bestDistance = Infinity;
  let bestStudent = null;

  for (const s of students) {
    if (!s.embedding) continue;

    const dist = faceDistance(detectedEmbedding, s.embedding);

    if (dist < bestDistance) {
      bestDistance = dist;
      bestStudent = s;
    }
  }

  // Threshold (very important)
  const THRESHOLD = 0.6; // Good for face-api

  if (bestDistance < THRESHOLD) {
    return {
      match: true,
      student: bestStudent,
      distance: bestDistance,
    };
  }

  return { match: false };
}
