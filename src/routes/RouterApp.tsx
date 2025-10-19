import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import HomePage from "../pages/HomePage";
import ContactPage from "../pages/ContactPage";
import AboutPage from "../pages/AboutPage";
import { CartPage } from "../pages/CartPage";
import DetailPage from "../pages/DetailPage";
const router = createBrowserRouter([

    {
        path:"",
        element:<App/>,
        children:[
            {
                index:true,
                element: <HomePage/>
            },
            {
                path: "contact",
                element: <ContactPage/>
            },
            {
                path: "about",
                element: <AboutPage/>
            },
            {
                path: "cart",
                element: <CartPage/>
            },
            {
                path: "/books/:id",
                element: <DetailPage/>
            }
        ]
    }

])

export default router