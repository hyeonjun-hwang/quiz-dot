import { supabase } from "@/utils/supabase";
import type { QuizContent } from "@/types/quiz";

export interface SharedQuizData {
  id: string;
  title: string | null;
  quiz_content: QuizContent;
  type: string;
  count: number;
  difficulty: string;
}

/**
 * 공유 토큰을 사용하여 공유된 퀴즈 데이터를 가져옵니다.
 * 이 API는 RLS 정책에 따라 'is_shared = true'인 퀴즈에 대해서는
 * 인증되지 않은 사용자도 접근할 수 있어야 합니다.
 * @param sharedToken - 퀴즈의 공유 토큰
 * @returns 공유된 퀴즈 데이터
 */
export async function getSharedQuiz(
  sharedToken: string
): Promise<SharedQuizData> {
  if (!sharedToken) {
    throw new Error("공유 토큰이 필요합니다.");
  }

  const { data, error } = await supabase
    .from("quizzes")
    .select(
      `
      id,
      title,
      quiz_content,
      type,
      count,
      difficulty
    `
    )
    .eq("shared_token", sharedToken)
    .eq("is_shared", true)
    .single();

  if (error || !data) {
    console.error("Error fetching shared quiz:", error);
    // 데이터가 없거나 에러가 발생하면 퀴즈를 찾을 수 없다는 에러를 던집니다.
    throw new Error("공유된 퀴즈를 찾을 수 없거나 접근이 불가능합니다.");
  }

  return data;
}
