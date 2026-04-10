// app/educator/classroom/[classId]/students/page.tsx

export default function StudentsPage({ params }: { params: { classId: string } }) {
  return (
    <div>
      <h1>Students of {params.classId}</h1>
    </div>
  );
}