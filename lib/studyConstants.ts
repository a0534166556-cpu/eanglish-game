export type StudyDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'extreme';
export type StudyType = 'exam' | 'exercise' | 'homework' | 'task';
export type StudySubject = 'vocabulary' | 'grammar' | 'reading' | 'listening' | 'mixed';

export interface StudyQuestion {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  points: number;
  category?: string;
}

export const DIFFICULTY_LEVELS: {
  id: StudyDifficulty;
  name: string;
  description: string;
  icon: string;
  color: string;
}[] = [
  { id: 'beginner', name: 'מתחיל', description: 'מילים בסיסיות ושאלות פשוטות', icon: '🌱', color: 'from-green-400 to-green-600' },
  { id: 'intermediate', name: 'בינוני', description: 'אוצר מילים יומיומי ודקדוק בסיסי', icon: '🌿', color: 'from-yellow-400 to-yellow-600' },
  { id: 'advanced', name: 'מתקדם', description: 'שאלות מורכבות ומבנה משפטים', icon: '🌳', color: 'from-purple-400 to-purple-600' },
  { id: 'extreme', name: 'אקסטרים', description: 'אתגר מקסימלי — רמה גבוהה ביותר', icon: '🔥', color: 'from-red-500 to-yellow-600' },
];

export const STUDY_TYPES: { id: StudyType; name: string; icon: string; description: string }[] = [
  { id: 'exam', name: 'מבחן', icon: '📝', description: 'מבחן מסכם עם ציון' },
  { id: 'exercise', name: 'תרגיל', icon: '✏️', description: 'תרגול ממוקד בנושא' },
  { id: 'homework', name: 'שיעורי בית', icon: '📖', description: 'משימה לבית עם תאריך יעד' },
  { id: 'task', name: 'משימה', icon: '📋', description: 'משימת לימוד כללית' },
];

export const STUDY_SUBJECTS: { id: StudySubject; name: string; icon: string }[] = [
  { id: 'vocabulary', name: 'אוצר מילים', icon: '📚' },
  { id: 'grammar', name: 'דקדוק', icon: '📐' },
  { id: 'reading', name: 'קריאה', icon: '📖' },
  { id: 'listening', name: 'האזנה', icon: '🎧' },
  { id: 'mixed', name: 'מעורב', icon: '🎯' },
];

export function getDifficultyInfo(id: string) {
  return DIFFICULTY_LEVELS.find((d) => d.id === id) ?? DIFFICULTY_LEVELS[0];
}

export function getStudyTypeInfo(id: string) {
  return STUDY_TYPES.find((t) => t.id === id) ?? STUDY_TYPES[0];
}

export function getSubjectInfo(id: string) {
  return STUDY_SUBJECTS.find((s) => s.id === id) ?? STUDY_SUBJECTS[4];
}

