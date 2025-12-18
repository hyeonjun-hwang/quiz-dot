import { supabase } from "@/utils/supabase";

// 개별 퀴즈 타입
export interface QuizItem {
  id: number; // ← UUID가 아닌 숫자!
  question: string; // 문제 텍스트
  options: string[]; // 선택지 배열 (객관식)
  answer: string; // 정답 (단일 값)
  explanation: string; // 해설
}

// quiz_content 타입
export interface QuizContent {
  summary: string; // 학습 자료 요약
  quizzes: QuizItem[]; // 문제 배열
}

// quiz 타입
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

// 사용자 답변 구조 (ex. { 1: "API 서버", 2: "잘모르겠음" })
export type UserAnswers = Record<number, string>;

// 채점 결과 반환(response) 타입
export interface SubmissionResult {
  submission_id: string;
  score: number; // 0~100
  correct_count: number;
  total_count: number;
  results: {
    questionId: number; // ← 숫자로 변경
    question: string;
    user_answer: string;
    correct_answer: string;
    is_correct: boolean;
    explanation: string;
  }[];
  wrong_questions: QuizItem[];
}

// quiz_submissions 타입
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

/**
 * 퀴즈 채점 로직 (로컬 연산)
 * @param userAnswers 사용자 답변 {1: "답", 2: "답"}
 * @param quizContent 퀴즈 내용 {summary, quizzes[]}
 * @returns 채점 결과
 */
export function scoreQuiz(userAnswers: UserAnswers, quizContent: QuizContent) {
  const results = [];
  let correctCount = 0;

  const quizzes = quizContent.quizzes; // 요약 빼고 퀴즈 리스트 부분만 추출

  // 퀴즈 리스트 순회 돌면서 채점
  quizzes.forEach((question: QuizItem) => {
    const userAnswer = userAnswers[question.id];

    const isAnswered =
      userAnswer && userAnswer !== "잘모르겠음" && userAnswer.trim() !== "";

    const isCorrect =
      isAnswered &&
      userAnswer.toLowerCase().trim() === question.answer.toLowerCase().trim();

    if (isCorrect) {
      correctCount++;
    }

    // results에 각 문제 채점 결과 넣기
    results.push({
      questionId: question.id,
      question: question.question,
      user_answer: userAnswer || "잘모르겠음",
      correct_answer: question.answer,
      is_correct: isCorrect,
      explanation: question.explanation,
    });
  });

  const score = Math.round((correctCount / quizzes.length) * 100);

  const wrongQuestions = quizzes.filter((q: QuizItem) => {
    const userAnswer = userAnswers[q.id];
    return (
      !userAnswer ||
      userAnswer === "잘모르겠음" ||
      userAnswer.toLowerCase().trim() !== q.answer.toLowerCase().trim()
    );
  });

  return {
    score,
    correct_count: correctCount,
    total_count: quizzes.length,
    results,
    wrong_questions: wrongQuestions,
  };
}

/**
 * 퀴즈 제출 및 채점
 * @param quizId 퀴즈 ID
 * @param userId 사용자 ID
 * @param userAnswers 사용자 답변 {1: "답", 2: "답"}
 * @param quizContent 퀴즈 내용 {summary, quizzes[]}
 * @returns 제출 결과
 */
export async function submitQuizAndScore(
  quizId: string,
  userId: string,
  userAnswers: UserAnswers,
  quizContent: QuizContent
): Promise<SubmissionResult> {
  try {
    if (!quizId) throw new Error("퀴즈 ID가 필요합니다.");
    if (!userId) throw new Error("사용자 ID가 필요합니다.");
    if (!userAnswers || Object.keys(userAnswers).length === 0) {
      throw new Error("답변이 없습니다.");
    }
    if (
      !quizContent ||
      !quizContent.quizzes ||
      quizContent.quizzes.length === 0
    ) {
      throw new Error("퀴즈 내용이 비어있습니다.");
    }

    const scoringResult = scoreQuiz(userAnswers, quizContent);

    const { data: submission, error } = await supabase
      .from("quiz_submissions")
      .insert({
        quiz_id: quizId,
        user_id: userId,
        user_answers: userAnswers,
        score: scoringResult.score,
        correct_count: scoringResult.correct_count,
        total_count: scoringResult.total_count,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase 저장 오류:", error);

      if (error.code === "PGRST116") {
        throw new Error("사용자 정보를 찾을 수 없습니다.");
      }
      if (error.code === "FOREIGN_KEY_VIOLATION") {
        throw new Error("잘못된 퀴즈 ID입니다.");
      }

      throw new Error(`제출 저장 실패: ${error.message}`);
    }

    if (!submission) {
      throw new Error("제출 결과를 저장할 수 없습니다.");
    }

    return {
      submission_id: submission.id,
      score: scoringResult.score,
      correct_count: scoringResult.correct_count,
      total_count: scoringResult.total_count,
      results: scoringResult.results,
      wrong_questions: scoringResult.wrong_questions,
    };
  } catch (error) {
    const errorMsg =
      error instanceof Error
        ? error.message
        : "퀴즈 제출 중 알 수 없는 오류 발생";
    console.error("❌ 제출 및 채점 실패:", errorMsg);
    throw new Error(errorMsg);
  }
}
