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

import { GoogleIcon, KakaoIcon } from "@/components/auth/social-icon";
import { SigninHeader } from "@/components/auth/sign-in-header";

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
        navigate("/quiz/create");
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
        <SigninHeader />

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
                <GoogleIcon className="mr-1 h-4 w-4" />
                Google로 {isLogin ? "로그인" : "가입"}
              </Button>
              <Button
                variant="outline"
                className="bg-[#FEE500] hover:bg-[#FDD835] text-black border-none"
                onClick={signInWithKakao}
                disabled={isLoading}
              >
                <KakaoIcon className="mr-2 h-4 w-4" />
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
