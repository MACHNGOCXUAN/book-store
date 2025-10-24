import { Button, Card, Form, Input } from 'antd'
import { useState } from 'react'

interface AddressProfileProps {
    initialData?: {
        address?: string
    }
    onSave?: (data: AddressFormData) => void
}

interface AddressFormData {
    address: string
}

const AddressProfile = ({ initialData, onSave }: AddressProfileProps) => {
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

    return (
        <Card
            title={
                <div style={{ fontSize: 18, fontWeight: 600 }}>
                    Cập nhật địa chỉ
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
                    address: initialData?.address || '',
                }}
            >
                <Form.Item
                    label={<span style={{ fontWeight: 500 }}>Địa chỉ</span>}
                    name="address"
                    rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
                >
                    <Input.TextArea
                        placeholder="Nhập địa chỉ đầy đủ của bạn (số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố)"
                        rows={4}
                        size="large"
                        style={{ borderRadius: 8 }}
                    />
                </Form.Item>

                <div style={{
                    marginTop: 24,
                    padding: 16,
                    background: '#FFF5F5',
                    borderRadius: 8,
                    fontSize: 13,
                    color: '#666',
                    marginBottom: 24
                }}>
                    <div style={{ fontWeight: 600, marginBottom: 8, color: '#C92127' }}>
                        💡 Gợi ý:
                    </div>
                    <div>
                        Hãy nhập địa chỉ đầy đủ để việc giao hàng được thuận tiện nhất.
                        <br />
                        Ví dụ: 123 Nguyễn Văn Linh, Phường Tân Phú, Quận 7, TP. Hồ Chí Minh
                    </div>
                </div>

                <Form.Item style={{ marginBottom: 0 }}>
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
                </Form.Item>
            </Form>
        </Card>
    )
}

export default AddressProfile
