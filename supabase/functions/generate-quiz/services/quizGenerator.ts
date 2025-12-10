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
    throw new Error("OPENAI_API_KEY environment variable is not set in the Deno runtime.");
}
  // 1. 모델 설정 (gpt-4o-mini 추천)
  const model = new ChatOpenAI({
    modelName: "gpt-4o-mini",
    temperature: 0.7, // 약간의 창의성 허용
    apiKey: OPENAI_API_KEY,
  });

  // 2. Structured Output 설정 (핵심!)
  // 모델에게 Zod 스키마를 주입해서, 무조건 이 형태의 JSON을 뱉게 만듦
  const structuredLlm = model.withStructuredOutput(quizResponseSchema);

  // 3. 프롬프트 템플릿 작성
  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `당신은 전문 학습 튜터입니다. 주어진 학습 자료를 분석하여 퀴즈를 생성하세요.
      
      [생성 규칙]
      - 언어: 한국어 (Korean)
      - 퀴즈 유형: {type} (multiple_choice: 객관식 / true_false: OX / short_answer: 단답형)
      - 난이도: {difficulty} (hard/medium/easy)
      - 문제 개수: {count}개
      
      [유형별 가이드]
      - 객관식: 'options'에 4~5개의 보기를 포함하세요.
      - OX: 'options'는 빈 배열([])로 두고, 'answer'는 'O' 또는 'X'로 하세요.
      - 단답형: 'options'는 빈 배열([])로 두고, 'answer'는 한 단어로 하세요.
      
      모든 응답은 주어진 포맷(JSON)을 엄격히 준수해야 합니다.`
    ],
    ["human", "학습 자료:\n{text}"]
  ]);

  // 4. 체인 연결 (Prompt -> Model -> JSON Output)
  const chain = prompt.pipe(structuredLlm);

  // 5. 실행
  try {
    const result = await chain.invoke({
      type: config.type,
      difficulty: config.difficulty,
      count: config.count,
      text: text.substring(0, 15000), // 토큰 제한 안전장치
    });

    return result; // 여기서 이미 완벽한 JSON 객체가 반환됨 (파싱 불필요!)

  } catch (error) {
    console.error("Quiz Generation Error:", error);
    throw new Error("퀴즈 생성 중 오류가 발생했습니다.");
  }
}