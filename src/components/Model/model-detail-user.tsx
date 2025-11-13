"use client";
import React from "react";
import { Modal, Descriptions, Tag, Spin } from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { AddressType, UserDataType } from "@/types/users";

interface UserDetailModalProps {
  isModalOpen: boolean;
  handleCancel: () => void;
  userData?: UserDataType | null;
  isLoading?: boolean;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({
  isModalOpen,
  handleCancel,
  userData,
  isLoading = false,
}) => {
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Chưa cập nhật";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const getRoleText = (role?: string) => {
    switch (role) {
      case "CUSTOMER":
        return "Khách hàng";
      case "STAFF":
        return "Nhân viên";
      case "ADMIN":
        return "Quản trị viên";
      default:
        return role || "Chưa xác định";
    }
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case "CUSTOMER":
        return "blue";
      case "STAFF":
        return "green";
      case "ADMIN":
        return "red";
      default:
        return "default";
    }
  };

  const getGenderText = (gender?: string) => {
    switch (gender?.toLowerCase()) {
      case "male":
      case "nam":
        return "Nam";
      case "female":
      case "nữ":
      case "nu":
        return "Nữ";
      case "other":
      case "khác":
      case "khac":
        return "Khác";
      default:
        return gender || "Chưa cập nhật";
    }
  };

  const formatAddress = (address: AddressType) => {
    const parts = [];
    if (address.specifics) {
      parts.push(address.specifics);
    }
    if (address.ward) {
      parts.push(`${address.ward.startsWith('Phường') || address.ward.startsWith('Xã') ? '' : 'Phường '}${address.ward}`);
    }
    if (address.district) {
      parts.push(`${address.district.startsWith('Quận') || address.district.startsWith('Huyện') ? '' : 'Quận '}${address.district}`);
    }
    if (address.province) {
      parts.push(`${address.province.startsWith('Tỉnh') || address.province.startsWith('Thành phố') || address.province.startsWith('TP.') ? '' : 'Tỉnh '}${address.province}`);
    }
    return parts.join(", ");
  };

  if (isLoading) {
    return (
      <Modal
        title={
          <div className="flex items-center gap-2">
            <UserOutlined className="text-blue-500" />
            <span className="font-semibold text-lg">Thông tin người dùng</span>
          </div>
        }
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={800}
      >
        <div className="flex justify-center items-center h-64">
          <Spin size="large"/>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <UserOutlined className="text-blue-500" />
          <span className="font-semibold text-lg">Thông tin người dùng</span>
        </div>
      }
      open={isModalOpen}
      onCancel={handleCancel}
      footer={null}
      width={900}
      centered
    >
      {userData && (
        <div className="mt-4">
          <Descriptions
            bordered
            column={{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }}
            size="middle"
          >
            {/* Mã người dùng */}
            <Descriptions.Item label="Mã người dùng" span={2}>
              <span className="font-semibold text-blue-600">
                {userData.userId}
              </span>
            </Descriptions.Item>

            {/* Họ và tên */}
            <Descriptions.Item
              label={
                <span className="flex items-center gap-2">
                  <UserOutlined /> Họ và tên
                </span>
              }
            >
              <span className="font-medium">
                {userData.fullName || "Chưa cập nhật"}
              </span>
            </Descriptions.Item>

            {/* Giới tính */}
            <Descriptions.Item label="Giới tính">
              {getGenderText(userData.gender)}
            </Descriptions.Item>

            {/* Ngày sinh */}
            <Descriptions.Item
              label={
                <span className="flex items-center gap-2">
                  <CalendarOutlined /> Ngày sinh
                </span>
              }
            >
              {formatDate(userData.dateOfBirth)}
            </Descriptions.Item>

            {/* Vai trò */}
            <Descriptions.Item
              label={
                <span className="flex items-center gap-2">
                  <TeamOutlined /> Vai trò
                </span>
              }
            >
              <Tag color={getRoleColor(userData.role)}>
                {getRoleText(userData.role)}
              </Tag>
            </Descriptions.Item>

            {/* Email */}
            <Descriptions.Item
              label={
                <span className="flex items-center gap-2">
                  <MailOutlined /> Email
                </span>
              }
              span={2}
            >
              <span className="text-blue-600">{userData.email}</span>
            </Descriptions.Item>

            {/* Số điện thoại */}
            <Descriptions.Item
              label={
                <span className="flex items-center gap-2">
                  <PhoneOutlined /> Số điện thoại
                </span>
              }
            >
              <span className="font-medium">{userData.phoneNumber}</span>
            </Descriptions.Item>

            {/* Trạng thái */}
            <Descriptions.Item label="Trạng thái">
              <Tag
                color={userData.status ? "success" : "error"}
                className="px-3 py-1"
              >
                {userData.status ? "Hoạt động" : "Khóa"}
              </Tag>
            </Descriptions.Item>

            {/* Phòng ban - chỉ hiện nếu có */}
            {userData.department && (
              <Descriptions.Item label="Phòng ban">
                <span className="font-medium">{userData.department}</span>
              </Descriptions.Item>
            )}

            {/* Ca làm - chỉ hiện nếu có */}
            {userData.shift && (
              <Descriptions.Item label="Ca làm">
                <span className="font-medium">{userData.shift}</span>
              </Descriptions.Item>
            )}

            {/* Ngày đăng ký */}
            <Descriptions.Item
              label="Ngày đăng ký"
              span={userData.department || userData.shift ? 1 : 2}
            >
              {formatDate(userData.registrationDate)}
            </Descriptions.Item>

            {/* Điểm tích lũy */}
            {userData.role === "CUSTOMER" && (
              <Descriptions.Item
                label={
                  <span className="flex items-center gap-2">
                    <StarOutlined /> Điểm tích lũy
                  </span>
                }
                span={userData.department || userData.shift ? 1 : 2}
              >
                <span className="font-semibold text-orange-500 text-base">
                  {userData.loyaltyPoints
                    ? `${userData.loyaltyPoints} điểm`
                    : "0 điểm"}
                </span>
              </Descriptions.Item>
            )}

            {/* Địa chỉ đơn giản (nếu có) */}
            {userData.address && (
              <Descriptions.Item
                label={
                  <span className="flex items-center gap-2">
                    <HomeOutlined /> Địa chỉ
                  </span>
                }
                span={2}
              >
                {userData.address}
              </Descriptions.Item>
            )}

            {/* Danh sách địa chỉ chi tiết */}
            {userData.addresses && userData.addresses.length > 0 && (
              <Descriptions.Item
                label={
                  <span className="flex items-center gap-2">
                    <EnvironmentOutlined /> Danh sách địa chỉ
                  </span>
                }
                span={2}
              >
                <div className="space-y-3">
                  {userData.addresses.map((address, index) => (
                    <div
                      key={address.id}
                      className="p-3! bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-medium text-gray-700">
                          Địa chỉ {index + 1}
                        </span>
                        {address.main === 1 && (
                          <Tag color="gold" className="ml-2">
                            Mặc định
                          </Tag>
                        )}
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex gap-2">
                          <span className="text-gray-500 min-w-[100px]">
                            Người nhận:
                          </span>
                          <span className="font-medium">
                            {address.receiverName}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-gray-500 min-w-[100px]">
                            Số điện thoại:
                          </span>
                          <span className="font-medium">
                            {address.receiverPhone}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-gray-500 min-w-[100px]">
                            Địa chỉ:
                          </span>
                          <span className="text-gray-700">
                            {formatAddress(address)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Descriptions.Item>
            )}
          </Descriptions>
        </div>
      )}
    </Modal>
  );
};

export default UserDetailModal;