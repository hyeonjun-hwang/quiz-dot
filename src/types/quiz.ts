// # 1. quizzes schema
// 1-1. quiz 타입
export interface Quiz {
  id: string; // UUID v4
  user_id: string; // 작성자 ID (UUID)
  title: string; // 퀴즈 제목
  type: string; // 퀴즈 분류 (예: 'Node.js', 'React')
  difficulty: "easy" | "medium" | "hard";
  count: number; // 문제 개수
  quiz_content: QuizContent; // ← 구조: {summary, quizzes[]}
  is_shared: boolean; // 공개 여부
  shared_token?: string | null; // 공유 토큰
  created_at: string; // 생성 일시
  updated_at: string; // 수정 일시
}

// 1-2. quiz_content 타입
export interface QuizContent {
  summary: string; // 학습 자료 요약
  quizzes: QuizItem[]; // 문제 배열
}

// 1-3. 개별 퀴즈 타입
export interface QuizItem {
  id: number; // 문제 번호
  question: string; // 문제 텍스트
  options: string[]; // 선택지 배열 (객관식)
  answer: string; // 정답 (단일 값)
  explanation: string; // 해설
}

// # 2. quiz_submissions schema
// 2-1. quiz_submission 타입
export interface QuizSubmission {
  id: string; // UUID v4
  quiz_id: string; // 퀴즈 ID (UUID)
  user_id: string; // 사용자 ID (UUID)
  user_answers: UserAnswers; // {1: "답", 2: "잘모르겠음"}
  score: number; // 0~100
  correct_count: number;
  total_count: number;
  created_at: string; // 제출 일시
}
// 2-2. user_answers 타입
export type UserAnswers = Record<number, string>;
