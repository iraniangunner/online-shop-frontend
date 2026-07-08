"use server";

import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

const cookieBase = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
};

// ========================
// Login
// ========================
export async function loginAction(prevState: any, formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { isSuccess: false, error: "ایمیل و رمز عبور را وارد کنید" };
  }

  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        isSuccess: false,
        error: data.message || "ایمیل یا رمز عبور اشتباه است",
      };
    }

    const c = await cookies();
    c.set("access_token", data.access_token, {
      ...cookieBase,
      maxAge: data.expires_in,
    });
    c.set("refresh_token", data.refresh_token, {
      ...cookieBase,
      maxAge: 60 * 60 * 24 * 30,
    });

    return { isSuccess: true, error: "" };
  } catch {
    return { isSuccess: false, error: "خطا در برقراری ارتباط با سرور" };
  }
}

// ========================
// Register
// ========================
export async function registerAction(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const password_confirmation = formData.get("password_confirmation") as string;

  if (!name || !email || !password || !password_confirmation) {
    return { isSuccess: false, error: "همه فیلدها را پر کنید" };
  }

  try {
    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, password_confirmation }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errors = data.errors;
      return {
        isSuccess: false,
        error: errors
          ? Object.values(errors).flat().join(" - ")
          : data.message || "خطا در ثبت‌نام",
      };
    }

    return { isSuccess: true, error: "" };
  } catch {
    return { isSuccess: false, error: "خطا در برقراری ارتباط با سرور" };
  }
}

// ========================
// Logout
// ========================
export async function logoutAction() {
  const c = await cookies();
  const accessToken = c.get("access_token")?.value;

  try {
    await fetch(`${API_URL}/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
    });
  } catch {}

  c.delete("access_token");
  c.delete("refresh_token");

  return { isSuccess: true };
}
