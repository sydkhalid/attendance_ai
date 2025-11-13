import OfflineAI from "./offline";
import GoogleAI from "./google";
import AWSAI from "./aws";
import FaceIOAI from "./faceio";

export function getAIProvider(provider: string) {
  switch (provider) {
    case "google":
      return new GoogleAI();
    case "aws":
      return new AWSAI();
    case "faceio":
      return new FaceIOAI();
    case "none":
    default:
      return new OfflineAI();
  }
}
