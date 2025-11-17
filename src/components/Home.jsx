// Home.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { products, comboDeals } from "./Data";

export default function Home() {
  const navigate = useNavigate();
  const [selectedItems] = useState(new Set());

  return (
    <div style={{ padding: "20px" }}>
      {/* 套餐說明 */}
      <div
        style={{
          marginBottom: "30px",
          padding: "25px",
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          borderRadius: "20px",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          color: "black",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
        }}
      >
        <h2 style={{ margin: "0 0 15px 0", textAlign: "center" }}>🎁 套餐優惠</h2>
        <p
          style={{
            textAlign: "center",
            marginBottom: "20px",
            color: "#0000009f",
          }}
        >
          各品項加入購物車後將會自動計算最佳組合並折扣
        </p>

        <p
          style={{
            textAlign: "center",
            marginBottom: "20px",
            background: "#ffe7e7ff",
            border: "1px solid #ff0000ff",
            display: "flex",
            flexWrap: "wrap",
            gap: "15px",
            justifyContent: "center",
            color: "#a10d0dff",
            padding: "15px",
            borderRadius: "10px",
            backdropFilter: "blur(10px)",
            minWidth: "200px",
          }}
        >
          滿$1000即贈送徽章或鑰匙圈 1 個
          <br />
          限時優惠，只到12月5日
          <br />
          DM上棒球外套誤植為650元，實際價格應為700元，一切價格均以網站為準，造成不便敬請見諒！
        </p>

        {/* 套餐卡片 */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "15px",
            justifyContent: "center",
          }}
        >
          {comboDeals.map((combo) => (
            <div
              key={combo.id}
              style={{
                background: "rgba(255, 255, 255, 0.73)",
                padding: "15px",
                borderRadius: "10px",
                backdropFilter: "blur(10px)",
                minWidth: "200px",
              }}
            >
              <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
                {combo.name}
              </div>
              <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>
                包含：
                {combo.items
                  .map((no) => products.find((p) => p.no === no)?.category)
                  .join(" + ")}
                {combo.note && (
                  <div
                    style={{
                      marginTop: "5px",
                      fontSize: "0.85rem",
                      color: "#555",
                    }}
                  >
                    ({combo.note})
                  </div>
                )}
              </div>
              <div style={{ marginTop: "8px" }}>
                <span
                  style={{ textDecoration: "line-through", opacity: 0.7 }}
                >
                  ${combo.originalPrice}
                </span>
                <span
                  style={{
                    marginLeft: "10px",
                    fontWeight: "bold",
                    fontSize: "1.1rem",
                  }}
                >
                  ${combo.comboPrice}
                </span>
                <span
                  style={{ marginLeft: "10px", color: "#ffc400ff" }}
                >
                  省${combo.showdiscount}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 商品列表 */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          justifyContent: "center",
          paddingBottom: "40px",
        }}
      >
        {products.map((product) => {
          const isSelected = selectedItems.has(product.no);
          return (
            <div
              key={product.id}
              style={{
                width: "220px",
                padding: "16px",
                borderRadius: "12px",
                background: isSelected
                  ? "linear-gradient(135deg, #4CAF50, #45a049)"
                  : "white",
                color: isSelected ? "white" : "black",
                boxShadow: isSelected
                  ? "0 8px 20px rgba(76,175,80,0.3)"
                  : "0 4px 12px rgba(0,0,0,0.1)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                transition: "all 0.3s",
                cursor: "pointer",
              }}
            >
              {/* 商品名稱 */}
              <div
                style={{
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  marginBottom: "8px",
                }}
              >
                {product.name}
              </div>

              {/* 價格區塊 */}
              <div
                style={{
                  color: isSelected ? "#e8f5e8" : "#555",
                  marginBottom: "12px",
                }}
              >
                {/* 原價 (不是50才顯示) */}
                {product.orPrice && product.orPrice !== 50 && (
                  <div
                    style={{
                      textDecoration: "line-through",
                      opacity: 0.7,
                    }}
                  >
                    {`$${product.orPrice}`}
                  </div>
                )}

                {/* 現價 */}
                <div style = {{textAlign: "center"}}>{`$${product.price}`}</div>
              </div>

              {/* 商品圖片 */}
              <div
                style={{
                  width: "200px",
                  height: "200px",
                  marginBottom: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "12px",
                  overflow: "hidden",
                }}
              >
                <img
                   src={`${import.meta.env.BASE_URL}images/product-${product.textid}.png`}
                  alt={product.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>

              {/* 按鈕 */}
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  style={{
                    padding: "8px 16px",
                    background: isSelected
                      ? "rgba(255,255,255,0.2)"
                      : "linear-gradient(90deg, #ff512f 0%, #dd2476 100%)",
                    color: "white",
                    border: isSelected ? "2px solid white" : "none",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    minWidth: "70px",
                  }}
                  onClick={() => navigate(`/product/${product.textid}`)}
                >
                  查看
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
