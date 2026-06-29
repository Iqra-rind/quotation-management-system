import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Building2, FileText, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";
import "./Layout.css";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/vendors", label: "Vendors", icon: Building2 },
  { to: "/quotation-requests", label: "Quotation Requests", icon: FileText },
];

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-mark">VQ</div>
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-title">Vendor &amp; Quotation</span>
            <span className="sidebar-brand-sub">Management System</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) => "sidebar-link" + (isActive ? " is-active" : "")}
            >
              <Icon size={17} strokeWidth={2} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {user && (
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">{user.name.charAt(0).toUpperCase()}</div>
            <div className="sidebar-user-text">
              <span className="sidebar-user-name">{user.name}</span>
              <span className="sidebar-user-role">{user.role}</span>
            </div>
            <button
              type="button"
              className="sidebar-user-logout"
              onClick={logout}
              aria-label="Log out"
              title="Log out"
            >
              <LogOut size={15} />
            </button>
          </div>
        )}

        <ThemeToggle />
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
