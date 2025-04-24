"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// API 配置
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Option {
  value: string;
  text: string;
  score: number;
}

interface Question {
  id: string;
  question: string;
  type: string;
  options: Option[];
  relatedConstitutions: string[];
  score_weights: number[];
}

interface Constitution {
  id: string;
  name: string;
  description: string;
  recommendation: string;
  tags: string[];
}

interface ConstitutionScore {
  id: string;
  name: string;
  score: number;
}

export function Questionnaire() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [constitutions, setConstitutions] = useState<Constitution[]>([]);
  const [result, setResult] = useState<ConstitutionScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const questionsRes = await fetch(`${API_BASE_URL}/api/questions`);
        if (!questionsRes.ok) {
          throw new Error("Failed to fetch questions");
        }
        const questionsData = await questionsRes.json();
        setQuestions(questionsData);

        const constitutionsRes = await fetch(
          `${API_BASE_URL}/api/constitution-types`
        );
        if (!constitutionsRes.ok) {
          throw new Error("Failed to fetch constitution types");
        }
        const constitutionsData = await constitutionsRes.json();
        setConstitutions(constitutionsData);

        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const calculateResult = () => {
    const constitutionScores: Record<string, { total: number; count: number }> =
      {};
    constitutions.forEach((constitution) => {
      constitutionScores[constitution.id] = { total: 0, count: 0 };
    });

    Object.entries(answers).forEach(([questionId, answerValue]) => {
      const question = questions.find((q) => q.id === questionId);
      if (question) {
        const selectedOption = question.options.find(
          (opt) => opt.value === answerValue
        );
        if (selectedOption) {
          question.relatedConstitutions.forEach((constitutionId) => {
            constitutionScores[constitutionId].total += selectedOption.score;
            constitutionScores[constitutionId].count += 1;
          });
        }
      }
    });

    const finalScores: ConstitutionScore[] = Object.entries(constitutionScores)
      .map(([id, { total, count }]) => {
        const constitution = constitutions.find((c) => c.id === id);
        if (!constitution) return null;

        const averageScore = count > 0 ? (total / count) * 20 : 0;
        return {
          id,
          name: constitution.name,
          score: Math.round(averageScore * 10) / 10,
        };
      })
      .filter((score): score is ConstitutionScore => score !== null);

    setResult(finalScores);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 p-4 rounded-lg">
          <h2 className="text-red-800 font-semibold">Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto p-4">
        {/* <h1 className=" font-bold mb-8">中医体质测评</h1> */}

        {!result.length ? (
          <div className="space-y-4">
            {questions.map((question, index) => (
              <div key={question.id}>
                <div>
                  <h2 className="text-base font-medium">
                    {index + 1} . {question.question}
                  </h2>
                </div>
                <div className="flex gap-2 mt-2">
                  {question.options.map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center space-x-2 px-3 py-1 rounded cursor-pointer transition-colors duration-200 ${
                        answers[question.id] === option.value
                          ? "bg-blue-50 dark:bg-blue-900"
                          : "hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      <Input
                        type="radio"
                        name={question.id}
                        value={option.value}
                        checked={answers[question.id] === option.value}
                        onChange={() => handleAnswer(question.id, option.value)}
                        className="h-3 w-3 text-blue-600"
                      />
                      <span className="text-sm">{option.text}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg shadow-md ">
            <h2 className="text-2xl font-bold text-center mb-6">测评结果</h2>
            <div className="space-y-4">
              {result.map((score) => (
                <div key={score.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{score.name}</span>
                    <span
                      className={`font-semibold ${
                        score.score >= 40
                          ? "text-red-600 dark:text-red-400"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {score.score}分
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        score.score >= 40
                          ? "bg-red-500"
                          : "bg-blue-500 dark:bg-blue-400"
                      }`}
                      style={{ width: `${Math.min(score.score, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-gray-700 rounded-lg">
                <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                  体质判定
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {(() => {
                    const pingheScore =
                      result.find((s) => s.id === "pinghe")?.score ?? 0;
                    const otherScores = result.filter((s) => s.id !== "pinghe");
                    const highScores = otherScores.filter((s) => s.score >= 40);

                    if (
                      pingheScore >= 60 &&
                      otherScores.every((s) => s.score < 30)
                    ) {
                      return "属于平和质";
                    } else if (highScores.length === 1) {
                      return `属于${highScores[0].name}`;
                    } else if (highScores.length > 1) {
                      return "属于混合体质";
                    } else {
                      return "尚未形成明显体质类型";
                    }
                  })()}
                </p>
              </div>
              <button
                onClick={() => setResult([])}
                className="w-full mt-6 py-2 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors duration-200"
              >
                重新测评
              </button>
            </div>
          </div>
        )}

        {!result.length && (
          <div className="mx-auto">
            <Button
              onClick={calculateResult}
              disabled={Object.keys(answers).length !== questions.length}
              className={`w-full py-3 px-6 rounded-lg text-white font-semibold transition-colors duration-200 ${
                Object.keys(answers).length === questions.length
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-400 dark:bg-gray-700 cursor-not-allowed"
              }`}
            >
              查看结果
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
