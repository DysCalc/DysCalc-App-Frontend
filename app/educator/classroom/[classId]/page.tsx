// app/educator/classroom/[classId]/page.tsx

export default function ClassroomPage({ params }: { params: { classId: string } }) {
  return (
    <div>
      <h1>Classroom: {params.classId}</h1>
    </div>
  );
}