import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { generateQuizWithLangChain } from "./services/quizGenerator.ts"; // LangChain 로직을 불러옴

// ----------------------------------------------------
// 💡 필수: CORS 헤더 설정 (클라이언트(Vite)가 요청할 수 있도록)
// ----------------------------------------------------
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // 실제 배포 시에는 React 앱 주소로 변경하는 것이 보안상 좋음
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ----------------------------------------------------
// 🚀 Edge Function 실행 메인 함수
// ----------------------------------------------------
serve(async (req) => {
  // 1. OPTIONS 요청 처리 (CORS Preflight)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  // 2. 요청 본문(Body) 파싱
  let data;
  try {
    data = await req.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), { 
      status: 400,
      headers: corsHeaders 
    });
  }

  const { text, type, count, difficulty } = data;

  // 3. 입력값 검증 (매우 중요!)
  if (!text || !type || !count || !difficulty) {
    return new Response(JSON.stringify({ 
      error: "Missing required parameters (text, type, count, difficulty)" 
    }), { 
      status: 400,
      headers: corsHeaders 
    });
  }

  // 4. 핵심 비즈니스 로직 위임 (LangChain 호출)
  try {
    const result = await generateQuizWithLangChain(text, { type, count, difficulty });
    
    // 5. 성공 응답
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Quiz Generation Failed in Edge Function:", error.message);
    
    // 6. 실패 응답
    return new Response(JSON.stringify({ 
      error: "AI 퀴즈 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});