import { Suspense } from "react";
import { PaymentCallbackContent } from "@/app/payment/callback/PaymentCallbackContent";

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          در حال بارگذاری...
        </div>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
}
