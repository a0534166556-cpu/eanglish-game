import { Suspense } from 'react';
import ClassroomStudentPage from './ClassroomStudentClient';

export default function ClassroomStudentPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ClassroomStudentPage />
    </Suspense>
  );
}
