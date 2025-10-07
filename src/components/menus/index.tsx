"use client";
import { Menu as MenuAnt } from "antd"
import { MenuItems } from "./menu-list";
import { usePathname, useRouter } from "next/navigation";


export const Menu = () => {
  const router = useRouter();
  const pathname = usePathname(); 

  const handleClickPage = (path: string) => {
    router.push(path)
  }

  return (
    <MenuAnt
      theme="light"
      mode="inline"
      defaultSelectedKeys={[pathname]}
      onClick={(k) => handleClickPage(k.key)}
      items={MenuItems}
      style={{ height: "100%" }}
    />
  )
}