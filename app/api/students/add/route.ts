import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const name = formData.get("name") as string;
    const roll = formData.get("roll") as string;
    const parentEmail = formData.get("parentEmail") as string;
    const image = formData.get("image") as File | null;

    if (!name || !roll || !parentEmail || !image) {
      return NextResponse.json(
        { success: false, message: "All fields are required." },
        { status: 400 }
      );
    }

    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const student = await prisma.student.create({
      data: {
        name,
        roll,
        parentEmail,
        image: buffer, // later we replace this with file path
      },
    });

    return NextResponse.json({
      success: true,
      message: "Student added successfully!",
      student,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
