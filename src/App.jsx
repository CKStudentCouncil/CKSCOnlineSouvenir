import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { IoMdMenu } from "react-icons/io";
import { MdOutlineShoppingBag } from "react-icons/md";

import AuthPage from "./components/AuthPage";
import AccountPage from "./components/AccountPage";
import HomePage from "./components/Home";
import CartPage from "./components/CartPage";
import OrdersPage from "./components/OrderPage";
import ProductPage from "./components/ProductPage"; 
import TermsPage from "./components/TermsPage";
import AboutPage from "./components/AboutPage"; 
import AdminPage from "./components/AdminPage";
import OrderdetailPage from "./components/OrderdetailPage";
import InformationPage from "./components/InformationPage";
import ToastProvider, { useToast } from "./components/ToastContext";
import ComingSoonPage from "./components/ComingoonPage";
import ToolPage from "./components/ToolPage";
import UpdatePage from "./components/UpdatePage";
import CheckCartPage from "./components/CheckCartPage";
import EndPage from "./components/EndPage";

const InfoPage = InformationPage;

const starttime = new Date("2025-11-05T12:00:00+08:00");
//const endtime = new Date("2025-11-20T11:00:59+08:00");
const endtime = new Date("2025-11-28T13:00:00+08:00");
const now = new Date();
const isAfterStartTime = now >= starttime;
const isAfterEndTime = now >= endtime;
const isinfoPage = window.location.pathname === "/info";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          // 從 Firestore 讀取用戶資料和角色
          const userRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userRef);
          
          let isAdmin = false;
          let isManager = false;
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            // 使用 Firestore 中的 role 欄位判斷
            isAdmin = userData.role === "admin";
            isManager = userData.role === "manager";
          }
          
          // 正確設定用戶狀態,包含所有屬性
          setUser({ 
            ...currentUser, 
            isAdmin, 
            isManager 
          });
        } catch (error) {
          console.error("Error fetching user role:", error);
          // 發生錯誤時預設為非管理員/管理者
          setUser({ 
            ...currentUser, 
            isAdmin: false, 
            isManager: false 
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(120deg, #e0eafc 0%, #cfdef3 100%)"
      }}>
        <p style={{ fontSize: "1.2rem", color: "#333" }}>Loading...</p>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut(auth);
    showToast("已登出");
    setUser(null);
    setDrawerOpen(false);
  };

  const drawerBtnStyle = {
    padding: "10px 16px",
    marginBottom: "12px",
    border: "none",
    borderRadius: "8px",
    background: "linear-gradient(90deg, #ff512f 0%, #dd2476 100%)",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    width: "100%",
    textAlign: "left",
  };

  // 判斷是否有管理權限 (admin 或 manager)
  const hasManagePermission = user && (user.isAdmin || user.isManager);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(120deg, #e0eafc 0%, #cfdef3 100%)" }}>
      {/* Header */}
      <header
        style={{
          padding: "10px 20px",
          marginBottom: "32px",
          background: "white",
          color: "black",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
        }}
      >
        {/* 左側漢堡菜單 */}
        <button
          disabled={isinfoPage}
          onClick={() => setDrawerOpen(true)}
          style={{
            border: "none",
            fontSize: "1.5rem",
            background: "transparent",
            cursor: "pointer",
          }}
        >
          <IoMdMenu />
        </button>

        <span style={{ fontSize: "1.0rem", fontWeight: "bold", letterSpacing: "2px" }}>
          建中校慶紀念品訂購系統
        </span>

        {user ? (
          <button
            disabled={isinfoPage}
            onClick={() => navigate("/cart")}
            style={{
              border: "none",
              background: "transparent",
              fontSize: "1.5rem",
              cursor: "pointer",
            }}
          >
            <MdOutlineShoppingBag />
          </button>
        ) : (
          <button
            onClick={() => navigate("/auth")}
            style={{
              padding: "6px 14px",
              borderRadius: "8px",
              border: "none",
              background: "linear-gradient(90deg, #ff512f 0%, #dd2476 100%)",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            登入 / 註冊
          </button>
        )}
      </header>

      {/* Drawer */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "260px",
          height: "100%",
          background: "#fff",
          boxShadow: drawerOpen ? "2px 0 12px rgba(0,0,0,0.2)" : "none",
          padding: "20px",
          display: drawerOpen ? "flex" : "none",
          flexDirection: "column",
          transition: "left 0.3s",
          zIndex: 1000,
        }}
      >
        <button
          onClick={() => setDrawerOpen(false)}
          style={{
            alignSelf: "flex-end",
            marginBottom: "20px",
            background: "transparent",
            border: "none",
            fontSize: "1.5rem",
            cursor: "pointer",
          }}
        >
          &times;
        </button>

        {user ? (
          <>
            <button onClick={() => { navigate("/"); setDrawerOpen(false); }} style={drawerBtnStyle}>首頁</button>
            <button onClick={() => { navigate("/cart"); setDrawerOpen(false); }} style={drawerBtnStyle}>購物車</button>
            <button onClick={() => { navigate("/orders"); setDrawerOpen(false); }} style={drawerBtnStyle}>我的訂單</button>
            <button onClick={() => { navigate("/info"); setDrawerOpen(false); }} style={drawerBtnStyle}>修改資料</button>
            <button onClick={() => { navigate("/terms"); setDrawerOpen(false); }} style={drawerBtnStyle}>使用者條款</button>
            <button onClick={() => { navigate("/about"); setDrawerOpen(false); }} style={drawerBtnStyle}>關於</button>
            
            {/* 管理員專屬功能 */}
            {user.isAdmin && (
              <>
                <button onClick={() => { navigate("/admin"); setDrawerOpen(false); }} style={drawerBtnStyle}>後台管理</button>
                <button onClick={() => { navigate("/account"); setDrawerOpen(false); }} style={drawerBtnStyle}>帳號管理</button>
                <button onClick={() => { navigate("/checkcart"); setDrawerOpen(false); }} style={drawerBtnStyle}>檢查購物車</button>
                <button onClick={() => { navigate("/tool"); setDrawerOpen(false); }} style={drawerBtnStyle}>工具</button>
              </>
            )}
            
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginTop: "auto",
              padding: "12px",
              borderRadius: "12px",
              background: "linear-gradient(120deg, #fdfbfb 0%, #ebedee 100%)",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              marginBottom: 0,
            }}>
              <img 
                src={user.photoURL || "https://via.placeholder.com/48?text=👤"} 
                alt="User Avatar"
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid #ddd"
                }}
              />
              <div>
                <p style={{ margin: 0, fontWeight: "bold", fontSize: "1rem", color: "#333" }}>
                  {user.displayName || "未命名用戶"}
                </p>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#666" }}>
                  {user.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              style={{
                ...drawerBtnStyle,
                marginTop: 20,
                background: "linear-gradient(90deg, #232526 0%, #414345 100%)",
                marginBottom: 40,
              }}
            >
              登出
            </button>
          </>
        ) : (
          <>
            <button onClick={() => { navigate("/auth"); setDrawerOpen(false); }} style={drawerBtnStyle}>登入 / 註冊</button>
            <button onClick={() => { navigate("/terms"); setDrawerOpen(false); }} style={drawerBtnStyle}>使用者條款</button>
            <button onClick={() => { navigate("/about"); setDrawerOpen(false); }} style={drawerBtnStyle}>關於</button>
          </>
        )}
      </div>

      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.3)",
            zIndex: 900,
          }}
        />
      )}

      {/* Main Content */}
      <main style={{ maxWidth: "900px", margin: "16px auto 0", padding: "0 12px" }}>
        <Routes>
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/info" element={<InfoPage />} />
          {!user ? (
            <>
              <Route path="*" element={<AuthPage />} />
            </>
          ) : (
            <>
              {isAfterStartTime && !isAfterEndTime ? (
                <>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/product/:id" element={<ProductPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/orders" element={<OrdersPage />} />
                  <Route path="/orders/:id" element={<OrderdetailPage />} />
                  <Route path="/tool" element={<ToolPage />} />
                  <Route path="/update" element={<UpdatePage />} />
                  <Route path="/checkcart" element={<CheckCartPage />} />
                </>
              ) : isAfterEndTime ? (
                  <>
                    <Route path="/end" element={<EndPage />} />
                    <Route
                      path="/"
                      element={hasManagePermission ? <HomePage /> : <Navigate to="/end" replace />}
                    />
                    <Route
                      path="/product/:id"
                      element={hasManagePermission ? <ProductPage /> : <Navigate to="/end" replace />}
                    />
                    <Route
                      path="/cart"
                      element={hasManagePermission ? <CartPage /> : <Navigate to="/end" replace />}
                    />
                    <Route
                      path="/orders"
                      element={<OrdersPage />}
                    />
                    <Route
                      path="/orders/:id"
                      element={hasManagePermission ? <OrderdetailPage /> : <Navigate to="/end" replace />}
                    />
                  </>
                ) : (
                  <>
                    <Route
                      path="/"
                      element={hasManagePermission ? <HomePage /> : <Navigate to="/info" replace />}
                    />
                    <Route
                      path="/product/:id"
                      element={hasManagePermission ? <ProductPage /> : <Navigate to="/comingsoon" replace />}
                    />
                    <Route
                      path="/cart"
                      element={hasManagePermission ? <CartPage /> : <Navigate to="/comingsoon" replace />}
                    />
                    <Route
                      path="/orders"
                      element={hasManagePermission ? <OrdersPage /> : <Navigate to="/comingsoon" replace />}
                    />
                    <Route
                      path="/orders/:id"
                      element={hasManagePermission ? <OrderdetailPage /> : <Navigate to="/comingsoon" replace />}
                    />
                  </>
                )}
              {/* 管理員專屬頁面 */}
              <Route
                path="/admin"
                element={hasManagePermission ? <AdminPage /> : <Navigate to="/" replace />}
              />
              <Route
                path="/account"
                element={user.isAdmin ? <AccountPage /> : <Navigate to="/" replace />}
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
      </main>
    </div>
  );
}

export default function AppWrapper() {
  return (
    <ToastProvider>
      <Router>
        <App />
      </Router>
    </ToastProvider>
  );
}