import { Outlet } from "react-router-dom";
import "./App.css";
import { ChatProvider } from "./context/ChatContext";
import ChatStack from "./components/ChatStack";
import Footer from "./components/Footer";
import Header from "./components/Header";
import RouteLoadingOverlay from "./components/RouteLoadingOverlay";

const App = () => {
  return (
    <ChatProvider>
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
        <ChatStack />
      </div>
    </ChatProvider>
  );
};

export default App;
