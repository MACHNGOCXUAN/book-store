"use client";

import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { getProfileUser } from "@/stores/slices/auth.slice";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const { isAuth, loading } = useAppSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    dispatch(getProfileUser());
  }, [dispatch]);

  useEffect(() => {
    if (isAuth) {
      router.push("/reports");
    }
  }, [isAuth, loading, router]);

  // return (
  //   <div className="bg-gray-100 flex min-h-screen items-center justify-center">
  //     {children}
  //   </div>
  // );

  return children
}
