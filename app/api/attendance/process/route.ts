import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import sharp from "sharp";

import {
  RekognitionClient,
  DetectFacesCommand,
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
    const file = form.get("image") as File;

    if (!file) {
      return NextResponse.json({ success: false, message: "Image missing" });
    }

    // Read RAW buffer (not browser-transformed)
    const buffer = Buffer.from(await file.arrayBuffer());

    // FIX: Rotate + read correct dimensions
    let sharpImage = sharp(buffer).rotate();
    let meta = await sharpImage.metadata();

    if (!meta.width || !meta.height) {
      return NextResponse.json({
        success: false,
        message: "Invalid metadata",
      });
    }

    let imgWidth = meta.width;
    let imgHeight = meta.height;

    console.log("Sharp Image Size:", imgWidth, imgHeight);

    // Set up date range for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 1️⃣ DETECT FACES
    const detectCmd = new DetectFacesCommand({
      Image: { Bytes: buffer }, // RAW AWS bytes
      Attributes: ["ALL"],
    });

    const detectRes = await rekog.send(detectCmd);
    const faces = detectRes.FaceDetails || [];

    console.log("Detected faces:", faces.length);

    const present: any[] = [];
    const presentStudentIds = new Set<number>();

    for (const face of faces) {
      const box = face.BoundingBox;
      if (!box) continue;

      // 🔥 Convert relative box → absolute pixels
      const pad = 0.5;

      let left = Math.floor((box.Left - box.Width * pad) * imgWidth);
      let top = Math.floor((box.Top - box.Height * pad) * imgHeight);
      let width = Math.floor(box.Width * imgWidth * (1 + pad * 2));
      let height = Math.floor(box.Height * imgHeight * (1 + pad * 2));

      // Clamp to safe region
      if (left < 0) left = 0;
      if (top < 0) top = 0;
      if (left + width > imgWidth) width = imgWidth - left;
      if (top + height > imgHeight) height = imgHeight - top;

      if (width < 40 || height < 40) {
        console.log("Skipping too small face");
        continue;
      }

      // ⛔ Attempt crop (might still fail if AWS & Sharp differ)
      let cropped: Buffer;
      try {
        cropped = await sharpImage
          .extract({ left, top, width, height })
          .png()
          .toBuffer();
      } catch (err) {
        console.log("Crop failed at:", left, top, width, height);

        // ⭐ FIX: FORCE RESIZE IMAGE TO MATCH AWS COORDINATES
        const resized = await sharp(buffer)
          .rotate()
          .resize(2000, undefined, { withoutEnlargement: true })
          .toBuffer();

        sharpImage = sharp(resized);
        meta = await sharpImage.metadata();
        imgWidth = meta.width!;
        imgHeight = meta.height!;

        console.log("Retry Size:", imgWidth, imgHeight);

        // Recalculate bounding box with new dimensions
        left = Math.floor((box.Left - box.Width * pad) * imgWidth);
        top = Math.floor((box.Top - box.Height * pad) * imgHeight);
        width = Math.floor(box.Width * imgWidth * (1 + pad * 2));
        height = Math.floor(box.Height * imgHeight * (1 + pad * 2));

        if (left < 0) left = 0;
        if (top < 0) top = 0;
        if (left + width > imgWidth) width = imgWidth - left;
        if (top + height > imgHeight) height = imgHeight - top;

        try {
          cropped = await sharpImage
            .extract({ left, top, width, height })
            .png()
            .toBuffer();
        } catch (err2) {
          console.log("Retry crop failed also.");
          continue;
        }
      }

      // 3️⃣ MATCH WITH REKOGNITION
      const matchCmd = new SearchFacesByImageCommand({
        CollectionId: process.env.AWS_REKOG_COLLECTION!,
        Image: { Bytes: cropped },
        FaceMatchThreshold: 95,
        MaxFaces: 1,
      });

      let matchRes;
      try {
        matchRes = await rekog.send(matchCmd);
      } catch {
        continue;
      }

      const matches = matchRes.FaceMatches || [];
      if (matches.length === 0) continue;

      const roll = matches[0].Face?.ExternalImageId;
      if (!roll) continue;

      const student = await prisma.student.findFirst({ where: { roll } });
      if (!student) continue;

      // Check if already marked present (avoid duplicates)
      if (presentStudentIds.has(student.id)) {
        continue;
      }

      // Check if attendance already exists for today
      const existingAttendance = await prisma.attendance.findFirst({
        where: {
          studentId: student.id,
          date: {
            gte: today,
            lt: tomorrow,
          },
        },
      });

      if (!existingAttendance) {
        await prisma.attendance.create({
          data: {
            studentId: student.id,
            status: "PRESENT",
            date: today,
          },
        });
      }

      present.push(student);
      presentStudentIds.add(student.id);
    }

    // 4️⃣ Mark Absent - Only students who don't have attendance today
    const existingAttendanceToday = await prisma.attendance.findMany({
      where: {
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
      select: {
        studentId: true,
      },
    });

    const attendedStudentIds = new Set(
      existingAttendanceToday.map((a) => a.studentId)
    );

    // Get all students
    const all = await prisma.student.findMany();

    // Mark absent only those without any attendance record today
    const absent = all.filter((s) => !attendedStudentIds.has(s.id));

    for (const s of absent) {
      await prisma.attendance.create({
        data: {
          studentId: s.id,
          status: "ABSENT",
          date: today,
        },
      });
    }

    return NextResponse.json({
      success: true,
      present,
      absent,
    });
  } catch (err: any) {
    console.error("ERROR:", err);
    return NextResponse.json({
      success: false,
      message: err.message,
    });
  }
}