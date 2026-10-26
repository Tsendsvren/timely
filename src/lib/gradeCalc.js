export const SCALE = [
  { letter: 'A', min: 90, gp: 4.0 },
  { letter: 'B+', min: 85, gp: 3.5 },
  { letter: 'B', min: 80, gp: 3.0 },
  { letter: 'C+', min: 75, gp: 2.5 },
  { letter: 'C', min: 70, gp: 2.0 },
  { letter: 'D', min: 60, gp: 1.0 },
  { letter: 'F', min: 0, gp: 0 },
];

export const letterOf = (total) => SCALE.find((s) => total >= s.min);

export function calcGrade(b, examOverride) {
  const base = Number(b.attendance || 0) + Number(b.lab || 0) + Number(b.quiz || 0);
  const exam = Number(examOverride ?? b.exam ?? 0);
  const total = base + exam;
  const l = letterOf(total);
  return { base, exam, total, letter: l.letter, gradePoint: l.gp };
}

// Үсгэн дүн бүрт шалгалтаас хэдэн оноо хэрэгтэй вэ
export function neededExam(b) {
  const base = Number(b.attendance || 0) + Number(b.lab || 0) + Number(b.quiz || 0);
  return SCALE.filter((s) => s.letter !== 'F').map((s) => {
    const exam = Math.max(0, s.min - base);
    return { letter: s.letter, min: s.min, exam, possible: exam <= 30 };
  });
}
