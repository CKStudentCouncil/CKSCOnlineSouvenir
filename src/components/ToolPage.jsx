import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import * as XLSX from 'xlsx';

export default function OrderDataFixer() {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fixedCount, setFixedCount] = useState(0);
  const [errors, setErrors] = useState([]);
  const [logs, setLogs] = useState([]);
  const [notFoundOrders, setNotFoundOrders] = useState([]);

  const addLog = (message, type = 'info') => {
    setLogs(prev => [...prev, { message, type, time: new Date().toLocaleTimeString() }]);
  };

  const loadOrders = async () => {
    if (!db) {
      addLog('❌ Firebase 尚未初始化', 'error');
      return;
    }

    try {
      setIsLoading(true);
      addLog('📥 開始載入訂單...');

      const ordersRef = collection(db, 'orders');
      const ordersSnapshot = await getDocs(ordersRef);

      const ordersData = [];
      ordersSnapshot.forEach(docSnap => {
        const data = docSnap.data();
        ordersData.push({
          id: docSnap.id,
          ...data
        });
      });

      setOrders(ordersData);

      // 載入所有用戶資料
      addLog('📥 載入用戶資料...');
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      
      const usersData = [];
      usersSnapshot.forEach(docSnap => {
        const data = docSnap.data();
        usersData.push({
          id: docSnap.id,
          email: data.email,
          classandnumber: data.classandnumber || data.classNumber || '',
          name: data.name || '',
          school: data.school || '',
          phone: data.phone || ''
        });
      });
      
      setUsers(usersData);

      addLog(`✅ 載入完成！共 ${ordersData.length} 筆訂單，${usersData.length} 筆用戶`, 'success');
    } catch (error) {
      addLog(`❌ 載入資料失敗: ${error.message}`, 'error');
      setErrors(prev => [...prev, error.message]);
    } finally {
      setIsLoading(false);
    }
  };

  const findUserByEmail = (email) => {
    if (!email) return null;
    return users.find(user => user.email && user.email.toLowerCase() === email.toLowerCase());
  };

  const fixOrders = async () => {
    if (!db) {
      addLog('❌ Firebase 尚未初始化', 'error');
      return;
    }

    try {
      setIsLoading(true);
      setFixedCount(0);
      setNotFoundOrders([]);
      addLog('🔧 開始修復訂單...');

      let fixed = 0;
      let skipped = 0;
      let failed = 0;
      const notFound = [];

      for (const order of orders) {
        try {
          if (!order.customerEmail) {
            skipped++;
            addLog(`⚠️ 訂單 ${order.id.substring(0, 8)}... 沒有 Email，跳過`, 'warning');
            continue;
          }

          // 根據 Email 查找用戶
          const matchedUser = findUserByEmail(order.customerEmail);

          if (!matchedUser) {
            failed++;
            notFound.push({
              orderId: order.id,
              customerEmail: order.customerEmail,
              customerName: order.customerName || '',
              school: order.school || '',
              classNumber: order.classandnumber || order.classNumber || '',
              customerPhone: order.customerPhone || '',
              createdAt: order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString('zh-TW') : '',
              totalAmount: order.finalTotal || order.originalTotal || 0
            });
            addLog(
              `❌ 訂單 ${order.id.substring(0, 8)}... 找不到 Email 對應的用戶 (${order.customerEmail})`,
              'error'
            );
            continue;
          }

          // 準備要更新的資料
          const updateData = {
            updatedAt: new Date(),
            dataFixed: true,
            matchMethod: 'email'
          };

          const updatedFields = [];

          // 更新班級座號
          if (matchedUser.classandnumber) {
            updateData.classandnumber = matchedUser.classandnumber;
            updateData.classNumber = matchedUser.classandnumber;
            updatedFields.push(`班級座號: ${matchedUser.classandnumber}`);
          }

          // 更新姓名
          if (matchedUser.name) {
            updateData.customerName = matchedUser.name;
            updatedFields.push(`姓名: ${matchedUser.name}`);
          }

          // 更新學校
          if (matchedUser.school) {
            updateData.school = matchedUser.school;
            updatedFields.push(`學校: ${matchedUser.school}`);
          }

          // 更新電話
          if (matchedUser.phone) {
            updateData.customerPhone = matchedUser.phone;
            updatedFields.push(`電話: ${matchedUser.phone}`);
          }

          // 確保 userId 正確
          if (matchedUser.id) {
            updateData.userId = matchedUser.id;
          }

          // 執行更新
          const orderRef = doc(db, 'orders', order.id);
          await updateDoc(orderRef, updateData);

          fixed++;
          addLog(
            `✅ 訂單 ${order.id.substring(0, 8)}... 已更新 (${order.customerEmail}): ${updatedFields.join(', ')}`,
            'success'
          );

        } catch (error) {
          failed++;
          addLog(`❌ 訂單 ${order.id.substring(0, 8)}... 更新失敗: ${error.message}`, 'error');
          setErrors(prev => [...prev, `訂單 ${order.id}: ${error.message}`]);
        }

        // 每處理 5 筆稍微延遲，避免過載
        if ((fixed + skipped + failed) % 5 === 0) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }

      setFixedCount(fixed);
      setNotFoundOrders(notFound);
      addLog(`\n🎉 修復完成！`, 'success');
      addLog(`✅ 成功修復: ${fixed} 筆`, 'success');
      addLog(`⚠️ 跳過: ${skipped} 筆`, 'warning');
      addLog(`❌ 找不到用戶: ${failed} 筆`, 'error');

      if (notFound.length > 0) {
        addLog(`📊 可以下載找不到用戶的訂單清單 Excel`, 'warning');
      }

      // 重新載入訂單以顯示最新狀態
      await loadOrders();
    } catch (error) {
      addLog(`❌ 修復過程發生錯誤: ${error.message}`, 'error');
      setErrors(prev => [...prev, error.message]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
    setErrors([]);
  };

  const exportNotFoundToExcel = () => {
    if (notFoundOrders.length === 0) {
      addLog('⚠️ 沒有找不到用戶的訂單', 'warning');
      return;
    }

    try {
      // 準備 Excel 資料
      const excelData = notFoundOrders.map((order, index) => ({
        '序號': index + 1,
        '訂單ID': order.orderId,
        '客戶Email': order.customerEmail,
        '客戶姓名': order.customerName,
        '學校': order.school,
        '班級座號': order.classNumber,
        '電話': order.customerPhone,
        '訂單建立時間': order.createdAt,
        '訂單金額': order.totalAmount
      }));

      // 建立工作簿
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, '找不到用戶的訂單');

      // 設定欄寬
      const colWidths = [
        { wch: 6 },  // 序號
        { wch: 20 }, // 訂單ID
        { wch: 30 }, // Email
        { wch: 15 }, // 姓名
        { wch: 15 }, // 學校
        { wch: 12 }, // 班級座號
        { wch: 15 }, // 電話
        { wch: 20 }, // 時間
        { wch: 10 }  // 金額
      ];
      ws['!cols'] = colWidths;

      // 下載檔案
      const fileName = `找不到用戶的訂單_${new Date().toLocaleDateString('zh-TW').replace(/\//g, '')}.xlsx`;
      XLSX.writeFile(wb, fileName);

      addLog(`✅ Excel 已下載: ${fileName}`, 'success');
    } catch (error) {
      addLog(`❌ 匯出 Excel 失敗: ${error.message}`, 'error');
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '16px', fontSize: '2rem' }}>
          🔧 訂單資料修復工具
        </h1>
        <p style={{ textAlign: 'center', color: '#6c757d', marginBottom: '32px' }}>
          根據 Email 更新所有訂單的使用者資料
        </p>

        <div style={{ marginBottom: '32px', padding: '20px', background: '#f8f9fa', borderRadius: '12px', border: '1px solid #dee2e6' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '16px', color: '#495057' }}>
            步驟 1: 載入訂單與用戶資料
          </h2>
          <button
            onClick={loadOrders}
            disabled={isLoading}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              fontWeight: 'bold',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              marginRight: '12px'
            }}
          >
            {isLoading ? '載入中...' : '載入所有資料'}
          </button>
          {orders.length > 0 && (
            <span style={{ color: '#6c757d', fontSize: '0.95rem' }}>
              已載入 {orders.length} 筆訂單、{users.length} 筆用戶資料
            </span>
          )}
        </div>

        {orders.length > 0 && (
          <div style={{ marginBottom: '32px', padding: '20px', background: '#f8f9fa', borderRadius: '12px', border: '1px solid #dee2e6' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '16px', color: '#495057' }}>
              訂單預覽 (前 20 筆)
            </h2>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#e9ecef' }}>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>訂單 ID</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>客戶姓名</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Email</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>學校</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>班級座號</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>電話</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 20).map((order, index) => (
                    <tr key={order.id} style={{ background: index % 2 === 0 ? 'white' : '#f8f9fa' }}>
                      <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', fontSize: '0.85rem' }}>
                        {order.id.substring(0, 12)}...
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                        {order.customerName || <span style={{ color: '#999' }}>未提供</span>}
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', fontSize: '0.85rem' }}>
                        {order.customerEmail || <span style={{ color: '#999' }}>未提供</span>}
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                        {order.school || <span style={{ color: '#999' }}>未提供</span>}
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                        {order.classandnumber || order.classNumber || <span style={{ color: '#999' }}>未提供</span>}
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                        {order.customerPhone || <span style={{ color: '#999' }}>未提供</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {orders.length > 20 && (
              <p style={{ marginTop: '12px', color: '#6c757d', fontSize: '0.9rem', textAlign: 'center' }}>
                顯示前 20 筆，共 {orders.length} 筆訂單
              </p>
            )}
          </div>
        )}

        {orders.length > 0 && (
          <div style={{ marginBottom: '32px', padding: '20px', background: '#fff3cd', borderRadius: '12px', border: '2px solid #ffc107' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '16px', color: '#856404' }}>
              步驟 2: 執行修復
            </h2>
            <div style={{ marginBottom: '16px', padding: '12px', background: 'white', borderRadius: '8px', border: '1px solid #ffc107' }}>
              <p style={{ margin: '0 0 8px 0', color: '#856404', fontWeight: 'bold' }}>
                🔍 修復策略：
              </p>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#856404' }}>
                <li>使用訂單中的 Email 比對用戶資料</li>
                <li>更新所有訂單的班級座號、姓名、學校、電話等資訊</li>
                <li>確保 userId 正確關聯</li>
              </ul>
            </div>
            <p style={{ marginBottom: '16px', color: '#856404' }}>
              ⚠️ 此操作將會更新所有訂單的使用者資料。請確保您已備份資料。
            </p>
            <button
              onClick={fixOrders}
              disabled={isLoading || orders.length === 0}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(90deg, #ff512f 0%, #dd2476 100%)',
                color: 'white',
                fontWeight: 'bold',
                cursor: isLoading || orders.length === 0 ? 'not-allowed' : 'pointer',
                opacity: isLoading || orders.length === 0 ? 0.7 : 1
              }}
            >
              {isLoading ? '修復中...' : '開始修復訂單'}
            </button>
            {fixedCount > 0 && (
              <span style={{ marginLeft: '16px', color: '#28a745', fontWeight: 'bold' }}>
                ✅ 已修復 {fixedCount} 筆訂單
              </span>
            )}
          </div>
        )}

        {notFoundOrders.length > 0 && (
          <div style={{ marginBottom: '32px', padding: '20px', background: '#f8d7da', borderRadius: '12px', border: '2px solid #dc3545' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '16px', color: '#721c24' }}>
              找不到用戶的訂單 ({notFoundOrders.length} 筆)
            </h2>
            <div style={{ marginBottom: '16px', maxHeight: '300px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
                <thead>
                  <tr style={{ background: '#f5c6cb' }}>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dc3545' }}>訂單 ID</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dc3545' }}>Email</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dc3545' }}>姓名</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dc3545' }}>學校</th>
                    <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #dc3545' }}>金額</th>
                  </tr>
                </thead>
                <tbody>
                  {notFoundOrders.map((order, index) => (
                    <tr key={order.orderId} style={{ background: index % 2 === 0 ? 'white' : '#fff5f5' }}>
                      <td style={{ padding: '12px', borderBottom: '1px solid #f5c6cb', fontSize: '0.85rem' }}>
                        {order.orderId.substring(0, 12)}...
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #f5c6cb', fontSize: '0.85rem' }}>
                        {order.customerEmail}
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #f5c6cb' }}>
                        {order.customerName || <span style={{ color: '#999' }}>未提供</span>}
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #f5c6cb' }}>
                        {order.school || <span style={{ color: '#999' }}>未提供</span>}
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #f5c6cb', textAlign: 'right' }}>
                        ${order.totalAmount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={exportNotFoundToExcel}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(90deg, #28a745 0%, #20c997 100%)',
                color: 'white',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              📥 下載 Excel 報表
            </button>
          </div>
        )}

        {logs.length > 0 && (
          <div style={{ padding: '20px', background: '#212529', borderRadius: '12px', color: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.3rem', margin: 0 }}>執行日誌</h2>
              <button
                onClick={clearLogs}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #6c757d',
                  background: '#343a40',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                清除日誌
              </button>
            </div>
            <div style={{ maxHeight: '400px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.9rem' }}>
              {logs.map((log, index) => (
                <div
                  key={index}
                  style={{
                    padding: '8px',
                    borderBottom: '1px solid #495057',
                    color: log.type === 'error' ? '#ff6b6b' : log.type === 'success' ? '#51cf66' : log.type === 'warning' ? '#ffd43b' : 'white'
                  }}
                >
                  <span style={{ color: '#6c757d', marginRight: '8px' }}>[{log.time}]</span>
                  {log.message}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}