import { supabase } from "@/utils/supabase";
import type { QuizContent, QuizItem, UserAnswers } from "@/types/quiz";

// 채점 결과 반환(response) 타입
export interface SubmitQuizResponse {
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

/**
 * 퀴즈 채점 로직 (로컬 연산)
 * @param userAnswers 사용자 답변 {1: "답", 2: "답"}
 * @param quizContent 퀴즈 내용 {summary, quizzes[]}
 * @returns 채점 결과
 */
export function scoreQuiz(userAnswers: UserAnswers, quizContent: QuizContent) {
  const results: SubmitQuizResponse["results"] = [];
  let correctCount = 0;

  const quizzes = quizContent.quizzes; // 요약 빼고 퀴즈 리스트 부분만 추출

  // 퀴즈 리스트 순회 돌면서 채점
  quizzes.forEach((question: QuizItem) => {
    const userAnswer = userAnswers[question.id];

    const isAnswered = Boolean(
      userAnswer && userAnswer !== "잘모르겠음" && userAnswer.trim() !== ""
    );

    const isCorrect = Boolean(
      isAnswered &&
        userAnswer.toLowerCase().trim() === question.answer.toLowerCase().trim()
    );

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

  const score = Math.round((correctCount / quizzes.length) * 100); // 점수 계산

  // 틀린 문제 리스트만 따로 추출
  const wrongQuestions = quizzes.filter((q: QuizItem) => {
    const userAnswer = userAnswers[q.id];
    return (
      !userAnswer ||
      userAnswer === "잘모르겠음" ||
      userAnswer.toLowerCase().trim() !== q.answer.toLowerCase().trim()
    );
  });

  // 채첨 결과 반환
  return {
    score,
    correct_count: correctCount,
    total_count: quizzes.length,
    results,
    wrong_questions: wrongQuestions,
  };
}

/**
 * 퀴즈 제출 및 DB 저장
 * @param quizId 퀴즈 ID
 * @param userId 사용자 ID
 * @param userAnswers 사용자 답변 {1: "답", 2: "답"}
 * @param quizContent 퀴즈 내용 {summary, quizzes[]}
 * @returns 제출 결과
 */
export async function submitQuiz(
  quizId: string,
  userId: string,
  userAnswers: UserAnswers,
  quizContent: QuizContent
): Promise<SubmitQuizResponse> {
  try {
    // 파라미터 타입 판단 (방어코드)
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

    // scoreQuiz()함수 호출해서 채점 결과 scoringResult에 받기
    const scoringResult = scoreQuiz(userAnswers, quizContent);

    // DB에 저장
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

    // 에러 처리
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

    // DB에 저장된 최종 채점 결과 반환
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
