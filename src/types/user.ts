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
  target_weight?: number | null;
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
export type UserProfile = {
  username: string;
  email?: string | null;
  age?: number | null;
  gender?: string | null;
  height?: number | null;
  weight?: number | null;
  target_weight?: number | null;
  fitness_level?: string | null;
  goal?: string | null;
  days_per_week?: number | null;
  session_time_mins?: number | null;
  new_password?: string | null;
};

export type ChangePasswordRequest = {
  old_password: string;
  new_password: string;
};

export type ChangePasswordResponse = {
  success: boolean;
  token: string;
  masked_email: string;
  message: string;
};

export type ChangePasswordConfirmRequest = {
  token: string;
  code: string;
};

export type EmailUpdateRequest = {
  new_email: string;
};

export type EmailUpdateResponse = {
  success: boolean;
  token: string;
  masked_email: string;
  message: string;
};

export type EmailConfirmRequest = {
  token: string;
  code: string;
};

export type RequestDeleteAccountRequest = {
  password: string;
};

export type RequestDeleteAccountResponse = {
  success: boolean;
  token: string;
  masked_email: string;
  message: string;
};

export type DeleteAccountRequest = {
  password: string;
  token?: string;
  code?: string;
  confirmation?: string;
};
