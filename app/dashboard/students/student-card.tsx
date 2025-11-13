export default function StudentCard({ student }: any) {
  return (
    <div className="border p-4 rounded bg-white shadow-sm">
      <h3 className="text-lg font-semibold">{student.name}</h3>
      <p className="text-sm text-gray-600">Roll: {student.roll}</p>
      <p className="text-sm text-gray-600">Parent: {student.parentEmail}</p>
      <p className="text-xs text-gray-400 mt-2">
        Joined: {new Date(student.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
}
