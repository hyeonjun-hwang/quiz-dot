import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
// 폼 유효성 검사
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
// 상태 관리 스토어
import { useAuthStore } from "@/stores/auth";
// UI 컴포넌트
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Separator,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/";
import { toast } from "sonner";
import { Logo } from "@/components/ui/Logo";

import { FileText, Sparkles } from "lucide-react";

export default function SigninPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const {
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithKakao,
    isLoading,
  } = useAuthStore();

  // 1. 유효성 검사 스키마
  const authSchema = useMemo(() => {
    return z
      .object({
        // 로그인 시 에는 이름 검사 제외
        name: isLogin
          ? z.string().optional()
          : // 회원가입 시에는 이름 검사 포함
            z
              .string()
              .min(2, { message: "이름은 최소 2자 이상이어야 합니다." })
              .max(10, { message: "이름은 최대 10자 이하여야 합니다." })
              .transform((val) => (val ? val.replace(/\s+/g, "") : val)),
        email: z
          .email({ message: "유효한 이메일 주소를 입력해주세요." })
          .trim(),
        password: z
          .string()
          .min(8, { message: "비밀번호는 최소 8자 이상이어야 합니다." }),
        //.regex(/[a-zA-Z]/, { message: "영문자가 최소 하나 이상 포함되어야 합니다." })
        //.regex(/[0-9]/, { message: "숫자가 최소 하나 이상 포함되어야 합니다." })
        //.regex(/[^a-zA-Z0-9]/, { message: "특수문자가 최소 하나 이상 포함되어야 합니다." }),

        // 로그인 시에는 체크하지 않고, 가입 시에만 문자열 길이를 체크하도록 설정
        confirmPassword: isLogin
          ? z.string().optional()
          : z.string().min(1, { message: "비밀번호를 다시 입력해주세요." }),
      })
      .refine(
        (data) => {
          // 회원가입 모드에서만 비밀번호 일치 확인
          if (!isLogin && data.password !== data.confirmPassword) {
            return false;
          }
          return true;
        },
        {
          message: "비밀번호가 일치하지 않습니다.",
          path: ["confirmPassword"],
        }
      );
  }, [isLogin]);

  type AuthFormValues = z.infer<typeof authSchema>;

  // 2. Form 초기화
  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
    },
  });

  // 3. 제출 핸들러
  async function onSubmit(values: AuthFormValues) {
    try {
      if (isLogin) {
        await signInWithEmail(values.email, values.password);
        toast.success("로그인 성공!", { description: "반갑습니다!" });
        navigate("/");
      } else {
        await signUpWithEmail(
          values.email,
          values.password,
          values.name || undefined
        );
        toast.success("회원가입 신청 완료!", {
          description: "이메일함에서 인증 링크를 확인해주세요.",
        });
        setIsLogin(true); // 가입 후 로그인 모드로 자동 전환
      }
    } catch (err: any) {
      toast.error("오류 발생", {
        description: err.message || "다시 시도해주세요.",
      });
    }
  }

  // 4. 모드 전환 시 데이터 초기화
  const toggleMode = () => {
    setIsLogin(!isLogin);
    form.reset();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-linear-to-b from-blue-50 to-background">
      <div className="w-full max-w-md space-y-8">
        {/* 히어로 섹션 */}
        <div className="text-center space-y-4">
          <Logo className="text-4xl justify-center mx-auto" />
          <h1 className="text-2xl font-bold">AI 기반 맞춤형 퀴즈 학습</h1>
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-background border shadow-sm">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium">AI 퀴즈 생성</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-background border shadow-sm">
              <FileText className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium">AI 요약 생성</span>
            </div>
          </div>
        </div>

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
            {/* 소셜 로그인 */}
            <div className="grid gap-2">
              <Button
                variant="outline"
                onClick={signInWithGoogle}
                disabled={isLoading}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google로 {isLogin ? "로그인" : "가입"}
              </Button>
              <Button
                variant="outline"
                className="bg-[#FEE500] hover:bg-[#FDD835] text-black border-none"
                onClick={signInWithKakao}
                disabled={isLoading}
              >
                {" "}
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 3C6.477 3 2 6.477 2 10.75C2 13.32 3.617 15.594 6.089 16.974L5.151 20.377C5.082 20.651 5.388 20.867 5.629 20.705L9.761 17.937C10.485 18.051 11.234 18.125 12 18.125C17.523 18.125 22 14.773 22 10.75C22 6.477 17.523 3 12 3Z"
                    fill="#3C1E1E"
                  />
                </svg>
                Kakao로 {isLogin ? "로그인" : "가입"}
              </Button>
            </div>

            <div className="relative py-2">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
                또는 이메일로 {isLogin ? "로그인" : "가입"}
              </span>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {!isLogin && (
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="animate-in fade-in slide-in-from-top-2 duration-200">
                        <FormLabel>이름</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="이름을 입력해주세요"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>이메일</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="이메일을 입력해주세요"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>비밀번호</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="비밀번호를 입력해주세요"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!isLogin && (
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem className="animate-in fade-in slide-in-from-top-2 duration-200">
                        <FormLabel>비밀번호 확인</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="비밀번호를 다시 입력해주세요"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "처리 중..." : isLogin ? "로그인" : "회원가입"}
                </Button>
              </form>
            </Form>

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
