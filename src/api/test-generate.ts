// generateQuiz 함수 테스트 (Supabase Edge Function 모킹)

// 퀴즈 생성 요청 타입
interface QuizRequestSchema {
  text: string;
  type: string;
  count: number;
  difficulty: string;
  failedQuestions?: string[];
}

// AI가 반환하는 퀴즈 문제 하나
interface QuizItem {
  id: number;
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
}

// AI가 반환하는 전체 응답 구조
interface QuizResponseSchema {
  summary: string;
  quizzes: QuizItem[];
}

// Supabase 모킹 (Edge Function 호출 시뮬레이션)
const mockSupabase = {
  auth: {
    getSession: async () => {
      // 가짜 세션 반환
      return {
        data: {
          session: {
            access_token: "mock-access-token-123",
            user: {
              id: "mock-user-id",
              email: "test@example.com",
            },
          },
        },
        error: null,
      };
    },
  },
  functions: {
    invoke: async (functionName: string, options: any) => {
      console.log(`\n🔧 [Mock Edge Function] ${functionName} 호출됨`);
      console.log(
        "📥 요청 Body:",
        JSON.stringify(JSON.parse(options.body), null, 2)
      );

      // 요청 파라미터 추출
      const request = JSON.parse(options.body) as QuizRequestSchema;

      // AI가 생성한 것처럼 가짜 퀴즈 데이터 반환
      const mockQuizResponse: QuizResponseSchema = {
        summary: `${request.text.substring(0, 50)}...에 대한 ${
          request.difficulty
        } 난이도 퀴즈입니다. 총 ${request.count}개의 문제로 구성되어 있습니다.`,
        quizzes: Array.from({ length: request.count }, (_, i) => {
          const isMultipleChoice = request.type === "multiple_choice";

          return {
            id: i + 1,
            question: `${request.difficulty} 난이도 문제 ${i + 1}: ${
              request.text.split(" ")[0]
            }에 대한 질문`,
            ...(isMultipleChoice && {
              options: [
                "선택지 1",
                "선택지 2",
                "정답 선택지",
                "선택지 4",
                "선택지 5",
              ],
            }),
            answer: isMultipleChoice ? "정답 선택지" : "정답",
            explanation: `이것은 문제 ${i + 1}번의 해설입니다. ${
              request.text.split(" ")[0]
            }에 대한 내용을 설명합니다.`,
          };
        }),
      };

      console.log("✅ [Mock Edge Function] 응답 생성 완료\n");

      return {
        data: mockQuizResponse,
        error: null,
      };
    },
  },
};

// generateQuiz 함수 복사 (모킹된 Supabase 사용)
async function generateQuiz(
  quizRequest: QuizRequestSchema
): Promise<QuizResponseSchema> {
  // 세션 가져오기
  const {
    data: { session },
  } = await mockSupabase.auth.getSession();

  if (!session) {
    throw new Error("session이 없어서 access token을 가져올 수 엄슴!");
  }

  // Edge Function 호출
  try {
    const { data, error } = await mockSupabase.functions.invoke(
      "generate-quiz",
      {
        body: JSON.stringify(quizRequest),
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (error) {
      throw new Error(error.message || "퀴즈 생성 API 호출에 실패했습니다.");
    }

    return data as QuizResponseSchema;
  } catch (err) {
    console.error("Quiz Generation Failed:", err);
    const errorMessage =
      err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
    throw new Error(`퀴즈 생성 실패: ${errorMessage}`);
  }
}

// ========================================
// 테스트 실행
// ========================================

async function runTest() {
  console.log("🚀 generateQuiz 함수 테스트 시작\n");
  console.log("=".repeat(60));

  // 테스트 케이스 1: 객관식 퀴즈
  console.log("\n📝 [테스트 1] 객관식 퀴즈 생성\n");

  const multipleChoiceRequest: QuizRequestSchema = {
    text: "Node.js는 구글의 V8 엔진을 사용하여 서버나 CLI 환경에서도 자바스크립트를 실행할 수 있도록 만든 런타임입니다.",
    type: "multiple_choice",
    count: 3,
    difficulty: "medium",
  };

  try {
    const result1 = await generateQuiz(multipleChoiceRequest);

    console.log("📊 반환된 퀴즈 데이터:\n");
    console.log(JSON.stringify(result1, null, 2));

    console.log("\n✅ 테스트 1 성공!");
    console.log(`  - 요약: ${result1.summary}`);
    console.log(`  - 문제 개수: ${result1.quizzes.length}개`);
    console.log(
      `  - 첫 번째 문제 타입: ${
        result1.quizzes[0].options
          ? "객관식 (선택지 " + result1.quizzes[0].options.length + "개)"
          : "단답형"
      }`
    );
  } catch (error) {
    console.error("\n❌ 테스트 1 실패:", error);
  }

  console.log("\n" + "=".repeat(60));

  // 테스트 케이스 2: 단답형 퀴즈
  console.log("\n📝 [테스트 2] 단답형 퀴즈 생성\n");

  const shortAnswerRequest: QuizRequestSchema = {
    text: "React는 사용자 인터페이스를 구축하기 위한 JavaScript 라이브러리입니다.",
    type: "short_answer",
    count: 2,
    difficulty: "hard",
  };

  try {
    const result2 = await generateQuiz(shortAnswerRequest);

    console.log("📊 반환된 퀴즈 데이터:\n");
    console.log(JSON.stringify(result2, null, 2));

    console.log("\n✅ 테스트 2 성공!");
    console.log(`  - 요약: ${result2.summary}`);
    console.log(`  - 문제 개수: ${result2.quizzes.length}개`);
    console.log(
      `  - 첫 번째 문제 타입: ${
        result2.quizzes[0].options ? "객관식" : "단답형"
      }`
    );
  } catch (error) {
    console.error("\n❌ 테스트 2 실패:", error);
  }

  console.log("\n" + "=".repeat(60));

  // 테스트 케이스 3: 오답 복습 모드
  console.log("\n📝 [테스트 3] 오답 복습 퀴즈 생성\n");

  const reviewRequest: QuizRequestSchema = {
    text: "JavaScript는 웹 개발을 위한 프로그래밍 언어입니다.",
    type: "multiple_choice",
    count: 2,
    difficulty: "easy",
    failedQuestions: ["변수 선언 방법", "함수 정의"],
  };

  try {
    const result3 = await generateQuiz(reviewRequest);

    console.log("📊 반환된 퀴즈 데이터:\n");
    console.log(JSON.stringify(result3, null, 2));

    console.log("\n✅ 테스트 3 성공!");
    console.log(`  - 요약: ${result3.summary}`);
    console.log(`  - 문제 개수: ${result3.quizzes.length}개`);
    console.log(
      `  - 복습할 오답: ${reviewRequest.failedQuestions?.join(", ")}`
    );
  } catch (error) {
    console.error("\n❌ 테스트 3 실패:", error);
  }

  console.log("\n" + "=".repeat(60));
  console.log("\n🎉 모든 테스트 완료!\n");
}

// 실행
runTest();
