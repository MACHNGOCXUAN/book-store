import { Button, Card, Form, Input, Select } from 'antd'
import { useState, useEffect } from 'react'
import { API_BASE } from '../../config/api'
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import { toast } from "react-toastify";

const { Option } = Select;

interface AddressProfileProps {
    onSave?: (data: { address: string, city: string }) => void
}

const AddressProfile = ({ onSave }: AddressProfileProps) => {
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const { token, user } = useSelector((state: RootState) => state.auth);

    const cities = [
        "Hồ Chí Minh",
        "Hà Nội",
        "Đà Nẵng",
        "Hải Phòng",
        "Cần Thơ",
        "Khác"
    ]

    useEffect(() => {
        const fetchAddress = async () => {
            if (!user?.userId) return;

            try {
                const res = await fetch(`${API_BASE}/customer/${user.userId}/address`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error("Không thể tải địa chỉ");
                const data = await res.json();

                // ✅ Điền giá trị lên form: address + city
                form.setFieldsValue({ 
                    address: data.address || "",
                    city: data.city || ""
                });
            } catch (error) {
                console.error("Lỗi khi lấy địa chỉ:", error);
                toast.error("Lấy thông tin địa chỉ thất bại!");
            }
        };

        fetchAddress();
    }, [user?.userId, token, form]);

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            const res = await fetch(`${API_BASE}/customer/${user?.userId}/update-address`, { 
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ 
                    address: values.address, 
                    city: values.city 
                }),
            });

            const result = await res.json();

            if (!res.ok) {
                toast.error(result.message || "Cập nhật thất bại!");
            } else {
                toast.success(result.message || "Cập nhật địa chỉ thành công!");
                if (onSave) onSave(values);
            }

        } catch (error) {
            console.error("Lỗi khi cập nhật địa chỉ:", error);
            toast.error("Có lỗi xảy ra khi lưu địa chỉ!");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card
            title={<div style={{ fontSize: 18, fontWeight: 600 }}>Cập nhật địa chỉ</div>}
            bordered={false}
            style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
        >
            <Form
                form={form}
                layout="vertical"
            >
                <Form.Item
                    label="Tỉnh / Thành phố"
                    name="city"
                    rules={[{ required: true, message: 'Vui lòng chọn tỉnh/thành!' }]}
                >
                    <Select placeholder="Chọn tỉnh/thành" size="large" style={{ borderRadius: 8 }}>
                        {cities.map(city => <Option key={city} value={city}>{city}</Option>)}
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Địa chỉ chi tiết"
                    name="address"
                    rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
                >
                    <Input.TextArea
                        placeholder="Nhập địa chỉ đầy đủ"
                        rows={4}
                        size="large"
                        style={{ borderRadius: 8 }}
                    />
                </Form.Item>

                <Form.Item style={{ marginBottom: 0 }}>
                    <Button
                        type="primary"
                        size="large"
                        onClick={handleSave}
                        loading={loading}
                        htmlType="button"
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
