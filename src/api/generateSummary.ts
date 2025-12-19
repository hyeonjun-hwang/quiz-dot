// src/api/generateSummary.ts (edge function 호출 함수)

import { supabase } from "@/utils/supabase"; // 위에서 만든 클라이언트

/**
 * 요약 생성 요청에 필요한 설정 타입
 * @param text - 사용자가 입력한 학습 자료 텍스트
 */
interface SummaryRequestSchema {
  text: string;
}

/**
 * 요약 생성 응답 타입
 * @param summary - AI가 생성한 요약 텍스트
 */
interface SummaryResponseSchema {
  summary: string;
}

/**
 * Supabase Edge Function을 호출하여 요약을 생성합니다.
 *
 * @param summaryRequest - 요약 생성에 필요한 설정 객체
 * @returns AI가 생성한 요약 데이터
 */
export async function generateSummary(
  summaryRequest: SummaryRequestSchema
): Promise<SummaryResponseSchema> {
  // 현재 로그인된 유저의 session을 가져옴 (세션 자동 관리)
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("session이 없어서 access token을 가져올 수 없음!");
  }

  // Edge Function 호출
  try {
    // Supabase JS SDK의 functions.invoke를 사용하여 안전하게 호출
    const { data, error } = await supabase.functions.invoke("generate-summary", {
      body: JSON.stringify(summaryRequest), // Body에 사용자 데이터만 전달
      headers: {
        // SDK가 자동으로 Bearer Token을 포함시켜 줍니다.
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
    });

    if (error) {
      // Edge Function 내부에서 발생한 4xx/5xx 에러 처리
      throw new Error(error.message || "요약 생성 API 호출에 실패했습니다.");
    }

    // Edge Function이 반환한 JSON 데이터 (AI 요약 결과)
    return data as SummaryResponseSchema;
  } catch (err) {
    console.error("Summary Generation Failed:", err);
    // 에러 메시지 정리 후 다시 던지기
    const errorMessage =
      err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
    throw new Error(`요약 생성 실패: ${errorMessage}`);
  }
}
