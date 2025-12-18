// 순수 함수만 테스트 (Supabase 의존성 없음)

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

// scoreQuiz 함수 복사 (순수 로직만)
function scoreQuiz(userAnswers: UserAnswers, quizContent: QuizContent) {
  const results = [];
  let correctCount = 0;

  const quizzes = quizContent.quizzes;

  quizzes.forEach((question: QuizItem) => {
    const userAnswer = userAnswers[question.id];

    const isAnswered =
      userAnswer && userAnswer !== "잘모르겠음" && userAnswer.trim() !== "";

    const isCorrect =
      isAnswered &&
      userAnswer.toLowerCase().trim() === question.answer.toLowerCase().trim();

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

// 테스트 데이터
const userAnswers = { 1: "API 서버", 2: "V8" };
const quizContent = {
  summary: "(사용자가 올린 학습 자료 요약한 내용)",
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
        "정답은 '서버 및 CLI 환경'입니다. Node.js는 구글의 V8 엔진을 사용하여 서버나 CLI 환경에서도 자바스크립트를 실행할 수 있도록 만든 런타임입니다. 이를 통해 자바스크립트를 다양한 환경에서 사용할 수 있게 됩니다.",
    },
    {
      id: 2,
      question: "자바스크립트 엔진의 예시로 Chrome은 (    ) 엔진을 사용합니다.",
      options: [],
      answer: "V8",
      explanation:
        "Chrome 브라우저는 V8이라는 자바스크립트 엔진을 사용합니다. V8은 구글이 개발한 오픈 소스 엔진으로, 자바스크립트를 해석하고 실행하는 역할을 합니다.",
    },
  ],
};

// 실행
const result = scoreQuiz(userAnswers, quizContent);

console.log('📊 채점 결과:', JSON.stringify(result, null, 2));
console.log('\n📈 요약:');
console.log(`점수: ${result.score}점`);
console.log(`정답: ${result.correct_count}/${result.total_count}`);
console.log(`오답: ${result.wrong_questions.length}개`);
