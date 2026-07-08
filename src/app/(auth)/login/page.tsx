import { Suspense } from "react";
import { LoginContent } from "@/app/(auth)/login/LoginContent";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          در حال بارگذاری...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
