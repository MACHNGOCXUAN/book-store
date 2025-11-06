import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import AboutPage from "../pages/AboutPage";
import AccountLayout from "../pages/account/AccountLayout";
import { CartPage } from "../pages/CartPage";
import ContactPage from "../pages/ContactPage";

import AccountInfoPage from "../pages/account/AccountInfoPage";
import AddressPage from "../pages/account/AddressPage";
import ChangePasswordPage from "../pages/account/ChangePasswordPage";
import FavoritePage from "../pages/account/FavoritePage";
import { OrdersPage } from "../pages/account/OrdersPage";
import VoucherPage from "../pages/account/VoucherPage";
import DetailPage from "../pages/DetailPage";
import FilterCategory from "../pages/FilterCategory";
import HomePage from "../pages/HomePage";
import MembershipPage from "../pages/MembershipPage";
import ReviewPage from "../pages/ReviewPage";
import CheckoutPage from "../pages/CheckoutPage";
import OrderSuccessPage from "../pages/OrderSuccessPage";
import OrderHistoryPage from "../pages/orders/OrderHistoryPage";
import OrderPendingPage from "../pages/orders/OrderPendingPage";
import OrderProcessingPage from "../pages/orders/OrderProcessingPage";
import OrderShippingPage from "../pages/orders/OrderShippingPage";
import OrderCancelledPage from "../pages/orders/OrderCancelledPage";

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
        path: "membership",
        element: <MembershipPage />,
      },
      {
        path: "reviews",
        element: <ReviewPage />,
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
            children: [
              {
                index: true,
                element: <OrderHistoryPage />,
              },
              {
                path: "pending",
                element: <OrderPendingPage />,
              },
              {
                path: "processing",
                element: <OrderProcessingPage />,
              },
              {
                path: "shipping",
                element: <OrderShippingPage />,
              },
              {
                path: "completed",
                element: <OrderShippingPage />,
              },
              {
                path: "cancelled",
                element: <OrderCancelledPage />,
              },
            ],
          },
        ],
      },
      {
        path: "categories/:type",
        element: <FilterCategory />,
      },
      {
        path: "checkout",
        element: <CheckoutPage />,
      },
      {
        path: "order-success",
        element: <OrderSuccessPage />,
      },
    ],
  },
]);

export default router;
