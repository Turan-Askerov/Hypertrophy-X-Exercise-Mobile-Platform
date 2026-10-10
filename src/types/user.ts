export type LoginRequest = {
  username: string;
  password: string;
};

export type RegisterRequest = {
  username: string;
  password: string;
  email?: string;
};

export type RegisterResponse = {
  message: string;
  username: string;
};

export type User = {
  // çıktıdaki 22 alanın hepsi, çıktıdaki sırayla:
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
  custom_split: string; // JSON
  dashboard_preferences: string; // JSON
  daily_nutrition: string; // JSON
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