import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { QuizLayout } from "@/components/layout/QuizLayout";
import { QuizSolving, type Question } from "../../components/QuizSolving";
import { submitQuiz } from "../../api/submitQuiz";
import { useAuthStore } from "../../stores/auth";
import { toast } from "sonner";
import type { UserAnswers } from "../../types/quiz";
import { supabase } from "../../utils/supabase";

export function QuizSolvingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    // QuizLoadingPage에서 전달받은 퀴즈 데이터
    const quizData = location.state?.quizData;

    if (quizData && quizData.quizzes) {
      // API 응답 데이터를 Question 타입으로 변환
      const convertedQuestions: Question[] = quizData.quizzes.map((quiz: any, index: number) => ({
        id: `q-${quiz.id || index + 1}`,
        question: quiz.question,
        type: quiz.options && quiz.options.length > 0 ? "multiple" : "short",
        options: quiz.options || undefined,
        answer: quiz.answer,
        explanation: quiz.explanation,
      }));

      setQuestions(convertedQuestions);
    } else {
      // 퀴즈 데이터가 없으면 홈으로 이동
      navigate("/");
    }
  }, [location.state, navigate]);

  const handleSubmit = async (userAnswers: Record<string, { answer: string; dontKnow: boolean }>) => {
    try {
      const quizData = location.state?.quizData;

      // 사용자 답변을 UserAnswers 타입으로 변환 (dontKnow가 true면 "잘모르겠음", 아니면 answer)
      const formattedAnswers: UserAnswers = {};
      Object.keys(userAnswers).forEach((key) => {
        const questionId = parseInt(key.replace('q-', '')); // "q-1" -> 1
        formattedAnswers[questionId] = userAnswers[key].dontKnow
          ? "잘모르겠음"
          : userAnswers[key].answer;
      });

      const userId = user?.id || '';

      if (!userId) {
        toast.error("로그인이 필요합니다.");
        navigate("/sign-in");
        return;
      }

      // 1. 먼저 quizzes 테이블에 퀴즈 저장
      const { data: savedQuiz, error: quizError } = await supabase
        .from("quizzes")
        .insert({
          user_id: userId,
          title: "AI 생성 퀴즈",
          type: questions[0]?.type === "multiple" ? "multiple_choice" : "short_answer",
          difficulty: "medium", // 실제로는 quizData에서 가져와야 함
          count: questions.length,
          quiz_content: quizData,
          is_shared: false,
        })
        .select()
        .single();

      if (quizError) {
        console.error("퀴즈 저장 오류:", quizError);
        throw new Error(`퀴즈 저장 실패: ${quizError.message}`);
      }

      if (!savedQuiz) {
        throw new Error("퀴즈가 저장되지 않았습니다.");
      }

      const quizId = savedQuiz.id;

      // 2. submitQuiz API 호출하여 제출 결과를 DB에 저장
      await submitQuiz(quizId, userId, formattedAnswers, quizData);

      toast.success("퀴즈 제출이 완료되었습니다!");

      // 사용자 답안과 퀴즈 데이터를 QuizResultPage로 전달
      navigate("/quiz/result", {
        state: {
          questions: questions,
          userAnswers: userAnswers,
          quizData: quizData,
        },
      });
    } catch (error) {
      console.error("퀴즈 제출 오류:", error);
      toast.error(error instanceof Error ? error.message : "퀴즈 제출에 실패했습니다.");

      // 에러가 발생해도 결과 페이지로 이동 (로컬 채점 결과는 보여줌)
      navigate("/quiz/result", {
        state: {
          questions: questions,
          userAnswers: userAnswers,
          quizData: location.state?.quizData,
        },
      });
    }
  };

  // 퀴즈 데이터가 로드되지 않았으면 로딩 표시
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">퀴즈를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <QuizLayout>
      <QuizSolving
        questions={questions}
        onSubmit={handleSubmit}
      />
    </QuizLayout>
  );
}