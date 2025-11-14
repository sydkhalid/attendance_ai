"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function AddStudentForm() {
  const [form, setForm] = useState({
    name: "",
    roll: "",
    parentEmail: "",
  });

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImage = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!form.name || !form.roll || !form.parentEmail || !image) {
      toast.error("All fields & photo are required!");
      return;
    }

    setLoading(true);

    const data = new FormData();
    data.append("name", form.name);
    data.append("roll", form.roll);
    data.append("parentEmail", form.parentEmail);
    data.append("image", image);

    const res = await fetch("/api/students/add", {
      method: "POST",
      body: data,
    });

    const json = await res.json();
    setLoading(false);

    if (json.success) {
      toast.success("Student added successfully!");

      // RESET FORM
      setForm({ name: "", roll: "", parentEmail: "" });
      setImage(null);
      setPreview(null);
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

        <div>
          <label className="block mb-1 text-sm text-gray-600">
            Upload Student Photo
          </label>
          <input type="file" accept="image/*" onChange={handleImage} />

          {preview && (
            <img
              src={preview}
              className="w-32 h-32 mt-2 object-cover rounded border"
            />
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:bg-gray-400"
        >
          {loading ? "Saving..." : "Save Student"}
        </button>
      </form>
    </div>
  );
}
