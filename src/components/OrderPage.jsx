import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs, orderBy, doc, deleteDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { useToast } from "./ToastContext";

export default function OrderPage() {
  const [user] = useAuthState(auth);
  const [orders, setOrders] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // 儲存要刪除的訂單 ID
  const navigate = useNavigate();
  const { showToast } = useToast();

  const fetchOrders = async () => {
    try {
      const q = query(
        collection(db, "orders"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("取得訂單錯誤:", err);
      showToast("❌ 取得訂單失敗：" + err.message);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchOrders();
  }, [user]);

  // 刪除訂單
  const handleDeleteOrder = async (orderId) => {
    try {
      await deleteDoc(doc(db, "orders", orderId));
      
      // 重新載入訂單列表
      await fetchOrders();
      
      // 調整當前索引
      if (currentIndex >= orders.length - 1 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
      
      setDeleteConfirm(null);
      showToast("✅ 訂單已刪除");
    } catch (err) {
      console.error("刪除訂單錯誤:", err);
      showToast("❌ 刪除訂單失敗：" + err.message);
    }
  };

  // 確認刪除對話框
  const confirmDelete = (orderId) => {
    setDeleteConfirm(orderId);
  };

  // 取消刪除
  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  // 滑動到上一個訂單
  const handlePrevious = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? orders.length - 1 : prev - 1
    );
  };

  // 滑動到下一個訂單
  const handleNext = () => {
    setCurrentIndex((prev) => 
      prev === orders.length - 1 ? 0 : prev + 1
    );
  };

  // 跳轉到指定訂單
  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  // 處理觸控滑動
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrevious();
    }
  };

  if (!user) return <p style={{ textAlign: "center", marginTop: "40px" }}>請先登入查看訂單</p>;

  return (
    <div style={{
      minHeight: "100vh",
      padding: "40px 20px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }}>
      <h1 style={{ marginBottom: "30px", color: "#333" }}>我的訂單</h1>
      <button
        onClick={() => open("https://forms.gle/Grnk7FXfrXDQutE87", "_blank")}
        style={{
          marginTop: "30px",
          padding: "12px 28px",
          background: "linear-gradient(90deg, #ff512f 0%, #dd2476 100%)",
          color: "white",
          border: "none",
          borderRadius: "10px",
          fontWeight: "bold",
          fontSize: "1rem",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(221,36,118,0.25)",
          transition: "all 0.2s"
        }}
      >
        使用者滿意度調查
      </button><br />
      {orders.length === 0 && <p style={{ color: "#555" }}>你還沒有任何訂單</p>}

      {orders.length > 0 && (
        <>
          {/* 訂單計數器 */}
          <div style={{
            textAlign: "center",
            marginBottom: "20px",
            fontSize: "0.9rem",
            color: "#666"
          }}>
            第 {currentIndex + 1} 筆 / 共 {orders.length} 筆訂單
          </div>

          {/* 主要卡片容器 */}
          <div style={{
            position: "relative",
            width: "100%",
            maxWidth: "800px",
            minHeight: "600px",
            overflow: "hidden",
            margin: "0 auto",
            padding: "0 30px",
            boxSizing: "border-box"
          }}>
            {/* 卡片滑動容器 */}
            <div
              style={{
                display: "flex",
                width: `${orders.length * 100}%`,
                height: "100%",
                transform: `translateX(-${currentIndex * (100 / orders.length)}%)`,
                transition: "transform 0.3s ease-in-out"
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {orders.map((order, index) => (
                <div
                  key={order.id}
                  style={{
                    width: `${100 / orders.length}%`,
                    height: "100%",
                    padding: "0 5px",
                    boxSizing: "border-box"
                  }}
                >
                  <div style={{
                    background: "white",
                    borderRadius: "12px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    padding: "24px",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    position: "relative"
                  }}>
                    {/* 重新設計的標頭區域 */}
                    <div style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                      marginBottom: "8px"
                    }}>
                      {/* 第一行：交貨、付款狀態 */}
                      <div style={{
                        display: "flex",
                        justifyContent: "center"
                      }}>
                        <div style={{
                          background: order.delivered ? "#dcfce7" : "#fef3c7",
                          color: order.delivered ? "#166534" : "#92400e",
                          padding: "10px 20px",
                          borderRadius: "25px",
                          fontSize: "1rem",
                          fontWeight: "bold",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px"
                        }}>
                          {order.delivered ? "✅ 已交貨" : "⏳ 未交貨"}
                        </div>
                      </div>
                      <div style={{
                        display: "flex",
                        justifyContent: "center"
                      }}>
                        <div style={{
                          background: order.paid ? "#dcfce7" : "#fef3c7",
                          color: order.paidd ? "#166534" : "#92400e",
                          padding: "10px 20px",
                          borderRadius: "25px",
                          fontSize: "1rem",
                          fontWeight: "bold",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px"
                        }}>
                          {order.paid ? "✅ 已付款" : "⏳ 未付款"}
                        </div>
                      </div>

                      {/* 第二行：訂單編號 */}
                      <div style={{
                        display: "flex",
                        justifyContent: "center"
                      }}>
                        <div style={{
                          fontSize: "0.9rem",
                          color: "#666",
                          fontWeight: "500",
                          background: "#f8fafc",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          border: "1px solid #e2e8f0"
                        }}>
                          訂單編號：#{order.id}
                        </div>
                      </div>

                      {/* 第三行：刪除按鈕 */}
                      <div style={{
                        display: "flex",
                        justifyContent: "center"
                      }}>
                        <button
                          onClick={() => confirmDelete(order.id)}
                          style={{
                            padding: "8px 16px",
                            borderRadius: "8px",
                            border: "none",
                            background: "#fee2e2",
                            color: "#dc2626",
                            fontSize: "0.9rem",
                            fontWeight: "bold",
                            cursor: "pointer",
                            transition: "all 0.2s",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            boxShadow: "0 2px 4px rgba(220, 38, 38, 0.1)"
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = "#fecaca";
                            e.target.style.transform = "translateY(-1px)";
                            e.target.style.boxShadow = "0 4px 8px rgba(220, 38, 38, 0.15)";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = "#fee2e2";
                            e.target.style.transform = "translateY(0)";
                            e.target.style.boxShadow = "0 2px 4px rgba(220, 38, 38, 0.1)";
                          }}
                        >
                          🗑️ 刪除訂單
                        </button>
                      </div>
                    </div>

                    {/* 主要訂單資訊 */}
                    <div style={{ 
                      background: "#f8fafc", 
                      borderRadius: "8px", 
                      padding: "16px",
                      display: "flex", 
                      flexDirection: "column", 
                      gap: "12px" 
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#666", fontSize: "1rem" }}>原始金額</span>
                        <span style={{ fontWeight: "500", fontSize: "1rem" }}>NT$ {order.originalTotal}</span>
                      </div>
                      
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#666", fontSize: "1rem" }}>總金額</span>
                        <span style={{ 
                          fontWeight: "bold", 
                          fontSize: "1.2rem", 
                          color: "#059669" 
                        }}>
                          NT$ {order.finalTotal}
                        </span>
                      </div>

                      <div style={{ 
                        fontSize: "0.9rem", 
                        color: "#888",
                        textAlign: "center",
                        paddingTop: "8px",
                        borderTop: "1px solid #e2e8f0"
                      }}>
                        {order.createdAt?.toDate().toLocaleString()}
                      </div>
                    </div>

                    {/* 商品列表 */}
                    <div style={{
                      background: "#f9f9f9",
                      borderRadius: "8px",
                      padding: "16px",
                      flex: "1",
                      overflow: "auto"
                    }}>
                      <div style={{
                        fontWeight: "600",
                        marginBottom: "12px",
                        fontSize: "1rem",
                        color: "#333"
                      }}>
                        購買商品
                      </div>
                      <table style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: "0.9rem",
                        backgroundColor: "white",
                        borderRadius: "4px",
                        overflow: "hidden",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                      }}>
                        <thead>
                          <tr style={{
                            backgroundColor: "#f3f4f6",
                            borderBottom: "1px solid #e5e7eb"
                          }}>
                            <th style={{
                              padding: "12px 16px",
                              textAlign: "left",
                              fontWeight: "600",
                              color: "#374151"
                            }}>
                              商品名稱
                            </th>
                            <th style={{
                              padding: "12px 16px",
                              textAlign: "center",
                              fontWeight: "600",
                              color: "#374151"
                            }}>
                              數量
                            </th>
                            <th style={{
                              padding: "12px 16px",
                              textAlign: "right",
                              fontWeight: "600",
                              color: "#374151"
                            }}>
                              價格
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map(item => (
                            <tr key={item.id} style={{
                              borderBottom: "1px solid #f3f4f6",
                              transition: "background-color 0.2s"
                            }}>
                              <td style={{
                                padding: "12px 16px",
                                color: "#374151"
                              }}>
                                {item.name}
                              </td>
                              <td style={{
                                padding: "12px 16px",
                                textAlign: "center",
                                color: "#6b7280"
                              }}>
                                {item.quantity}
                              </td>
                              <td style={{
                                padding: "12px 16px",
                                textAlign: "right",
                                color: "#059669",
                                fontWeight: "500"
                              }}>
                                NT$ {item.price}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* 套餐折扣明細 */}
                    {order.appliedCombos && order.appliedCombos.length > 0 && (
                      <div style={{ 
                        background: "linear-gradient(135deg, #fff0f6 0%, #fdf2f8 100%)", 
                        border: "1px solid #f9c2d3", 
                        borderRadius: "8px", 
                        padding: "16px"
                      }}>
                        <div style={{ 
                          fontWeight: "600", 
                          marginBottom: "12px",
                          fontSize: "1rem",
                          color: "#be185d"
                        }}>
                          🎉 套餐優惠
                        </div>
                        <ul style={{ 
                          margin: 0, 
                          paddingLeft: "20px",
                          fontSize: "0.9rem",
                          lineHeight: "1.5"
                        }}>
                          {order.appliedCombos.map(combo => (
                            <li key={combo.id} style={{ marginBottom: "6px" }}>
                              <div>{combo.name} × {combo.applicableCount}</div>
                              <div style={{ 
                                color: "#be185d", 
                                fontSize: "0.85rem",
                                fontWeight: "500"
                              }}>
                                折扣 NT$ {combo.totalDiscount}
                              </div>
                            </li>
                          ))}
                        </ul>
                        <div style={{ 
                          marginTop: "12px", 
                          fontWeight: "bold", 
                          color: "#be185d",
                          textAlign: "center",
                          fontSize: "1rem",
                          background: "rgba(190, 24, 93, 0.1)",
                          padding: "8px",
                          borderRadius: "6px"
                        }}>
                          💰 共節省 NT$ {order.totalDiscount}
                        </div>
                      </div>
                    )}

                    {/* QR Code */}
                    <div style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "8px",
                      background: "#f8fafc",
                      padding: "16px",
                      borderRadius: "8px"
                    }}>
                      {(() => {
                        const baseUrl = (import.meta && import.meta.env && import.meta.env.VITE_PUBLIC_BASE_URL) || window.location.origin;
                        const url = `${baseUrl}/orders/${order.id}`;
                        return (
                          <>
                            <QRCodeCanvas value={url} size={120} />
                            <div style={{
                              fontSize: "0.8rem",
                              color: "#666",
                              textAlign: "center"
                            }}>
                              掃描查看訂單詳情
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 左右箭頭 */}
            {orders.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  style={{
                    position: "absolute",
                    left: "5px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    border: "2px solid #e2e8f0",
                    background: "white",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.4rem",
                    color: "#374151",
                    transition: "all 0.2s",
                    zIndex: 10,
                    userSelect: "none"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "#f3f4f6";
                    e.target.style.color = "#1f2937";
                    e.target.style.transform = "translateY(-50%) scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "white";
                    e.target.style.color = "#374151";
                    e.target.style.transform = "translateY(-50%) scale(1)";
                  }}
                >
                  ←
                </button>
                <button
                  onClick={handleNext}
                  style={{
                    position: "absolute",
                    right: "5px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    border: "2px solid #e2e8f0",
                    background: "white",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.4rem",
                    color: "#374151",
                    transition: "all 0.2s",
                    zIndex: 10,
                    userSelect: "none"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "#f3f4f6";
                    e.target.style.color = "#1f2937";
                    e.target.style.transform = "translateY(-50%) scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "white";
                    e.target.style.color = "#374151";
                    e.target.style.transform = "translateY(-50%) scale(1)";
                  }}
                >
                  →
                </button>
              </>
            )}
          </div>

          {/* 指示點 */}
          {orders.length > 1 && (
            <div style={{
              display: "flex",
              justifyContent: "center",
              gap: "8px",
              marginTop: "20px"
            }}>
              {orders.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    border: "none",
                    background: currentIndex === index ? 
                      "linear-gradient(90deg, #ff512f 0%, #dd2476 100%)" : 
                      "#ddd",
                    cursor: "pointer",
                    transition: "all 0.3s"
                  }}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* 刪除確認對話框 */}
      {deleteConfirm && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "white",
            borderRadius: "12px",
            padding: "30px",
            maxWidth: "400px",
            width: "90%",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)"
          }}>
            <div style={{
              textAlign: "center",
              marginBottom: "20px"
            }}>
              <div style={{
                fontSize: "3rem",
                marginBottom: "16px"
              }}>
                ⚠️
              </div>
              <h3 style={{
                margin: 0,
                marginBottom: "8px",
                color: "#dc2626",
                fontSize: "1.2rem"
              }}>
                確認刪除訂單
              </h3>
              <p style={{
                margin: 0,
                color: "#666",
                fontSize: "0.95rem",
                lineHeight: "1.4"
              }}>
                您確定要刪除訂單 #{deleteConfirm} 嗎？<br />
                此操作無法復原。
              </p>
            </div>
            
            <div style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center"
            }}>
              <button
                onClick={cancelDelete}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  background: "#f9fafb",
                  color: "#374151",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#f3f4f6";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "#f9fafb";
                }}
              >
                取消
              </button>
              <button
                onClick={() => handleDeleteOrder(deleteConfirm)}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#dc2626",
                  color: "white",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#b91c1c";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "#dc2626";
                }}
              >
                確定刪除
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => navigate("/")}
        style={{
          marginTop: "30px",
          padding: "12px 28px",
          background: "linear-gradient(90deg, #ff512f 0%, #dd2476 100%)",
          color: "white",
          border: "none",
          borderRadius: "10px",
          fontWeight: "bold",
          fontSize: "1rem",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(221,36,118,0.25)",
          transition: "all 0.2s"
        }}
      >
        回到首頁
      </button>
    </div>
  );
}