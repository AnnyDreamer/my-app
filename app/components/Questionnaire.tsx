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
        // 获取问题数据
        const questionsRes = await fetch(`${API_BASE_URL}/api/questions`);
        if (!questionsRes.ok) {
          throw new Error("Failed to fetch questions");
        }
        const questionsData = await questionsRes.json();
        console.log("获取到的问题数据:", questionsData);
        setQuestions(questionsData);

        // 获取体质数据
        const constitutionsRes = await fetch(
          `${API_BASE_URL}/api/constitution-types`
        );
        if (!constitutionsRes.ok) {
          throw new Error("Failed to fetch constitution types");
        }
        const constitutionsData = await constitutionsRes.json();
        console.log("获取到的体质数据:", constitutionsData);

        // 确保体质数据不为空
        if (!constitutionsData || constitutionsData.length === 0) {
          throw new Error("体质数据为空");
        }

        setConstitutions(constitutionsData);
        setLoading(false);
      } catch (err) {
        console.error("获取数据时出错:", err);
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
    if (constitutions.length === 0) {
      console.error("体质数据未加载");
      setError("体质数据未加载，请刷新页面重试");
      return;
    }

    console.log("开始计算结果");
    console.log("constitutions:", constitutions);
    console.log("questions:", questions);
    console.log("answers:", answers);

    // 初始化所有体质的分数
    const constitutionScores: Record<string, { total: number; count: number }> =
      {};
    constitutions.forEach((constitution) => {
      constitutionScores[constitution.name] = { total: 0, count: 0 };
    });

    // 遍历所有答案
    Object.entries(answers).forEach(([questionId, answerValue]) => {
      const question = questions.find((q) => q.id === questionId);
      if (question) {
        const score = parseInt(answerValue);
        if (!isNaN(score)) {
          // 遍历该问题相关的所有体质
          question.relatedConstitutions.forEach((constitutionName) => {
            if (constitutionScores[constitutionName]) {
              constitutionScores[constitutionName].total += score;
              constitutionScores[constitutionName].count += 1;
            } else {
              console.warn(`未找到体质: ${constitutionName}`);
            }
          });
        }
      } else {
        console.warn(`未找到问题: ${questionId}`);
      }
    });

    console.log("计算后的 constitutionScores:", constitutionScores);

    // 计算最终分数
    const finalScores: ConstitutionScore[] = [];
    Object.entries(constitutionScores).forEach(([name, { total, count }]) => {
      if (count > 0) {
        const constitution = constitutions.find((c) => c.name === name);
        if (constitution) {
          const averageScore = (total / count) * 20;
          finalScores.push({
            id: constitution.id,
            name: constitution.name,
            score: Math.round(averageScore * 10) / 10,
          });
        }
      }
    });

    console.log("最终结果:", finalScores);
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
          <div className="rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-center mb-6">测评结果</h2>
            <div className="space-y-6">
              {result.map((score) => {
                const constitution = constitutions.find(
                  (c) => c.id === score.id
                );
                return (
                  <div
                    key={score.id}
                    className="space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-lg">{score.name}</span>
                      <span
                        className={`font-semibold text-xl ${
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
                    {constitution && (
                      <div className="mt-4 space-y-2">
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          <span className="font-medium">特征描述：</span>
                          {constitution.description}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          <span className="font-medium">调理建议：</span>
                          {constitution.recommendation}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {constitution.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-gray-700 rounded-lg">
                <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                  体质判定
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {(() => {
                    const pingheScore =
                      result.find((s) => s.name === "平和质")?.score ?? 0;
                    const otherScores = result.filter(
                      (s) => s.name !== "平和质"
                    );
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
