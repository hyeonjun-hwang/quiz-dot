// 1. Quizzes Schema (DB 기준 - Supabase Table)

// 1-1. 개별 퀴즈 문제 (DB 규격: id는 number)
export interface QuizItem {
  id: number;
  question: string;
  options: string[]; // 객관식 선택지
  answer: string; // 정답
  explanation: string;
}

// 1-2. quiz_content 구조
export interface QuizContent {
  summary: string;
  quizzes: QuizItem[];
}

// 1-3. 퀴즈 전체 데이터
export interface Quiz {
  id: string; // UUID
  user_id: string;
  title: string;
  type: string;
  difficulty: "easy" | "medium" | "hard";
  count: number;
  quiz_content: QuizContent;
  is_shared: boolean;
  shared_token?: string | null;
  created_at: string;
  updated_at: string;
}

// 2. Quiz Submissions Schema (DB 기준 - 제출 기록)

// DB의 UserAnswers는 문제번호(number)를 키로 가짐
export type UserAnswers = Record<number, string>;

export interface QuizSubmission {
  id: string;
  quiz_id: string;
  user_id: string;
  user_answers: UserAnswers;
  score: number;
  correct_count: number;
  total_count: number;
  created_at: string;
}

// 3. Active Quiz Session (UI/Store 확장 타입)

export interface QuizQuestionContent extends QuizItem {
  // UI 렌더링 시 타입 판별을 위해 추가
  type: "multiple_choice" | "short_answer";
}

export interface ActiveQuiz {
  quizId: string;
  title: string;
  summary: string;
  type: string;
  difficulty: string;
  questions: QuizQuestionContent[];
}

export interface SessionAnswer {
  questionId: number; // DB QuizItem.id(number)와 매칭
  userSelectedAnswer: string;
  isCorrect: boolean;
}
