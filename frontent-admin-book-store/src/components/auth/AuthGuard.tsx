// components/auth/AuthGuard.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { getProfileUser } from "@/stores/slices/auth.slice";
import { Spin } from "antd";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export default function AuthGuard({
  children,
  requireAuth = true,
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { isAuth, loading, user } = useAppSelector((state) => state.auth);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (isAuth && !user) {
        try {
          await dispatch(getProfileUser()).unwrap();
        } catch (error) {
          console.error("Get profile failed:", error);
        }
      }
      setIsChecking(false);
    };

    checkAuth();
  }, [isAuth, user, dispatch]);

  useEffect(() => {
    if (isChecking || loading) return;

    console.log("Auth check:", { isAuth, requireAuth, pathname });

    if (requireAuth) {
      if (!isAuth) {
        const currentPath = `${pathname}${
          searchParams.toString() ? `?${searchParams.toString()}` : ""
        }`;
        router.replace(`/login?from=${encodeURIComponent(currentPath)}`);
      }
    } else {
      if (isAuth) {
        const redirectTo = searchParams.get("from") || "/reports";
        router.replace(decodeURIComponent(redirectTo));
      }
    }
  }, [
    isAuth,
    loading,
    requireAuth,
    isChecking,
    pathname,
    searchParams,
    router,
  ]);

  if (isChecking || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large"/>
      </div>
    );
  }

  if (requireAuth && !isAuth) {
    return null;
  }

  if (!requireAuth && isAuth) {
    return null;
  }

  return <>{children}</>;
}
