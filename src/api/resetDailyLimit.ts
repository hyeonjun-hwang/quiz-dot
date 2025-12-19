import { supabase } from "@/utils/supabase";

// interface UserLimits {
//   limit: number;
//   remaining: number;
// }

// 일일 퀴즈 횟수를 초기화 로직 실행
export async function resetDailyLimit(): Promise<void> {
  // supabase.functions.invoke를 사용하여 JWT 토큰을 자동으로 포함하여 호출
  const { error } = await supabase.functions.invoke("reset-daily-limit");

  if (error) {
    throw new Error(
      error.message || "일일 퀴즈 제한 초기화 API 호출에 실패했습니다."
    );
  }
  // 성공 시 data는 { message: "..." }만 포함 (필요하면 로그 출력)
}

// // (필요시) [STEP 2] users 테이블에서 잔여 횟수 정보를 직접 조회
// // 이 함수를 호출하기 전에 resetDailyLimit()가 먼저 호출되어야 함
// export async function fetchUserLimits(): Promise<UserLimits> {
//   // RLS (Row Level Security)가 설정되어 있어야 안전함 (user_id = auth.uid())
//   const { data, error } = await supabase
//     .from("users")
//     .select("quiz_limit_daily, quiz_count_today")
//     .single();

//   if (error || !data) {
//     throw new Error(error?.message || "사용자 한도 정보를 찾을 수 없습니다.");
//   }

//   const remaining = data.quiz_limit_daily - data.quiz_count_today;

//   return {
//     limit: data.quiz_limit_daily,
//     remaining: remaining,
//   };
// }
