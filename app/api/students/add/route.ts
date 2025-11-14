import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import {
  RekognitionClient,
  IndexFacesCommand,
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

    const name = form.get("name") as string;
    const roll = form.get("roll") as string;
    const parentEmail = form.get("parentEmail") as string;

    // MULTIPLE IMAGES
    const images = form.getAll("images[]") as File[];

    if (!name || !roll || !parentEmail || images.length === 0) {
      return NextResponse.json({
        success: false,
        message: "All fields & 1–5 photos required",
      });
    }

    // Create folder if missing
    const uploadDir = path.join(process.cwd(), "public", "uploads", "students");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Store all Rekognition face data
    const faceIds: string[] = [];
    const imageIds: string[] = [];

    // Loop multiple images
    for (const img of images) {
      const arrayBuffer = await img.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Save image
      const fileName = `${Date.now()}-${img.name}`;
      const filePath = path.join(uploadDir, fileName);
      fs.writeFileSync(filePath, buffer);

      // Send to Rekognition
      const indexCmd = new IndexFacesCommand({
        CollectionId: process.env.AWS_REKOG_COLLECTION!,
        ExternalImageId: roll, // SAME for all images
        Image: { Bytes: buffer },
        DetectionAttributes: ["DEFAULT"],
      });

      const r = await rekog.send(indexCmd);

      if (r.FaceRecords && r.FaceRecords.length > 0) {
        const record = r.FaceRecords[0];

        if (record.Face?.FaceId) faceIds.push(record.Face.FaceId);
        if (record.Face?.ImageId) imageIds.push(record.Face.ImageId);
      }
    }

    // Save in database
    await prisma.student.create({
      data: {
        name,
        roll,
        parentEmail,
        // we save only FIRST photo as display photo
        photo: images[0].name,
        rekogExternalId: roll,
        rekogFaceId: faceIds.join(","), // save all faceIds
        rekogImageId: imageIds.join(","), // save all Rekog ImageIds
      },
    });

    return NextResponse.json({
      success: true,
      message: "Student added successfully with multiple photos",
    });
  } catch (err: any) {
    console.error("Student Add Error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
