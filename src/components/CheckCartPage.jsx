import React, { useState } from "react";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useToast } from "./ToastContext";
import { comboDeals } from "./Data";

export default function AdminCartViewer() {
  const [user] = useAuthState(auth);
  const [searchEmail, setSearchEmail] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [targetUser, setTargetUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const { showToast } = useToast();

  // 檢查是否為管理員（從 users collection 讀取）
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);

  React.useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user?.uid) {
        setIsCheckingAdmin(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log("用戶資料:", userData);
          console.log("isAdmin 值:", userData.isAdmin);
          console.log("admin 值:", userData.admin);
          
          // 檢查多種可能的欄位名稱
          const adminStatus = userData.isAdmin === true || 
                            userData.admin === true || 
                            userData.role === "admin" ||
                            userData.role === "Admin";
          setIsAdmin(adminStatus);
          console.log("最終 admin 狀態:", adminStatus);
        } else {
          console.log("用戶文件不存在");
        }
      } catch (error) {
        console.error("檢查管理員權限失敗:", error);
      } finally {
        setIsCheckingAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  const checkComboDeals = (items) => {
    const itemQuantities = {};
    items.forEach(item => {
      if (item.no) {
        itemQuantities[item.no] = (itemQuantities[item.no] || 0) + item.quantity;
      }
    });

    const possibleCombos = [];
    comboDeals.forEach(combo => {
      const requiredQuantities = {};
      combo.items.forEach(itemNo => {
        requiredQuantities[itemNo] = (requiredQuantities[itemNo] || 0) + 1;
      });

      const hasAllItems = Object.entries(requiredQuantities).every(
        ([itemNo, requiredQty]) => itemQuantities[parseInt(itemNo)] >= requiredQty
      );

      if (hasAllItems) {
        const maxPossibleCount = Math.min(
          ...Object.entries(requiredQuantities).map(
            ([itemNo, requiredQty]) => Math.floor(itemQuantities[parseInt(itemNo)] / requiredQty)
          )
        );
        possibleCombos.push({ ...combo, maxCount: maxPossibleCount, requiredQuantities });
      }
    });

    if (possibleCombos.length === 0) {
      return { appliedCombos: [], remainingItems: itemQuantities, totalDiscount: 0 };
    }

    const findOptimalCombination = (combos, quantities) => {
      let bestResult = { totalDiscount: 0, appliedCombos: [], remainingItems: quantities };

      combos.forEach(combo => {
        const canApply = Object.entries(combo.requiredQuantities).every(
          ([itemNo, requiredQty]) => quantities[parseInt(itemNo)] >= requiredQty
        );

        if (canApply) {
          const maxApplications = Math.min(
            ...Object.entries(combo.requiredQuantities).map(
              ([itemNo, requiredQty]) => Math.floor(quantities[parseInt(itemNo)] / requiredQty)
            )
          );

          for (let count = maxApplications; count >= 1; count--) {
            const newQuantities = { ...quantities };
            Object.entries(combo.requiredQuantities).forEach(([itemNo, requiredQty]) => {
              newQuantities[parseInt(itemNo)] -= requiredQty * count;
            });

            const currentDiscount = combo.discount * count;
            const remainingCombos = combos.filter(c => c.id !== combo.id);
            const recursiveResult = remainingCombos.length > 0 
              ? findOptimalCombination(remainingCombos, newQuantities)
              : { totalDiscount: 0, appliedCombos: [], remainingItems: newQuantities };

            const totalDiscount = currentDiscount + recursiveResult.totalDiscount;

            if (totalDiscount > bestResult.totalDiscount) {
              bestResult = {
                totalDiscount,
                appliedCombos: [{ ...combo, applicableCount: count }, ...recursiveResult.appliedCombos],
                remainingItems: recursiveResult.remainingItems,
              };
            }
          }
        }
      });

      return bestResult;
    };

    return findOptimalCombination(possibleCombos, itemQuantities);
  };

  const calculatePricing = (items) => {
    const originalTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const comboResult = checkComboDeals(items);
    
    const giftItems = items.filter(item => item.no === 7 || item.no === 8);
    const totalGiftQuantity = giftItems.reduce((sum, item) => sum + item.quantity, 0);
    
    const combo3Applied = comboResult.appliedCombos.find(combo => combo.id === "combo3");
    const giftUsedInCombo = combo3Applied ? combo3Applied.applicableCount : 0;
    
    const availableGiftCount = totalGiftQuantity - giftUsedInCombo;
    const hasAvailableGift = availableGiftCount > 0;
    
    const totalAfterCombo = originalTotal - comboResult.totalDiscount;
    
    let giftDiscount = 0;
    let qualifiesForGift = false;
    
    if (hasAvailableGift) {
      const firstGiftItem = giftItems[0];
      if (firstGiftItem) {
        const totalAfterGiftDiscount = totalAfterCombo - firstGiftItem.price;
        if (totalAfterGiftDiscount >= 1000) {
          qualifiesForGift = true;
          giftDiscount = firstGiftItem.price;
        }
      }
    }
    
    const reachedThreshold = totalAfterCombo >= 1000;
    const currentTotal = totalAfterCombo - giftDiscount;

    return {
      originalTotal,
      finalTotal: currentTotal,
      totalDiscount: comboResult.totalDiscount,
      appliedCombos: comboResult.appliedCombos,
      qualifiesForGift,
      giftDiscount,
      hasAvailableGift,
      totalGiftQuantity,
      giftUsedInCombo,
      availableGiftCount,
      reachedThreshold,
    };
  };

  const handleSearch = async () => {
    if (!searchEmail.trim()) {
      showToast("請輸入 Email");
      return;
    }

    setIsSearching(true);
    try {
      // 查詢用戶
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", searchEmail.trim()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        showToast("找不到該用戶");
        setTargetUser(null);
        setCartItems([]);
        setUserProfile(null);
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      const userId = userDoc.id;

      setTargetUser({ uid: userId, ...userData });
      setUserProfile(userData);

      // 載入用戶購物車
      const cartRef = doc(db, "carts", userId);
      const cartSnap = await getDoc(cartRef);

      if (cartSnap.exists()) {
        const cartData = cartSnap.data();
        setCartItems(cartData.items || []);
        showToast("成功載入購物車");
      } else {
        setCartItems([]);
        showToast("該用戶購物車為空");
      }
    } catch (error) {
      console.error("查詢失敗:", error);
      showToast("查詢失敗：" + error.message);
    } finally {
      setIsSearching(false);
    }
  };

  if (isCheckingAdmin) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "1.2rem", color: "#666", marginBottom: "10px" }}>驗證權限中...</div>
          <div style={{ width: "40px", height: "40px", border: "4px solid #f3f3f3", borderTop: "4px solid #ff512f", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" }}></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }}>
        <div style={{ textAlign: "center", background: "white", padding: "40px", borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}>
          <h2 style={{ color: "#333", marginBottom: "20px" }}>請先登入</h2>
          <button onClick={() => window.location.href = "/"} style={gradientBtnStyle}>回到首頁</button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }}>
        <div style={{ textAlign: "center", background: "white", padding: "40px", borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}>
          <h2 style={{ color: "#dc3545", marginBottom: "20px" }}>⚠️ 權限不足</h2>
          <p style={{ color: "#666", marginBottom: "20px" }}>此頁面僅限管理員訪問</p>
          <button onClick={() => window.location.href = "/"} style={gradientBtnStyle}>回到首頁</button>
        </div>
      </div>
    );
  }

  const pricing = cartItems.length > 0 ? calculatePricing(cartItems) : null;

  return (
    <div style={{ minHeight: "100vh", padding: "40px 20px" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.15)", padding: "30px", marginBottom: "20px" }}>
          <h1 style={{ color: "#333", margin: "0 0 10px 0", textAlign: "center" }}>👨‍💼 管理員購物車查詢</h1>
          <p style={{ textAlign: "center", color: "#666", marginBottom: "30px" }}>查詢任何用戶的購物車內容</p>

          <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
            <input
              type="email"
              placeholder="輸入用戶 Email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              style={{
                flex: 1,
                padding: "12px 16px",
                borderRadius: "8px",
                border: "2px solid #e0e0e0",
                fontSize: "1rem",
                outline: "none",
                transition: "border-color 0.2s"
              }}
            />
            <button
              onClick={handleSearch}
              disabled={isSearching}
              style={{
                ...gradientBtnStyle,
                padding: "12px 30px",
                opacity: isSearching ? 0.6 : 1,
                cursor: isSearching ? "not-allowed" : "pointer"
              }}
            >
              {isSearching ? "搜尋中..." : "🔍 搜尋"}
            </button>
          </div>

          <button 
            onClick={() => window.location.href = "/"} 
            style={{ ...secondaryBtnStyle, width: "100%" }}
          >
            ← 回到首頁
          </button>
        </div>

        {targetUser && (
          <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.15)", padding: "30px" }}>
            <div style={{ background: "linear-gradient(135deg, #667eea20 0%, #764ba220 100%)", padding: "20px", borderRadius: "10px", marginBottom: "24px", border: "2px solid #667eea" }}>
              <h3 style={{ color: "#667eea", margin: "0 0 12px 0" }}>👤 用戶資訊</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", fontSize: "0.95rem" }}>
                <div><strong>姓名：</strong>{userProfile?.name || "未設定"}</div>
                <div><strong>Email：</strong>{targetUser.email}</div>
                <div><strong>電話：</strong>{userProfile?.phone || "未設定"}</div>
                <div><strong>學校：</strong>{userProfile?.school || "未設定"}</div>
                <div><strong>班級座號：</strong>{userProfile?.classandnumber || "未設定"}</div>
              </div>
            </div>

            <h3 style={{ color: "#333", marginBottom: "16px" }}>🛒 購物車內容</h3>

            {cartItems.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
                <p style={{ fontSize: "1.1rem" }}>購物車是空的</p>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
                  {cartItems.map((item, index) => (
                    <div key={index} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", borderRadius: "10px", border: "1px solid #e0e0e0", background: "#fafafa" }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: "bold", marginBottom: "4px", color: "#333" }}>{item.name}</p>
                        <p style={{ color: "#888", fontSize: "0.9rem" }}>單價：NT$ {item.price}</p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: "0.85rem", color: "#888", marginBottom: "2px" }}>數量</div>
                          <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#667eea" }}>{item.quantity}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: "0.85rem", color: "#888", marginBottom: "2px" }}>小計</div>
                          <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#333" }}>NT$ {item.price * item.quantity}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {pricing && pricing.appliedCombos.length > 0 && (
                  <div style={{ padding: "16px", background: "#fff0f6", borderRadius: "10px", border: "1px solid #f9c2d3", marginBottom: "20px" }}>
                    <div style={{ color: "#d63384", fontWeight: "bold", fontSize: "1.1rem", marginBottom: "12px" }}>🎉 套餐折扣</div>
                    {pricing.appliedCombos.map((combo) => (
                      <div key={combo.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span>{combo.name} x {combo.applicableCount}</span>
                        <span>- NT$ {combo.discount * combo.applicableCount}</span>
                      </div>
                    ))}
                    <div style={{ textAlign: "right", marginTop: "8px", fontWeight: "bold" }}>總共節省: NT$ {pricing.totalDiscount}</div>
                  </div>
                )}

                {pricing && (
                  <div style={{ 
                    padding: "16px", 
                    background: pricing.qualifiesForGift && pricing.hasAvailableGift ? "linear-gradient(135deg, #ffd89b 0%, #19547b 100%)" : pricing.reachedThreshold ? "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)" : "#fff8e1", 
                    borderRadius: "10px", 
                    border: pricing.qualifiesForGift && pricing.hasAvailableGift ? "2px solid #f57c00" : pricing.reachedThreshold ? "2px solid #48c6ef" : "1px solid #ffd54f",
                    color: pricing.qualifiesForGift && pricing.hasAvailableGift ? "white" : "#333",
                    marginBottom: "20px"
                  }}>
                    <div style={{ fontWeight: "bold", fontSize: "1.1rem", marginBottom: "8px" }}>🎁 滿千好禮</div>
                    <div style={{ fontSize: "0.95rem" }}>
                      {pricing.qualifiesForGift && pricing.hasAvailableGift ? (
                        <>
                          <div>✅ 已符合滿千贈禮資格！</div>
                          <div style={{ marginTop: "4px" }}>已自動扣除贈品 NT$ {pricing.giftDiscount}</div>
                        </>
                      ) : pricing.reachedThreshold ? (
                        <div>🎉 已滿 NT$ 1000！{pricing.hasAvailableGift ? "但扣除贈品後未達標準" : "尚未加入贈品"}</div>
                      ) : (
                        <div>需消費滿 NT$ 1000（扣除贈品後）</div>
                      )}
                    </div>
                  </div>
                )}

                <div style={{ padding: "20px", background: "#f8f9fa", borderRadius: "10px", border: "1px solid #e9ecef" }}>
                  {pricing && (pricing.totalDiscount > 0 || pricing.giftDiscount > 0) ? (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <span style={{ color: "#6c757d", textDecoration: "line-through" }}>商品小計：</span>
                        <span style={{ color: "#6c757d" }}>NT$ {pricing.originalTotal}</span>
                      </div>
                      {pricing.totalDiscount > 0 && (
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                          <span style={{ color: "#28a745" }}>套餐優惠：</span>
                          <span style={{ color: "#28a745", fontWeight: "bold" }}>- NT$ {pricing.totalDiscount}</span>
                        </div>
                      )}
                      {pricing.giftDiscount > 0 && (
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                          <span style={{ color: "#ff9800" }}>滿千贈品：</span>
                          <span style={{ color: "#ff9800", fontWeight: "bold" }}>- NT$ {pricing.giftDiscount}</span>
                        </div>
                      )}
                      <hr style={{ borderTop: "1px solid #dee2e6", margin: "12px 0" }} />
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <strong style={{ fontSize: "1.3rem", color: "#333" }}>應付金額：</strong>
                        <strong style={{ fontSize: "1.5rem", color: "#ff512f" }}>NT$ {pricing.finalTotal}</strong>
                      </div>
                      <div style={{ textAlign: "right", color: "#28a745", fontSize: "0.9rem", marginTop: "4px" }}>
                        已節省 NT$ {pricing.totalDiscount + pricing.giftDiscount}
                      </div>
                    </>
                  ) : (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <strong style={{ fontSize: "1.3rem", color: "#333" }}>總金額：</strong>
                      <strong style={{ fontSize: "1.5rem", color: "#333" }}>NT$ {pricing?.finalTotal || 0}</strong>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        input:focus {
          border-color: #667eea !important;
        }
      `}</style>
    </div>
  );
}

const gradientBtnStyle = {
  padding: "10px 20px",
  borderRadius: "8px",
  border: "none",
  background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
  boxShadow: "0 4px 12px rgba(102,126,234,0.25)",
  transition: "all 0.2s",
  fontSize: "1rem",
};

const secondaryBtnStyle = {
  padding: "10px 20px",
  borderRadius: "8px",
  border: "2px solid #667eea",
  background: "white",
  color: "#667eea",
  fontWeight: "bold",
  cursor: "pointer",
  transition: "all 0.2s",
  fontSize: "1rem",
};