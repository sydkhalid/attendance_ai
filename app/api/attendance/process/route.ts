import { NextResponse } from "next/server";

export const runtime = "nodejs"; // ensure node runtime

export async function POST(req: Request) {
  try {
    // 1) Receive image from form-data
    const form = await req.formData();
    const image = form.get("image") as File | null;

    if (!image) {
      return NextResponse.json(
        { success: false, message: "Image not found" },
        { status: 400 }
      );
    }

    // 2) Prepare form-data for Face Server
    const forwardForm = new FormData();
    forwardForm.append("image", image);

    // 3) Call external face server
    const faceServerURL = "http://localhost:4000/process";

    const res = await fetch(faceServerURL, {
      method: "POST",
      body: forwardForm,
    });

    // 4) If server fails
    if (!res.ok) {
      return NextResponse.json(
        {
          success: false,
          message: "Face server error",
          status: res.status,
        },
        { status: 500 }
      );
    }

    // 5) Parse JSON from face server
    const data = await res.json();

    return NextResponse.json({
      success: true,
      detections: data.detections,
      message: "Face recognition successful",
    });
  } catch (err: any) {
    console.error("❌ PROCESS API ERROR:", err);
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
