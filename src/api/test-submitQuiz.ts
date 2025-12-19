// submitQuizAndScore 함수 테스트 (Supabase 모킹)

interface QuizItem {
  id: number;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

interface QuizContent {
  summary: string;
  quizzes: QuizItem[];
}

type UserAnswers = Record<number, string>;

interface SubmissionResult {
  submission_id: string;
  score: number;
  correct_count: number;
  total_count: number;
  results: {
    questionId: number;
    question: string;
    user_answer: string;
    correct_answer: string;
    is_correct: boolean;
    explanation: string;
  }[];
  wrong_questions: QuizItem[];
}

interface QuizSubmission {
  id: string;
  quiz_id: string;
  user_id: string;
  user_answers: UserAnswers;
  score: number;
  correct_count: number;
  total_count: number;
  created_at: string;
}

// scoreQuiz 함수 복사
function scoreQuiz(userAnswers: UserAnswers, quizContent: QuizContent) {
  const results: SubmissionResult["results"] = [];
  let correctCount = 0;

  const quizzes = quizContent.quizzes;

  quizzes.forEach((question: QuizItem) => {
    const userAnswer = userAnswers[question.id];

    const isAnswered = Boolean(
      userAnswer && userAnswer !== "잘모르겠음" && userAnswer.trim() !== ""
    );

    const isCorrect = Boolean(
      isAnswered &&
        userAnswer.toLowerCase().trim() === question.answer.toLowerCase().trim()
    );

    if (isCorrect) {
      correctCount++;
    }

    results.push({
      questionId: question.id,
      question: question.question,
      user_answer: userAnswer || "잘모르겠음",
      correct_answer: question.answer,
      is_correct: isCorrect,
      explanation: question.explanation,
    });
  });

  const score = Math.round((correctCount / quizzes.length) * 100);

  const wrongQuestions = quizzes.filter((q: QuizItem) => {
    const userAnswer = userAnswers[q.id];
    return (
      !userAnswer ||
      userAnswer === "잘모르겠음" ||
      userAnswer.toLowerCase().trim() !== q.answer.toLowerCase().trim()
    );
  });

  return {
    score,
    correct_count: correctCount,
    total_count: quizzes.length,
    results,
    wrong_questions: wrongQuestions,
  };
}

// Supabase 모킹 (실제 DB 없이 테스트)
const mockSupabase = {
  from: (table: string) => ({
    insert: (data: any) => ({
      select: () => ({
        single: async () => {
          // insert 데이터 추출 (배열이면 첫 요소, 객체면 그대로)
          const insertData = Array.isArray(data) ? data[0] : data;

          // 성공적으로 저장된 것처럼 시뮬레이션
          const mockSubmission: QuizSubmission = {
            id: "mock-submission-id-123",
            quiz_id: insertData.quiz_id,
            user_id: insertData.user_id,
            user_answers: insertData.user_answers,
            score: insertData.score,
            correct_count: insertData.correct_count,
            total_count: insertData.total_count,
            created_at: new Date().toISOString(),
          };

          console.log(
            "✅ [Mock DB] 저장된 데이터:",
            JSON.stringify(mockSubmission, null, 2)
          );

          return { data: mockSubmission, error: null };
        },
      }),
    }),
  }),
};

// submitQuizAndScore 함수 복사 (모킹된 Supabase 사용)
async function submitQuiz(
  quizId: string,
  userId: string,
  userAnswers: UserAnswers,
  quizContent: QuizContent
): Promise<SubmissionResult> {
  try {
    if (!quizId) throw new Error("퀴즈 ID가 필요합니다.");
    if (!userId) throw new Error("사용자 ID가 필요합니다.");
    if (!userAnswers || Object.keys(userAnswers).length === 0) {
      throw new Error("답변이 없습니다.");
    }
    if (
      !quizContent ||
      !quizContent.quizzes ||
      quizContent.quizzes.length === 0
    ) {
      throw new Error("퀴즈 내용이 비어있습니다.");
    }

    const scoringResult = scoreQuiz(userAnswers, quizContent);

    const { data: submission, error } = await mockSupabase
      .from("quiz_submissions")
      .insert({
        quiz_id: quizId,
        user_id: userId,
        user_answers: userAnswers,
        score: scoringResult.score,
        correct_count: scoringResult.correct_count,
        total_count: scoringResult.total_count,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase 저장 오류:", error);

      if (error.code === "PGRST116") {
        throw new Error("사용자 정보를 찾을 수 없습니다.");
      }
      if (error.code === "FOREIGN_KEY_VIOLATION") {
        throw new Error("잘못된 퀴즈 ID입니다.");
      }

      throw new Error(`제출 저장 실패: ${error.message}`);
    }

    if (!submission) {
      throw new Error("제출 결과를 저장할 수 없습니다.");
    }

    return {
      submission_id: submission.id,
      score: scoringResult.score,
      correct_count: scoringResult.correct_count,
      total_count: scoringResult.total_count,
      results: scoringResult.results,
      wrong_questions: scoringResult.wrong_questions,
    };
  } catch (error) {
    const errorMsg =
      error instanceof Error
        ? error.message
        : "퀴즈 제출 중 알 수 없는 오류 발생";
    console.error("❌ 제출 및 채점 실패:", errorMsg);
    throw new Error(errorMsg);
  }
}

// ========================================
// 테스트 실행
// ========================================

async function runTest() {
  console.log("🚀 submitQuizAndScore 함수 테스트 시작\n");

  // 테스트 데이터
  const quizId = "quiz-uuid-12345";
  const userId = "user-uuid-67890";

  const userAnswers = {
    1: "서버 및 CLI 환경", // 정답
    2: "V9", // 오답
  };

  const quizContent = {
    summary: "Node.js와 자바스크립트 엔진에 대한 학습 자료",
    quizzes: [
      {
        id: 1,
        question: "Node.js는 무엇을 위한 런타임인가요?",
        options: [
          "브라우저 환경",
          "데이터베이스",
          "서버 및 CLI 환경",
          "프론트엔드",
          "API 서버",
        ],
        answer: "서버 및 CLI 환경",
        explanation:
          "정답은 '서버 및 CLI 환경'입니다. Node.js는 구글의 V8 엔진을 사용하여 서버나 CLI 환경에서도 자바스크립트를 실행할 수 있도록 만든 런타임입니다.",
      },
      {
        id: 2,
        question:
          "자바스크립트 엔진의 예시로 Chrome은 (    ) 엔진을 사용합니다.",
        options: [],
        answer: "V8",
        explanation:
          "Chrome 브라우저는 V8이라는 자바스크립트 엔진을 사용합니다. V8은 구글이 개발한 오픈 소스 엔진으로, 자바스크립트를 해석하고 실행하는 역할을 합니다.",
      },
    ],
  };

  try {
    // 함수 실행
    const result = await submitQuiz(quizId, userId, userAnswers, quizContent);

    console.log("\n📊 최종 반환값:\n");
    console.log(JSON.stringify(result, null, 2));

    console.log("\n✅ 테스트 성공!");
    console.log(`\n📈 요약:`);
    console.log(`  - Submission ID: ${result.submission_id}`);
    console.log(`  - 점수: ${result.score}점`);
    console.log(`  - 정답: ${result.correct_count}/${result.total_count}`);
    console.log(`  - 오답 문제: ${result.wrong_questions.length}개`);
  } catch (error) {
    console.error("\n❌ 테스트 실패:", error);
  }
}

// 실행
runTest();
