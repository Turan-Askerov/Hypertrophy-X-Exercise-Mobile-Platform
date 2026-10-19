export type LoginRequest = {
  username: string;
  password: string;
};

export type User = {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: number;
  is_admin: number;
  created_at: string;
  updated_at: string;
  age: number;
  gender: string;
  height: number;
  weight: number;
  fitness_level: string;
  goal: string;
  days_per_week: number;
  session_time_mins: number;
  stagnation_detected: number;
  custom_split: string;
  dashboard_preferences: string;
  daily_nutrition: string;
  admin_role_title: string | null;
  admin_permissions: string | null;
};

export type UserLoginResponse = User & { token: string };

export type AdminLoginResponse = {
  username: string;
  is_admin: true;
  token: string;
};

export type LoginResponse = UserLoginResponse | AdminLoginResponse;