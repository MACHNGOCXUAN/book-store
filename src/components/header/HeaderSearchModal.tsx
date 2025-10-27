// src/components/header/HeaderSearchModal.tsx
import React, { useState } from "react";
import { Modal, Input } from "antd";

interface HeaderSearchModalProps {
  open: boolean;
  onClose: () => void;
  onSearch: (value: string) => void;
}

const HeaderSearchModal: React.FC<HeaderSearchModalProps> = ({
  open,
  onClose,
  onSearch,
}) => {
  // Modal này cần state tìm kiếm riêng để người dùng gõ
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = (value: string) => {
    onSearch(value);
    setSearchValue(""); // Xóa input sau khi tìm
  };

  return (
    <Modal
      title="Tìm kiếm sản phẩm"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
    >
      <Input.Search
        placeholder="Nhập tên sách bạn muốn tìm..."
        allowClear
        enterButton="Tìm"
        size="large"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        onSearch={handleSearch}
        autoFocus
      />
    </Modal>
  );
};

export default HeaderSearchModal;
