import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { QuizLayout } from "@/components/layout/QuizLayout";
import { QuizResult, type QuizResultData } from "../../components/QuizResult";
import type { Question } from "../../components/QuizSolving";
import { toast } from "sonner";
import { useShareQuiz } from "@/hooks/use-share-quiz";
import { ShareDialog } from "@/components/ShareDialog";
import { useAuthStore } from "@/stores/auth";

export function QuizResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [quizResult, setQuizResult] = useState<QuizResultData | null>(null);
  const { user } = useAuthStore();

  // 공유 기능 hook 가져오기
  const { sharingQuiz, openShareDialog, closeShareDialog } = useShareQuiz();

  useEffect(() => {
    // QuizSolvingPage에서 전달받은 데이터
    const { questions, userAnswers, quizId, submissionId } =
      location.state || {};

    if (!questions || !userAnswers) {
      // 데이터가 없으면 홈으로 이동
      navigate("/");
      return;
    }

    // 채점 로직: 각 문제를 채점하고 결과 데이터 생성
    let correctCount = 0;
    const gradedQuestions = questions.map((question: Question) => {
      const userAnswer = userAnswers[question.id];
      const correctAnswer = question.answer || "";

      // "모르겠어요" 체크 여부와 답안 확인
      const userAnswerText = userAnswer?.dontKnow
        ? "모르겠어요"
        : userAnswer?.answer || "";

      // 정답 비교 (대소문자 구분 없이, 공백 제거)
      const isCorrect =
        !userAnswer?.dontKnow &&
        userAnswerText.trim().toLowerCase() ===
          correctAnswer.trim().toLowerCase();

      if (isCorrect) {
        correctCount++;
      }

      return {
        id: question.id,
        question: question.question,
        type: question.type,
        userAnswer: userAnswerText,
        correctAnswer: correctAnswer,
        isCorrect: isCorrect,
        explanation:
          (question as any).explanation || "해설이 제공되지 않았습니다.",
        options: question.options,
      };
    });

    // 점수 계산 (0-100점)
    const score = Math.round((correctCount / questions.length) * 100);

    const result: QuizResultData = {
      quizId: quizId,
      score: score,
      totalQuestions: questions.length,
      correctCount: correctCount,
      questions: gradedQuestions,
      submittedAt: new Date().toISOString(),
      submissionId: submissionId,
    };

    setQuizResult(result);
  }, [location.state, navigate]);

  const handleBackToHome = () => {
    // 퀴즈 생성 페이지로 이동
    navigate("/quiz/create");
  };

  const handleRetryWrong = async () => {
    // 오답 문제만 필터링
    const { questions, quizData } = location.state || {};

    if (!questions || !quizResult) {
      return;
    }

    // isCorrect가 false인 문제들만 추출
    const wrongQuestions = quizResult.questions
      .filter((q) => !q.isCorrect)
      .map((q) => q.question);

    if (wrongQuestions.length === 0) {
      toast.info("틀린 문제가 없습니다.");
      return;
    }

    // PRO 사용자가 아니고 남은 횟수가 0인 경우 체크
    const remainingQuizzes = user ? user.quiz_limit_daily - user.quiz_count_today : 0;
    if (user?.subscription_plan !== "pro" && remainingQuizzes <= 0) {
      toast.error("퀴즈 생성 횟수를 모두 사용했습니다. PRO 구독으로 무제한 이용하세요!");
      navigate("/subscription");
      return;
    }

    // 틀린 문제들을 학습 자료 텍스트로 변환
    const wrongQuestionsText = wrongQuestions.join("\n\n");

    // quizData에서 원본 설정 가져오기 (없으면 기본값 사용)
    const quizType = quizData?.type || "multiple_choice";
    const quizDifficulty = quizData?.difficulty || "medium";
    const quizCount = wrongQuestions.length; // 틀린 문제 수만큼

    // 디버깅: 전달되는 데이터 확인
    console.log("=== 오답 다시 풀기 디버깅 ===");
    console.log("틀린 문제 개수:", wrongQuestions.length);
    console.log("틀린 문제들:", wrongQuestions);
    console.log("학습 자료 텍스트 길이:", wrongQuestionsText.length);
    console.log("학습 자료 텍스트:", wrongQuestionsText);
    console.log("퀴즈 요청 데이터:", {
      text: wrongQuestionsText,
      type: quizType,
      count: quizCount,
      difficulty: quizDifficulty,
      failedQuestions: wrongQuestions,
    });

    // QuizLoadingPage로 이동하여 퀴즈 생성
    navigate("/quiz/loading", {
      state: {
        quizRequest: {
          text: wrongQuestionsText,
          type: quizType,
          count: quizCount,
          difficulty: quizDifficulty,
          failedQuestions: wrongQuestions,
        },
        generateSummary: false,
      },
    });
  };

  // 공유하기 버튼 핸들러
  const handleShareClick = () => {
    if (!quizResult) return;

    const quizItemForSharing = {
      id: quizResult.submissionId, // 제출 ID (임시로 생성 시간 사용)
      quiz_id: quizResult.quizId, // 퀴즈 ID
      score: quizResult.score,
      correct_count: quizResult.correctCount,
      total_count: quizResult.totalQuestions,
      created_at: quizResult.submittedAt || new Date().toISOString(),
      quizzes: {
        // `quizzes` 테이블에서 직접 가져온 정보가 아니므로, 일부 정보는 알 수 없음
        // 공유 기능에 필수적인 is_shared, shared_token은 DB에서 다시 조회되므로 여기서는 기본값을 넣음
        title: "방금 푼 퀴즈", // 임시 제목
        is_shared: false, // 기본값
        shared_token: null, // 기본값
      },
    };

    openShareDialog(quizItemForSharing as any);
  };

  // 퀴즈 결과가 로드되지 않았으면 로딩 표시
  if (!quizResult) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">결과를 계산하는 중...</p>
      </div>
    );
  }

  return (
    <QuizLayout>
      <QuizResult
        result={quizResult}
        onRetryWrong={handleRetryWrong}
        onBackToHome={handleBackToHome}
        onShare={handleShareClick}
      />

      <ShareDialog
        open={!!sharingQuiz}
        onClose={closeShareDialog}
        quiz={sharingQuiz}
        onStateChange={() => {}} // 결과 페이지에서는 상태를 실시간으로 업데이트할 필요가 없으므로 빈 함수 전달
      />
    </QuizLayout>
  );
}
