import { create } from "zustand";
import { supabase } from "@/utils/supabase";
import { generateQuiz } from "@/api/generateQuiz"; // 분리된 API 함수
import { useAuthStore } from "./auth"; // 유저 한도 갱신용
// --- 1. Supabase 'users' 테이블 기반 사용자 정보 구조 ---
// 이 정보는 useAuthStore에서 관리, 퀴즈 도메인의 의존성 위해 주석 처리

// export interface User {
//   id: string; // auth.users.id와 1:1 매핑
//   email: string; // 사용자 이메일
//   nickname?: string; // 사용자 닉네임
//   subscription_plan: "free" | "pro" | string; // 구독 플랜 종류
//   quiz_limit_daily: number; // 일일 퀴즈 생성 한도
//   quiz_count_today: number; // 오늘 생성한 퀴즈 수
//   quiz_count_reset_at: string; // 한도 리셋 시각
//   is_admin: boolean; // 어드민 계정 여부

// }

// --- 2. 퀴즈 문제의 기본 구조 (quizzes.quiz_content JSONB 구조) ---
export interface QuizQuestionContent {
  id: string; // 문제 고유 ID
  questionText: string;
  type: "multiple_choice" | "short_answer";
  options?: string[]; // 객관식일 경우 존재
  correctAnswer: string; // 정답 텍스트
}

// --- 3. 현재 풀이 중인 퀴즈의 메타 정보와 문제 내용을 통합한 상태 ---
export interface ActiveQuiz {
  quizId: string; // Supabase quizzes.id (DB PK)
  title: string;
  summary?: string; // quizzes.summary (퀴즈 요약)
  type: string; // quizzes.type(퀴즈 유형)
  difficulty: string; // quizzes.difficulty(퀴즈 난이도)
  questions: QuizQuestionContent[]; // quizzes.quiz_content (JSONB)
}

// --- 4. 퀴즈 풀이 중 사용자가 제출한 답변 기록  ---
export interface UserAnswer {
  questionId: string; // 문제 ID
  userSelectedAnswer: string; // 사용자가 선택/입력한 답변
  isCorrect: boolean; // 정답 여부
}

// --- 5. Supabase 'quiz_submissions' 테이블 엔티티 ---
export interface QuizSubmission {
  id: string; // 제출 결과 고유 식별자
  quiz_id: string; // 풀이한 퀴즈 ID
  user_id: string; // 풀이한 사용자 ID
  user_answers: { [qId: string]: string }; // JSONB (사용자 답변)
  score: number; // 최종 점수 (0~100)
  correct_count: number; // 정답 개수
  total_count: number; // 전체 문제 개수
  created_at: string; // 제출 시간
}

// --- 6. UI에 표시할 학습 기록 (Submission + Quizzes 테이블 정보 결합) ---
export interface ExtendedQuizRecord extends QuizSubmission {
  quizTitle: string;
  quizDifficulty: string;
  quizType: string;
}

// --- 7. Zustand 스토어 정의 ---
interface QuizStore {
  // --- 상태 (State) ---
  activeQuiz: ActiveQuiz | null; // 현재 풀이 중인 세션 데이터
  sessionAnswers: UserAnswer[]; // 현재 세션의 임시 답변 기록
  records: ExtendedQuizRecord[]; // 사용자 학습 기록 목록

  // 세분화된 비동기 로딩 상태
  isGenerating: boolean; // 퀴즈 생성 및 DB 저장 (quizzes) 로딩
  isSubmitting: boolean; // 퀴즈 결과 제출 (quiz_submissions) 로딩
  isFetchingRecords: boolean; // 학습 기록 조회 로딩

  error: string | null; // 작업 중 발생한 에러

  // --- 액션 (Actions) ---

  // 문제가 아닌 생성 요청 데이터를 받음
  saveAndStartQuiz: (
    payload: {
      title?: string;
      difficulty: string;
      type: string;
      content: string;
    }
  ) => Promise<void>;