export function parseQuestions(json: string): StudyQuestion[] {
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function calculateTotalPoints(questions: StudyQuestion[]): number {
  return questions.reduce((sum, q) => sum + (q.points || 10), 0);
}

export const QUESTION_TEMPLATES: Record<StudyDifficulty, StudyQuestion[]> = {
  beginner: [
    { id: 'b1', text: 'What color is the sky?', options: ['Green', 'Blue', 'Red', 'Yellow'], correctIndex: 1, explanation: 'השמיים כחולים', points: 10, category: 'colors' },
    { id: 'b2', text: 'Which animal says "meow"?', options: ['Dog', 'Cat', 'Cow', 'Bird'], correctIndex: 1, explanation: 'חתול אומר meow', points: 10, category: 'animals' },
    { id: 'b3', text: 'How many days are in a week?', options: ['Five', 'Six', 'Seven', 'Eight'], correctIndex: 2, explanation: 'יש שבעה ימים בשבוע', points: 10, category: 'numbers' },
    { id: 'b4', text: 'What do you read?', options: ['Pen', 'Book', 'Chair', 'Table'], correctIndex: 1, explanation: 'קוראים ספר', points: 10, category: 'school' },
    { id: 'b5', text: 'Complete: I ___ happy', options: ['am', 'is', 'are', 'be'], correctIndex: 0, explanation: 'I am happy', points: 10, category: 'grammar' },
  ],
  intermediate: [
    { id: 'i1', text: 'What is the opposite of "hot"?', options: ['Warm', 'Cold', 'Cool', 'Fire'], correctIndex: 1, explanation: 'ההפך מ-hot הוא cold', points: 15, category: 'vocabulary' },
    { id: 'i2', text: 'Complete: She ___ to school every day', options: ['go', 'goes', 'going', 'gone'], correctIndex: 1, explanation: 'She goes to school', points: 15, category: 'grammar' },
    { id: 'i3', text: 'Which word rhymes with "cat"?', options: ['Dog', 'Hat', 'Sun', 'Ball'], correctIndex: 1, explanation: 'Cat and Hat rhyme', points: 15, category: 'sounds' },
    { id: 'i4', text: 'What do you call a baby dog?', options: ['Puppy', 'Kitten', 'Chick', 'Cub'], correctIndex: 0, explanation: 'גור כלב הוא puppy', points: 15, category: 'vocabulary' },
    { id: 'i5', text: 'Read: "Tom likes pizza." What does Tom like?', options: ['Pasta', 'Pizza', 'Salad', 'Soup'], correctIndex: 1, explanation: 'טום אוהב פיצה', points: 15, category: 'reading' },
  ],
  advanced: [
    { id: 'a1', text: 'Complete: If I ___ rich, I would travel the world', options: ['am', 'was', 'were', 'be'], correctIndex: 2, explanation: 'Second conditional: If I were rich...', points: 20, category: 'grammar' },
    { id: 'a2', text: 'What is a synonym for "enormous"?', options: ['Tiny', 'Huge', 'Small', 'Short'], correctIndex: 1, explanation: 'Enormous = huge', points: 20, category: 'vocabulary' },
    { id: 'a3', text: 'Choose the correct sentence:', options: ['He don\'t like it', 'He doesn\'t like it', 'He not like it', 'He no like it'], correctIndex: 1, explanation: 'He doesn\'t like it — נכון דקדוקית', points: 20, category: 'grammar' },
    { id: 'a4', text: 'Read: "Despite the rain, they continued hiking." What happened?', options: ['They stopped', 'They continued hiking', 'They went home', 'They got lost'], correctIndex: 1, explanation: 'למרות הגשם המשיכו לטייל', points: 20, category: 'reading' },
    { id: 'a5', text: 'What is the past participle of "write"?', options: ['Wrote', 'Written', 'Writed', 'Writing'], correctIndex: 1, explanation: 'write — wrote — written', points: 20, category: 'grammar' },
  ],
  extreme: [
    { id: 'e1', text: 'Complete: By the time we arrived, the movie ___', options: ['started', 'has started', 'had started', 'was starting'], correctIndex: 2, explanation: 'Past perfect: had started', points: 25, category: 'grammar' },
    { id: 'e2', text: 'Which sentence uses the subjunctive correctly?', options: ['I wish I was taller', 'I wish I were taller', 'I wish I am taller', 'I wish I be taller'], correctIndex: 1, explanation: 'Subjunctive: I wish I were', points: 25, category: 'grammar' },
    { id: 'e3', text: 'What does "ubiquitous" mean?', options: ['Rare', 'Found everywhere', 'Ancient', 'Dangerous'], correctIndex: 1, explanation: 'Ubiquitous = נמצא בכל מקום', points: 25, category: 'vocabulary' },
    { id: 'e4', text: 'Read: "The protagonist\'s ambivalence was palpable." What was noticeable?', options: ['Anger', 'Mixed feelings', 'Happiness', 'Fear'], correctIndex: 1, explanation: 'Ambivalence = רגשות מעורבים', points: 25, category: 'reading' },
    { id: 'e5', text: 'Identify the error: "Neither the students nor the teacher were ready"', options: ['students', 'teacher', 'were', 'ready'], correctIndex: 2, explanation: 'Neither...nor עם teacher יחיד → was', points: 25, category: 'grammar' },
  ],
};
