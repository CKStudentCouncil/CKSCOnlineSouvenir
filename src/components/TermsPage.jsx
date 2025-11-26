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
        <h1 style={{ textAlign: "center", marginBottom: "16px", color: "#333" }}>臺北市立建國高級中學班聯會校慶紀念品訂購系統使用者條款</h1>
        <p style={{ color: "#000000ff", marginBottom: "24px" }}>
          歡迎您使用臺北市立建國高級中學班聯會校慶紀念品訂購系統（以下簡稱「本系統」）。為保障使用者權益並維護系統運作秩序，請您在使用本系統前，詳閱以下使用者條款。當您使用本系統，即表示您已閱讀、瞭解並同意遵守本條款之所有內容。
        </p>
        <h3 style={{ color: "#000000ff", marginBottom: "24px" }}>
          一、個人資料保護
        </h3>
        <ul style={{ color: "#000000ff", marginBottom: "24px" }}>
        <li>本系統可能蒐集、處利、利用您於使用過程中提供之個人資料（如姓名、電子郵件帳號、班級、座號、學號、電話、密碼、IP 位址等），僅用於系統管理、使用者識別與功能提供，不會用於其他未經授權之用途。</li>
        <li>您有權就您所提供之個人資料，依《個人資料保護法》行使查詢、閱覽、補充、更正、停止蒐集、處理或使用及刪除等權利，請聯繫系統管理員辦理。</li>
        <li>本系統將採取合理技術與資安管理措施，保護您的個人資料安全，防止未經授權之存取、洩漏或竄改。</li>
        <li>如有第三人以不法手段未經授權存取、洩漏或竄改您的個人資料，本系統不負任何責任，使用者應自行向第三人究責。</li>
        </ul>
        <h3 style={{ color: "#000000ff", marginBottom: "24px" }}>
            二、使用者責任
        </h3>
        <ul style={{ color: "#000000ff", marginBottom: "24px" }}>
        <li>您應保證所提供之使用者內容不違反中華民國法律、臺北市立建國高級中學學生獎懲規定及臺北市立建國高級中學班聯會內法。</li>
        <li>您不得利用本系統從事任何違法、不當或侵害他人權益之行為。</li>
        <li>您應妥善保管您的帳號及密碼，對於任何經由您的帳號所進行之行為，您應負完全責任。</li>
        <li>若您違反本條款任一項，本系統有權利即停止您的使用權限，您並應自行承擔一切法律責任，並賠償本系統及第三人因此所受之損害。</li>
        </ul>
        <h3 style={{ color: "#000000ff", marginBottom: "24px" }}>
            三、平台責任免除與內容管理
        </h3>
        <ul style={{ color: "#000000ff", marginBottom: "24px" }}>
        <li>對於任何因使用者提供之內容所生錯誤、遺漏、違法事項或損害，本系統不負任何責任。</li>
        <li>本系統保留隨時審查、移除、限制或封鎖任何違反本條款或相關法規之內容或帳號之權利，無須事先通知。</li>
        <li>如有未經授權之存取、洩漏或竄改本平台之資料庫，本系統將依法追究刑事責任及請求民事賠償。</li>
        </ul>
        <h3 style={{ color: "#000000ff", marginBottom: "24px" }}>
            四、條款修改
        </h3>
        <ul style={{ color: "#000000ff", marginBottom: "24px" }}>
        <li>本系統有權隨時修改本使用者條款，並將更新內容公告於系統，標註最後更新日期。</li>
        <li>條款更新後，您繼續使用本系統即視為同意更新內容。如您不同意修改內容，請立即停止使用本系統。</li>
        </ul>
        <h3 style={{ color: "#000000ff", marginBottom: "24px" }}>
            五、準據法與管轄法院
        </h3>
        <ul style={{ color: "#000000ff", marginBottom: "24px" }}>
        <li>本條款之解釋與適用，悉依中華民國法律為準據法。</li>
        <li>因本條款或使用本系統所生之任何爭議，雙方同意以臺灣臺北地方法院為第一審管轄法院。</li>
        </ul>
        <h4>最後更新日期：2025/10/10</h4>
        <br />
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
