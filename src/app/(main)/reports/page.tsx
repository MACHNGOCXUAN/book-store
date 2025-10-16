// "use client"
// import React from "react";
// import { Card, Row, Col, Statistic, Progress, Badge, Typography } from "antd";
// import {
//   DollarOutlined,
//   RiseOutlined,
//   FallOutlined,
//   ShoppingOutlined,
//   UserOutlined,
//   AppstoreOutlined,
//   TransactionOutlined,
//   PercentageOutlined,
//   SwapOutlined,
//   RollbackOutlined
// } from "@ant-design/icons";

// const { Title, Text } = Typography;

// // ==================== STYLES ====================
// const styles = `
//   .report-dashboard {
//     padding: 24px;
//     background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
//     min-height: 100vh;
//   }

//   .dashboard-header {
//     margin-bottom: 32px;
//     animation: fadeInDown 0.6s ease-out;
//   }

//   .dashboard-title {
//     margin-bottom: 8px !important;
//     background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//     -webkit-background-clip: text !important;
//     -webkit-text-fill-color: transparent !important;
//     background-clip: text !important;
//   }

//   .dashboard-subtitle {
//     color: #718096 !important;
//     font-size: 16px !important;
//   }

//   .stat-card {
//     border-radius: 16px !important;
//     overflow: hidden;
//     border: none !important;
//     box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
//     transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
//     position: relative;
//     animation: fadeInUp 0.6s ease-out;
//     animation-fill-mode: both;
//   }

//   .stat-card::before {
//     content: '';
//     position: absolute;
//     top: 0;
//     left: 0;
//     right: 0;
//     height: 4px;
//     background: var(--card-gradient);
//   }

//   .stat-card:hover {
//     transform: translateY(-4px);
//     box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
//   }

//   .stat-card:nth-child(1) { animation-delay: 0.1s; }
//   .stat-card:nth-child(2) { animation-delay: 0.2s; }
//   .stat-card:nth-child(3) { animation-delay: 0.3s; }
//   .stat-card:nth-child(4) { animation-delay: 0.4s; }
//   .stat-card:nth-child(5) { animation-delay: 0.5s; }
//   .stat-card:nth-child(6) { animation-delay: 0.6s; }

//   .stat-card-blue { --card-gradient: linear-gradient(90deg, #3b82f6, #1d4ed8); }
//   .stat-card-green { --card-gradient: linear-gradient(90deg, #10b981, #059669); }
//   .stat-card-purple { --card-gradient: linear-gradient(90deg, #8b5cf6, #6d28d9); }
//   .stat-card-orange { --card-gradient: linear-gradient(90deg, #f59e0b, #d97706); }
//   .stat-card-cyan { --card-gradient: linear-gradient(90deg, #06b6d4, #0891b2); }
//   .stat-card-pink { --card-gradient: linear-gradient(90deg, #ec4899, #db2777); }

//   .stat-card .ant-card-body {
//     padding: 24px !important;
//   }

//   .stat-icon-wrapper {
//     width: 56px;
//     height: 56px;
//     border-radius: 12px;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     margin-bottom: 16px;
//     box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.15);
//   }

//   .stat-icon {
//     font-size: 28px;
//     color: white;
//   }

//   .stat-content {
//     margin-bottom: 16px;
//   }

//   .stat-label {
//     font-size: 12px;
//     font-weight: 700;
//     text-transform: uppercase;
//     letter-spacing: 0.05em;
//     color: #64748b;
//     margin-bottom: 8px;
//     display: block;
//   }

//   .stat-value {
//     font-size: 32px;
//     font-weight: 800;
//     color: #1a202c;
//     line-height: 1;
//   }

//   .stat-footer {
//     display: flex;
//     align-items: center;
//     gap: 8px;
//     padding-top: 16px;
//     border-top: 1px solid #e5e7eb;
//   }

//   .trend-badge {
//     padding: 4px 12px !important;
//     border-radius: 999px !important;
//     font-weight: 600 !important;
//     font-size: 12px !important;
//   }

//   .trend-text {
//     font-size: 13px;
//     color: #64748b;
//   }

//   .metric-card {
//     border-radius: 16px !important;
//     border: 1px solid #e5e7eb !important;
//     box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
//     transition: all 0.3s !important;
//     animation: fadeInUp 0.6s ease-out 0.7s;
//     animation-fill-mode: both;
//   }

