import { CheckCircleOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { Button, Card, Popconfirm, Tag } from 'antd'
import type { Address } from '../../types/Address'

interface AddressCardProps {
    address: Address
    onEdit: (address: Address) => void
    onDelete: (addressId: number) => void
    onSetDefault: (addressId: number) => void
}

const AddressCard = ({ address, onEdit, onDelete, onSetDefault }: AddressCardProps) => {
    console.log('🏠 AddressCard rendering:', {
        id: address.id,
        receiverName: address.receiverName,
        isDefault: address.isDefault,
        isDefaultType: typeof address.isDefault
    })

    return (
        <Card
            hoverable
            style={{
                borderRadius: 8,
                border: address.isDefault ? '2px solid #C92127' : '1px solid #f0f0f0',
                background: address.isDefault ? 'linear-gradient(135deg, #FFF5F5 0%, #FFFFFF 100%)' : '#FFFFFF',
                boxShadow: address.isDefault
                    ? '0 4px 12px rgba(201, 33, 39, 0.15)'
                    : '0 2px 8px rgba(0,0,0,0.1)'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                    {/* Default Badge */}
                    {address.isDefault && (
                        <Tag
                            icon={<CheckCircleOutlined />}
                            color="#C92127"
                            style={{ marginBottom: 12 }}
                        >
                            Địa chỉ mặc định
                        </Tag>
                    )}

                    {/* Recipient Name */}
                    <div style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: '#333',
                        marginBottom: 8
                    }}>
                        {address.receiverName}
                    </div>

                    {/* Phone */}
                    <div style={{
                        fontSize: 14,
                        color: '#666',
                        marginBottom: 8
                    }}>
                        📱 {address.receiverPhone}
                    </div>

                    {/* Address */}
                    <div style={{
                        fontSize: 14,
                        color: '#666',
                        lineHeight: 1.6
                    }}>
                        📍 {address.specifics}
                        {address.ward && `, ${address.ward}`}
                        {address.district && `, ${address.district}`}
                        {address.province && `, ${address.province}`}
                    </div>
                </div>

                {/* Actions */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    marginLeft: 16
                }}>
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => onEdit(address)}
                        style={{ color: '#1890ff' }}
                    >
                        Sửa
                    </Button>

                    {!address.isDefault && (
                        <Button
                            type="text"
                            icon={<CheckCircleOutlined />}
                            onClick={() => address.id && onSetDefault(address.id)}
                            style={{ color: '#52c41a' }}
                        >
                            Mặc định
                        </Button>
                    )}

                    <Popconfirm
                        title="Xóa địa chỉ này?"
                        description="Bạn có chắc chắn muốn xóa địa chỉ này không?"
                        onConfirm={() => address.id && onDelete(address.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                        >
                            Xóa
                        </Button>
                    </Popconfirm>
                </div>
            </div>
        </Card>
    )
}

export default AddressCard
