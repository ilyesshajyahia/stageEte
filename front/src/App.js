// App.js
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "./components/sidebar";
import NotificationBell from "./components/NotificationBell";
import CreateTicket from "./pages/agent/createticket";
import Login from "./pages/login";
import AgentTickets from "./pages/agent/agentTicketList";
import TechTickets from "./pages/tech/techTicketList";
import RespTickets from "./pages/resp/respTicketList";
import RespUserList from "./pages/resp/RespUserList";
import RespReport from "./pages/resp/RespReport";
import TechHistory from "./pages/tech/techHistory";
import Signup from "./pages/signup";
import Profile from "./pages/Profile";
import RespInterventions from "./pages/resp/RespInterventions";
import RespConge from "./pages/resp/RespConge";

const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [role, setRole] = useState(() => localStorage.getItem("role"));

  const path = location.pathname;

  const allowedPaths = {
    AGENT: ["/agent", "/profile"],
    TECHNICIEN: ["/tech", "/profile"],
    RESPONSABLE: ["/responsable", "/profile"],
  };

  useEffect(() => {
    if (!role && path !== "/" && path !== "/signup") {
      navigate("/");
    }
  }, [role, path, navigate]);

  useEffect(() => {
    if (role) {
      const allowed = allowedPaths[role] || [];
      const isAllowed = allowed.some((prefix) => path.startsWith(prefix));
      if (!isAllowed) {
        // Redirect to dashboard for the role
        if (role === "AGENT") navigate("/agent/tickets");
        else if (role === "TECHNICIEN") navigate("/tech/tickets");
        else if (role === "RESPONSABLE") navigate("/responsable/all");
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, path, navigate]);

  useEffect(() => {
    if (role && path === "/") {
      const dashboard =
        role === "AGENT"
          ? "/agent/tickets"
          : role === "TECHNICIEN"
          ? "/tech/tickets"
          : "/responsable/all";
      navigate(dashboard, { replace: true });
    }
  }, [role, path, navigate]);

  const showSidebar = role && path !== "/";

  return (
    <div style={{ display: "flex" }}>
      {showSidebar && <Sidebar role={role} />}
      <div style={{ flex: 1, minWidth: 0, marginLeft: showSidebar ? 240 : 0, position: 'relative' }}>
        {showSidebar && (
          <NotificationBell userId={localStorage.getItem('id')} />
        )}
        <Routes>
          <Route path="/" element={<Login onLogin={setRole} />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
          {/* Agent */}
          <Route path="/agent/create" element={<CreateTicket />} />
          <Route path="/agent/tickets" element={<AgentTickets />} />
          {/* Technicien */}
          <Route path="/tech/tickets" element={<TechTickets />} />
          <Route path="/tech/history" element={<TechHistory />} />
          {/* Responsable */}
          <Route path="/responsable/all" element={<RespTickets />} />
          <Route path="/responsable/users" element={<RespUserList />} />
          <Route path="/responsable/reports" element={<RespReport />} />
          <Route path="/responsable/interventions" element={<RespInterventions />} />
          <Route path="/responsable/conges" element={<RespConge />} />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
