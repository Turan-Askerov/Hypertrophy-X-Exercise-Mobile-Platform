import type { LoginResponse } from "../types/user";

export function isAdminAccount(res: LoginResponse): boolean {
  // 1. Boolean(res.is_admin) doğruysa true döndür
  if (Boolean(res.is_admin)) {
    return true;
  }
  //    (hem true hem 1 için işler, 0 için işlemez)
  // 2. "role" in res ise res artık UserLoginResponse'tur:
  //    res.role küçük harfe çevrildiğinde "admin" mi? onu döndür
  if ("role" in res) {
    return res.role.toLowerCase() === "admin";
  }
  // 3. diğer her durumda false
  return false;
}