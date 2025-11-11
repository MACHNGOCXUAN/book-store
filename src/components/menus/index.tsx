"use client";
import { Menu as MenuAnt } from "antd"
import { MenuItems } from "./menu-list";
import { usePathname, useRouter } from "next/navigation";
import { useMenuItems } from "@/hooks/useMenuItems";
import { useTopLoader } from "nextjs-toploader";
import { useEffect } from "react";


export const Menu = () => {
  const router = useRouter();
  const pathname = usePathname(); 
  const menuItems = useMenuItems();
  const topLoader = useTopLoader();

  useEffect(() => {
    topLoader.done();
  }, [pathname]);

  const handleClickPage = (path: string) => {
    if (path === pathname) return;
    topLoader.start();
    router.push(path)
  }

  return (
    <MenuAnt
      theme="light"
      mode="inline"
      defaultSelectedKeys={[pathname]}
      onClick={(k) => handleClickPage(k.key)}
      items={menuItems}
      style={{ height: "100%" }}
    />
  )
}