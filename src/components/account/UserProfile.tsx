import { Button, Card, Col, Form, Input, Row } from 'antd'
import { useEffect, useState } from 'react'
import { useAppSelector } from "../../store/hooks"
import { toast } from "react-toastify"
import { API_BASE } from '../../config/api'
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
    const authUser = useAppSelector((s) => s.auth.user)
    const token = useAppSelector((s) => s.auth.token)


    useEffect(() => {
        if (authUser) {
            form.setFieldsValue({
                fullname: authUser.fullName,
                phone: authUser.phone,
                email: authUser.email,
            });
        }
    }, [authUser, form]);

    const fetchUserData = async () => {
        try {
            const res = await fetch(`${API_BASE}/admin/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const result = await res.json();
            if (res.ok) {
                return result;
            } else {
                toast.error(result.message || "Lấy thông tin user thất bại");
            }
        } catch (error) {
            console.error(error);
            toast.error("Lấy thông tin user thất bại");
        }
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            const res = await fetch(`${API_BASE}/customer/${authUser?.userId}/update-info`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    fullname: values.fullname,
                    phone: values.phone,
                    email: values.email
                }),
            });

            const result = await res.json();

            if (!res.ok) {
                toast.error(result.message || "Cập nhật thất bại!");
            } else {
                toast.success(result.message || "Cập nhật thành công!");

                const updatedUser = result.data;
                if (updatedUser) {

                    form.setFieldsValue({
                        fullname: updatedUser.fullName,
                        phone: updatedUser.phoneNumber || updatedUser.phone,
                        email: updatedUser.email
                    });

                    if (onSave) onSave(updatedUser);
                }
            }

        } catch (error) {
            console.error('Validation or API failed:', error);
            toast.error("Có lỗi xảy ra khi cập nhật!");
        } finally {
            setLoading(false);
        }
    };
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
                    // phone: initialData?.phone || '',
                    // email: initialData?.email || '',
                    gender: initialData?.gender || 'male',
                    day: initialData?.birthday?.day || '',
                    month: initialData?.birthday?.month || '',
                    year: initialData?.birthday?.year || '',
                }}
            >
                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item
                            label={<span style={{ fontWeight: 500 }}>Họ và tên</span>}
                            name="fullname"
                            rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
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
                            label={<span style={{ fontWeight: 500 }}>Số điện thoại</span>}
                            name="phone"
                            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                        >
                            <Input
                                placeholder="phone number"
                                size="large"
                                style={{ borderRadius: 8 }}
                            />
                        </Form.Item>
                    </Col>
                </Row>



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
                    // addonAfter={
                    //     <a href="#" style={{ color: '#C92127', textDecoration: 'none', fontSize: 13 }}>
                    //         Thêm mới
                    //     </a>
                    // }
                    />
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
