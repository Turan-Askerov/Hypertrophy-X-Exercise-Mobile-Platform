import * as SecureStore from "expo-secure-store";
import { createTokenStorage } from "./create-token-storage.ts";

export const tokenStorage = createTokenStorage({
  get: (key) => SecureStore.getItemAsync(key),
  set: (key, value) => SecureStore.setItemAsync(key, value),
  remove: (key) => SecureStore.deleteItemAsync(key),
});