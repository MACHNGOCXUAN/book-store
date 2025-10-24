"use client";
import React, { useEffect, useState } from "react";
import {
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Dropdown, Layout, MenuProps, theme } from "antd";
import { Menu } from "@/components/menus";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { getProfileUser, logout } from "@/stores/slices/auth.slice";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/auth/AuthGuard";
import { Image as ImageLogo } from "@/assets/images";
import Image from "next/image";

const { Header, Sider, Content } = Layout;

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const SIDER_WIDTH = 250;
  const SIDER_COLLAPSED_WIDTH = 80;
  const HEADER_HEIGHT = 64;

  const currentSiderWidth = collapsed ? SIDER_COLLAPSED_WIDTH : SIDER_WIDTH;

  const dispatch = useAppDispatch();
  const { isAuth, loading, user } = useAppSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    dispatch(getProfileUser());
  }, [dispatch]);

  // useEffect(() => {
  //   if (!isAuth && !loading) {
  //     router.push("/login");
  //   }
  // }, [isAuth, loading, router]);

  if (loading) {
    return "loading";
  }

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleProfile = () => {
    router.push("/profile");
  };

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: user?.fullName || user?.userName,
      disabled: true,
    },
    {
      type: "divider",
    },
    {
      key: "2",
      label: "Tài khoản",
      icon: <UserOutlined />,
      onClick: handleProfile,
    },
    {
      key: "3",
      label: "Đăng xuất",
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  return (
    <AuthGuard requireAuth={true}>
      <Layout style={{ minHeight: "100vh" }}>
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={SIDER_WIDTH}
          collapsedWidth={SIDER_COLLAPSED_WIDTH}
          theme="light"
          style={{
            height: "100vh",
            position: "fixed",
            left: 0,
            top: 0,
            bottom: 0,
            overflow: "hidden",
            zIndex: 1001,
          }}
        >
          <div
            style={{
              height: HEADER_HEIGHT,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            <div className="text-2xl text-amber-900 font-bold">
              {collapsed ? (
                <Image src={ImageLogo.LogoBook} alt="Books Logo" width={40} height={40} />
              ) : (
                "Books"
              )}
            </div>
          </div>
          <div
            style={{
              height: `calc(100vh - ${HEADER_HEIGHT}px)`,
              overflowY: "auto",
              overflowX: "hidden",
            }}
            className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
          >
            <Menu />
          </div>
        </Sider>

        <Layout
          style={{
            marginLeft: currentSiderWidth,
            transition: "margin-left 0.2s ease",
          }}
        >
          <Header
            style={{
              background: colorBgContainer,
              position: "fixed",
              top: 0,
              right: 0,
              left: currentSiderWidth,
              zIndex: 1000,
              height: HEADER_HEIGHT,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
              transition: "left 0.2s ease",
              padding: 0,
            }}
          >
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: "16px",
                width: 64,
                height: 64,
              }}
            />
            <Dropdown menu={{ items }} className="mr-10!">
              <a onClick={(e) => e.preventDefault()}>
                <Avatar icon={<UserOutlined />} />
              </a>
            </Dropdown>
          </Header>
          <Content
            style={{
              marginTop: HEADER_HEIGHT,
              minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </AuthGuard>
  );
}
