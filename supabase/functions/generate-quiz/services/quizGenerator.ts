// services/quizGenerator.ts
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { quizResponseSchema } from "../schemas/quizSchema.ts"; // 위에서 만든 스키마

export async function generateQuizWithLangChain(
  text: string,
  config: { type: string; count: number; difficulty: string }
) {
  // Deno 환경에서는 Deno.env.get()으로 환경 변수를 가져와야 함
  const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

  // 💡 키가 없으면 바로 에러 던지기 (디버깅에 도움됨)
  if (!OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY environment variable is not set in the Deno runtime."
    );
  }
  // 1. 모델 설정 (gpt-4o-mini 추천)
  const model = new ChatOpenAI({
    modelName: "gpt-4o-mini",
    temperature: 0.5, // 약간의 창의성 허용
    apiKey: OPENAI_API_KEY,
  });

  // 2. Structured Output 설정 (핵심!)
  // 모델에게 Zod 스키마를 주입해서, 무조건 이 형태의 JSON을 뱉게 만듦
  const structuredLlm = model.withStructuredOutput(quizResponseSchema);

  // 3. 프롬프트 템플릿 작성
  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      // 기존 프롬프트 대신 아래 내용으로 교체
      `당신은 전문 학습 튜터입니다. 주어진 학습 자료를 분석하여 퀴즈를 생성하세요.
        
        [공통 생성 규칙]
        - 언어: 한국어
        - 문제의 문맥과 해설은 반드시 입력된 자료에 기반해야 합니다.
        - 문제의 길이는 단답형을 피하고, **최소 30자 이상**의 문장 형태로 작성하십시오.
        
        [난이도별 요구사항]
        
        // --- Easy (쉬움) ---
        - 난이도: easy
        - 자료에 **명시적으로 언급된 단어**나 문장을 그대로 질문하고 답하세요.
        - 보기는 **오답인 것이 명백한 내용**을 사용하여 난이도를 낮춥니다.
        
        // --- Medium (보통) ---
        - 난이도: medium
        - 자료에 있는 **두 개 이상의 개념을 연결**하거나, **간단한 추론**이 필요한 질문을 생성하십시오.
        - 보기는 헷갈리기 쉬운 **유사 개념**을 포함하여 변별력을 높입니다.
        
        // --- Hard (어려움) ---
        - 난이도: hard
        - **자료의 행간을 읽는 심층적인 이해**나, **비교 분석**이 필요한 질문을 생성하십시오.
        - **'~이 아닌 것은?', '가장 거리가 먼 것은?'** 같은 고난도 질문 형태를 적극 사용하십시오.
        - 보기는 정답과 매우 유사하거나, 자료의 지엽적인 부분에서 가져온 **함정 보기**를 반드시 포함하십시오.
        
        [유형별 가이드]
        - 객관식(multiple_choice): 'options'에 4~5개의 보기를 포함.
        - 단답형(short_answer): 'options'는 빈 배열, 'answer'는 띄어쓰기 없는 한 단어.
        
        모든 응답은 주어진 포맷(JSON)을 엄격히 준수해야 합니다.`,
    ],
    ["human", "학습 자료:\n{text}"],
  ]);

  // 4. 체인 연결 (Prompt -> Model -> JSON Output)
  const chain = prompt.pipe(structuredLlm);

  // 5. 실행
  try {
    const result = await chain.invoke({
      type: config.type,
      difficulty: config.difficulty,
      count: config.count,
      text: text.substring(0, 20000), // 토큰 제한 안전장치 텍스트 5000자, 10page PDF 1개 15000 기준
    });

    return result; // 여기서 이미 완벽한 JSON 객체가 반환됨 (파싱 불필요!)
  } catch (error) {
    console.error("Quiz Generation Error:", error);
    throw new Error("퀴즈 생성 중 오류가 발생했습니다.");
  }
}
