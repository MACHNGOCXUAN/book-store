import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import AboutPage from "../pages/AboutPage";
import AccountPage from "../pages/AccountPage";
import { CartPage } from "../pages/CartPage";
import ContactPage from "../pages/ContactPage";
import DetailPage from "../pages/DetailPage";
import HomePage from "../pages/HomePage";
import AddressPage from "../pages/account/AddressPage";
import ChangePasswordPage from "../pages/account/ChangePasswordPage";
import VoucherPage from "../pages/account/VoucherPage";
import FavoritePage from "../pages/account/FavoritePage";
import { OrdersPage } from "../pages/account/OrdersPage";
import FilterCategory from "../pages/FilterCategory";

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
        element: <AccountPage />,
        children: [
          {
            path: "address",
            element: <AddressPage />,
          },
          {
            path: "password",
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
