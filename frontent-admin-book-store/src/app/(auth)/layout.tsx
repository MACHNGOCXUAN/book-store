"use client";

import AuthGuard from "@/components/auth/AuthGuard";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requireAuth={false}>
      <div className="bg-gray-100 flex min-h-screen items-center justify-center">
        {children}
      </div>
    </AuthGuard>
  );
}