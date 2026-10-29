import React, { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Milk,
  Wallet,
  BookOpen,
  ChartNoAxesCombined,
  Settings,
  Search,
  Bell,
  ChevronDown,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  CalendarDays,
  Clock3,
  Droplets,
  IndianRupee,
  CheckCircle2,
  XCircle,
  Menu,
  X,
  Download,
  Filter,
  Eye,
  ClipboardList,
  CircleHelp,
  LogOut,
} from "lucide-react";

const initialFarmers = [];
const initialDeliveries = [];
const initialAdvances = [];
const money = (n) =>
  "₹" +
  Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const today = new Date().toLocaleDateString("en-CA");

const navGroups = [
  {
    label: "OVERVIEW",
    items: [{ id: "Dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "MILK OPERATIONS",
    items: [
      { id: "Deliveries", label: "Milk deliveries", icon: Milk },
      { id: "Farmers", label: "Farmers", icon: Users },
      { id: "Advances", label: "Farmer advances", icon: Wallet },
    ],
  },
  {
    label: "ACCOUNTS & REPORTS",
    items: [
      { id: "Payments", label: "10-day payments", icon: IndianRupee },
      { id: "Passbook", label: "Farmer passbook", icon: BookOpen },
      { id: "Reports", label: "Daily reports", icon: ChartNoAxesCombined },
    ],
  },
];

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem("dairyflowUser") !== null,
  );
  const [user, setUser] = useState(() => {
    const savedUser = sessionStorage.getItem("dairyflowUser");

    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [authMode, setAuthMode] = useState("login");
  const [authMessage, setAuthMessage] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const handleLogout = () => {
    sessionStorage.removeItem("dairyflowUser");
    sessionStorage.removeItem("dairyflowToken");
    setIsAuthenticated(false);
    setUser(null);
    setRole("Operator");
    setPage("Dashboard");
    setAuthMode("login");
    setAuthMessage("");
  };
  const [page, setPage] = useState("Dashboard");
  const [role, setRole] = useState(() => {
    const savedUser = sessionStorage.getItem("dairyflowUser");

    if (savedUser) {
      try {
        return JSON.parse(savedUser).role || "Operator";
      } catch {
        return "Operator";
      }
    }

    return "Operator";
  });
  const normalizedRole = String(role).toUpperCase();

  const allowedPages = {
    OPERATOR: ["Dashboard", "Farmers", "Deliveries", "Passbook"],
    SECRETARY: [
      "Dashboard",
      "Farmers",
      "Deliveries",
      "Advances",
      "Payments",
      "Passbook",
      "Reports",
    ],
    FARMER: ["Passbook"],
  };

  const canAccessPage = (pageName) =>
    (allowedPages[normalizedRole] || []).includes(pageName);
  useEffect(() => {
    if (!canAccessPage(page)) {
      setPage(normalizedRole === "FARMER" ? "Passbook" : "Dashboard");
    }
  }, [page, normalizedRole]);
  const [farmers, setFarmers] = useState(initialFarmers);
  const [deliveries, setDeliveries] = useState(initialDeliveries);
  const [advances, setAdvances] = useState(initialAdvances);
  const [farmersLoading, setFarmersLoading] = useState(true);
  const [farmersError, setFarmersError] = useState("");

  useEffect(() => {
    async function loadFarmers() {
      try {
        setFarmersLoading(true);
        setFarmersError("");
        const response = await fetch("http://localhost:8080/api/farmers", {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("dairyflowToken")}`,
          },
        });
        if (!response.ok)
          throw new Error("Could not load farmers from the backend.");
        const data = await response.json();
        setFarmers(
          Array.isArray(data)
            ? data.map((f) => ({
                ...f,
                id: f.id ?? f._id,
                joined: f.joined || "—",
              }))
            : [],
        );
      } catch (error) {
        setFarmersError(
          error.message ||
            "Cannot connect to the backend. Start Spring Boot and try again.",
        );
      } finally {
        setFarmersLoading(false);
      }
    }
    loadFarmers();
  }, []);

  useEffect(() => {
    async function loadDeliveries() {
      try {
        const response = await fetch("http://localhost:8080/api/deliveries", {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("dairyflowToken")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to load deliveries");
        }

        const data = await response.json();

        setDeliveries(
          data.map((delivery) => ({
            ...delivery,
            id: delivery.id ?? delivery._id,
          })),
        );
      } catch (error) {
        console.error("Error loading deliveries:", error);
      }
    }

    loadDeliveries();
  }, []);

  useEffect(() => {
    async function loadAdvances() {
      try {
        const response = await fetch("http://localhost:8080/api/advances", {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("dairyflowToken")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to load advances");
        }

        const data = await response.json();

        setAdvances(
          data.map((advance) => ({
            ...advance,
            id: advance.id ?? advance._id,
          })),
        );
      } catch (error) {
        console.error("Error loading advances:", error);
      }
    }

    loadAdvances();
  }, []);

  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showFarmerForm, setShowFarmerForm] = useState(false);
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState("");
  const [periodStart, setPeriodStart] = useState("2026-10-19");
  const [periodEnd, setPeriodEnd] = useState(today);

  const accepted = deliveries.filter((d) => d.status === "Accepted");
  const totalLitres = accepted.reduce((s, d) => s + Number(d.litres), 0);
  const totalAmount = accepted.reduce((s, d) => s + Number(d.amount), 0);
  const todayRows = deliveries.filter((d) => d.date === today);
  const todayAccepted = todayRows.filter((d) => d.status === "Accepted");
  const todayLitres = todayAccepted.reduce((s, d) => s + Number(d.litres), 0);
  const todayAmount = todayAccepted.reduce((s, d) => s + Number(d.amount), 0);

  const filteredFarmers = farmers.filter((f) =>
    `${f.name} ${f.id} ${f.village} ${f.phone}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const filteredDeliveries = deliveries.filter((d) =>
    `${d.farmer} ${d.id} ${d.shift} ${d.status}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const farmer =
    String(role).toUpperCase() === "FARMER"
      ? farmers.find(
          (f) => String(f.phone).trim() === String(user?.phone || "").trim(),
        ) || null
      : farmers.find((f) => f.id === selectedFarmer) || farmers[0] || null;

  function flash(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3500);
  }
  async function addFarmer(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const farmerData = {
      name: String(data.get("name") || "").trim(),
      village: String(data.get("village") || "").trim(),
      phone: String(data.get("phone") || "").trim(),
    };
    if (
      !farmerData.name ||
      !farmerData.village ||
      !/^[0-9]{10}$/.test(farmerData.phone)
    ) {
      flash("Enter a name, village and valid 10-digit phone number.");
      return;
    }
    try {
      const response = await fetch("http://localhost:8080/api/farmers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("dairyflowToken")}`,
        },
        body: JSON.stringify(farmerData),
      });
      if (!response.ok) {
        const detail = await response.text();
        throw new Error(detail || "Farmer could not be saved.");
      }
      const saved = await response.json();
      const newFarmer = {
        ...saved,
        id: saved.id ?? saved._id,
        joined:
          saved.joined ||
          new Date().toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
      };
      setFarmers((prev) => [
        newFarmer,
        ...prev.filter((f) => f.id !== newFarmer.id),
      ]);
      setSelectedFarmer(newFarmer.id);
      setShowFarmerForm(false);
      form.reset();
      flash("Farmer saved to MongoDB successfully.");
    } catch (error) {
      flash(
        error.message ||
          "Could not connect to Spring Boot. Check that the backend is running.",
      );
    }
  }

  async function addDelivery(e) {
    e.preventDefault();

    const data = new FormData(e.currentTarget);

    const delivery = {
      farmerId: data.get("farmerId"),
      date: data.get("date"),
      shift: data.get("shift"),
      litres: Number(data.get("litres")),
      fat: Number(data.get("fat")),
    };

    if (
      !delivery.farmerId ||
      !delivery.date ||
      !delivery.shift ||
      !Number.isFinite(delivery.litres) ||
      delivery.litres <= 0 ||
      !Number.isFinite(delivery.fat) ||
      delivery.fat < 0 ||
      delivery.fat > 9
    ) {
      flash("Invalid entry. Check litres and fat percentage.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/deliveries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("dairyflowToken")}`,
        },
        body: JSON.stringify(delivery),
      });

      const result = await response.json();

      if (!response.ok) {
        flash(result.message || "Could not save milk delivery.");
        return;
      }

      const savedDelivery = {
        ...result,
        id: result.id ?? result._id,
        farmerId: result.farmerId,
      };

      setDeliveries((prev) => [savedDelivery, ...prev]);
      setShowDeliveryForm(false);

      flash(
        savedDelivery.status === "Rejected"
          ? "Delivery recorded as rejected. Amount is ₹0."
          : "Milk delivery saved successfully.",
      );
    } catch (error) {
      flash(
        "Cannot connect to the backend. Check whether Spring Boot is running.",
      );
    }
  }

  async function addAdvance(e) {
    e.preventDefault();

    const form = e.currentTarget;
    const data = new FormData(form);

    const advance = {
      farmerId: data.get("farmerId"),
      date: data.get("date"),
      amount: Number(data.get("amount")),
      note: data.get("note") || "",
    };

    if (
      !advance.farmerId ||
      !advance.date ||
      !Number.isFinite(advance.amount) ||
      advance.amount <= 0
    ) {
      flash("Enter a valid advance amount.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/advances", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("dairyflowToken")}`,
        },
        body: JSON.stringify(advance),
      });
      const result = await response.json();

      if (!response.ok) {
        flash(result.message || "Could not save advance.");
        return;
      }

      const savedAdvance = {
        ...result,
        id: result.id ?? result._id,
      };

      setAdvances((prev) => [savedAdvance, ...prev]);

      flash("Advance recorded successfully.");
      form.reset();
    } catch (error) {
      flash(
        "Cannot connect to the backend. Check whether Spring Boot is running.",
      );
    }
  }

  async function handleRegister(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const name = String(formData.get("name") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const password = String(formData.get("password") || "");

    console.log("Name:", name);
    console.log("Phone:", JSON.stringify(phone));
    console.log("Phone length:", phone.length);

    if (!name) {
      setAuthMessage("Please enter your name.");
      return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      setAuthMessage(
        `Invalid mobile number. Digits received: ${phone.length}. Please enter exactly 10 digits.`,
      );
      return;
    }

    if (password.length < 8) {
      setAuthMessage("Password must contain at least 8 characters.");
      return;
    }

    const payload = { name, phone, password };

    setAuthLoading(true);
    setAuthMessage("");

    try {
      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.error || result.message || "Registration failed.",
        );
      }

      setAuthMode("login");
      setAuthMessage(
        "Registration successful. Your farmer account was saved. You can now log in.",
      );
    } catch (error) {
      setAuthMessage(
        error.message ||
          "Could not connect to the backend. Make sure Spring Boot is running.",
      );
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLogin(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const phone = formData.get("phone")?.toString().trim() || "";
    const password = formData.get("password")?.toString() || "";

    setAuthLoading(true);
    setAuthMessage("");

    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone, password }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setAuthMessage(data.error || data.message || "Login failed.");
        return;
      }

      setAuthMessage(`Welcome, ${data.name}!`);
      sessionStorage.setItem("dairyflowUser", JSON.stringify(data));
      sessionStorage.setItem("dairyflowToken", data.token);

      setUser(data);
      setRole(data.role);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Login error:", error);
      setAuthMessage(error.message || "Could not connect to the backend.");
    } finally {
      setAuthLoading(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <AuthPage
        mode={authMode}
        setMode={(mode) => {
          setAuthMode(mode);
          setAuthMessage("");
        }}
        message={authMessage}
        loading={authLoading}
        onRegister={handleRegister}
        onLogin={handleLogin}
      />
    );
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">
            <Milk size={21} />
          </div>
          <div>
            <div className="brand-name">DairyFlow</div>
            <div className="brand-sub">COLLECTION MANAGEMENT</div>
          </div>
          <button
            className="mobile-close"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>
        <div className="centre-card">
          <div className="centre-avatar">VC</div>
          <div className="centre-details">
            <strong>Village Dairy Centre</strong>
            <span>Heggadahalli, Karnataka</span>
          </div>
          <ChevronDown size={15} className="muted-icon" />
        </div>
        <nav className="side-nav">
          {navGroups
            .filter((group) =>
              group.items.some((item) => canAccessPage(item.id)),
            )
            .map((group) => (
              <div className="nav-group" key={group.label}>
                <div className="nav-heading">{group.label}</div>
                {group.items
                  .filter((item) => canAccessPage(item.id))
                  .map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        className={`nav-item ${page === item.id ? "active" : ""}`}
                        onClick={() => {
                          setPage(item.id);
                          setSearch("");
                          setSidebarOpen(false);
                        }}
                      >
                        <Icon size={18} strokeWidth={1.8} />
                        <span>{item.label}</span>
                        {item.id === "Deliveries" && (
                          <span className="nav-count">{todayRows.length}</span>
                        )}
                      </button>
                    );
                  })}
              </div>
            ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon">
              <CircleHelp size={17} />
            </div>
            <div>
              <strong>Need help?</strong>
              <span>View the quick guide</span>
            </div>
            <ArrowUpRight size={15} />
          </div>
          <button
            className="nav-item settings-item"
            onClick={() =>
              flash("Settings are part of the next integration step.")
            }
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>
          <div className="sidebar-foot">
            <div className="online-dot" />
            <span>Centre system operational</span>
          </div>
        </div>
      </aside>
      {sidebarOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={21} />
            </button>
            <div className="breadcrumb">
              Workspace <span>/</span> <strong>{page}</strong>
            </div>
          </div>
          <div className="topbar-actions">
            <div className="search-box">
              <Search size={17} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search records..."
              />
            </div>
            <button
              className="icon-button notification-button"
              aria-label="Notifications"
              onClick={() => flash("You are all caught up.")}
            >
              <Bell size={18} />
              <span />
            </button>
            <div className="top-divider" />
            <div className="user-profile">
              <div className="user-avatar">
                {(user?.name || "User")
                  .trim()
                  .split(/\s+/)
                  .map((part) => part[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </div>

              <div className="user-meta">
                <strong>{user?.name || "User"}</strong>
                <span>{role}</span>
              </div>
            </div>

            <button
              className="btn btn-light btn-sm"
              onClick={handleLogout}
              style={{ width: "100%", marginTop: "12px" }}
            >
              Logout
            </button>
          </div>
        </header>
        {!canAccessPage(page) &&
          setPage(normalizedRole === "FARMER" ? "Passbook" : "Dashboard")}
        <div className="page-content">
          {page === "Dashboard" && (
            <Dashboard
              todayLitres={todayLitres}
              todayAmount={todayAmount}
              farmers={farmers}
              todayRows={todayRows}
              deliveries={deliveries}
              setPage={setPage}
              setShowDeliveryForm={setShowDeliveryForm}
              setShowFarmerForm={setShowFarmerForm}
            />
          )}
          {page === "Farmers" && (
            <Farmers
              farmers={filteredFarmers}
              allCount={farmers.length}
              loading={farmersLoading}
              error={farmersError}
              onAdd={() => setShowFarmerForm(true)}
              onPassbook={(id) => {
                setSelectedFarmer(id);
                setPage("Passbook");
              }}
            />
          )}
          {page === "Deliveries" && (
            <Deliveries
              rows={filteredDeliveries}
              onAdd={() => setShowDeliveryForm(true)}
            />
          )}
          {page === "Advances" && (
            <Advances
              farmers={farmers}
              advances={advances}
              onAdd={addAdvance}
            />
          )}
          {page === "Payments" && (
            <Payments
              farmers={farmers}
              deliveries={deliveries}
              advances={advances}
              start={periodStart}
              end={periodEnd}
              setStart={setPeriodStart}
              setEnd={setPeriodEnd}
            />
          )}
          {page === "Passbook" && (
            <Passbook
              farmers={farmers}
              deliveries={deliveries}
              advances={advances}
              selectedFarmer={selectedFarmer}
              setSelectedFarmer={setSelectedFarmer}
              farmer={farmer}
              role={role}
            />
          )}
          {page === "Reports" && <Reports deliveries={deliveries} />}
        </div>
        <footer className="app-footer">
          <span>
            DairyFlow <span className="footer-dot">·</span> Village Milk
            Collection & Payment System
          </span>
          <span>Live workspace</span>
        </footer>
      </main>
      {notice && (
        <div className="toast">
          <CheckCircle2 size={18} />
          <span>{notice}</span>
          <button onClick={() => setNotice("")}>
            <X size={15} />
          </button>
        </div>
      )}
      {showFarmerForm && (
        <Modal
          title="Add new farmer"
          subtitle="Create a farmer profile for milk collection records"
          onClose={() => setShowFarmerForm(false)}
        >
          <form onSubmit={addFarmer} className="form-grid">
            <Field label="Farmer full name">
              <input name="name" required placeholder="Enter full name" />
            </Field>
            <Field label="Phone number">
              <input
                name="phone"
                type="tel"
                required
                maxLength={10}
                inputMode="numeric"
                pattern="[0-9]{10}"
                title="Enter a 10-digit phone number"
                placeholder="10-digit mobile number"
                onChange={(event) => {
                  event.target.value = event.target.value
                    .replace(/\D/g, "")
                    .slice(0, 10);
                }}
              />
            </Field>
            <Field label="Village" wide>
              <input name="village" required placeholder="Enter village name" />
            </Field>
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setShowFarmerForm(false)}
              >
                Cancel
              </button>
              <button className="btn btn-primary" type="submit">
                <Plus size={16} /> Add farmer
              </button>
            </div>
          </form>
        </Modal>
      )}
      {showDeliveryForm && (
        <Modal
          title="Record milk delivery"
          subtitle="Enter the farmer's milk quantity and fat reading"
          onClose={() => setShowDeliveryForm(false)}
        >
          <form onSubmit={addDelivery} className="form-grid">
            <Field label="Farmer" wide>
              <select name="farmerId" defaultValue={selectedFarmer} required>
                {farmers.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} · {f.id}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Delivery date">
              <input name="date" type="date" defaultValue={today} required />
            </Field>
            <Field label="Shift">
              <select name="shift" defaultValue="Morning">
                <option>Morning</option>
                <option>Evening</option>
              </select>
            </Field>
            <Field label="Milk quantity (litres)">
              <input
                name="litres"
                type="number"
                min="0.01"
                step="0.01"
                required
                placeholder="e.g. 10"
              />
            </Field>
            <Field label="Fat percentage (%)">
              <input
                name="fat"
                type="number"
                min="0"
                max="9"
                step="0.1"
                required
                placeholder="e.g. 4.0"
              />
            </Field>
            <div className="rate-note">
              <Droplets size={16} />
              <span>
                Rate is calculated automatically: fat % × ₹8. Fat below 3% is
                recorded as rejected.
              </span>
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setShowDeliveryForm(false)}
              >
                Cancel
              </button>
              <button className="btn btn-primary" type="submit">
                <Plus size={16} /> Save delivery
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Dashboard({
  todayLitres,
  todayAmount,
  farmers,
  todayRows,
  deliveries,
  setPage,
  setShowDeliveryForm,
  setShowFarmerForm,
}) {
  const [range, setRange] = useState("Today");
  const accepted = deliveries.filter((d) => d.status === "Accepted");
  const allLitres = accepted.reduce((s, d) => s + Number(d.litres), 0);
  const allAmount = accepted.reduce((s, d) => s + Number(d.amount), 0);
  const stats = [
    {
      label: "Milk collected today",
      value: `${todayLitres.toFixed(1)} L`,
      change: "Across both shifts",
      icon: Droplets,
      tone: "green",
      trend: "up",
    },
    {
      label: "Collection value today",
      value: money(todayAmount),
      change: `${todayRows.filter((d) => d.status === "Rejected").length} rejected entries`,
      icon: IndianRupee,
      tone: "blue",
      trend: "up",
    },
    {
      label: "Registered farmers",
      value: farmers.length.toString().padStart(2, "0"),
      change: "Active farmer profiles",
      icon: Users,
      tone: "purple",
      trend: "up",
    },
    {
      label: "Accepted deliveries",
      value: accepted.length.toString().padStart(2, "0"),
      change: `${deliveries.filter((d) => d.status === "Rejected").length} rejected overall`,
      icon: ClipboardList,
      tone: "amber",
      trend: "up",
    },
  ];
  const chartData = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    const iso = date.toLocaleDateString("en-CA");
    return {
      day: date.toLocaleDateString("en-IN", { weekday: "short" }),
      litres: deliveries
        .filter((d) => d.date === iso && d.status === "Accepted")
        .reduce((sum, d) => sum + Number(d.litres || 0), 0),
    };
  });
  const max = Math.max(...chartData.map((x) => x.litres), 1);
  return (
    <>
      <div className="welcome-row">
        <div>
          <div className="eyebrow">
            {new Date()
              .toLocaleDateString("en-IN", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
              })
              .toUpperCase()}
          </div>
          <h1>Welcome to DairyFlow</h1>
          <p className="page-subtitle">
            Here is what is happening at your dairy centre today.
          </p>
        </div>
        <div className="welcome-actions">
          <button className="btn btn-light" onClick={() => setPage("Reports")}>
            <ChartNoAxesCombined size={16} /> View reports
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setShowDeliveryForm(true)}
          >
            <Plus size={17} /> Record delivery
          </button>
        </div>
      </div>
      <div className="stats-grid">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div className="stat-card" key={s.label}>
              <div className="stat-top">
                <span className="stat-label">{s.label}</span>
                <div className={`stat-icon ${s.tone}`}>
                  <Icon size={19} />
                </div>
              </div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-bottom">
                <span className="stat-change">{s.change}</span>
                {i === 0 && (
                  <span className="live-tag">
                    <span /> LIVE
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="dashboard-grid">
        <section className="panel collection-panel">
          <div className="panel-heading">
            <div>
              <h2>Milk collection overview</h2>
              <p>Collection volume over the last 7 days</p>
            </div>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="select-compact"
            >
              <option>Today</option>
              <option>7 days</option>
              <option>30 days</option>
            </select>
          </div>
          <div className="chart-summary">
            <div>
              <span className="summary-caption">Total recorded volume</span>
              <strong>
                {allLitres.toFixed(1)} <small>litres</small>
              </strong>
            </div>
            <div className="chart-legend">
              <span className="legend-dot" />
              <span>Milk collected</span>
            </div>
          </div>
          <div className="bar-chart">
            {chartData.map((d, i) => (
              <div className="bar-column" key={d.day}>
                <div className="bar-value">{d.litres}</div>
                <div className={`bar-track ${i === 6 ? "bar-current" : ""}`}>
                  <div
                    className="bar-fill"
                    style={{
                      height: `${d.litres === 0 ? 0 : Math.max(4, (d.litres / max) * 100)}%`,
                    }}
                  />
                </div>
                <span className="bar-label">{d.day}</span>
              </div>
            ))}
          </div>
          <div className="chart-foot">
            <span>
              <span className="foot-dot green-dot" /> Accepted collection
            </span>
            <span>Amounts shown in litres</span>
          </div>
        </section>
        <section className="panel quick-panel">
          <div className="panel-heading">
            <div>
              <h2>Quick actions</h2>
              <p>Common tasks for your centre</p>
            </div>
          </div>
          <div className="quick-list">
            <button onClick={() => setShowDeliveryForm(true)}>
              <span className="quick-icon q-green">
                <Milk size={18} />
              </span>
              <span className="quick-copy">
                <strong>Record milk delivery</strong>
                <small>Enter litres and fat percentage</small>
              </span>
              <ArrowUpRight size={17} />
            </button>
            <button onClick={() => setShowFarmerForm(true)}>
              <span className="quick-icon q-blue">
                <Users size={18} />
              </span>
              <span className="quick-copy">
                <strong>Register a farmer</strong>
                <small>Add a new farmer profile</small>
              </span>
              <ArrowUpRight size={17} />
            </button>
            <button onClick={() => setPage("Payments")}>
              <span className="quick-icon q-purple">
                <Wallet size={18} />
              </span>
              <span className="quick-copy">
                <strong>Prepare 10-day payment</strong>
                <small>Review payable amounts</small>
              </span>
              <ArrowUpRight size={17} />
            </button>
            <button onClick={() => setPage("Reports")}>
              <span className="quick-icon q-amber">
                <ChartNoAxesCombined size={18} />
              </span>
              <span className="quick-copy">
                <strong>View daily report</strong>
                <small>Collection and amount summary</small>
              </span>
              <ArrowUpRight size={17} />
            </button>
          </div>
        </section>
      </div>
      <section className="panel recent-panel">
        <div className="panel-heading">
          <div>
            <h2>Recent milk deliveries</h2>
            <p>Latest entries recorded at the centre</p>
          </div>
          <button className="text-link" onClick={() => setPage("Deliveries")}>
            View all deliveries <ArrowUpRight size={15} />
          </button>
        </div>
        <DeliveryTable
          rows={
            todayRows.length ? todayRows.slice(0, 4) : deliveries.slice(0, 4)
          }
          compact
        />
      </section>
      <div className="dashboard-note">
        <div className="note-icon">
          <CheckCircle2 size={18} />
        </div>
        <div>
          <strong>Collection rules are active</strong>
          <p>
            Rates are calculated as fat percentage × ₹8. Entries below 3% fat
            are rejected and recorded at ₹0.
          </p>
        </div>
        <span className="note-status">System rules</span>
      </div>
    </>
  );
}

function PageHeader({ eyebrow, title, subtitle, action }) {
  return (
    <div className="page-header">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p className="page-subtitle">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}
function Farmers({ farmers, allCount, loading, error, onAdd, onPassbook }) {
  return (
    <>
      <PageHeader
        eyebrow="FARMER DIRECTORY"
        title="Farmers"
        subtitle="Manage registered farmers and their collection records."
        action={
          <button className="btn btn-primary" onClick={onAdd}>
            <Plus size={17} /> Add farmer
          </button>
        }
      />
      <div className="mini-stats-row">
        <div className="mini-stat">
          <span>Total registered farmers</span>
          <strong>{allCount}</strong>
        </div>
        <div className="mini-stat">
          <span>Farmers shown</span>
          <strong>{farmers.length}</strong>
        </div>
        <div className="mini-stat">
          <span>Centre location</span>
          <strong className="mini-location">Heggadahalli</strong>
        </div>
      </div>
      <section className="panel table-panel">
        <div className="panel-heading">
          <div>
            <h2>Farmer directory</h2>
            <p>Contact details and farmer identification</p>
          </div>
          <button className="btn btn-light btn-sm">
            <Filter size={15} /> Filter
          </button>
        </div>
        {error && (
          <div className="dashboard-note">
            <div>
              <strong>Could not load farmers</strong>
              <p>{error}</p>
            </div>
          </div>
        )}
        {loading && (
          <p className="page-subtitle">Loading farmers from the database...</p>
        )}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>FARMER</th>
                <th>FARMER ID</th>
                <th>VILLAGE</th>
                <th>PHONE NUMBER</th>
                <th>REGISTERED</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {farmers.map((f) => (
                <tr key={f.id}>
                  <td>
                    <div className="person-cell">
                      <div className="person-avatar">
                        {f.name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                      <strong>{f.name}</strong>
                    </div>
                  </td>
                  <td>
                    <span className="id-pill">{f.id}</span>
                  </td>
                  <td>{f.village}</td>
                  <td>{f.phone}</td>
                  <td>{f.joined}</td>
                  <td>
                    <button
                      className="table-action"
                      onClick={() => onPassbook(f.id)}
                      aria-label={`Open passbook for ${f.name}`}
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {farmers.length === 0 && (
            <Empty
              message={
                error
                  ? "Farmer records are unavailable until the backend connection is restored."
                  : "No farmers saved yet. Add your first farmer to get started."
              }
            />
          )}
        </div>
        <div className="table-footer">
          <span>
            Showing {farmers.length} of {allCount} farmers
          </span>
          <span>Farmer records</span>
        </div>
      </section>
    </>
  );
}
function Deliveries({ rows, onAdd }) {
  return (
    <>
      <PageHeader
        eyebrow="MILK OPERATIONS"
        title="Milk deliveries"
        subtitle="Record and review every farmer delivery by date and shift."
        action={
          <button className="btn btn-primary" onClick={onAdd}>
            <Plus size={17} /> Record delivery
          </button>
        }
      />
      <div className="mini-stats-row">
        <div className="mini-stat">
          <span>Visible entries</span>
          <strong>{rows.length}</strong>
        </div>
        <div className="mini-stat">
          <span>Accepted entries</span>
          <strong>{rows.filter((r) => r.status === "Accepted").length}</strong>
        </div>
        <div className="mini-stat">
          <span>Rejected entries</span>
          <strong>{rows.filter((r) => r.status === "Rejected").length}</strong>
        </div>
      </div>
      <section className="panel table-panel">
        <div className="panel-heading">
          <div>
            <h2>Delivery register</h2>
            <p>
              Saved delivery records are read-only. Use a cancellation entry to
              correct a mistake.
            </p>
          </div>
          <button className="btn btn-light btn-sm">
            <CalendarDays size={15} /> All dates
          </button>
        </div>
        <DeliveryTable rows={rows} />
        <div className="table-footer">
          <span>{rows.length} delivery records</span>
          <span>Rate = fat % × ₹8</span>
        </div>
      </section>
    </>
  );
}
function DeliveryTable({ rows, compact = false }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>FARMER</th>
            <th>DATE & SHIFT</th>
            <th>QUANTITY</th>
            <th>FAT %</th>
            <th>RATE / LITRE</th>
            <th>AMOUNT</th>
            <th>STATUS</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((d) => (
            <tr key={d.id}>
              <td>
                <div className="delivery-person">
                  <strong>{d.farmer}</strong>
                  <span>{d.id}</span>
                </div>
              </td>
              <td>
                <div className="date-shift">
                  <span>
                    {new Date(d.date + "T12:00:00").toLocaleDateString(
                      "en-IN",
                      { day: "2-digit", month: "short", year: "numeric" },
                    )}
                  </span>
                  <small>
                    <Clock3 size={12} />
                    {d.shift}
                  </small>
                </div>
              </td>
              <td>
                <strong>{Number(d.litres).toFixed(1)} L</strong>
              </td>
              <td>
                <span className={`fat-value ${d.fat < 3 ? "fat-low" : ""}`}>
                  {Number(d.fat).toFixed(1)}%
                </span>
              </td>
              <td>{money(d.rate)}</td>
              <td>
                <strong>{money(d.amount)}</strong>
              </td>
              <td>
                <Status value={d.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <Empty message="No delivery records found." />}
    </div>
  );
}
function Status({ value }) {
  return (
    <span className={`status status-${value.toLowerCase()}`}>
      <span />
      {value}
    </span>
  );
}
function Advances({ farmers, advances, onAdd }) {
  return (
    <>
      <PageHeader
        eyebrow="ACCOUNTS"
        title="Farmer advances"
        subtitle="Record advances so they can be deducted from 10-day payments."
      />
      <div className="content-columns">
        <section className="panel form-panel">
          <div className="panel-heading">
            <div>
              <h2>Record an advance</h2>
              <p>Enter the amount given to a farmer.</p>
            </div>
            <div className="stat-icon purple">
              <Wallet size={18} />
            </div>
          </div>
          <form onSubmit={onAdd} className="stack-form">
            <Field label="Select farmer">
              <select name="farmerId" required>
                {farmers.map((f) => (
                  <option value={f.id} key={f.id}>
                    {f.name} · {f.id}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Advance date">
              <input name="date" type="date" defaultValue={today} required />
            </Field>
            <Field label="Advance amount (₹)">
              <input
                name="amount"
                type="number"
                min="1"
                step="0.01"
                placeholder="Enter amount"
                required
              />
            </Field>
            <button className="btn btn-primary full-btn" type="submit">
              <Plus size={16} /> Save advance
            </button>
          </form>
        </section>
        <section className="panel table-panel">
          <div className="panel-heading">
            <div>
              <h2>Advance history</h2>
              <p>Recently recorded advances</p>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>FARMER</th>
                  <th>DATE</th>
                  <th>ADVANCE ID</th>
                  <th>AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {advances.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <strong>{a.farmer}</strong>
                    </td>
                    <td>{a.date}</td>
                    <td>
                      <span className="id-pill">{a.id}</span>
                    </td>
                    <td>
                      <strong>{money(a.amount)}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!advances.length && <Empty message="No advances recorded yet." />}
          </div>
        </section>
      </div>
    </>
  );
}
function Payments({
  farmers,
  deliveries,
  advances,
  start,
  end,
  setStart,
  setEnd,
}) {
  const [paymentResults, setPaymentResults] = useState([]);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");

  const calculatePayments = async () => {
    setPaymentLoading(true);
    setPaymentMessage("");

    try {
      const results = await Promise.all(
        farmers.map(async (farmer) => {
          const response = await fetch(
            "http://localhost:8080/api/payments/calculate",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${sessionStorage.getItem("dairyflowToken")}`,
              },
              body: JSON.stringify({
                farmerId: farmer.id,
                startDate: start,
                endDate: end,
              }),
            },
          );

          const responseText = await response.text();

          let data = {};

          if (responseText) {
            try {
              data = JSON.parse(responseText);
            } catch {
              throw new Error(
                `Payment API returned invalid JSON (HTTP ${response.status}).`,
              );
            }
          }

          if (!response.ok) {
            throw new Error(
              data.message ||
                data.error ||
                `Payment calculation failed (HTTP ${response.status}).`,
            );
          }

          return data;
        }),
      );

      setPaymentResults(results);
      setPaymentMessage("Payment statements calculated successfully.");
    } catch (error) {
      setPaymentMessage(error.message);
    } finally {
      setPaymentLoading(false);
    }
  };

  const rows = farmers.map((f) => {
    const ds = deliveries.filter(
      (d) =>
        d.farmerId === f.id &&
        d.date >= start &&
        d.date <= end &&
        d.status === "Accepted",
    );
    const total = ds.reduce((s, d) => s + d.amount, 0);
    const adv = advances
      .filter((a) => a.farmerId === f.id && a.date >= start && a.date <= end)
      .reduce((s, a) => s + a.amount, 0);
    return {
      ...f,
      litres: ds.reduce((s, d) => s + d.litres, 0),
      total,
      adv,
      net: total - adv,
    };
  });
  const displayRows =
    paymentResults.length > 0
      ? paymentResults.map((p) => {
          const farmer = farmers.find(
            (f) => String(f.id) === String(p.farmerId),
          );

          return {
            ...farmer,
            id: p.farmerId,
            name: p.farmer || farmer?.name || "Unknown Farmer",
            litres:
              Number(p.grossAmount) >= 0
                ? deliveries
                    .filter(
                      (d) =>
                        String(d.farmerId) === String(p.farmerId) &&
                        d.date >= start &&
                        d.date <= end &&
                        d.status === "Accepted",
                    )
                    .reduce((sum, d) => sum + Number(d.litres || 0), 0)
                : 0,
            total: Number(p.grossAmount || 0),
            adv: Number(p.advanceDeducted || 0),
            net: Number(p.netPayable || 0),
            status: p.status || "Calculated",
          };
        })
      : rows;

  const gross = displayRows.reduce((sum, r) => sum + r.total, 0);
  const totalAdv = displayRows.reduce((sum, r) => sum + r.adv, 0);
  const net = displayRows.reduce((sum, r) => sum + r.net, 0);
  return (
    <>
      <PageHeader
        eyebrow="ACCOUNTS & REPORTS"
        title="10-day payments"
        subtitle="Review farmer earnings, advances and net payable for a selected period."
      />
      <section className="panel period-panel">
        <div className="period-title">
          <div className="period-icon">
            <CalendarDays size={18} />
          </div>
          <div>
            <strong>Payment period</strong>
            <span>Select the 10-day window to calculate statements.</span>
          </div>
        </div>
        <div className="period-controls">
          <Field label="From">
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </Field>
          <Field label="To">
            <input
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </Field>
        </div>
      </section>

      <button
        className="btn btn-primary"
        onClick={calculatePayments}
        disabled={paymentLoading}
      >
        {paymentLoading ? "Calculating..." : "Calculate Payments"}
      </button>

      {paymentMessage && <p role="status">{paymentMessage}</p>}

      <div className="payment-summary">
        <div className="payment-card">
          <span>Gross collection amount</span>
          <strong>{money(gross)}</strong>
          <small>Accepted deliveries only</small>
        </div>
        <div className="payment-card">
          <span>Advances deducted</span>
          <strong className="amount-orange">{money(totalAdv)}</strong>
          <small>Advances within selected period</small>
        </div>
        <div className="payment-card payment-net">
          <span>Total net payable</span>
          <strong>{money(net)}</strong>
          <small>Net payable never goes below ₹0</small>
        </div>
      </div>
      <section className="panel table-panel">
        <div className="panel-heading">
          <div>
            <h2>Payment statement</h2>
            <p>
              Calculated from delivery and advance records for {start} to {end}.
            </p>
          </div>
          <button
            className="btn btn-light btn-sm"
            onClick={() => window.print()}
          >
            <Download size={15} /> Print statement
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>FARMER</th>
                <th>TOTAL LITRES</th>
                <th>GROSS AMOUNT</th>
                <th>ADVANCE</th>
                <th>NET PAYABLE</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {displayRows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="person-cell">
                      <div className="person-avatar">
                        {r.name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                      <div>
                        <strong>{r.name}</strong>
                        <div className="sub-cell">{r.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>{r.litres.toFixed(1)} L</td>
                  <td>{money(r.total)}</td>
                  <td className="amount-orange">{money(r.adv)}</td>
                  <td>
                    <strong>{money(r.net)}</strong>
                  </td>
                  <td>
                    <Status value={r.status || "Calculated"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <span>{rows.length} farmer statements</span>
          <span>Calculated from available records</span>
        </div>
      </section>
    </>
  );
}
function Passbook({
  farmers,
  deliveries,
  advances,
  selectedFarmer,
  setSelectedFarmer,
  farmer,
  role,
}) {
  if (!farmer) return <Empty message="Add a farmer to view their passbook." />;
  const passbookFarmerId =
    String(role).toUpperCase() === "FARMER" ? farmer.id : selectedFarmer;

  const ds = deliveries
    .filter((d) => d.farmerId === passbookFarmerId)
    .sort((a, b) => b.date.localeCompare(a.date));
  const total = ds
    .filter((d) => d.status === "Accepted")
    .reduce((s, d) => s + d.amount, 0);
  const adv = advances
    .filter((a) => a.farmerId === passbookFarmerId)
    .reduce((s, a) => s + a.amount, 0);
  return (
    <>
      <PageHeader
        eyebrow="FARMER ACCOUNT"
        title="Farmer passbook"
        subtitle="A clear history of milk deliveries, earnings and advances."
        action={
          <button className="btn btn-light" onClick={() => window.print()}>
            <Download size={16} /> Print passbook
          </button>
        }
      />
      <section className="passbook-profile panel">
        <div className="passbook-avatar">
          {farmer.name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")}
        </div>
        <div className="passbook-identity">
          <span className="eyebrow">FARMER PROFILE</span>
          <h2>{farmer.name}</h2>
          <p>
            {farmer.village}, Karnataka <span>·</span> {farmer.phone}
          </p>
          <span className="id-pill">{farmer.id}</span>
        </div>
        {String(role).toUpperCase() !== "FARMER" && (
          <div className="farmer-select">
            <label>View passbook for</label>
            <select
              value={selectedFarmer}
              onChange={(e) => setSelectedFarmer(e.target.value)}
            >
              {farmers.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </section>
      <div className="passbook-stats">
        <div>
          <span>Total accepted earnings</span>
          <strong>{money(total)}</strong>
        </div>
        <div>
          <span>Total advances</span>
          <strong className="amount-orange">{money(adv)}</strong>
        </div>
        <div>
          <span>Net balance estimate</span>
          <strong>{money(Math.max(0, total - adv))}</strong>
        </div>
        <div>
          <span>Delivery entries</span>
          <strong>{ds.length}</strong>
        </div>
      </div>
      <section className="panel table-panel">
        <div className="panel-heading">
          <div>
            <h2>Passbook transactions</h2>
            <p>All delivery entries and their recorded status.</p>
          </div>
        </div>
        <DeliveryTable rows={ds} />
        <div className="table-footer">
          <span>{ds.length} transactions</span>
          <span>Advances are shown in the summary above</span>
        </div>
      </section>
    </>
  );
}
function Reports({ deliveries }) {
  const dates = [...new Set(deliveries.map((d) => d.date))].sort((a, b) =>
    b.localeCompare(a),
  );
  const report = dates.map((date) => {
    const ds = deliveries.filter((d) => d.date === date);
    const accepted = ds.filter((d) => d.status === "Accepted");
    return {
      date,
      entries: ds.length,
      litres: accepted.reduce((s, d) => s + d.litres, 0),
      amount: accepted.reduce((s, d) => s + d.amount, 0),
      rejected: ds.filter((d) => d.status === "Rejected").length,
    };
  });
  const allLitres = report.reduce((s, r) => s + r.litres, 0),
    allAmount = report.reduce((s, r) => s + r.amount, 0);
  return (
    <>
      <PageHeader
        eyebrow="CENTRE PERFORMANCE"
        title="Daily reports"
        subtitle="Monitor daily milk volume, collection value and rejected deliveries."
        action={
          <button className="btn btn-light" onClick={() => window.print()}>
            <Download size={16} /> Print report
          </button>
        }
      />
      <div className="stats-grid report-stats">
        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">Total accepted milk</span>
            <div className="stat-icon green">
              <Droplets size={19} />
            </div>
          </div>
          <div className="stat-value">{allLitres.toFixed(1)} L</div>
          <div className="stat-bottom">
            <span className="stat-change">Across saved records</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">Total collection value</span>
            <div className="stat-icon blue">
              <IndianRupee size={19} />
            </div>
          </div>
          <div className="stat-value">{money(allAmount)}</div>
          <div className="stat-bottom">
            <span className="stat-change">Accepted deliveries</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">Recorded days</span>
            <div className="stat-icon purple">
              <CalendarDays size={19} />
            </div>
          </div>
          <div className="stat-value">{dates.length}</div>
          <div className="stat-bottom">
            <span className="stat-change">Dates with entries</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">Rejected entries</span>
            <div className="stat-icon amber">
              <XCircle size={19} />
            </div>
          </div>
          <div className="stat-value">
            {deliveries.filter((d) => d.status === "Rejected").length}
          </div>
          <div className="stat-bottom">
            <span className="stat-change">Amount recorded as ₹0</span>
          </div>
        </div>
      </div>
      <section className="panel table-panel">
        <div className="panel-heading">
          <div>
            <h2>Daily collection register</h2>
            <p>
              Daily totals exclude rejected deliveries from litres and amount.
            </p>
          </div>
          <button className="btn btn-light btn-sm">
            <Filter size={15} /> All dates
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>COLLECTION DATE</th>
                <th>ENTRIES</th>
                <th>ACCEPTED LITRES</th>
                <th>COLLECTION AMOUNT</th>
                <th>REJECTED</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {report.map((r) => (
                <tr key={r.date}>
                  <td>
                    <strong>
                      {new Date(r.date + "T12:00:00").toLocaleDateString(
                        "en-IN",
                        { day: "2-digit", month: "short", year: "numeric" },
                      )}
                    </strong>
                  </td>
                  <td>{r.entries}</td>
                  <td>
                    <strong>{r.litres.toFixed(1)} L</strong>
                  </td>
                  <td>
                    <strong>{money(r.amount)}</strong>
                  </td>
                  <td>
                    {r.rejected ? (
                      <span className="status status-rejected">
                        <span />
                        {r.rejected} rejected
                      </span>
                    ) : (
                      <span className="quiet">None</span>
                    )}
                  </td>
                  <td>
                    <span className="quiet">Daily total</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <span>{report.length} daily reports</span>
          <span>Database records</span>
        </div>
      </section>
    </>
  );
}
function Field({ label, children, wide = false }) {
  return (
    <div className={`field ${wide ? "field-wide" : ""}`}>
      <label>{label}</label>
      {children}
    </div>
  );
}
function Modal({ title, subtitle, onClose, children }) {
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section className="modal">
        <div className="modal-heading">
          <div>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={19} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
function Empty({ message }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <ClipboardList size={22} />
      </div>
      <strong>{message}</strong>
      <span>Try changing your search or add a new record.</span>
    </div>
  );
}

function AuthPage({ mode, setMode, message, loading, onRegister, onLogin }) {
  const isRegister = mode === "register";
  const pageStyle = {
    minHeight: "100vh",
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.05fr) minmax(320px, 0.95fr)",
    background: "#f5f7f6",
    color: "#1d2b25",
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
  };
  const leftStyle = {
    background: "linear-gradient(145deg, #123d2b 0%, #1e6243 100%)",
    color: "white",
    padding: "clamp(32px, 6vw, 84px)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: "100vh",
    boxSizing: "border-box",
  };
  const formSide = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px 22px",
    boxSizing: "border-box",
  };
  const card = {
    width: "100%",
    maxWidth: 420,
    background: "white",
    padding: "clamp(24px, 4vw, 38px)",
    borderRadius: 20,
    boxShadow: "0 18px 60px rgba(24, 50, 36, .08)",
    boxSizing: "border-box",
  };
  const labelStyle = {
    display: "block",
    fontSize: 13,
    fontWeight: 650,
    marginBottom: 7,
    color: "#33443a",
  };
  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px 14px",
    border: "1px solid #dce5df",
    borderRadius: 10,
    fontSize: 15,
    outlineColor: "#28734d",
    background: "#fff",
    color: "#1d2b25",
  };
  const buttonStyle = {
    width: "100%",
    border: 0,
    borderRadius: 10,
    padding: "13px 16px",
    background: "#21734a",
    color: "white",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    marginTop: 8,
  };
  const messageStyle = {
    marginTop: 16,
    borderRadius: 10,
    padding: 12,
    background: message.toLowerCase().includes("successful")
      ? "#edf8f0"
      : "#fff7e8",
    color: "#37463c",
    fontSize: 13,
    lineHeight: 1.5,
  };

  return (
    <div style={pageStyle}>
      <section style={leftStyle}>
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 64,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 13,
                background: "rgba(255,255,255,.14)",
                display: "grid",
                placeItems: "center",
              }}
            >
              <Milk size={24} />
            </div>
            <div>
              <div
                style={{
                  fontSize: 23,
                  fontWeight: 800,
                  letterSpacing: "-.5px",
                }}
              >
                DairyFlow
              </div>
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: 2,
                  opacity: 0.78,
                  marginTop: 3,
                }}
              >
                COLLECTION MANAGEMENT
              </div>
            </div>
          </div>
          <div
            style={{
              fontSize: 12,
              letterSpacing: 2,
              fontWeight: 700,
              opacity: 0.75,
              marginBottom: 14,
            }}
          >
            VILLAGE MILK COLLECTION
          </div>
          <h1
            style={{
              fontSize: "clamp(32px, 4vw, 50px)",
              lineHeight: 1.12,
              letterSpacing: "-1.5px",
              maxWidth: 520,
              margin: "0 0 18px",
            }}
          >
            A simpler way to manage your dairy centre.
          </h1>
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.8,
              maxWidth: 480,
              color: "#d8e9df",
              margin: 0,
            }}
          >
            Manage farmer records, milk collection and payment statements in one
            organised workspace.
          </p>
        </div>
        <div style={{ fontSize: 12, color: "#d8e9df", opacity: 0.85 }}>
          DairyFlow · Village Milk Collection &amp; Payment System
        </div>
      </section>
      <section style={formSide}>
        <div style={card}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 750,
              letterSpacing: 1.5,
              color: "#28734d",
              marginBottom: 10,
            }}
          >
            {isRegister ? "CREATE FARMER ACCOUNT" : "WELCOME BACK"}
          </div>
          <h2
            style={{
              fontSize: 29,
              letterSpacing: "-.8px",
              margin: "0 0 9px",
              color: "#1c3025",
            }}
          >
            {isRegister ? "Register as a farmer" : "Sign in to DairyFlow"}
          </h2>
          <p
            style={{
              fontSize: 14,
              color: "#718078",
              lineHeight: 1.6,
              margin: "0 0 25px",
            }}
          >
            {isRegister
              ? "Create your account to get started."
              : "Enter your account details to continue to your workspace."}
          </p>
          <form
            onSubmit={isRegister ? onRegister : onLogin}
            style={{ display: "grid", gap: 16 }}
          >
            {isRegister && (
              <div>
                <label style={labelStyle}>Full name</label>
                <input
                  style={inputStyle}
                  name="name"
                  autoComplete="name"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            )}

            <div>
              <label style={labelStyle}>Mobile Number</label>
              <input
                style={inputStyle}
                type="tel"
                name="phone"
                autoComplete="tel"
                inputMode="numeric"
                maxLength={10}
                pattern="[0-9]{10}"
                title="Enter a 10-digit mobile number"
                placeholder="Enter 10-digit mobile number"
                onChange={(event) => {
                  event.target.value = event.target.value
                    .replace(/\D/g, "")
                    .slice(0, 10);
                }}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <input
                style={inputStyle}
                type="password"
                name="password"
                autoComplete={isRegister ? "new-password" : "current-password"}
                minLength={isRegister ? 8 : undefined}
                placeholder={
                  isRegister ? "At least 8 characters" : "Enter your password"
                }
                required
              />
            </div>
            <button style={buttonStyle} type="submit" disabled={loading}>
              {loading
                ? "Please wait…"
                : isRegister
                  ? "Create farmer account"
                  : "Sign in"}
            </button>
          </form>
          {message && (
            <div role="status" style={messageStyle}>
              {message}
            </div>
          )}
          <div
            style={{
              textAlign: "center",
              fontSize: 14,
              color: "#718078",
              marginTop: 22,
            }}
          >
            {isRegister ? "Already registered? " : "New farmer? "}
            <button
              type="button"
              onClick={() => setMode(isRegister ? "login" : "register")}
              style={{
                border: 0,
                background: "none",
                padding: 0,
                color: "#21734a",
                fontSize: 14,
                fontWeight: 750,
                cursor: "pointer",
              }}
            >
              {isRegister ? "Sign in" : "Create an account"}
            </button>
          </div>
          <p
            style={{
              fontSize: 11,
              color: "#8a968f",
              textAlign: "center",
              lineHeight: 1.5,
              margin: "22px 0 0",
            }}
          >
            Operator and Secretary accounts are created by an administrator.
          </p>
        </div>
      </section>
    </div>
  );
}

export default App;