  // 퀴즈 풀이 중 특정 문제에 대한 답변을 제출하고 기록합니다.
  submitAnswer: (questionId: string, answer: string, isCorrect: boolean) => void;

  // 풀이 완료 후, 결과를 계산하여 DB(quiz_submissions)에 저장하고 세션을 종료합니다.
  submitSession: (userId: string) => Promise<void>;
  
  // 사용자 학습 기록 목록을 DB에서 조회하여 records 상태를 업데이트합니다.
  fetchRecords: (userId: string) => Promise<void>;
}

export const useQuizStore = create<QuizStore>((set, get) => ({
  // --- 초기 상태 설정 ---
  activeQuiz: null,
  sessionAnswers: [],
  records: [],
  isGenerating: false,
  isSubmitting: false,
  isFetchingRecords: false,
  error: null,

  // --- 액션 구현 ---

  // 1. 퀴즈 생성 및 전역 상태 저장
  saveAndStartQuiz: async (payload) => {
    // 1.1 사전 체크 시작
  const { user } = useAuthStore.getState();
    // 1.2 로그인체크
  if (!user) {
    set({ error: "로그인이 필요한 서비스입니다." });
    return;
  }
  // 1.3 한도 체크 (클라이언트 측 선제 차단)
 if (user.quiz_count_today >= user.quiz_limit_daily) {
    set({ 
      error: `오늘 생성 가능한 퀴즈 한도(${user.quiz_limit_daily}회)를 모두 사용하셨습니다. 내일 다시 시도해주세요!` 
    });
    return; 
  }
    // 1.4 로딩 시작 및 에러 초기화
    set({ isGenerating: true, error: null });

    try {
      // 1.5 AuthStore에서 현재 로그인된 유저 ID 가져오기.
      const userId = useAuthStore.getState().user?.id;

      // 1.6 로그인 체크
      if (!userId) {
        throw new Error("로그인이 필요한 서비스입니다.");
      }
      // 1.7 외부 API 함수 호출
      const data = await generateQuiz({
        text: payload.content,
        type: payload.type,
        difficulty: payload.difficulty,
        count: 10, // 고정 문제 수 
      });

      // 1.8 API 성공 후, 다른 전역 상태(유저 한도) 동기화
      await useAuthStore.getState().refreshUserProfile();

    // 1.9 API 응답(data.quizzes)을 UI 상태(questions)로 매핑
    const mappedQuestions: QuizQuestionContent[] = data.quizzes.map((item) => ({
    // id가 API에서 number로 넘어올 경우를 대비해 문자열로 변환
    id: String(item.id), 
  
   // 1.9.1 질문과 해설을 합쳐서 questionText에 저장
   questionText: item.explanation 
    ? `${item.question}\n\n[해설]: ${item.explanation}` 
    : item.question,
    
   // 1.9.2 payload에서 전달받은 타입 유지 (multiple_choice 등)
   type: payload.type as "multiple_choice" | "short_answer",
  
  // 1.9.3 options가 undefined일 수 있으므로 빈 배열로 기본값 처리
   options: item.options || [],
  
   // 1.9.4 API의 answer를 스토어의 correctAnswer로 매핑
   correctAnswer: item.answer,
}));

      // 1.5. 전역 상태(ActiveQuiz) 업데이트
      set({
        activeQuiz: {
          // data.id가 없을 경우를 대비해 임시 ID 부여 (실제 응답값 확인 필요)
          quizId: (data as any).id || (data as any).quiz_id || `temp_${Date.now()}`,
          title: payload.title || "새로운 학습 퀴즈",
          summary: data.summary, // 요약 부분 확인
          type: payload.type,
          difficulty: payload.difficulty,
          questions: mappedQuestions,
        },
        sessionAnswers: [], // 새 퀴즈 시작 시 답변 초기화
        isGenerating: false,
      });

    } catch (err: any) {
      set({ 
        error: err.message || "퀴즈 생성 중 오류가 발생했습니다.", 
        isGenerating: false 
      });
    }
  },

  // 2. 답변 제출 액션 (로컬 상태에만 저장)
  submitAnswer: (questionId, answer, isCorrect) =>
    set((state) => {
      // 답변은 중복되지 않도록 기존 답변을 제거하고 새로운 답변을 추가하여 최신 답변만 유지
      const filteredAnswers = state.sessionAnswers.filter(
        (a) => a.questionId !== questionId
      );
      return {
        sessionAnswers: [
          ...filteredAnswers,
          { questionId, userSelectedAnswer: answer, isCorrect },
        ],
      };
    }),

  // 3. 풀이 결과 제출 (supabase submissions 테이블에 저장)
  submitSession: async (userId) => {
    const { activeQuiz, sessionAnswers } = get();

    if (!activeQuiz) {
      set({ error: "제출할 활성화된 퀴즈가 없습니다." });
      return;
    }

    set({ isSubmitting: true, error: null });

    // 3.1. 최종 통계 계산
    const totalCount = activeQuiz.questions.length; // total_count
    const correctCount = sessionAnswers.filter((a) => a.isCorrect).length; // correct_count
    const score = Math.round((correctCount / totalCount) * 100); // score

    // 3.2. Supabase 'quiz_submissions' 테이블에 저장할 데이터 매핑
    const submissionData: Partial<QuizSubmission> = {
      quiz_id: activeQuiz.quizId, // quiz_id (FK)
      user_id: userId, // user_id (FK)
      // 사용자 답변 배열을 user_answers JSONB 객체 형태로 변환
      user_answers: sessionAnswers.reduce(
        (acc, curr) => ({
          ...acc,
          [curr.questionId]: curr.userSelectedAnswer,
        }),
        {}
      ),
      score: score,
      correct_count: correctCount,
      total_count: totalCount,
      // created_at은 DB에서 DEFAULT CURRENT_TIMESTAMP로 자동 처리
    };

    try {
      // 3.3. Supabase 'quiz_submissions' 테이블에 삽입
      const { error: submissionError } = await supabase
        .from("quiz_submissions")
        .insert([submissionData]);

      if (submissionError) throw new Error(submissionError.message);

      // 3.4. 제출 성공 시, 세션 초기화 및 로딩 종료
      set({
        activeQuiz: null,
        sessionAnswers: [],
        isSubmitting: false,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "퀴즈 제출 중 오류 발생";
      set({ error: errorMessage, isSubmitting: false });
    }
  },

  // 4. 학습 기록 조회 액션
  fetchRecords: async (userId) => {
    set({ isFetchingRecords: true, error: null });
    try {
      // 4.1. submissions와 quizzes 테이블을 JOIN하여 기록과 퀴즈 메타 정보를 함께 가져옴
      const { data: submissions, error } = await supabase
        // submissions 테이블을 기준으로 quizzes 테이블의 title, difficulty, type 필드를 JOIN
        .from("quiz_submissions")
        .select(
          `
                    *, 
                    quizzes (title, difficulty, type)
                `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false }); // 제출 시간 기준으로 최신 기록부터 정렬

      if (error) throw new Error(error.message);

      // 4.2. DB 결과를 UI용 ExtendedQuizRecord 타입으로 변환
      const extendedRecords: ExtendedQuizRecord[] = submissions.map(
        (sub: any) => ({
          ...sub, // Submission 데이터
          quizTitle: sub.quizzes?.title || "제목 없음",
          quizDifficulty: sub.quizzes?.difficulty || "N/A",
          quizType: sub.quizzes?.type || "N/A",
        })
      );

      set({
        records: extendedRecords,
        isFetchingRecords: false,
        error: null,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "학습 기록 불러오기 중 오류 발생";
      set({ error: errorMessage, isFetchingRecords: false });
    }
  },
}));
