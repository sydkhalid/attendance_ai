import StudentCard from "./student-card";

async function getStudents() {
  const base = process.env.NEXT_PUBLIC_BASE_URL!;

  const res = await fetch(`${base}/api/students/list`, {
    cache: "no-store",
  });

  if (!res.ok) {
    console.log("Error fetching:", await res.text());
    return [];
  }

  const json = await res.json();
  return json.students || [];
}



export default async function StudentsPage() {
  const students = await getStudents();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Students</h1>

      <div className="mb-6">
        <a
          href="/dashboard/students/add"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add New Student
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {students.length === 0 && (
          <p className="text-gray-500">No students found.</p>
        )}

        {students.map((s: any) => (
          <StudentCard key={s.id} student={s} />
        ))}
      </div>
    </div>
  );
}
