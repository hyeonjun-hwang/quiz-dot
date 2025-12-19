import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response("ok", { headers: corsHeaders });

  // Service Role Client (DB UPDATE 권한 필요)
  const supabaseServiceRoleClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    // 1. 유저 ID 추출 (JWT에서 ID만 안전하게 추출)
    const authHeader = req.headers.get("Authorization"); // request header의 Authorization에서 access token 가져오기
    if (!authHeader) throw new Error("인증 토큰이 없습니다.");
    // userId 추출용 supabaseClient
    const supabaseAnonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    // userId 가져오기
    const {
      data: { user },
      error: authError,
    } = await supabaseAnonClient.auth.getUser();
    if (authError || !user) throw new Error("유효하지 않은 사용자입니다.");
    const userId = user.id;

    // 2. uerId로 해당 유저의 quiz_count_reset_at 조회
    const { data: userData, error: fetchError } =
      await supabaseServiceRoleClient
        .from("users")
        .select("quiz_count_reset_at")
        .eq("id", userId)
        .single();

    if (fetchError || !userData)
      throw new Error("사용자 정보를 찾을 수 없습니다.");

    // 3. [핵심] 일일 한도 초기화 로직 (On-demand Reset)
    const currentTime = new Date();
    const lastResetTime = new Date(userData.quiz_count_reset_at);
    // 24시간 (86,400,000 밀리초) 경과 확인
    const isTimeForReset =
      currentTime.getTime() - lastResetTime.getTime() >= 24 * 60 * 60 * 1000;

    if (isTimeForReset) {
      const { error: resetError } = await supabaseServiceRoleClient
        .from("users")
        .update({
          quiz_count_today: 0,
          quiz_count_reset_at: currentTime.toISOString(),
        })
        .eq("id", userId);

      if (resetError) {
        console.error("퀴즈 카운트 초기화 실패:", resetError);
        throw new Error("카운트 초기화 중 DB 오류 발생.");
      }
    }

    // 4. 성공 응답 (실제 데이터 반환 없이 성공 여부만)
    return new Response(
      JSON.stringify({ message: "Daily limit check and reset complete." }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const status = error.message && error.message.includes("인증") ? 401 : 400;
    return new Response(JSON.stringify({ error: error.message }), {
      status: status,
      headers: corsHeaders,
    });
  }
});
