import { Outlet } from "react-router-dom";
import "./App.css";
import ChatEmail from "./components/ChatEmail";
import ChatWithAI from "./components/ChatWithAI";
import ChatWithEmployee from "./components/ChatWithEmployee";
import Footer from "./components/Footer";
import Header from "./components/Header";
import IconMap from "./components/IconMap";
import RouteLoadingOverlay from "./components/RouteLoadingOverlay";


const App = () => {
  return (
    <div
      className="w-100 h-screen flex flex-col justify-between"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* <ScrollToTop /> */}
      <RouteLoadingOverlay />
      <Header />
      <div style={{ flex: 1 }}>
        <Outlet />
      </div>
      <Footer />
      <ChatWithAI />
      <ChatWithEmployee />
      <ChatEmail />
      <IconMap />
    </div>
  );
};

export default App;
