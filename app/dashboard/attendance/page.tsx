import AttendanceUpload from "../attendance/attendance-upload";

export default function AttendancePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Attendance</h1>
      <p className="text-gray-600 mb-6">
        Upload a classroom photo to detect present students.
      </p>

      <AttendanceUpload />
    </div>
  );
}
