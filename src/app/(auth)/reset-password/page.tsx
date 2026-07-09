import { Suspense } from "react";
import { ResetPasswordContent } from "./ResetPasswordContent";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          در حال بارگذاری...
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
