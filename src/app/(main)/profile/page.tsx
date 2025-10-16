"use client";
import React from 'react';
import { Card, Tag, Avatar, Row, Col, Descriptions, Spin } from 'antd';
import { 
  UserOutlined, MailOutlined, PhoneOutlined, BankOutlined, ClockCircleOutlined, 
  EnvironmentOutlined, CalendarOutlined, TrophyOutlined, IdcardOutlined, SafetyOutlined 
} from '@ant-design/icons';
import { useAppSelector } from '@/stores/hooks';

export type UserDataType = {
  userId: string;
  userName: string;
  email: string;
  phoneNumber: string;
  role: string;
  status: boolean;
  department?: string;
  shift?: string;
  fullName?: string;
  address?: string;
  dateOfBirth?: string;
  loyaltyPoints?: string;
  password?: string;
}

function ProfilePage() {
  const { user, loading } = useAppSelector((state) => state.auth);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-2">Chưa có dữ liệu người dùng</h1>
          <p className="text-gray-500">Vui lòng đăng nhập để xem thông tin profile</p>
        </div>
      </div>
    );
  }

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const hasAdditionalInfo = user.department || user.shift || user.address || user.dateOfBirth || user.loyaltyPoints;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 !py-8 !px-4">
      <div className="max-w-6xl !mx-auto">
        {/* Header Profile Card */}
        <Card className="!mb-6 !shadow-lg !rounded-2xl !overflow-hidden !border-0">
          <div className="!h-32 !bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 !-m-6 !mb-0"></div>
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 !mt-6">
            {/* Avatar */}
            <div className="relative -mt-20 md:-mt-16">
              <Avatar 
                size={128} 
                className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-bold text-4xl border-4 border-white shadow-xl"
              >
                {getInitials(user.fullName || user.userName)}
              </Avatar>
              <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-4 border-white ${user.status ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            </div>

            {/* Thông tin cơ bản */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {user.fullName || user.userName}
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
                <Tag icon={<SafetyOutlined />} color="blue" className="text-sm px-3 py-1">
                  {user.role}
                </Tag>
                <Tag color={user.status ? 'success' : 'default'} className="text-sm px-3 py-1">
                  {user.status ? 'Đang hoạt động' : 'Không hoạt động'}
                </Tag>
              </div>
              <p className="text-gray-600 flex items-center justify-center md:justify-start gap-2">
                <IdcardOutlined />
                <span className="font-medium">ID: {user.userId}</span>
              </p>
            </div>
          </div>
        </Card>

        {/* Thông tin liên hệ */}
        <Card 
          title={
            <span className="text-xl font-bold flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded"></div>
              Thông tin liên hệ
            </span>
          }
          className="!mb-6 !shadow-lg !rounded-2xl !border-0"
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 !p-4 rounded-xl border border-blue-200 h-full">
                <div className="flex items-center gap-3">
                  <UserOutlined className="text-2xl text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Tên đăng nhập</p>
                    <p className="font-semibold text-gray-800">{user.userName}</p>
                  </div>
                </div>
              </div>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 !p-4 rounded-xl border border-purple-200 h-full">
                <div className="flex items-center gap-3">
                  <MailOutlined className="text-2xl text-purple-600" />
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Email</p>
                    <p className="font-semibold text-gray-800 text-sm break-all">{user.email}</p>
                  </div>
                </div>
              </div>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <div className="bg-gradient-to-br from-green-50 to-green-100 !p-4 rounded-xl border border-green-200 h-full">
                <div className="flex items-center gap-3">
                  <PhoneOutlined className="text-2xl text-green-600" />
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Số điện thoại</p>
                    <p className="font-semibold text-gray-800">{user.phoneNumber}</p>
                  </div>
                </div>
              </div>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 !p-4 rounded-xl border border-indigo-200 h-full">
                <div className="flex items-center gap-3">
                  <IdcardOutlined className="text-2xl text-indigo-600" />
                  <div>
                    <p className="text-xs text-gray-600 mb-1">User ID</p>
                    <p className="font-semibold text-gray-800">{user.userId}</p>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Thông tin chi tiết - Chỉ hiển thị nếu có dữ liệu */}
        {hasAdditionalInfo && (
          <Card 
            title={
              <span className="text-xl font-bold flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded"></div>
                Thông tin chi tiết
              </span>
            }
            className="!shadow-lg !rounded-2xl !border-0"
          >
            <Descriptions 
              bordered 
              column={{ xs: 1, sm: 1, md: 2 }}
              size="middle"
            >
              {user.department && (
                <Descriptions.Item 
                  label={
                    <span className="font-semibold flex items-center gap-2">
                      <BankOutlined className="text-blue-600" />
                      Phòng ban
                    </span>
                  }
                >
                  <span className="font-medium">{user.department}</span>
                </Descriptions.Item>
              )}

              {user.shift && (
                <Descriptions.Item 
                  label={
                    <span className="font-semibold flex items-center gap-2">
                      <ClockCircleOutlined className="text-indigo-600" />
                      Ca làm việc
                    </span>
                  }
                >
                  <span className="font-medium">{user.shift}</span>
                </Descriptions.Item>
              )}

              {user.dateOfBirth && (
                <Descriptions.Item 
                  label={
                    <span className="font-semibold flex items-center gap-2">
                      <CalendarOutlined className="text-purple-600" />
                      Ngày sinh
                    </span>
                  }
                >
                  <span className="font-medium">{user.dateOfBirth}</span>
                </Descriptions.Item>
              )}

              {user.address && (
                <Descriptions.Item 
                  label={
                    <span className="font-semibold flex items-center gap-2">
                      <EnvironmentOutlined className="text-green-600" />
                      Địa chỉ
                    </span>
                  }
                >
                  <span className="font-medium">{user.address}</span>
                </Descriptions.Item>
              )}

              {user.loyaltyPoints && (
                <Descriptions.Item 
                  label={
                    <span className="font-semibold flex items-center gap-2">
                      <TrophyOutlined className="text-amber-600" />
                      Điểm tích lũy
                    </span>
                  }
                  span={2}
                >
                  <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    {user.loyaltyPoints} điểm
                  </span>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
