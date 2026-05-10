import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { BookOpen, Clock, CheckCircle2, XCircle, Trophy, RotateCcw, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/theory")({
  head: () => ({ meta: [{ title: "Theory Tests — DriveSchool Pro" }] }),
  component: TheoryPage,
});

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

const CATEGORIES = [
  { id: "highway", label: "Highway Code", icon: "🛣️", count: 40, bestScore: 85, passed: true },
  { id: "signs", label: "Road Signs", icon: "🚦", count: 35, bestScore: 72, passed: false },
  { id: "safety", label: "Vehicle Safety", icon: "🔧", count: 25, bestScore: null, passed: false },
  { id: "hazards", label: "Hazard Perception", icon: "⚠️", count: 20, bestScore: null, passed: false },
];

const SAMPLE_QUESTIONS: Question[] = [
  {
    id: 1,
    question: "What does a solid white line in the centre of the road mean?",
    options: ["You may overtake if safe", "No overtaking allowed", "Road narrows ahead", "Give way to oncoming traffic"],
    correct: 1,
    explanation: "A solid white line means no overtaking is permitted. You must not cross or straddle this line unless it is safe and you need to enter adjoining premises.",
  },
  {
    id: 2,
    question: "At a junction controlled by traffic lights, what does a flashing amber light mean?",
    options: ["Stop and wait", "Proceed with caution", "Give way to pedestrians only", "The lights are about to change to red"],
    correct: 1,
    explanation: "A flashing amber light at a junction means proceed with caution, giving way to pedestrians and other vehicles already in the junction.",
  },
  {
    id: 3,
    question: "What is the minimum following distance on a dry road at 80 km/h?",
    options: ["1 second", "2 seconds", "3 seconds", "4 seconds"],
    correct: 1,
    explanation: "The 2-second rule is the minimum safe following distance in dry conditions. In wet or poor visibility conditions, double this to 4 seconds.",
  },
  {
    id: 4,
    question: "When must you use your headlights?",
    options: ["Only at night", "When visibility is less than 100m", "When visibility is less than 200m", "Only in fog"],
    correct: 1,
    explanation: "You must use headlights when visibility is seriously reduced — generally when you cannot see for more than 100 metres.",
  },
  {
    id: 5,
    question: "What should you do when you see a pedestrian with a white cane at a crossing?",
    options: ["Sound your horn to alert them", "Stop and give way", "Slow down and proceed carefully", "Flash your lights"],
    correct: 1,
    explanation: "A white cane indicates a blind or visually impaired pedestrian. You must stop and give way, ensuring they have safely crossed before proceeding.",
  },
];

type QuizState = "idle" | "active" | "result";

function TheoryPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [quizState, setQuizState] = useState<QuizState>("idle");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(SAMPLE_QUESTIONS.length).fill(null));
  const [timeLeft, setTimeLeft] = useState(45 * 60); // 45 min in seconds
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const startQuiz = (catId: string) => {
    setActiveCategory(catId);
    setQuizState("active");
    setCurrentQ(0);
    setAnswers(Array(SAMPLE_QUESTIONS.length).fill(null));
    setSelectedOption(null);
    setShowExplanation(false);
    setTimeLeft(45 * 60);
  };

  // Countdown timer — ticks every second while quiz is active
  useEffect(() => {
    if (quizState !== "active") return;
    const id = setInterval(() => {
      setTimeLeft((t: number) => {
        if (t <= 1) {
          clearInterval(id);
          setQuizState("result");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizState]);

  const selectOption = (idx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    setShowExplanation(true);
    const newAnswers = [...answers];
    newAnswers[currentQ] = idx;
    setAnswers(newAnswers);
  };

  const next = () => {
    if (currentQ < SAMPLE_QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      setQuizState("result");
    }
  };

  const score = answers.filter((a: number | null, i: number) => a === SAMPLE_QUESTIONS[i].correct).length;
  const pct = Math.round((score / SAMPLE_QUESTIONS.length) * 100);
  const passed = pct >= 70;

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const q = SAMPLE_QUESTIONS[currentQ];

  if (quizState === "active") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 md:px-8 md:py-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-label-sm text-muted-foreground">Question {currentQ + 1} of {SAMPLE_QUESTIONS.length}</p>
            <div className="mt-1 h-2 w-48 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-brand transition-all"
                style={{ width: `${((currentQ + 1) / SAMPLE_QUESTIONS.length) * 100}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-surface-1 px-3 py-2 text-sm font-mono font-semibold text-navy">
            <Clock className="h-4 w-4 text-muted-foreground" />
            {formatTime(timeLeft)}
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-white p-6 shadow-xs">
          <p className="text-lg font-medium text-navy leading-relaxed">{q.question}</p>
          <div className="mt-6 space-y-3">
            {q.options.map((opt, i) => {
              const isSelected = selectedOption === i;
              const isCorrect = i === q.correct;
              const revealed = selectedOption !== null;
              return (
                <button
                  key={i}
                  onClick={() => selectOption(i)}
                  disabled={revealed}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left text-sm transition-all",
                    !revealed && "hover:border-brand-blue hover:bg-brand-blue-light",
                    revealed && isCorrect && "border-success bg-success-light",
                    revealed && isSelected && !isCorrect && "border-danger bg-danger-light",
                    revealed && !isSelected && !isCorrect && "border-border opacity-60",
                    !revealed && "border-border",
                  )}
                >
                  <span className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold",
                    revealed && isCorrect ? "border-success bg-success text-white" :
                    revealed && isSelected && !isCorrect ? "border-danger bg-danger text-white" :
                    "border-current",
                  )}>
                    {["A", "B", "C", "D"][i]}
                  </span>
                  <span className="flex-1">{opt}</span>
                  {revealed && isCorrect && <CheckCircle2 className="h-5 w-5 text-success" />}
                  {revealed && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-danger" />}
                </button>
              );
            })}
          </div>

          {showExplanation && (
            <div className="mt-5 rounded-xl bg-info-light p-4 text-sm text-info">
              <p className="font-semibold mb-1">Explanation</p>
              {q.explanation}
            </div>
          )}

          {selectedOption !== null && (
            <div className="mt-6 flex justify-end">
              <Button variant="primary" size="lg" onClick={next}>
                {currentQ < SAMPLE_QUESTIONS.length - 1 ? "Next question" : "See results"}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (quizState === "result") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 md:px-8 md:py-10">
        <div className="rounded-2xl border border-border bg-white p-8 text-center shadow-xs">
          <div className={cn(
            "mx-auto flex h-24 w-24 items-center justify-center rounded-full text-4xl font-bold",
            passed ? "bg-success-light text-success" : "bg-danger-light text-danger",
          )}>
            {pct}%
          </div>
          <h1 className="mt-6 text-h1 text-navy">{passed ? "Well done!" : "Keep practising"}</h1>
          <p className="mt-2 text-muted-foreground">
            You scored {score} out of {SAMPLE_QUESTIONS.length} questions.
            {passed ? " You've passed this category!" : " You need 70% to pass."}
          </p>
          <Badge variant={passed ? "success" : "danger"} className="mt-4 text-sm px-4 py-1">
            {passed ? "PASSED" : "NOT PASSED"}
          </Badge>

          <div className="mt-8 space-y-3 text-left">
            {SAMPLE_QUESTIONS.map((q, i) => {
              const correct = answers[i] === q.correct;
              return (
                <div key={q.id} className={cn(
                  "flex items-start gap-3 rounded-xl p-3 text-sm",
                  correct ? "bg-success-light" : "bg-danger-light",
                )}>
                  {correct
                    ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    : <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />}
                  <div>
                    <p className="font-medium text-navy">{q.question}</p>
                    {!correct && (
                      <p className="mt-1 text-muted-foreground">
                        Correct: <strong>{q.options[q.correct]}</strong>
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex gap-3">
            <Button variant="secondary" size="lg" className="flex-1" onClick={() => { setQuizState("idle"); setActiveCategory(null); }}>
              Back to categories
            </Button>
            <Button variant="primary" size="lg" className="flex-1" onClick={() => startQuiz(activeCategory!)}>
              <RotateCcw className="mr-1.5 h-4 w-4" /> Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-8 md:py-10">
      <h1 className="text-h1 text-navy">Theory Tests</h1>
      <p className="mt-1 text-sm text-muted-foreground">Practice with timed mock tests. 30 questions · 45-minute limit · 70% to pass.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {CATEGORIES.map((cat) => (
          <div key={cat.id} className="rounded-2xl border border-border bg-white p-6 shadow-xs transition-all hover:shadow-md">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{cat.icon}</span>
                <div>
                  <h3 className="text-h3 text-navy">{cat.label}</h3>
                  <p className="text-sm text-muted-foreground">{cat.count} questions</p>
                </div>
              </div>
              {cat.passed
                ? <Badge variant="success" size="sm">Passed</Badge>
                : cat.bestScore !== null
                ? <Badge variant="warning" size="sm">{cat.bestScore}%</Badge>
                : <Badge variant="default" size="sm">Not started</Badge>
              }
            </div>

            {cat.bestScore !== null && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Best score</span>
                  <span>{cat.bestScore}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className={cn("h-full rounded-full", cat.passed ? "bg-success" : "bg-warning")}
                    style={{ width: `${cat.bestScore}%` }}
                  />
                </div>
              </div>
            )}

            <Button
              variant={cat.passed ? "secondary" : "primary"}
              size="sm"
              className="mt-5 w-full"
              onClick={() => startQuiz(cat.id)}
            >
              <BookOpen className="mr-1.5 h-4 w-4" />
              {cat.bestScore !== null ? "Retake test" : "Start test"}
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-surface-1 p-6">
        <div className="flex items-center gap-3">
          <Trophy className="h-6 w-6 text-warning" />
          <h2 className="text-h3 text-navy">Score history</h2>
        </div>
        <div className="mt-4 space-y-2 text-sm">
          {[
            { date: "9 May 2026", cat: "Highway Code", score: 85, passed: true },
            { date: "7 May 2026", cat: "Highway Code", score: 72, passed: false },
            { date: "5 May 2026", cat: "Road Signs", score: 72, passed: false },
          ].map((h, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg bg-white p-3">
              <div>
                <p className="font-medium text-navy">{h.cat}</p>
                <p className="text-xs text-muted-foreground">{h.date}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-navy">{h.score}%</span>
                <Badge variant={h.passed ? "success" : "danger"} size="sm">{h.passed ? "Pass" : "Fail"}</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
