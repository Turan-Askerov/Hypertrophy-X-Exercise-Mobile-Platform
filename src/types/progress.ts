export type ProgressMetric = "weight" | "weight-reps";
export type ProgressPeriod = "monthly" | "yearly" | "all";

export type TopProgressItem = {
  exercise_id: string;
  exercise: string;
  muscle: string;
  metric_type: "weight_kg" | "reps";
  first_value: number;
  first_date: string;
  current_pr_value: number;
  current_pr_date: string;
  last_increase_date?: string;
  diff: number;
  percentage: number;
  sessions_count?: number;
  is_compound?: boolean;
};

export type PersonalRecordItem = {
  exercise_id: string;
  exercise: string;
  muscle: string;
  primary_muscles?: string[];
  category?: string;
  record_value: number;
  metric_type: "weight_kg" | "reps";
  max_weight: number;
  max_reps: number;
  date: string;
};

export type ProgressChartDetail = {
  set: number;
  reps: number;
  weight_kg: number;
  value: number;
};

export type ProgressChartResponse = {
  success: boolean;
  exercise: string;
  exercise_name: string;
  canonical_exercise_id: string;
  exercise_id: string;
  metric_type: "weight_kg" | "reps";
  metric_label: string;
  is_bodyweight: boolean;
  is_legacy_exercise: boolean;
  labels: string[];
  data: number[];
  values: number[];
  details: ProgressChartDetail[];
};

export type ProgressResponse = {
  volume_timeline: {
    date: string;
    volume: number;
    session: string;
  }[];
  weekly_averages: {
    week: string;
    avg_volume: number;
  }[];
  personal_records: PersonalRecordItem[];
  top_progress: TopProgressItem[];
  stats?: Record<string, unknown>;
};
