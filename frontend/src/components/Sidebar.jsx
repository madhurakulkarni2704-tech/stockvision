import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../services/api";
import "./Sidebar.css";

const navigationItems = [
{ label: "Dashboard", icon: "▦", path: "/dashboard" },
{ label: "Products", icon: "📦", path: "/products" },
{ label: "Inventory", icon: "▤", path: "/inventory" },
{ label: "Sales", icon: "↗", path: "/sales" },
{ label: "Reports", icon: "▥", path: "/reports" },
{ label: "Expiry", icon: "◷", path: "/expiry" },
{ label: "Pricing", icon: "₹", path: "/pricing" },
{ label: "Alerts", icon: "♧", path: "/alerts" },
{ label: "Profile", icon: "♙", path: "/profile" },
];

export default function Sidebar({ activePage = "dashboard" }) {
const navigate = useNavigate();
const [isAdmin, setIsAdmin] = useState(false);

useEffect(() => {
let mounted = true;

async function loadProfile() {
  try {
    const response = await getProfile();
    const profile = response?.data ?? response?.user ?? response;

    if (mounted) {
      setIsAdmin(
        String(profile?.role ?? "").toUpperCase() === "ADMIN"
      );
    }
  } catch (error) {
    console.error("Could not load sidebar profile:", error);
  }
}

loadProfile();

return () => {
  mounted = false;
};


}, []);

const items = isAdmin
? [
...navigationItems,
{ label: "Admin Management", icon: "⚙", path: "/admin-management" },
]
: navigationItems;

return ( <aside className="app-sidebar"> <div className="app-sidebar-brand"> <div className="app-sidebar-logo">SV</div> <div> <h2>StockVision</h2> <span>INVENTORY INTELLIGENCE</span> </div> </div>

  <nav className="app-sidebar-nav">
    {items.map((item) => (
      <button
        key={item.path}
        type="button"
        className={`app-sidebar-link ${
          activePage === item.label.toLowerCase().replace(/\s+/g, "-")
            ? "active"
            : ""
        }`}
        onClick={() => navigate(item.path)}
      >
        <span className="app-sidebar-icon">{item.icon}</span>
        {item.label}
      </button>
    ))}
  </nav>
</aside>

);
}
