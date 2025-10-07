"use client"
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { getProfileUser } from "@/stores/slices/auth.slice";
import { Spin } from "antd";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoadingOutlined } from '@ant-design/icons';

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

  return (
    <html lang="en">
      <body className="bg-gray-100 flex min-h-screen items-center justify-center">
        {children}
      </body>
    </html>
  );
}