//   .metric-card:hover {
//     box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1) !important;
//     transform: translateY(-2px);
//   }

//   .metric-card .ant-card-body {
//     padding: 28px !important;
//   }

//   .metric-header {
//     display: flex;
//     align-items: center;
//     gap: 12px;
//     margin-bottom: 20px;
//   }

//   .metric-icon-wrapper {
//     width: 48px;
//     height: 48px;
//     border-radius: 12px;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//   }

//   .metric-icon {
//     font-size: 24px;
//   }

//   .metric-title {
//     font-size: 15px;
//     font-weight: 700;
//     color: #1a202c;
//     margin: 0;
//   }

//   .metric-content {
//     display: flex;
//     align-items: baseline;
//     justify-content: space-between;
//     margin-bottom: 16px;
//   }

//   .metric-value {
//     font-size: 32px;
//     font-weight: 800;
//     color: #1a202c;
//   }

//   .metric-change {
//     display: flex;
//     align-items: center;
//     gap: 4px;
//     font-size: 14px;
//     font-weight: 600;
//   }

//   @keyframes fadeInDown {
//     from {
//       opacity: 0;
//       transform: translateY(-20px);
//     }
//     to {
//       opacity: 1;
//       transform: translateY(0);
//     }
//   }

//   @keyframes fadeInUp {
//     from {
//       opacity: 0;
//       transform: translateY(20px);
//     }
//     to {
//       opacity: 1;
//       transform: translateY(0);
//     }
//   }

//   @media (max-width: 768px) {
//     .report-dashboard {
//       padding: 16px;
//     }
    
//     .stat-value {
//       font-size: 24px;
//     }

//     .metric-value {
//       font-size: 24px;
//     }
//   }
// `;

// // ==================== STAT CARD COMPONENT ====================
// interface StatCardProps {
//   title: string;
//   value: string;
//   trend: number;
//   trendText: string;
//   icon: React.ReactNode;
//   iconBg: string;
//   colorClass: string;
// }

// const StatCard: React.FC<StatCardProps> = ({
//   title,
//   value,
//   trend,
//   trendText,
//   icon,
//   iconBg,
//   colorClass
// }) => {
//   const isPositive = trend > 0;

//   return (
//     <Card className={`stat-card ${colorClass}`}>
//       <div className="stat-icon-wrapper" style={{ background: iconBg }}>
//         <div className="stat-icon">{icon}</div>
//       </div>

//       <div className="stat-content">
//         <span className="stat-label">{title}</span>
//         <div className="stat-value">{value}</div>
//       </div>

//       <div className="stat-footer">
//         <Badge
//           count={
//             <span className="trend-badge" style={{ 
//               background: isPositive ? '#dcfce7' : '#fee2e2',
//               color: isPositive ? '#16a34a' : '#dc2626'
//             }}>
//               {isPositive ? <RiseOutlined /> : <FallOutlined />} {Math.abs(trend)}%
//             </span>
//           }
//         />
//         <span className="trend-text">{trendText}</span>
//       </div>
//     </Card>
//   );
// };

// // ==================== METRIC CARD COMPONENT ====================
// interface MetricCardProps {
//   title: string;
//   value: string;
//   change: number;
//   icon: React.ReactNode;
//   iconBg: string;
//   iconColor: string;
//   progress?: number;
//   progressColor?: string;
// }

// const MetricCard: React.FC<MetricCardProps> = ({
//   title,
//   value,
//   change,
//   icon,
//   iconBg,
//   iconColor,
//   progress,
//   progressColor
// }) => {
//   const isPositive = change > 0;

//   return (
//     <Card className="metric-card">
//       <div className="metric-header">
//         <div className="metric-icon-wrapper" style={{ background: iconBg }}>
//           <div className="metric-icon" style={{ color: iconColor }}>
//             {icon}
//           </div>
//         </div>
//         <h4 className="metric-title">{title}</h4>
//       </div>

//       <div className="metric-content">
//         <div className="metric-value">{value}</div>
//         <div className="metric-change" style={{ color: isPositive ? '#16a34a' : '#dc2626' }}>
//           {isPositive ? <RiseOutlined /> : <FallOutlined />}
//           {Math.abs(change)}%
//         </div>
//       </div>

