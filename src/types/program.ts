// Backend schemas.py (CustomDay, CustomProgramRequest) uyumlu tipler

export type CustomDay = {
  day: string;
  type: string;
  focus: string;
  isRest: boolean;
};

export type CustomProgramRequest = {
  username: string;
  program: CustomDay[][]; // Haftalar listesi (her hafta 7 gün)
};

export type CustomProgramResponse = {
  success: boolean;
  message: string;
  program: CustomDay[][];
  custom_program_updated_at?: string;
  dashboard_preferences?: Record<string, unknown>;
};
