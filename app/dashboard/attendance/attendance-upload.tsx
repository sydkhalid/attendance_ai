"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function AttendanceUpload() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const handleImage = (e: any) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!image) {
      toast.error("Please upload a classroom photo.");
      return;
    }

    setProcessing(true);

    const form = new FormData();
    form.append("image", image);

    const res = await fetch("/api/attendance/process", {
      method: "POST",
      body: form,
    });

    const json = await res.json();
    setProcessing(false);

    if (!json.success) {
      toast.error("AI failed to process image.");
      return;
    }

    setResults(json.students);
    toast.success("Attendance processed!");
  };

  return (
    <div className="border p-4 bg-white rounded shadow-sm">
      <h2 className="text-lg font-semibold mb-3">Upload Classroom Image</h2>

      <input type="file" accept="image/*" onChange={handleImage} />

      {preview && (
        <img
          src={preview}
          className="w-64 h-64 mt-3 object-cover border rounded"
        />
      )}

      <button
        onClick={handleSubmit}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        disabled={processing}
      >
        {processing ? "Processing..." : "Process Attendance"}
      </button>

      {results.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-bold mb-2">Detected Students:</h3>
          <ul className="list-disc ml-6">
            {results.map((s: any, i: number) => (
              <li key={i}>{s.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
