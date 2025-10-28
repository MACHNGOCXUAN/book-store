import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import AboutPage from "../pages/AboutPage";
import AccountLayout from "../pages/account/AccountLayout";
import { CartPage } from "../pages/CartPage";
import ContactPage from "../pages/ContactPage";

import HomePage from "../pages/HomePage";
import AddressPage from "../pages/account/AddressPage";
import VoucherPage from "../pages/account/VoucherPage";
import FavoritePage from "../pages/account/FavoritePage";
import { OrdersPage } from "../pages/account/OrdersPage";
import FilterCategory from "../pages/FilterCategory";
import AccountInfoPage from "../pages/account/AccountInfoPage";
import ChangePasswordPage from "../pages/account/ChangePasswordPage";
import DetailPage from "../pages/DetailPage";

const router = createBrowserRouter([
  {
    path: "",
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "contact",
        element: <ContactPage />,
      },
      {
        path: "about",
        element: <AboutPage />,
      },
      {
        path: "cart",
        element: <CartPage />,
      },
      {
        path: "books/:id",
        element: <DetailPage />,
      },
      {
        path: "account",
        element: <AccountLayout />,
        children: [
          {
            index: true,
            element: <AccountInfoPage />,
          },
          {
            path: "address",
            element: <AddressPage />,
          },
          {
            path: "change-password",
            element: <ChangePasswordPage />,
          },
          {
            path: "vouchers",
            element: <VoucherPage />,
          },
          {
            path: "favorites",
            element: <FavoritePage />,
          },
          {
            path: "orders",
            element: <OrdersPage />,
          },
        ],
      },
      {
        path: "categories/:type",
        element: <FilterCategory />,
      },
    ],
  },
]);

export default router;
