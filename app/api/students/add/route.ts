import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import {
  RekognitionClient,
  IndexFacesCommand,
} from "@aws-sdk/client-rekognition";

// AWS Rekognition Client
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
    const image = form.get("image") as File;

    if (!name || !roll || !parentEmail || !image) {
      return NextResponse.json({
        success: false,
        message: "All fields are required",
      });
    }

    // ---------------------------------------------------------
    // 1️⃣ Convert image to buffer
    // ---------------------------------------------------------
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // ---------------------------------------------------------
    // 2️⃣ Save image to /public/uploads/students/
    // ---------------------------------------------------------
    const uploadDir = path.join(process.cwd(), "public", "uploads", "students");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = Date.now() + "-" + image.name;
    const filePath = path.join(uploadDir, fileName);

    fs.writeFileSync(filePath, buffer);

    // ---------------------------------------------------------
    // 3️⃣ Send image to AWS Rekognition – Index Face
    // ---------------------------------------------------------
    const indexCmd = new IndexFacesCommand({
      CollectionId: process.env.AWS_REKOG_COLLECTION!,
      ExternalImageId: roll, // Student roll is unique
      Image: { Bytes: buffer },
      DetectionAttributes: ["DEFAULT"],
    });

    const rekogRes = await rekog.send(indexCmd);

    const faceRecord = rekogRes.FaceRecords?.[0];
    const faceId = faceRecord?.Face?.FaceId || null;
    const imageId = faceRecord?.Face?.ImageId || null;

    // ---------------------------------------------------------
    // 4️⃣ Save Student in MySQL using Prisma
    // ---------------------------------------------------------
    await prisma.student.create({
      data: {
        name,
        roll,
        parentEmail,
        photo: fileName,
        rekogFaceId: faceId,
        rekogImageId: imageId,
        rekogExternalId: roll,
      },
    });

    return NextResponse.json({ success: true, message: "Student added" });
  } catch (err: any) {
    console.error("Student Add Error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
