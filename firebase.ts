export interface LevelGroup {
  level: string;
  questions: string[];
}

export interface QuestionSet {
  role: string;
  levels: LevelGroup[];
}

export interface AnalysisResponse {
  substanceScore: number;
  fluffPercentage: number;
  weaknesses: string[];
  identifiedBuzzwords: string[];
  improvedAnswer: string;
  verdict: string;
}

export type AppStep = "landing" | "interview" | "analyzing" | "question_analysis" | "overall_report" | "prediction";

export interface OverallReport {
  overall_score: number;
  consultant_verdict: string;
  key_themes: string[];
  growth_areas: string[];
  improvement_plan: string[];
  job_fit_prediction: "High" | "Medium" | "Low";
  readiness_summary: string;
}

export { Type } from "@google/genai";
