import { supabase } from "@/utils/supabase";
import { nanoid } from "nanoid";

/**
 * 퀴즈의 공유 상태를 업데이트하고 공유 토큰을 관리합니다.
 * @param quizId - 상태를 업데이트할 퀴즈의 ID
 * @param isShared - 새로운 공유 상태 (true: 공유 on, false: 공유 off)
 * @returns 업데이트된 공유 토큰 (공유 off 시 null)
 */
export async function updateQuizSharing(
  quizId: string,
  isShared: boolean
): Promise<string | null> {
  let sharedToken: string | null = null;

  // 공유를 활성화하는 경우
  if (isShared) {
    // 먼저 기존 토큰이 있는지 확인
    const { data: existingQuiz, error: selectError } = await supabase
      .from("quizzes")
      .select("shared_token")
      .eq("id", quizId)
      .single();

    if (selectError) {
      console.error("Error fetching existing shared_token:", selectError);
      throw new Error("기존 퀴즈 정보를 가져오는 데 실패했습니다.");
    }

    // 기존 토큰이 있으면 사용하고, 없으면 새로 생성
    if (existingQuiz?.shared_token) {
      sharedToken = existingQuiz.shared_token;
    } else {
      sharedToken = nanoid();
    }
  }

  // quizzes 테이블 업데이트
  const { data, error: updateError } = await supabase
    .from("quizzes")
    .update({
      is_shared: isShared,
      shared_token: sharedToken, // 공유 활성화 시 토큰 저장, 비활성화 시 null로 설정
    })
    .eq("id", quizId)
    .select("shared_token")
    .single();

  if (updateError) {
    console.error("Error updating sharing status:", updateError);
    throw new Error("퀴즈 공유 상태 업데이트에 실패했습니다.");
  }

  return data?.shared_token ?? null;
}
