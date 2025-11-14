"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function AddStudentForm() {
  const [form, setForm] = useState({
    name: "",
    roll: "",
    parentEmail: "",
  });

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // MULTIPLE IMAGE HANDLER
  const handleImages = (e: any) => {
    const files = Array.from(e.target.files) as File[];

    if (files.length === 0) return;

    setImages(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!form.name || !form.roll || !form.parentEmail) {
      toast.error("All fields are required!");
      return;
    }

    if (images.length === 0) {
      toast.error("Please upload at least 1 photo!");
      return;
    }

    if (images.length > 5) {
      toast.error("Maximum 5 photos allowed!");
      return;
    }

    setLoading(true);

    const data = new FormData();
    data.append("name", form.name);
    data.append("roll", form.roll);
    data.append("parentEmail", form.parentEmail);

    images.forEach((img) => data.append("images[]", img));

    const res = await fetch("/api/students/add", {
      method: "POST",
      body: data,
    });

    const json = await res.json();
    setLoading(false);

    if (json.success) {
      toast.success("Student added successfully!");

      // RESET fields
      setForm({ name: "", roll: "", parentEmail: "" });
      setImages([]);
      setPreviews([]);
    } else {
      toast.error(json.message || "Failed to add student");
    }
  };

  return (
    <div className="border p-4 rounded-lg bg-white shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Add Student</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Student Name"
          className="border p-2 rounded"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          type="text"
          placeholder="Roll Number"
          className="border p-2 rounded"
          value={form.roll}
          onChange={(e) => setForm({ ...form, roll: e.target.value })}
        />

        <input
          type="email"
          placeholder="Parent Email"
          className="border p-2 rounded"
          value={form.parentEmail}
          onChange={(e) => setForm({ ...form, parentEmail: e.target.value })}
        />

        {/* MULTIPLE IMAGE UPLOAD */}
        <div>
          <label className="block mb-1 text-sm">Upload 1–5 Student Photos</label>

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImages}
          />

          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              {previews.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  className="w-24 h-24 object-cover rounded border"
                />
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Saving..." : "Save Student"}
        </button>
      </form>
    </div>
  );
}
