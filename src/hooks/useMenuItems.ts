import { MenuItems } from "@/components/menus/menu-list";
import { useAppSelector } from "@/stores/hooks";

export const useMenuItems = () => {
  const { user } = useAppSelector((state) => state.auth);

  const filterMenuByRole = (items: any[]) => {
    return items.filter((item) => {
      if (item.children) {
        item.children = filterMenuByRole(item.children);
      }

      if (!item.roles) {
        return !item.children || item.children.length > 0;
      }

      const hasPermission = item.roles.includes(user?.role);

      return hasPermission;
    });
  };

  return filterMenuByRole(MenuItems);
};
