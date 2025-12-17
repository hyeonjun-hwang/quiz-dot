import { create } from "zustand";
import { supabase } from "@/utils/supabase";

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
  type: string; // quizzes.type(퀴즈 유형)
  difficulty: string; // quizzes.difficulty(퀴즈 난이도)
  questions: QuizQuestionContent[]; // quizzes.quiz_content (JSONB)
}

// --- 4. 퀴즈 풀이 중 사용자가 제출한 답변 기록 (세션 내부) ---
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
    userId: string,
    payload: {
      title?: string;
      difficulty: string;
      type: string;
      content: string;
    }
  ) => Promise<void>;

  // 퀴즈 풀이 중 특정 문제에 대한 답변을 제출하고 기록합니다.
  submitAnswer: (
    questionId: string, // 문제 ID
    answer: string, // 사용자가 선택/입력한 답변
    isCorrect: boolean // 정답
  ) => void;

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

  // 1. 퀴즈 저장 및 세션 시작 액션
  saveAndStartQuiz: async (userId, payload) => {
    set({ isGenerating: true, error: null });

    /*
     * 1.1. 퀴즈 생성 전: users 테이블에서 userId의 quiz_count_today와 quiz_limit_daily를 비교하여
     * 한도를 초과했는지 체크하고, 초과했다면 에러 메세지 설정 후 종료 [서버에서 처리]
     
     * 1.2. 퀴즈 생성 후: quizzes 테이블 저장이 성공하면, users 테이블의 quiz_count_today를 +1 업데이트해야 합니다.
     * 로직은 서버에서 처리 
     */

    try {
      // 통합 서버 API 호출 (Edge Function)
      // 1.3. 서버 API가 퀴즈 생성 + 한도 체크 + DB 저장을 한 번에 수행
      const { data, error } = await supabase.functions.invoke("generate-quiz", {
        body: { userId, ...payload },
      });

      if (error) throw new Error(error.message);
      // 1.4. [users 테이블 업데이트] 퀴즈 저장 성공 시, 오늘 생성 횟수 증가
      // 이 코드는 users 테이블에 접근해야 하므로 실제 useAuthStore에서 진행

      // 1.5. 저장 성공 시, activeQuiz 상태 설정 (풀이 세션 시작)
      set({
        activeQuiz: {
          quizId: data.id, // DB PK (UUID) 사용
          title: data.title,
          type: data.type,
          difficulty: data.difficulty,
          questions: data.quiz_content as QuizQuestionContent[],
        },
        sessionAnswers: [],
        isGenerating: false,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "퀴즈 저장 및 세션 시작 중 오류 발생 (한도 초과 또는 DB 오류)";
      set({ error: errorMessage, isGenerating: false });
    }
  },

  // 2. 답변 제출 액션
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

  // 3. 풀이 결과 제출 (submissions 테이블에 저장) 액션
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
