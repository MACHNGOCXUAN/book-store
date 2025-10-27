import { PlusOutlined } from '@ant-design/icons'
import { Button, Card, Col, Empty, Modal, Row, Spin, message } from 'antd'
import { useEffect, useState } from 'react'
import { addressService } from '../../services/addressService'
import { useAppSelector } from '../../store/hooks'
import type { Address } from '../../types/Address'
import AddressCard from './AddressCard'
import AddressForm from './AddressForm'

const AddressManagement = () => {
    const authUser = useAppSelector((state) => state.auth.user)
    const [addresses, setAddresses] = useState<Address[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingAddress, setEditingAddress] = useState<Address | null>(null)

    // Load addresses on mount
    useEffect(() => {
        if (authUser?.userId) {
            loadAddresses()
        }
    }, [authUser])

    const loadAddresses = async () => {
        try {
            setLoading(true)
            const data = await addressService.getAddressesByCustomer(authUser!.userId)
            console.log('📦 Loaded addresses from backend:', data)
            // Sắp xếp: địa chỉ mặc định lên đầu
            const sortedData = data.sort((a, b) => {
                if (a.isDefault && !b.isDefault) return -1
                if (!a.isDefault && b.isDefault) return 1
                return 0
            })
            console.log('✅ Sorted addresses (default first):', sortedData)
            setAddresses(sortedData)
        } catch (error) {
            console.error('Error loading addresses:', error)
            message.error('Không thể tải danh sách địa chỉ')
        } finally {
            setLoading(false)
        }
    }

    const handleAddNew = () => {
        setEditingAddress(null)
        setIsModalOpen(true)
    }

    const handleEdit = (address: Address) => {
        setEditingAddress(address)
        setIsModalOpen(true)
    }

    const handleDelete = async (addressId: number) => {
        try {
            await addressService.deleteAddress(authUser!.userId, addressId)
            message.success('Xóa địa chỉ thành công!')
            loadAddresses()
        } catch (error: any) {
            message.error(error.message || 'Không thể xóa địa chỉ')
        }
    }

    const handleSetDefault = async (addressId: number) => {
        try {
            await addressService.setDefaultAddress(authUser!.userId, addressId)
            message.success('Đã đặt làm địa chỉ mặc định!')
            loadAddresses()
        } catch (error: any) {
            message.error(error.message || 'Không thể đặt địa chỉ mặc định')
        }
    }

    const handleSubmit = async (data: Address) => {
        try {
            setSubmitting(true)
            if (editingAddress?.id) {
                // Update existing address
                await addressService.updateAddress(authUser!.userId, editingAddress.id, data)
                message.success('Cập nhật địa chỉ thành công!')
            } else {
                // Create new address
                await addressService.createAddress(authUser!.userId, data)
                message.success('Thêm địa chỉ thành công!')
            }
            setIsModalOpen(false)
            setEditingAddress(null)
            loadAddresses()
        } catch (error: any) {
            message.error(error.message || 'Không thể lưu địa chỉ')
        } finally {
            setSubmitting(false)
        }
    }

    const handleCancel = () => {
        setIsModalOpen(false)
        setEditingAddress(null)
    }

    if (loading) {
        return (
            <Card style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <Spin size="large" />
                    <div style={{ marginTop: 16, color: '#666' }}>Đang tải địa chỉ...</div>
                </div>
            </Card>
        )
    }

    // Nếu chưa có địa chỉ nào, hiển thị form thêm mới
    if (addresses.length === 0 && !isModalOpen) {
        return (
            <Card
                title={
                    <div style={{ fontSize: 18, fontWeight: 600 }}>
                        Thêm địa chỉ mới
                    </div>
                }
                bordered={false}
                style={{
                    borderRadius: 8,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
            >
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                        <div>
                            <div style={{ marginBottom: 8, fontSize: 16 }}>
                                Bạn chưa có địa chỉ nào
                            </div>
                            <div style={{ fontSize: 13, color: '#999' }}>
                                Thêm địa chỉ để việc đặt hàng được thuận tiện hơn
                            </div>
                        </div>
                    }
                    style={{ padding: '40px 0', marginBottom: 24 }}
                />
                <AddressForm
                    onSubmit={handleSubmit}
                    onCancel={() => { }}
                    loading={submitting}
                />
            </Card>
        )
    }

    // Hiển thị danh sách địa chỉ
    return (
        <>
            <Card
                title={
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span style={{ fontSize: 18, fontWeight: 600 }}>
                            Địa chỉ của tôi ({addresses.length})
                        </span>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleAddNew}
                            style={{
                                background: '#C92127',
                                borderColor: '#C92127',
                                borderRadius: 8,
                                fontWeight: 600
                            }}
                        >
                            Thêm địa chỉ mới
                        </Button>
                    </div>
                }
                bordered={false}
                style={{
                    borderRadius: 8,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
            >
                <Row gutter={[16, 16]}>
                    {addresses.map((address) => (
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

                {addresses.length > 0 && (
                    <div style={{
                        marginTop: 24,
                        padding: 16,
                        background: '#FFF5F5',
                        borderRadius: 8,
                        fontSize: 13,
                        color: '#666'
                    }}>
                        💡 <strong>Gợi ý:</strong> Đặt địa chỉ thường dùng làm mặc định để tiết kiệm thời gian khi đặt hàng
                    </div>
                )}
            </Card>

            {/* Modal for Add/Edit Address */}
            <Modal
                title={
                    <div style={{ fontSize: 18, fontWeight: 600 }}>
                        {editingAddress ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}
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
    )
}

export default AddressManagement
