import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import HomePage from "../pages/HomePage";
import ProductPage from "../components/ProductList";
import ContactPage from "../pages/ContactPage";
import AboutPage from "../pages/AboutPage";
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
            }
        
        ]
    }

])

export default router