import { Outlet } from "react-router-dom";
import "./App.css";
import Footer from "./components/Footer";
import Header from "./components/Header";
import ScrollToTop from "./utils/ScrollToTop";
import ChatPopoverWidget from "./components/LiveChatWidget";
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
      <ChatPopoverWidget />
    </div>
  );
};

export default App;
