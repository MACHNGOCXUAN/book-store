import { Button, Card, Col, Form, Input, Radio, Row } from 'antd'
import { useState } from 'react'

interface UserProfileProps {
    initialData?: {
        firstName?: string
        lastName?: string
        phone?: string
        email?: string
        gender?: 'male' | 'female'
        birthday?: {
            day?: string
            month?: string
            year?: string
        }
    }
    onSave?: (data: any) => void
}

const UserProfile = ({ initialData, onSave }: UserProfileProps) => {
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)

    const handleSave = async () => {
        try {
            const values = await form.validateFields()
            setLoading(true)

            // Simulate API call
            setTimeout(() => {
                setLoading(false)
                if (onSave) {
                    onSave(values)
                }
                console.log('Saved data:', values)
            }, 1000)
        } catch (error) {
            console.error('Validation failed:', error)
        }
    }

    return (
        <Card
            title={
                <div style={{ fontSize: 18, fontWeight: 600 }}>
                    Hồ sơ cá nhân
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
                    email: initialData?.email || '',
                    gender: initialData?.gender || 'male',
                    day: initialData?.birthday?.day || '',
                    month: initialData?.birthday?.month || '',
                    year: initialData?.birthday?.year || '',
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
                                placeholder="Nhập họ"
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
                                placeholder="Nhập tên"
                                size="large"
                                style={{ borderRadius: 8 }}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    label={<span style={{ fontWeight: 500 }}>Số điện thoại</span>}
                    name="phone"
                >
                    <Input
                        placeholder="0974122850"
                        size="large"
                        style={{ borderRadius: 8 }}
                        addonAfter={
                            <a href="#" style={{ color: '#C92127', textDecoration: 'none', fontSize: 13 }}>
                                Thay đổi
                            </a>
                        }
                    />
                </Form.Item>

                <Form.Item
                    label={<span style={{ fontWeight: 500 }}>Email</span>}
                    name="email"
                    rules={[
                        { type: 'email', message: 'Email không hợp lệ!' }
                    ]}
                >
                    <Input
                        placeholder="Chưa có email"
                        size="large"
                        style={{ borderRadius: 8 }}
                        addonAfter={
                            <a href="#" style={{ color: '#C92127', textDecoration: 'none', fontSize: 13 }}>
                                Thêm mới
                            </a>
                        }
                    />
                </Form.Item>

                <Form.Item
                    label={<span style={{ fontWeight: 500 }}>Giới tính<span style={{ color: '#ff4d4f' }}>*</span></span>}
                    name="gender"
                >
                    <Radio.Group>
                        <Radio value="male">Nam</Radio>
                        <Radio value="female">Nữ</Radio>
                    </Radio.Group>
                </Form.Item>

                <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
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
                            width: '100%',
                            maxWidth: 200
                        }}
                    >
                        Lưu thay đổi
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    )
}

export default UserProfile
