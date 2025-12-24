import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { Progress } from "./ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface Question {
  id: string;
  question: string;
  type: "multiple" | "short";
  options?: string[];
  answer?: string;
}

interface QuizSolvingProps {
  questions: Question[];
  onSubmit: (answers: Record<string, { answer: string; dontKnow: boolean }>) => void;
}

export function QuizSolving({ questions, onSubmit }: QuizSolvingProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { answer: string; dontKnow: boolean }>>({});

  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers[currentQuestion.id] || { answer: "", dontKnow: false };
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleAnswerChange = (value: string) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: { answer: value, dontKnow: false },
    });
  };

  const handleDontKnowChange = (checked: boolean) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: {
        answer: checked ? "" : currentAnswer.answer,
        dontKnow: checked,
      },
    });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = () => {
    onSubmit(answers);
  };

  return (
    <div className="container max-w-3xl mx-auto p-4 space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            문제 {currentIndex + 1} / {questions.length}
          </span>
          <span>{Math.round(progress)}% 완료</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Q{currentIndex + 1}. {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentQuestion.type === "multiple" && currentQuestion.options ? (
            <RadioGroup
              value={currentAnswer.dontKnow ? "" : currentAnswer.answer}
              onValueChange={handleAnswerChange}
              disabled={currentAnswer.dontKnow}
            >
              {currentQuestion.options.map((option, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`option-${idx}`} />
                  <Label htmlFor={`option-${idx}`} className="cursor-pointer flex-1">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="short-answer">답변</Label>
              <Input
                id="short-answer"
                type="text"
                placeholder="답을 입력하세요"
                value={currentAnswer.dontKnow ? "" : currentAnswer.answer}
                onChange={(e) => handleAnswerChange(e.target.value)}
                disabled={currentAnswer.dontKnow}
              />
            </div>
          )}

          <div className="flex items-center space-x-2 pt-4 border-t">
            <Checkbox
              id="dont-know"
              checked={currentAnswer.dontKnow}
              onCheckedChange={handleDontKnowChange}
            />
            <Label htmlFor="dont-know" className="cursor-pointer text-muted-foreground">
              모르겠음
            </Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          이전
        </Button>

        {currentIndex < questions.length - 1 ? (
          <Button onClick={handleNext}>
            다음
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit}>
            제출하기
          </Button>
        )}
      </div>

      <div className="grid grid-cols-5 gap-2">
        {questions.map((q, idx) => {
          const ans = answers[q.id];
          const isAnswered = ans && (ans.answer || ans.dontKnow);
          const isCurrent = idx === currentIndex;

          return (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(idx)}
              className={`
                p-2 rounded-md text-sm transition-colors
                ${isCurrent ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}
                ${isAnswered && !isCurrent ? "ring-2 ring-success" : ""}
              `}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
