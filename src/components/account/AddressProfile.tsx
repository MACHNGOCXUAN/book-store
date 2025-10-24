import { Button, Card, Checkbox, Col, Form, Input, Row, Select } from 'antd'
import { useState } from 'react'

interface AddressProfileProps {
    initialData?: {
        firstName?: string
        lastName?: string
        phone?: string
        country?: string
        province?: string
        district?: string
        ward?: string
        address?: string
        postalCode?: string
        isDefault?: boolean
    }
    onSave?: (data: AddressFormData) => void
    onCancel?: () => void
}

interface AddressFormData {
    firstName: string
    lastName: string
    phone: string
    country: string
    province: string
    district: string
    ward: string
    address: string
    postalCode?: string
    isDefault: boolean
}

const AddressProfile = ({ initialData, onSave, onCancel }: AddressProfileProps) => {
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)

    const handleSave = async () => {
        try {
            const values = await form.validateFields()
            setLoading(true)

            setTimeout(() => {
                setLoading(false)
                if (onSave) {
                    onSave(values)
                }
                console.log('Address saved:', values)
            }, 1000)
        } catch (error) {
            console.error('Validation failed:', error)
        }
    }

    const provinces = [
        'Hà Nội',
        'Hồ Chí Minh',
        'Đà Nẵng',
        'Hải Phòng',
        'Cần Thơ',
    ]

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
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    firstName: initialData?.firstName || '',
                    lastName: initialData?.lastName || '',
                    phone: initialData?.phone || '',
                    country: initialData?.country || 'Việt Nam',
                    province: initialData?.province || '',
                    district: initialData?.district || '',
                    ward: initialData?.ward || '',
                    address: initialData?.address || '',
                    postalCode: initialData?.postalCode || '',
                    isDefault: initialData?.isDefault || false,
                }}
            >
                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item
                            label={<span style={{ fontWeight: 500 }}>Họ<span style={{ color: '#ff4d4f' }}>*</span></span>}
                            name="firstName"
                            rules={[{ required: true, message: 'Vui lòng nhập họ!' }]}
                        >
                            <Input
                                placeholder="Họ*"
                                size="large"
                                style={{ borderRadius: 8 }}
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item
                            label={<span style={{ fontWeight: 500 }}>Tên<span style={{ color: '#ff4d4f' }}>*</span></span>}
                            name="lastName"
                            rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
                        >
                            <Input
                                placeholder="Tên*"
                                size="large"
                                style={{ borderRadius: 8 }}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    label={<span style={{ fontWeight: 500 }}>Điện thoại<span style={{ color: '#ff4d4f' }}>*</span></span>}
                    name="phone"
                    rules={[
                        { required: true, message: 'Vui lòng nhập số điện thoại!' },
                        { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ!' }
                    ]}
                >
                    <Input
                        placeholder="Ex: 09722xxxx"
                        size="large"
                        style={{ borderRadius: 8 }}
                    />
                </Form.Item>

                <Form.Item
                    label={<span style={{ fontWeight: 500 }}>Quốc gia<span style={{ color: '#ff4d4f' }}>*</span></span>}
                    name="country"
                    rules={[{ required: true, message: 'Vui lòng chọn quốc gia!' }]}
                >
                    <Select
                        size="large"
                        style={{ borderRadius: 8 }}
                        placeholder="Việt Nam"
                    >
                        <Select.Option value="Việt Nam">Việt Nam</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    label={<span style={{ fontWeight: 500 }}>Tỉnh/Thành phố<span style={{ color: '#ff4d4f' }}>*</span></span>}
                    name="province"
                    rules={[{ required: true, message: 'Vui lòng chọn tỉnh/thành phố!' }]}
                >
                    <Select
                        size="large"
                        style={{ borderRadius: 8 }}
                        placeholder="Vui lòng chọn"
                        showSearch
                        filterOption={(input, option) =>
                            (option?.children as string).toLowerCase().includes(input.toLowerCase())
                        }
                    >
                        {provinces.map(province => (
                            <Select.Option key={province} value={province}>
                                {province}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item
                            label={<span style={{ fontWeight: 500 }}>Quận/Huyện<span style={{ color: '#ff4d4f' }}>*</span></span>}
                            name="district"
                            rules={[{ required: true, message: 'Vui lòng nhập quận/huyện!' }]}
                        >
                            <Input
                                placeholder="Quận/Huyện*"
                                size="large"
                                style={{ borderRadius: 8 }}
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item
                            label={<span style={{ fontWeight: 500 }}>Xã/Phường<span style={{ color: '#ff4d4f' }}>*</span></span>}
                            name="ward"
                            rules={[{ required: true, message: 'Vui lòng nhập xã/phường!' }]}
                        >
                            <Input
                                placeholder="Xã/Phường*"
                                size="large"
                                style={{ borderRadius: 8 }}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    label={<span style={{ fontWeight: 500 }}>Địa chỉ<span style={{ color: '#ff4d4f' }}>*</span></span>}
                    name="address"
                    rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
                >
                    <Input
                        placeholder="Địa chỉ"
                        size="large"
                        style={{ borderRadius: 8 }}
                    />
                </Form.Item>

                <Form.Item
                    label={<span style={{ fontWeight: 500 }}>Mã bưu điện</span>}
                    name="postalCode"
                >
                    <Input
                        placeholder="Mã bưu điện VN: 700000"
                        size="large"
                        style={{ borderRadius: 8 }}
                    />
                </Form.Item>

                <Form.Item
                    name="isDefault"
                    valuePropName="checked"
                    style={{ marginBottom: 24 }}
                >
                    <Checkbox>
                        Đặt làm địa chỉ mặc định
                    </Checkbox>
                </Form.Item>

                <div style={{
                    display: 'flex',
                    gap: 12,
                    justifyContent: 'flex-start',
                    paddingTop: 12,
                    borderTop: '1px solid #f0f0f0'
                }}>
                    {onCancel && (
                        <Button
                            size="large"
                            onClick={onCancel}
                            style={{
                                borderRadius: 8,
                                fontWeight: 500,
                                height: 48,
                                minWidth: 120
                            }}
                        >
                            ← Quay lại
                        </Button>
                    )}
                    <Button
                        type="primary"
                        size="large"
                        onClick={handleSave}
                        loading={loading}
                        style={{
                            background: '#C92127',
                            borderColor: '#C92127',
                            borderRadius: 8,
                            fontWeight: 600,
                            height: 48,
                            minWidth: 160
                        }}
                    >
                        LƯU ĐỊA CHỈ
                    </Button>
                </div>

                <div style={{
                    marginTop: 16,
                    fontSize: 12,
                    color: '#999',
                    textAlign: 'right'
                }}>
                    (*): Bắt buộc
                </div>
            </Form>
        </Card>
    )
}

export default AddressProfile
