import { useState, useEffect } from "react";
import { QuizLayout } from "../../components/layout/QuizLayout";
import { supabase } from "../../utils/supabase";
import { useAuthStore } from "../../stores/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { MessageSquare, Send, Plus, Clock, CheckCircle2, MessageCircle, ArrowLeft, Reply, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";

type InquiryStatus = "pending" | "answered";

interface Reply {
  id: string;
  author: string;
  role: "admin" | "user";
  content: string;
  createdAt: string;
}

interface Inquiry {
  id: string;
  category: string;
  subject: string;
  message: string;
  email: string;
  status: InquiryStatus;
  createdAt: string;
  replies: Reply[];
}

export function ContactBoardPage() {
  const { user } = useAuthStore();
  const [view, setView] = useState<"list" | "detail" | "create">("list");
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [replyContent, setReplyContent] = useState("");
  const [loading, setLoading] = useState(true);

  // 새 문의 작성 폼 state
  const [newCategory, setNewCategory] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newMessage, setNewMessage] = useState("");

  // 수정 모드 state
  const [editingInquiryId, setEditingInquiryId] = useState<string | null>(null);
  const [editSubject, setEditSubject] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editReplyContent, setEditReplyContent] = useState("");

  // Supabase에서 문의 내역 불러오기
  useEffect(() => {
    const fetchInquiries = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // 문의 내역 가져오기
        const { data: inquiriesData, error: inquiriesError } = await supabase.from("inquiries").select("*").eq("user_id", user.id).order("created_at", { ascending: false });

        if (inquiriesError) {
          console.error("문의 내역 불러오기 오류:", inquiriesError);
          throw inquiriesError;
        }

        // 각 문의에 대한 답글 가져오기
        const inquiriesWithReplies = await Promise.all(
          (inquiriesData || []).map(async (inquiry) => {
            const { data: repliesData, error: repliesError } = await supabase.from("inquiry_replies").select("*").eq("inquiry_id", inquiry.id).order("created_at", { ascending: true });

            if (repliesError) {
              console.error("답글 불러오기 오류:", repliesError);
              return {
                id: inquiry.id,
                category: "",
                subject: inquiry.title,
                message: inquiry.content,
                email: user.email || "",
                status: "pending" as InquiryStatus,
                createdAt: inquiry.created_at,
                replies: [],
              };
            }

            return {
              id: inquiry.id,
              category: "",
              subject: inquiry.title,
              message: inquiry.content,
              email: user.email || "",
              status: (repliesData && repliesData.length > 0 ? "answered" : "pending") as InquiryStatus,
              createdAt: inquiry.created_at,
              replies: (repliesData || []).map((reply) => ({
                id: reply.id,
                author: reply.user_id === user.id ? user.email || "user" : "관리자",
                role: (reply.user_id === user.id ? "user" : "admin") as "user" | "admin",
                content: reply.content,
                createdAt: reply.created_at,
              })),
            };
          })
        );

        setInquiries(inquiriesWithReplies);
      } catch (error) {
        console.error("데이터 불러오기 실패:", error);
        toast.error("문의 내역을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();
  }, [user]);

  const handleCreateInquiry = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    try {
      // Supabase에 문의 저장
      const { data, error } = await supabase
        .from("inquiries")
        .insert([
          {
            user_id: user.id,
            title: newSubject,
            content: newMessage,
          },
        ])
        .select();

      if (error) {
        console.error("문의 등록 오류:", error);
        throw new Error(`문의 등록 실패: ${error.message}`);
      }

      // 로컬 state에도 추가 (UI 업데이트용)
      const newInquiry: Inquiry = {
        id: data[0].id,
        category: newCategory,
        subject: newSubject,
        message: newMessage,
        email: newEmail,
        status: "pending",
        createdAt: new Date().toISOString(),
        replies: [],
      };

      setInquiries([newInquiry, ...inquiries]);
      toast.success("문의가 등록되었습니다!");

      // 폼 초기화
      setNewCategory("");
      setNewEmail("");
      setNewSubject("");
      setNewMessage("");
      setView("list");
    } catch (error) {
      console.error("문의 등록 오류:", error);
      toast.error(error instanceof Error ? error.message : "문의 등록에 실패했습니다.");
    }
  };

  const handleAddReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry || !replyContent.trim()) return;

    if (!user) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    try {
      // Supabase에 답글 저장
      const { data, error } = await supabase
        .from("inquiry_replies")
        .insert([
          {
            inquiry_id: selectedInquiry.id,
            user_id: user.id,
            content: replyContent,
          },
        ])
        .select();

      if (error) {
        console.error("답글 등록 오류:", error);
        throw new Error(`답글 등록 실패: ${error.message}`);
      }

      // 로컬 state에도 추가 (UI 업데이트용)
      const newReply: Reply = {
        id: data[0].id,
        author: user.email || "user@example.com",
        role: "user",
        content: replyContent,
        createdAt: new Date().toISOString(),
      };

      const updatedInquiries = inquiries.map((inquiry) => {
        if (inquiry.id === selectedInquiry.id) {
          return {
            ...inquiry,
            replies: [...inquiry.replies, newReply],
          };
        }
        return inquiry;
      });

      setInquiries(updatedInquiries);
      setSelectedInquiry({
        ...selectedInquiry,
        replies: [...selectedInquiry.replies, newReply],
      });
      setReplyContent("");
      toast.success("답글이 등록되었습니다!");
    } catch (error) {
      console.error("답글 등록 오류:", error);
      toast.error(error instanceof Error ? error.message : "답글 등록에 실패했습니다.");
    }
  };

  // 문의 삭제
  const handleDeleteInquiry = async (inquiryId: string) => {
    if (!confirm("정말로 이 문의를 삭제하시겠습니까?")) return;

    try {
      // Supabase에서 답글 먼저 삭제
      const { error: repliesError } = await supabase
        .from("inquiry_replies")
        .delete()
        .eq("inquiry_id", inquiryId);

      if (repliesError) {
        console.error("답글 삭제 오류:", repliesError);
      }

      // 문의 삭제
      const { error } = await supabase
        .from("inquiries")
        .delete()
        .eq("id", inquiryId);

      if (error) {
        throw new Error(`문의 삭제 실패: ${error.message}`);
      }

      setInquiries(inquiries.filter((inq) => inq.id !== inquiryId));
      toast.success("문의가 삭제되었습니다.");
      setView("list");
    } catch (error) {
      console.error("문의 삭제 오류:", error);
      toast.error(error instanceof Error ? error.message : "문의 삭제에 실패했습니다.");
    }
  };

  // 문의 수정
  const handleUpdateInquiry = async (inquiryId: string) => {
    if (!editSubject.trim() || !editMessage.trim()) {
      toast.error("제목과 내용을 모두 입력해주세요.");
      return;
    }

    try {
      const { error } = await supabase
        .from("inquiries")
        .update({
          title: editSubject,
          content: editMessage,
        })
        .eq("id", inquiryId);

      if (error) {
        throw new Error(`문의 수정 실패: ${error.message}`);
      }

      // 로컬 state 업데이트
      setInquiries(
        inquiries.map((inq) =>
          inq.id === inquiryId
            ? { ...inq, subject: editSubject, message: editMessage }
            : inq
        )
      );

      if (selectedInquiry?.id === inquiryId) {
        setSelectedInquiry({
          ...selectedInquiry,
          subject: editSubject,
          message: editMessage,
        });
      }

      setEditingInquiryId(null);
      toast.success("문의가 수정되었습니다.");
    } catch (error) {
      console.error("문의 수정 오류:", error);
      toast.error(error instanceof Error ? error.message : "문의 수정에 실패했습니다.");
    }
  };

  // 답글 삭제
  const handleDeleteReply = async (replyId: string) => {
    if (!confirm("정말로 이 답글을 삭제하시겠습니까?")) return;

    try {
      const { error } = await supabase
        .from("inquiry_replies")
        .delete()
        .eq("id", replyId);

      if (error) {
        throw new Error(`답글 삭제 실패: ${error.message}`);
      }

      // 로컬 state 업데이트
      if (selectedInquiry) {
        const updatedReplies = selectedInquiry.replies.filter((r) => r.id !== replyId);
        setSelectedInquiry({
          ...selectedInquiry,
          replies: updatedReplies,
        });

        setInquiries(
          inquiries.map((inq) =>
            inq.id === selectedInquiry.id
              ? { ...inq, replies: updatedReplies }
              : inq
          )
        );
      }

      toast.success("답글이 삭제되었습니다.");
    } catch (error) {
      console.error("답글 삭제 오류:", error);
      toast.error(error instanceof Error ? error.message : "답글 삭제에 실패했습니다.");
    }
  };

  // 답글 수정
  const handleUpdateReply = async (replyId: string) => {
    if (!editReplyContent.trim()) {
      toast.error("답글 내용을 입력해주세요.");
      return;
    }

    try {
      const { error } = await supabase
        .from("inquiry_replies")
        .update({
          content: editReplyContent,
        })
        .eq("id", replyId);

      if (error) {
        throw new Error(`답글 수정 실패: ${error.message}`);
      }

      // 로컬 state 업데이트
      if (selectedInquiry) {
        const updatedReplies = selectedInquiry.replies.map((r) =>
          r.id === replyId ? { ...r, content: editReplyContent } : r
        );
        setSelectedInquiry({
          ...selectedInquiry,
          replies: updatedReplies,
        });

        setInquiries(
          inquiries.map((inq) =>
            inq.id === selectedInquiry.id
              ? { ...inq, replies: updatedReplies }
              : inq
          )
        );
      }

      setEditingReplyId(null);
      toast.success("답글이 수정되었습니다.");
    } catch (error) {
      console.error("답글 수정 오류:", error);
      toast.error(error instanceof Error ? error.message : "답글 수정에 실패했습니다.");
    }
  };

  // 목록 뷰
  if (view === "list") {
    return (
      <QuizLayout>
        <div className="container max-w-4xl mx-auto p-4 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1>문의 게시판</h1>
              <p className="text-muted-foreground mt-1">문의사항을 등록하고 답변을 확인하세요</p>
            </div>
            <Button onClick={() => setView("create")}>
              <Plus className="h-4 w-4 mr-2" />
              문의 작성
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">문의 내역을 불러오는 중...</p>
            </div>
          ) : inquiries.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">아직 문의 내역이 없습니다.</p>
              <Button onClick={() => setView("create")}>
                <Plus className="h-4 w-4 mr-2" />첫 문의 작성하기
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {inquiries.map((inquiry) => (
                <Card
                  key={inquiry.id}
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => {
                    setSelectedInquiry(inquiry);
                    setView("detail");
                  }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary" className="rounded-full w-8 h-8 flex items-center justify-center p-0">
                            {user?.email?.[0]?.toUpperCase() || "U"}
                          </Badge>
                          <Badge variant={inquiry.status === "answered" ? "default" : "outline"}>
                            {inquiry.status === "answered" ? (
                              <>
                                <CheckCircle2 className="h-3 w-3 mr-1" /> 답변 완료
                              </>
                            ) : (
                              <>
                                <Clock className="h-3 w-3 mr-1" /> 대기 중
                              </>
                            )}
                          </Badge>
                        </div>
                        <CardTitle className="text-base">{inquiry.subject}</CardTitle>
                        <CardDescription className="line-clamp-1">{inquiry.message}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span>{new Date(inquiry.createdAt).toLocaleDateString("ko-KR")}</span>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          <span>{inquiry.replies.length}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </QuizLayout>
    );
  }

  // 상세 뷰
  if (view === "detail" && selectedInquiry) {
    return (
      <QuizLayout>
        <div className="container max-w-4xl mx-auto p-4 space-y-6">
          <Button variant="ghost" onClick={() => setView("list")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            목록으로
          </Button>

          {/* 문의 내용 */}
          <Card>
            <CardHeader>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="rounded-full w-8 h-8 flex items-center justify-center p-0">
                      {user?.email?.[0]?.toUpperCase() || "U"}
                    </Badge>
                    <Badge variant={selectedInquiry.status === "answered" ? "default" : "outline"}>
                      {selectedInquiry.status === "answered" ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 mr-1" /> 답변 완료
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3 mr-1" /> 대기 중
                        </>
                      )}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    {editingInquiryId === selectedInquiry.id ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingInquiryId(null)}
                        >
                          취소
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleUpdateInquiry(selectedInquiry.id)}
                        >
                          저장
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingInquiryId(selectedInquiry.id);
                            setEditSubject(selectedInquiry.subject);
                            setEditMessage(selectedInquiry.message);
                          }}
                        >
                          <Edit2 className="h-4 w-4 mr-1" />
                          수정
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteInquiry(selectedInquiry.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          삭제
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                {editingInquiryId === selectedInquiry.id ? (
                  <div className="space-y-3">
                    <div>
                      <Label>제목</Label>
                      <Input
                        value={editSubject}
                        onChange={(e) => setEditSubject(e.target.value)}
                        placeholder="제목을 입력하세요"
                      />
                    </div>
                    <div>
                      <Label>내용</Label>
                      <Textarea
                        value={editMessage}
                        onChange={(e) => setEditMessage(e.target.value)}
                        placeholder="내용을 입력하세요"
                        rows={6}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <CardTitle>{selectedInquiry.subject}</CardTitle>
                    <CardDescription>
                      {selectedInquiry.email} • {new Date(selectedInquiry.createdAt).toLocaleString("ko-KR")}
                    </CardDescription>
                  </>
                )}
              </div>
            </CardHeader>
            {editingInquiryId !== selectedInquiry.id && (
              <CardContent>
                <p className="whitespace-pre-wrap">{selectedInquiry.message}</p>
              </CardContent>
            )}
          </Card>

          {/* 답글 목록 */}
          {selectedInquiry.replies.length > 0 && (
            <div className="space-y-4">
              <h3 className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                답글 {selectedInquiry.replies.length}개
              </h3>
              {selectedInquiry.replies.map((reply) => (
                <Card key={reply.id} className={reply.role === "admin" ? "bg-blue-50 border-blue-200" : ""}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{reply.author}</span>
                        {reply.role === "admin" && (
                          <Badge variant="default" className="text-xs">
                            관리자
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">{new Date(reply.createdAt).toLocaleString("ko-KR")}</span>
                      </div>
                      {reply.role === "user" && reply.author === user?.email && (
                        <div className="flex gap-2">
                          {editingReplyId === reply.id ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingReplyId(null)}
                              >
                                취소
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleUpdateReply(reply.id)}
                              >
                                저장
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingReplyId(reply.id);
                                  setEditReplyContent(reply.content);
                                }}
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteReply(reply.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {editingReplyId === reply.id ? (
                      <Textarea
                        value={editReplyContent}
                        onChange={(e) => setEditReplyContent(e.target.value)}
                        placeholder="답글 내용을 입력하세요"
                        rows={4}
                      />
                    ) : (
                      <p className="whitespace-pre-wrap">{reply.content}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* 답글 작성 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Reply className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">답글 작성</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddReply} className="space-y-4">
                <Textarea placeholder="답글을 입력하세요..." value={replyContent} onChange={(e) => setReplyContent(e.target.value)} rows={4} required />
                <Button type="submit" className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  답글 등록
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </QuizLayout>
    );
  }

  // 작성 뷰
  return (
    <QuizLayout>
      <div className="container max-w-3xl mx-auto p-4 space-y-6">
        <Button variant="ghost" onClick={() => setView("list")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          목록으로
        </Button>

        <div>
          <h1>문의 작성</h1>
          <p className="text-muted-foreground mt-1">궁금한 점이나 문제가 있으신가요? 언제든 문의해주세요</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <CardTitle>문의 작성</CardTitle>
            </div>
            <CardDescription>상세한 내용을 작성해주시면 더 정확한 답변을 드릴 수 있습니다</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateInquiry} className="space-y-6">
              {/* 문의 유형 */}
              <div className="space-y-2">
                <Label htmlFor="category">문의 유형</Label>
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="문의 유형을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quiz">퀴즈 생성 문제</SelectItem>
                    <SelectItem value="payment">결제 및 구독</SelectItem>
                    <SelectItem value="account">계정 문제</SelectItem>
                    <SelectItem value="feature">기능 제안</SelectItem>
                    <SelectItem value="bug">버그 신고</SelectItem>
                    <SelectItem value="etc">기타</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 이메일 */}
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input id="email" type="email" placeholder="답변 받을 이메일 주소" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required />
              </div>

              {/* 제목 */}
              <div className="space-y-2">
                <Label htmlFor="subject">제목</Label>
                <Input id="subject" placeholder="문의 제목을 입력하세요" value={newSubject} onChange={(e) => setNewSubject(e.target.value)} required />
              </div>

              {/* 문의 내용 */}
              <div className="space-y-2">
                <Label htmlFor="message">문의 내용</Label>
                <Textarea id="message" placeholder="문의 내용을 상세히 작성해주세요" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} rows={8} required />
                <p className="text-xs text-muted-foreground">최소 10자 이상 작성해주세요</p>
              </div>

              {/* 제출 버튼 */}
              <Button type="submit" className="w-full" size="lg">
                <Send className="h-4 w-4 mr-2" />
                문의 등록
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 추가 안내 */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <h3 className="text-sm">💡 빠른 답변을 위한 팁</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>발생한 문제를 구체적으로 설명해주세요</span>
                </li>
                {/* <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>스크린샷이 있다면 함께 첨부해주시면 좋습니다</span>
                </li>  */}
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>일반적으로 1-2 영업일 내에 답변 드립니다</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </QuizLayout>
  );
}