//       {progress !== undefined && (
//         <Progress
//           percent={progress}
//           strokeColor={progressColor || '#3b82f6'}
//           showInfo={false}
//           strokeWidth={8}
//           trailColor="#e5e7eb"
//         />
//       )}
//     </Card>
//   );
// };

// // ==================== MAIN REPORT PAGE ====================
// export default function ReportPage() {
//   const statsData = [
//     {
//       title: "Lợi nhuận",
//       value: "652K",
//       trend: 12,
//       trendText: "so với tháng trước",
//       icon: <DollarOutlined />,
//       iconBg: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
//       colorClass: "stat-card-blue"
//     },
//     {
//       title: "Doanh thu",
//       value: "482K",
//       trend: 50,
//       trendText: "so với tháng trước",
//       icon: <RiseOutlined />,
//       iconBg: "linear-gradient(135deg, #10b981, #059669)",
//       colorClass: "stat-card-green"
//     },
//     {
//       title: "Giao dịch",
//       value: "14.8K",
//       trend: 8,
//       trendText: "so với tháng trước",
//       icon: <TransactionOutlined />,
//       iconBg: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
//       colorClass: "stat-card-purple"
//     },
//     {
//       title: "Đơn hàng",
//       value: "1,286",
//       trend: 15,
//       trendText: "so với tháng trước",
//       icon: <ShoppingOutlined />,
//       iconBg: "linear-gradient(135deg, #f59e0b, #d97706)",
//       colorClass: "stat-card-orange"
//     },
//     {
//       title: "Người dùng",
//       value: "2,548",
//       trend: 22,
//       trendText: "so với tháng trước",
//       icon: <UserOutlined />,
//       iconBg: "linear-gradient(135deg, #06b6d4, #0891b2)",
//       colorClass: "stat-card-cyan"
//     },
//     {
//       title: "Sản phẩm",
//       value: "856",
//       trend: 8,
//       trendText: "so với tháng trước",
//       icon: <AppstoreOutlined />,
//       iconBg: "linear-gradient(135deg, #ec4899, #db2777)",
//       colorClass: "stat-card-pink"
//     }
//   ];

//   const metricsData = [
//     {
//       title: "Tỷ Lệ Chuyển Đổi",
//       value: "3.2%",
//       change: 5.4,
//       icon: <PercentageOutlined />,
//       iconBg: "#dbeafe",
//       iconColor: "#2563eb",
//       progress: 32,
//       progressColor: "#10b981"
//     },
//     {
//       title: "Giá Trị Đơn Trung Bình",
//       value: "₫375K",
//       change: 5.4,
//       icon: <SwapOutlined />,
//       iconBg: "#ddd6fe",
//       iconColor: "#7c3aed"
//     },
//     {
//       title: "Tỷ Lệ Hoàn Đơn",
//       value: "2.1%",
//       change: -0.8,
//       icon: <RollbackOutlined />,
//       iconBg: "#fed7aa",
//       iconColor: "#ea580c"
//     }
//   ];

//   return (
//     <>
//       <style>{styles}</style>
//       <div className="report-dashboard">
//         <div style={{ maxWidth: 1400, margin: '0 auto' }}>
//           {/* Header */}
//           <div className="dashboard-header">
//             <Title level={2} className="dashboard-title">
//               Báo Cáo Doanh Thu Bán Sách
//             </Title>
//             <Text className="dashboard-subtitle">
//               Tổng quan hiệu suất bán hàng và phân tích chi tiết
//             </Text>
//           </div>

//           {/* Stats Grid */}
//           <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
//             {statsData.map((stat, index) => (
//               <Col xs={24} sm={12} lg={8} xl={4} key={index}>
//                 <StatCard {...stat} />
//               </Col>
//             ))}
//           </Row>

//           {/* Metrics Grid */}
//           <Row gutter={[24, 24]}>
//             {metricsData.map((metric, index) => (
//               <Col xs={24} md={8} key={index}>
//                 <MetricCard {...metric} />
//               </Col>
//             ))}
//           </Row>
//         </div>
//       </div>
//     </>
//   );
// }

import React from 'react'

function page() {
  return (
    <div>page</div>
  )
}

export default page