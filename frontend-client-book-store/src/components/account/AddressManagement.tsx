import { PlusOutlined } from "@ant-design/icons";
import { Button, Card, Col, Empty, Modal, Row, Spin } from "antd";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import type { Address } from "../../types/Address";
import AddressCard from "./AddressCard";
import AddressForm from "./AddressForm";
import {
  getAddresses,
  deleteAddress,
  setDefaultAddress,
  updateAddress as updateAddressAction,
  createAddress as createAddressAction,
} from "../../features/addresses/addressSlice";

const AddressManagement = () => {
  const authUser = useAppSelector((state) => state.auth.user);
  const addressState = useAppSelector((state) => state.addresses);
  const dispatch = useAppDispatch();
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Load addresses on mount
  useEffect(() => {
    if (authUser?.userId) {
      dispatch(getAddresses(authUser.userId));
    }
  }, [authUser, dispatch]);

  const handleAddNew = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setIsModalOpen(true);
  };

  const handleDelete = async (addressId: number) => {
    try {
      await dispatch(
        deleteAddress({
          customerId: authUser!.userId,
          addressId,
        })
      ).unwrap();
      toast.success("Xóa địa chỉ thành công!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error: any) {
      toast.error(error || "Không thể xóa địa chỉ", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleSetDefault = async (addressId: number) => {
    try {
      await dispatch(
        setDefaultAddress({
          customerId: authUser!.userId,
          addressId,
        })
      ).unwrap();
      toast.success("Đã đặt làm địa chỉ mặc định!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error: any) {
      toast.error(error || "Không thể đặt địa chỉ mặc định", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleSubmit = async (data: Address) => {
    try {
      setSubmitting(true);
      if (editingAddress?.id) {
        // Update existing address
        await dispatch(
          updateAddressAction({
            customerId: authUser!.userId,
            addressId: editingAddress.id,
            address: data,
          })
        ).unwrap();
        toast.success("Cập nhật địa chỉ thành công!", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        // Create new address
        await dispatch(
          createAddressAction({
            customerId: authUser!.userId,
            address: data,
          })
        ).unwrap();
        toast.success("Thêm địa chỉ thành công!", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
      setIsModalOpen(false);
      setEditingAddress(null);
    } catch (error: any) {
      toast.error(error || "Không thể lưu địa chỉ", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingAddress(null);
  };

  if (addressState.loading) {
    return (
      <Card style={{ borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Spin size="large" />
          <div style={{ marginTop: 16, color: "#666" }}>
            Đang tải địa chỉ...
          </div>
        </div>
      </Card>
    );
  }

  // Nếu chưa có địa chỉ nào
  if (addressState.addresses.length === 0) {
    return (
      <>
        <Card
          title={
            <div style={{ fontSize: 18, fontWeight: 600 }}>Địa chỉ của tôi</div>
          }
          variant="borderless"
          style={{
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div>
                <div style={{ marginBottom: 8, fontSize: 16 }}>
                  Bạn chưa có địa chỉ nào
                </div>
                <div style={{ fontSize: 13, color: "#999" }}>
                  Thêm địa chỉ để việc đặt hàng được thuận tiện hơn
                </div>
              </div>
            }
            style={{ padding: "40px 0", marginBottom: 24 }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddNew}
            style={{
              background: "#C92127",
              borderColor: "#C92127",
              borderRadius: 8,
              fontWeight: 600,
              width: "100%",
              height: 48,
            }}
          >
            Thêm địa chỉ đầu tiên
          </Button>
        </Card>

        {/* Modal for Add Address */}
        <Modal
          title={
            <div style={{ fontSize: 18, fontWeight: 600 }}>
              Thêm địa chỉ mới
            </div>
          }
          open={isModalOpen}
          onCancel={handleCancel}
          footer={null}
          width={700}
          destroyOnClose
        >
          <AddressForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={submitting}
          />
        </Modal>
      </>
    );
  }

  // Hiển thị danh sách địa chỉ (khi có ít nhất 1 địa chỉ)
  return (
    <>
      <Card
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 18, fontWeight: 600 }}>
              Địa chỉ của tôi ({addressState.addresses.length})
            </span>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddNew}
              style={{
                background: "#C92127",
                borderColor: "#C92127",
                borderRadius: 8,
                fontWeight: 600,
              }}
            >
              Thêm địa chỉ mới
            </Button>
          </div>
        }
        variant="borderless"
        style={{
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <Row gutter={[16, 16]}>
          {addressState.addresses.map((address: Address) => (
            <Col xs={24} key={address.id}>
              <AddressCard
                address={address}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSetDefault={handleSetDefault}
              />
            </Col>
          ))}
        </Row>

        {addressState.addresses.length > 0 && (
          <div
            style={{
              marginTop: 24,
              padding: 16,
              background: "#FFF5F5",
              borderRadius: 8,
              fontSize: 13,
              color: "#666",
            }}
          >
            💡 <strong>Gợi ý:</strong> Đặt địa chỉ thường dùng làm mặc định để
            tiết kiệm thời gian khi đặt hàng
          </div>
        )}
      </Card>

      {/* Modal for Add/Edit Address */}
      <Modal
        title={
          <div style={{ fontSize: 18, fontWeight: 600 }}>
            {editingAddress ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
          </div>
        }
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={700}
        destroyOnClose
      >
        <AddressForm
          initialData={editingAddress}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={submitting}
        />
      </Modal>
    </>
  );
};

export default AddressManagement;
