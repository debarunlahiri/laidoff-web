import { Suspense } from "react";
import AuthForm from "@/components/auth/auth-form";
import { SkeletonLines } from "@/components/ui/skeleton";
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="auth-loading"><SkeletonLines lines={3} /></div>}>
      <AuthForm mode="login" />
    </Suspense>
  );
}
