import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import AboutPage from "../pages/AboutPage";
import AccountPage from "../pages/AccountPage";
import { CartPage } from "../pages/CartPage";
import ContactPage from "../pages/ContactPage";
import DetailPage from "../pages/DetailPage";
import HomePage from "../pages/HomePage";
const router = createBrowserRouter([

    {
        path: "",
        element: <App />,
        children: [
            {
                index: true,
                element: <HomePage />
            },
            {
                path: "contact",
                element: <ContactPage />
            },
            {
                path: "about",
                element: <AboutPage />
            },
            {
                path: "cart",
                element: <CartPage />
            },
            {
                path: "/books/:id",
                element: <DetailPage />
            },
            {
                path: "account",
                element: <AccountPage />
            }
        ]
    }

])

export default router