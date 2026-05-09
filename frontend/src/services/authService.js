import { post, get, saveTokens, clearTokens } from "./api";

export const registerUser = async (registrationData) => {
  console.log("Registering with data:", registrationData);
  const result = await post("/auth/register/", registrationData);
  console.log("Registration result:", result);
  return result;
};

export const loginUser = async (username, password) => {
  const result = await post("/auth/login/", { username, password });
  if (result.data?.access) {
    saveTokens(result.data.access, result.data.refresh);
    if (result.data.user) {
      localStorage.setItem('user', JSON.stringify(result.data.user));
    }
  }
  return result;
};

export const logoutUser = () => clearTokens();

export const getCurrentUser = async () => {
  const result = await get("/auth/user/");
  if (result.data && !result.error) {
    localStorage.setItem('user', JSON.stringify(result.data));
  }
  return result;
};