"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function AttendanceUpload() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  // IMPORTANT: results is NOT an array anymore.
  const [results, setResults] = useState<any | null>(null);

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

    setResults(json); // <-- IMPORTANT: store whole response
    toast.success("Attendance processed!");
  };

  return (
    <div className="border p-4 bg-white rounded shadow-sm">
      <h2 className="text-lg font-semibold mb-3">Upload Classroom Image</h2>

      {/* Upload Photo */}
      <input type="file" accept="image/*" onChange={handleImage} />

      {/* Preview */}
      {preview && (
        <img
          src={preview}
          className="w-64 h-64 mt-3 object-cover border rounded"
        />
      )}

      {/* Process Button */}
      <button
        onClick={handleSubmit}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        disabled={processing}
      >
        {processing ? "Processing..." : "Process Attendance"}
      </button>

      {/* Results Section */}
      {results && (
        <div className="mt-6">

          {/* Present Students */}
          {results.present?.length > 0 && (
            <>
              <h3 className="text-lg font-bold mb-2 text-green-600">
                Present Students:
              </h3>
              <ul className="list-disc ml-6 mb-4">
                {results.present.map((s: any) => (
                  <li key={s.id}>{s.name}</li>
                ))}
              </ul>
            </>
          )}

          {/* Absent Students */}
          {results.absent?.length > 0 && (
            <>
              <h3 className="text-lg font-bold mb-2 text-red-600">
                Absent Students:
              </h3>
              <ul className="list-disc ml-6">
                {results.absent.map((s: any) => (
                  <li key={s.id}>{s.name}</li>
                ))}
              </ul>
            </>
          )}

        </div>
      )}
    </div>
  );
}
