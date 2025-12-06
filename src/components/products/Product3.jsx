import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCart } from "../CartContext";
import { useToast } from "../ToastContext";

export default function Product3() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { id } = useParams();

  const product = {
    no: 3,
    id: 3,    
    name: "真皮證件套",
    price: 200,
    orPrice: 400,
  };

  const handleAddToCart = () => {
    addToCart(product);
    showToast(`${product.name} 已加入購物車`);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "40px 20px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "600px",
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
          padding: "30px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h1 style={{ marginBottom: "8px", color: "#333" }}>{ product.name }</h1>

        {/* 價格區塊 */}
        <div
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            color: "#dd2476",
            marginBottom: "24px",
            textAlign: "center",
          }}
        >
          <div style={{textDecoration: "line-through", opacity: 0.7}}>
            NT$ 400
          </div>
          校慶特惠價：
          NT$ 250
        </div>

        {/* 商品圖片示意 */}
        <div
          style={{
            width: "100%",
            maxWidth: "300px",
            height: "300px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          <img
            src={`${import.meta.env.BASE_URL}images/product-${id}.png`}
            alt={`商品 ${id}`}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        {/* 按鈕群組 */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
          <button
            onClick={handleAddToCart}
            style={{
              padding: "12px 24px",
              background: "linear-gradient(90deg, #ff512f 0%, #dd2476 100%)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontWeight: "bold",
              fontSize: "1rem",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(221,36,118,0.25)",
              transition: "all 0.2s",
              minWidth: "140px",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 16px rgba(221,36,118,0.35)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 12px rgba(221,36,118,0.25)";
            }}
          >
            加入購物車
          </button>
        </div>

        {/* 回首頁按鈕 */}
        <button
          onClick={() => navigate("/")}
          style={{
            padding: "12px 28px",
            background: "#f5f5f5",
            color: "#333",
            border: "1px solid #ddd",
            borderRadius: "10px",
            fontWeight: "bold",
            fontSize: "1rem",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "#eeeeee";
            e.target.style.borderColor = "#bbb";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "#f5f5f5";
            e.target.style.borderColor = "#ddd";
          }}
        >
          回到首頁
        </button>
      </div>
    </div>
  );
}