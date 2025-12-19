import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { generateQuizWithLangChain } from "./services/quizGenerator.ts"; // LangChain 로직을 불러옴
import { createClient } from "@supabase/supabase-js";

// ----------------------------------------------------
// 💡 필수: CORS 헤더 설정 (클라이언트(Vite)가 요청할 수 있도록)
// ----------------------------------------------------
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // 실제 배포 시에는 React 앱 주소로 변경하는 것이 보안상 좋음
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ----------------------------------------------------
// 🚀 Edge Function 실행 메인 함수
// ----------------------------------------------------
serve(async (req) => {
  // 1. OPTIONS 요청 처리 (CORS Preflight)
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // 2. 요청 본문(Body) 파싱
  let data;
  try {
    data = await req.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const { text, type, count, difficulty, failedQuestions } = data;

  // 3. req body 입력값 검증
  if (!text || !type || !count || !difficulty) {
    return new Response(
      JSON.stringify({
        error: "Missing required parameters (text, type, count, difficulty)",
      }),
      {
        status: 400,
        headers: corsHeaders,
      }
    );
  }

  // 4. 헤더의 토큰에서 user_id 추출하기
  // 요청(req) 헤더 중 Authorization 키의 값을 가져와서 authHeader 변수에 저장. (Bearer eyJhbGciOiJIUzI1Ni... 형태의 문자열이 여기에 들어옴)
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    throw new Error(
      "요청 헤더 Authorization에 유저의 access token이 없습니다."
    );
  }

  // 유저 검증용 클라이언트 (admin 권한으로 접근)
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    // 새로 만든 이 supabaseClient가 앞으로 보내는 모든 요청(여기서는 auth.getUser())의 헤더에, 사용자에게서 받은 토큰(authHeader)을 강제로 심어서 보내도록 설정하는 부분
    { global: { headers: { Authorization: authHeader } } }
  );

  // 위 supabaseClient에 강제로 심은 Authorization 토큰을 Supabase Auth 서버로 보내서,
  // "이 토큰이 유효한 토큰이 맞는지, 유효하다면 이 토큰의 주인(User)은 누구인지"를 확인
  const {
    data: { user },
    error: authError,
  } = await supabaseClient.auth.getUser();
  // 유저 정보가 없거나 에러가 발생한 경우 에러 처리
  if (authError || !user) {
    throw new Error("유효하지 않은 사용자입니다.");
  }

  // userId 추출
  const userId = user.id;

  // 5. 핵심 비즈니스 로직 위임 (LangChain 호출)
  try {
    const result = await generateQuizWithLangChain(
      text,
      { type, count, difficulty },
      userId,
      failedQuestions
    );

    // 6. 성공 응답
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Quiz Generation Failed in Edge Function:", error.message);

    // 7. 실패 응답
    return new Response(
      JSON.stringify({
        error:
          "AI 퀴즈 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
