import { BiCalendarCheck, BiShoppingBag } from "react-icons/bi" 
import { GiH2O } from "react-icons/gi"

export default function EndPage() {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                padding: "30px",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "calc(100vh - 64px)", 
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: "700px",
                    background: "white",
                    borderRadius: "16px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                    padding: "40px 5px",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    fontFamily: "'Klee One', cursive",
                }}
            >
                <h1
                    style={{
                        fontSize: "40px", 
                        color: "#0c1b7a", 
                        marginBottom: "10px",
                        fontWeight: "700",
                        letterSpacing: "-0.01em",
                    }}
                >
                    校慶紀念品公告<br />
                    Announcenent
                </h1>

                <p 
                    style={{ 
                        fontSize: "22px", 
                        color: "#6e6e73",
                        marginBottom: "40px", 
                        lineHeight: "1.4",
                        fontWeight: "400",
                        textAlign: "left",
                        padding: "0 50px",
                    }}
                >
                    本次網路預購服務已結束<br />
                    感謝您的支持<br />
                    如您仍有購買需求<br />
                    請於校慶當日至班聯會攤位選購<br /><br />
                    Thank you for your support!<br />
                    The online pre-order service has ended.<br /><br />
                    <strong style={{color:"#0c1b7a", fontSize:"24px"}}>校慶日期：2025年12月06日（六）<br />
                    攤位編號：62, 63<br /></strong><br />
                    <p style={{textAlign:"right", fontSize:"20px"}}>建國中學班聯會80屆<br />Taipei Municipal<br />Chien Kuo High School<br />Student Council</p>
                </p>                    
            </div>
        </div>
    )
}