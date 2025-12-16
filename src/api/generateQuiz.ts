// src/api/generateQuiz.ts (edge function 호출 함수)

import { supabase } from "@/utils/supabase"; // 위에서 만든 클라이언트
import { quizResponseSchema } from "../../supabase/functions/generate-quiz/schemas/quizSchema"; // AI가 반환할 TypeScript 타입
import type z from "zod";

/**
 * 퀴즈 생성 요청에 필요한 설정 타입
 * @param text - 사용자가 입력한 학습 자료 텍스트
 * @param type - 퀴즈 유형 (객관식 : 'multiple_choice', 단답형 : 'short_answer')
 * @param count - 문제 개수 (5~10개) 뭔가를 수정함!
 * @param difficulty - 난이도 ('hard', 'medium', 'easy')
 */
interface QuizRequestSchema {
  text: string;
  type: string;
  count: number;
  difficulty: string;
}

// AI가 반환하는 JSON의 타입 (Zod 스키마에서 추론된 타입)
type QuizResponseSchema = z.infer<typeof quizResponseSchema>;

/**
 * Supabase Edge Function을 호출하여 퀴즈를 생성합니다.
 *
 * @param quizRequest - 퀴즈 생성에 필요한 설정 객체
 * @returns AI가 생성한 퀴즈 데이터
 */
export async function generateQuiz(
  quizRequest: QuizRequestSchema
): Promise<QuizResponseSchema> {
  // 현재 로그인된 유저의 session을 가져옴 (세션 자동 관리) → zustand에서 관리하는 auth 작업되면 거기서 session을 가져오기 (추후 수정 필요)
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("session이 없어서 access token을 가져올 수 엄슴!");
  }

  // Edge Function 호출
  try {
    // Supabase JS SDK의 functions.invoke를 사용하여 안전하게 호출
    const { data, error } = await supabase.functions.invoke("generate-quiz", {
      body: JSON.stringify(quizRequest), // Body에 사용자 데이터만 전달
      headers: {
        // SDK가 자동으로 Bearer Token을 포함시켜 줍니다.
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
    });

    if (error) {
      // Edge Function 내부에서 발생한 4xx/5xx 에러 처리
      throw new Error(error.message || "퀴즈 생성 API 호출에 실패했습니다.");
    }

    // Edge Function이 반환한 JSON 데이터 (AI 퀴즈 결과)
    return data as QuizResponseSchema;
  } catch (err) {
    console.error("Quiz Generation Failed:", err);
    // 에러 메시지 정리 후 다시 던지기
    const errorMessage =
      err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
    throw new Error(`퀴즈 생성 실패: ${errorMessage}`);
  }
}
