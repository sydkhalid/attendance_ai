import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import {
  RekognitionClient,
  SearchFacesByImageCommand,
} from "@aws-sdk/client-rekognition";

const rekog = new RekognitionClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const image = form.get("image") as File;

    const bytes = Buffer.from(await image.arrayBuffer());

    const search = new SearchFacesByImageCommand({
      CollectionId: process.env.AWS_REKOG_COLLECTION!,
      Image: { Bytes: bytes },
      MaxFaces: 50,
      FaceMatchThreshold: 90,
    });

    const res = await rekog.send(search);

    const matches = res.FaceMatches || [];
    const students: any[] = [];

    for (const match of matches) {
      const roll = match.Face?.ExternalImageId;
      if (!roll) continue;

      const student = await prisma.student.findFirst({
        where: { roll },
      });

      if (student) {
        students.push(student);
      }
    }

    return NextResponse.json({ success: true, students });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message });
  }
}
