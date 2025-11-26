import React from "react";
import { useNavigate } from "react-router-dom";

export default function ProductPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: "100vh",
      padding: "40px 20px",
      display: "flex",
      justifyContent: "center",
      fontFamily: "'Klee One', cursive",
    }}>
      <div style={{
        width: "100%",
        maxWidth: "600px",
        background: "white",
        borderRadius: "12px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
        padding: "30px",
        display: "flex",
        flexDirection: "column",
      }}>
        <h1 style={{ textAlign: "center", marginBottom: "16px", color: "#333" }}>關於本系統</h1>
        <p style={{ color: "#000000ff", marginBottom: "24px" }}>
            此系統係由建國中學班聯會八十屆上主席暨班級代表大會七十九屆下副議長孫逢邦與班聯會八十屆上行政部門資訊股股長唐盛鈞共同製作。
        </p>
        <p style={{ color: "#000000ff", marginBottom: "24px" }}>
            本系統主要用於臺北市立建國高級中學班聯會校慶紀念品之訂購，旨在提供各界一個便捷的線上訂購平台，購買本校校慶紀念品。
        </p>
        <p style={{ color: "#000000ff", marginBottom: "24px" }}>
            然此系統仍於開發階段，尚有不足之處，希望各界能提供意見與建議，以利改進。
        </p>
        <br />
        <div style={{ color: "#000000ff", marginBottom: "24px" }}>
            聯絡方式：
            <ul>
            <li>主席孫逢邦：chris20090731@gmail.com</li>
            <br />
            <li>資訊股股長唐盛鈞：ck11300329@gl.ck.tp.edu.tw</li>
            <br />
            <li>建中班聯會公務信箱：ckhssc@gl.ck.tp.edu.tw</li>
            </ul>
        </div>
        <br />
        <button
          onClick={() => open("https://forms.gle/Grnk7FXfrXDQutE87", "_blank")}
          style={{
            padding: "12px 28px",
            background: "linear-gradient(90deg, #2f97ffff 0%, #7724ddff 100%)",
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontWeight: "bold",
            fontSize: "1rem",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(36, 82, 221, 0.25)",
            transition: "all 0.2s",
            alignItems: "center",
          }}
          >
            使用者滿意度調查
          </button><br />
        {/* 回首頁按鈕 */}
        <button
          onClick={() => navigate("/")}
          style={{
            padding: "12px 28px",
            background: "linear-gradient(90deg, #ff512f 0%, #dd2476 100%)",
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontWeight: "bold",
            fontSize: "1rem",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(221,36,118,0.25)",
            transition: "all 0.2s",
            alignItems: "center",
          }}
        >
          回到首頁
        </button>
      </div>
    </div>
  );
}
