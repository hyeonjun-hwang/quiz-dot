import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Separator,
} from "@/components/ui/";
import { toast } from "sonner";

import { Logo } from "@/components/ui/Logo";
import { FileText, Sparkles } from "lucide-react";
import { useAuthStore } from "@/stores/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
//import { KakaoIcon } from "@/components/icons/KakaoIcon";
//import { GoogleIcon } from "@/components/icons/GoogleIcon";

export default function SigninPage() {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // 1. 스토어에서 상태와 액션 가져오기
  const {
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithKakao,
    isLoading,
    error,
    setError,
  } = useAuthStore();

  // 2. 통합 이메일 인증 핸들러

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // 이전 에러 초기화

    try {
      if (isLogin) {
        await signInWithEmail(email, password);

        // 로그인 성공 토스트
        toast.success("로그인 성공!!", {
          description: "반가습니다! 학습을 시작해볼까요?",
        });

        // QuizCreationPage로 바로 이동
        navigate("/quiz/create");
      } else {
        await signUpWithEmail(email, password, name.trim() || undefined);

        // 회원가입 성공 토스트
        toast.success("회원가입 신청 완료!", {
          description: "이메일함에서 인증 링크를 확인해주세요.",
        });
      }
    } catch (err: any) {
      // 실패 시 토스트 (Store에서 throw error 처리)
      toast.error("인증 실패", {
        description: err.message || "정보를 다시 확인해주세요.",
      });
    }
  };
  // 3. 모드 전환 핸들러 (에러 초기화 포함)
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setName("");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-linear-to-b from-blue-50 to-background">
      <div className="w-full max-w-md space-y-8">
        {/* 상단 히어로 섹션 */}
        <div className="text-center space-y-4">
          <Logo className="text-4xl justify-center mx-auto" />
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">AI 기반 맞춤형 퀴즈 학습</h1>
            <p className="text-muted-foreground">
              텍스트와 PDF를 업로드하면 AI가 자동으로 퀴즈를 생성합니다
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-background border shadow-sm">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-xs text-center font-medium">
                AI 퀴즈 생성
              </span>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-background border shadow-sm">
              <FileText className="h-5 w-5 text-primary" />
              <span className="text-xs text-center font-medium">
                AI 요약 생성
              </span>
            </div>
          </div>
        </div>

        {/* 로그인/회원가입 카드 */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">
              {isLogin ? "로그인" : "회원가입"}
            </CardTitle>
            <CardDescription>
              {isLogin
                ? "계정에 로그인하여 학습을 시작하세요"
                : "새 계정을 만들어 학습을 시작하세요"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 소셜 로그인 버튼 세션 */}
            <div className="grid gap-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={signInWithGoogle}
                disabled={isLoading}
              >
                {/*<GoogleIcon className="mr-2 h-5 w-5" />*/}
                Google로 {isLogin ? "로그인" : "가입"}
              </Button>
              <Button
                variant="outline"
                className="w-full bg-[#FEE500] hover:bg-[#FDD835] text-black border-[#FEE500]"
                onClick={signInWithKakao}
                disabled={isLoading}
              >
                {/*<KakaoIcon className="mr-2 h-5 w-5" />*/}
                Kakao로 {isLogin ? "로그인" : "가입"}
              </Button>
            </div>

            <div className="relative">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
                또는 이메일로 {isLogin ? "로그인" : "가입"}
              </span>
            </div>

            {/* 이메일 폼 섹션 */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">이름 (선택사항)</Label>
                  <Input
                    id="name"
                    placeholder="홍길동"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="이메일을 입력해주세요"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="비밀번호를 입력해주세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md animate-in fade-in zoom-in duration-200">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "처리 중..." : isLogin ? "로그인" : "회원가입"}
              </Button>
            </form>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                {isLogin ? "계정이 없으신가요?" : "이미 계정이 있으신가요?"}
              </span>{" "}
              <button
                type="button"
                onClick={toggleMode}
                className="text-primary hover:underline font-semibold"
                disabled={isLoading}
              >
                {isLogin ? "회원가입" : "로그인"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
