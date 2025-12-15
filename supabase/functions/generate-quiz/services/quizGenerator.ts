// services/quizGenerator.ts
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { quizResponseSchema } from "../schemas/quizSchema.ts"; // 위에서 만든 스키마
// import { createClient } from "@supabase/supabase-js";

export async function generateQuizWithLangChain(
  text: string,
  config: { type: string; count: number; difficulty: string }
  // userId: string // DB 저장을 위한 유저 ID
) {
  // Deno 환경에서는 Deno.env.get()으로 환경 변수를 가져와야 함
  const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

  // // Supabase Client 초기화 (Admin 권한으로 DB 접근)
  // const supabaseClient = createClient(
  //   Deno.env.get("SUPABASE_URL")!,
  //   Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  // );

  // // 유저의 퀴즈 생성 제한 조회
  // const { data: user, error: userError } = await supabaseClient
  //   .from("users")
  //   .select("quiz_count_today, quiz_limit_daily")
  //   .eq("id", userId)
  //   .single();

  // // 없는 유저이거나 에러 발생 시 에러 반환
  // if (userError || !user) throw new Error("사용자 정보를 찾을 수 없습니다.");
  // if (user.quiz_count_today >= user.quiz_limit_daily) {
  //   throw new Error("일일 퀴즈 생성 한도를 초과했습니다.");
  // }

  // 1. 모델 설정 (gpt-4o-mini 추천)
  const model = new ChatOpenAI({
    modelName: "gpt-4o-mini",
    temperature: 0.7,
    apiKey: OPENAI_API_KEY,
  });

  // 2. Structured Output 설정
  // 모델에게 Zod 스키마를 주입해서, 무조건 그 형태의 JSON을 뱉게 만듦
  const structuredLlm = model.withStructuredOutput(quizResponseSchema);

  // 3. 프롬프트 템플릿 작성
  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `당신은 전문 교육 전문가이자 퀴즈 제작 전문가입니다. 주어진 학습 자료를 깊이 있게 분석하여 고품질의 교육적 가치가 높은 퀴즈를 생성하세요.

[요청 정보]
- 퀴즈 유형: {type}
- 난이도: {difficulty}
- 생성 개수: {count}개

[핵심 원칙 - 반드시 준수하세요!]
1. 자료의 단순 복사 금지: 자료의 문장을 그대로 사용하지 말고, 다양한 각도와 표현으로 질문을 만들어야 합니다.
2. 구체적이고 명확한 질문: 모호하거나 추상적인 질문을 피하고, 학습자가 정확히 무엇을 답해야 하는지 명확해야 합니다.
3. 교육적 가치: 단순 암기가 아닌 이해와 적용을 확인하는 질문을 우선시하세요.
4. 문제 간 다양성: 같은 주제라도 다른 관점, 다른 난이도, 다른 접근 방식으로 질문해야 합니다.
5. 정확한 답변: 답변(answer)은 자료에 명시된 정확한 내용이어야 합니다.

[난이도별 상세 가이드]

Easy (쉬움) - {difficulty}가 "easy"일 때:
- 자료에 직접적으로 명시된 사실을 묻는 질문
- 질문은 친절하고 명확하게 작성

Medium (보통) - {difficulty}가 "medium"일 때:
- 자료의 두 개 이상의 개념을 연결하거나 간단한 추론이 필요한 질문
- 질문은 약간의 사고를 요구하되 너무 어렵지 않게

Hard (어려움) - {difficulty}가 "hard"일 때:
- 자료의 심층적 이해나 비교 분석, 예외 상황을 묻는 질문
- 질문은 비판적 사고와 종합적 이해를 요구

[유형별 상세 가이드]

단답형(short_answer) - {type}이 "short_answer"일 때:
- 'options'는 반드시 빈 배열([])이어야 합니다.
- 'answer'는 반드시 띄어쓰기 없는 한 단어만 가능합니다.
  올바른 예(O): "V8", "백엔드", "런타임", "123"
  잘못된 예(X): "V8, SpiderMonkey" (여러 단어), "데이터베이스 통신" (띄어쓰기 있음), "CRUD 작업 수행" (문장 형태), "보이지않는" (형용사 또는 부사 형태)
- 답변이 여러 개념을 포함해야 하는 경우, 질문을 한 단어로 답할 수 있도록 재구성하세요.
  예: "Chrome의 자바스크립트 엔진은?" → 답: "V8" (단일 답변)
  예: "둘 사이의 다툼에서 제 3자가 이득을 본다는 뜻의 사자성어는?" → 답: "어부지리"

객관식(multiple_choice) - {type}이 "multiple_choice"일 때:
- 'options' 배열에 반드시 5개의 보기를 포함해야 합니다.
- 정답은 options 배열에 포함되어야 하며, answer는 정답 텍스트와 일치해야 합니다.
- 오답 보기는 자료의 다른 개념이나 유사하지만 명백히 틀린 내용으로 구성해야 합니다.

[질문 작성 가이드]
1. 다양한 질문 유형 사용:
   - "~란 무엇인가요?" (정의)
   - "~의 역할은 무엇인가요?" (기능)
   - "~의 예시를 들면?" (적용)
   - "~의 차이점은?" (비교)
   - "~가 필요한 이유는?" (이해)
   - "다음 중 ~인 것은?" (선택)
   - "~는 (    )입니다." (빈칸 채우기)

2.빈칸 채우기 문제 출제 가이드:
  - 객관식, 단답형 모두 빈칸 채우기 형태의 문제 출제 가능.
  - 빈칸은 문제 처음과 끝이 아닌 중간 위치에 있어야 함.
  - 올바른 예(O): "평창동계올림픽이 열렸던 해는 (    )년도 이다"
  - 잘못된 예(X): "백엔드의 주요 기능 중 데이터베이스와의 통신을 통해 수행되는 작업은 무엇인가요? (    )"

3. 구체적인 상황 제시:
   - 올바른 예(O) : "사용자가 로그인 버튼을 눌렀을 때 백엔드가 하는 일은?" (구체적)
   - 잘못된 예(X) : "백엔드의 역할은?" (너무 추상적)

4. 중복 방지:
   - 가급적 동일한 개념 하나당 하나의 문제만 만든다. (만약 자료가 적어 동일한 개념에 여러 문제를 만들어야 하는 경우, 다른 방식으로 문제를 만든다.)
   - 정답이 동일한 문제는 만들지 않는다.

[해설 작성 가이드]
- 해설은 최소 2문장 이상으로 상세하게 작성해야 합니다.
- 첫 번째 문장: 정답이 무엇인지 명확히 제시
- 두 번째 문장 이후: 왜 그 답이 맞는지, 자료의 어떤 부분에서 나온 것인지, 추가 설명이나 맥락 제공
- 예시:
  좋은 해설(O): "Chrome의 자바스크립트 엔진은 V8입니다. V8은 구글이 개발한 오픈소스 엔진으로, Chrome뿐만 아니라 Node.js에서도 사용됩니다."
  나쁜 해설(X): "Chrome은 V8 엔진을 사용합니다."

[생성 시 체크리스트]
각 퀴즈를 생성할 때 다음을 확인하세요:
✓ 각 질문의 정답이 정확한지 체크.
✓ 질문이 자료의 문장을 그대로 복사하지 않았는가?
✓ 질문이 구체적이고 명확한가?
✓ 이전 문제와 다른 관점이나 접근 방식인가?
✓ 난이도에 맞는 수준인가?
✓ 잘못된 예시(X)로 문제와 정답을 만들지 않았는지 체크.

현재 요청: {type} 유형, {difficulty} 난이도, {count}개 생성

모든 응답은 주어진 JSON 포맷을 엄격히 준수.`,
    ],
    [
      "human",
      `다음 학습 자료를 분석하여 {count}개의 {type} 유형 퀴즈를 {difficulty} 난이도로 생성.

학습 자료:
{text}

주의사항:
- 각 문제는 서로 다른 관점과 접근 방식으로 작성.
- {type}이 "short_answer"일 때, 정답은 반드시 띄어쓰기 없는 한 단어만 가능.
- {type}이 "multiple_choice"일 때, 반드시 보기 5개를 생성해야 함.
- 전체 문제의 30%는 빈칸 채우기 형태로 작성해야 함.
- 해설은 2문장 이상으로 상세하게 교육적으로 작성해야 함.`,
    ],
  ]);

  // 4. 체인 연결 (Prompt -> Model -> JSON Output)
  const chain = prompt.pipe(structuredLlm);

  // 5. 실행
  try {
    const result = await chain.invoke({
      type: config.type, // 객관식 : multiple_choice, 단답형 : short_answer
      difficulty: config.difficulty, // hard, medium, easy
      count: config.count, // 5~10
      text: text.substring(0, 20000), // 토큰 제한 안전장치 : 텍스트 최대 5000자, 10page PDF 1개 최대 15000자 기준
    });

    // // 퀴즈 JSON 결과 DB에 저장 (promise.all에서 병렬 비동기 처리)
    // const saveQuizPromise = supabaseClient.from("quizzes").insert({
    //   user_id: userId,
    //   title: `${new Date().toISOString().split("T")[0]} 퀴즈`, // 제목 자동 생성
    //   type: config.type,
    //   difficulty: config.difficulty,
    //   count: config.count,
    //   quiz_content: result, // AI 결과 JSON 그대로 저장
    // });

    // // 퀴즈 생성 횟수 증가 (promise.all에서 병렬 비동기 처리)
    // const incrementCountPromise = supabaseClient
    //   .from("users")
    //   .update({ quiz_count_today: user.quiz_count_today + 1 })
    //   .eq("id", userId);

    // // 퀴즈 저장, 퀴즈 생성 횟수 증가 모두 성공할 때까지 대기 (늦게 실행되는거 만큼 소요됨)
    // const [quizResult, updateResult] = await Promise.all([
    //   saveQuizPromise,
    //   incrementCountPromise,
    // ]);

    // if (quizResult.error)
    //   throw new Error(
    //     `퀴즈 JSON 결과 DB에 저장 실패: ${quizResult.error.message}`
    //   );
    // if (updateResult.error)
    //   throw new Error(
    //     `퀴즈 생성 횟수 제한(quiz_count_today) 업데이트 실패: ${updateResult.error.message}`
    //   );

    return result; // 최종 결과 반환
  } catch (error) {
    console.error("Quiz Generation Error:", error);
    throw new Error("퀴즈 생성 중 오류가 발생했습니다.", error.message);
  }
}
