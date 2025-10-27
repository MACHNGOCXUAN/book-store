import { Button, Checkbox, Col, Form, Input, Row, Select, Spin } from 'antd'
import { useEffect, useState } from 'react'
import { fetchProvincesV1, transformV1Data } from '../../services/provincesApi'
import type { Address } from '../../types/Address'

interface AddressFormProps {
    initialData?: Address | null
    onSubmit: (data: Address) => void
    onCancel: () => void
    loading?: boolean
}

const AddressForm = ({ initialData, onSubmit, onCancel, loading }: AddressFormProps) => {
    const [form] = Form.useForm()
    const [isEditMode] = useState(!!initialData?.id)

    // Province data
    const [provinceData, setProvinceData] = useState<Record<string, Record<string, string[]>>>({})
    const [loadingProvinces, setLoadingProvinces] = useState(true)
    const [selectedCity, setSelectedCity] = useState<string | undefined>()
    const [selectedDistrict, setSelectedDistrict] = useState<string | undefined>()

    // Load provinces data
    useEffect(() => {
        const loadProvinces = async () => {
            try {
                setLoadingProvinces(true)
                const provinces = await fetchProvincesV1(3) // depth=3: tỉnh + quận/huyện + xã/phường
                const transformed = transformV1Data(provinces)
                setProvinceData(transformed)
            } catch (error) {
                console.error('Error loading provinces:', error)
            } finally {
                setLoadingProvinces(false)
            }
        }
        loadProvinces()
    }, [])

    useEffect(() => {
        if (initialData) {
            form.setFieldsValue(initialData)
            setSelectedCity(initialData.province)  // Changed from city to province
            setSelectedDistrict(initialData.district)
        } else {
            form.resetFields()
            setSelectedCity(undefined)
            setSelectedDistrict(undefined)
        }
    }, [initialData, form])

    const handleCityChange = (value: string) => {
        setSelectedCity(value)
        setSelectedDistrict(undefined)
        form.setFieldsValue({
            province: value,  // Set province field
            district: undefined,
            ward: undefined
        })
    }

    const handleDistrictChange = (value: string) => {
        setSelectedDistrict(value)
        form.setFieldsValue({ ward: undefined })
    }

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields()
            const isDefault = values.isDefault || false
            onSubmit({
                ...values,
                id: initialData?.id,
                main: isDefault ? 1 : 0, // main = 1 means default, main = 0 means not default
                isDefault: isDefault
            })
        } catch (error) {
            console.error('Validation failed:', error)
        }
    }

    const cities = Object.keys(provinceData)
    const districts = selectedCity ? Object.keys(provinceData[selectedCity] || {}) : []
    const wards = selectedCity && selectedDistrict ? provinceData[selectedCity]?.[selectedDistrict] || [] : []

    return (
        <Spin spinning={loadingProvinces} tip="Đang tải dữ liệu địa chỉ...">
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    receiverName: '',
                    receiverPhone: '',
                    main: 0,
                    province: '',
                    district: '',
                    ward: '',
                    specifics: '',
                    isDefault: false,
                    ...initialData
                }}
            >
                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item
                            label={<span style={{ fontWeight: 500 }}>Tên người nhận<span style={{ color: '#ff4d4f' }}>*</span></span>}
                            name="receiverName"
                            rules={[{ required: true, message: 'Vui lòng nhập tên người nhận!' }]}
                        >
                            <Input
                                placeholder="Nhập tên người nhận"
                                size="large"
                                style={{ borderRadius: 8 }}
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item
                            label={<span style={{ fontWeight: 500 }}>Số điện thoại<span style={{ color: '#ff4d4f' }}>*</span></span>}
                            name="receiverPhone"
                            rules={[
                                { required: true, message: 'Vui lòng nhập số điện thoại!' },
                                { pattern: /^[0-9]{10}$/, message: 'Số điện thoại phải có 10 chữ số!' }
                            ]}
                        >
                            <Input
                                placeholder="Nhập số điện thoại"
                                size="large"
                                style={{ borderRadius: 8 }}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col xs={24} md={8}>
                        <Form.Item
                            label={<span style={{ fontWeight: 500 }}>Tỉnh/Thành phố<span style={{ color: '#ff4d4f' }}>*</span></span>}
                            name="province"
                            rules={[{ required: true, message: 'Vui lòng chọn tỉnh/thành phố!' }]}
                        >
                            <Select
                                placeholder="Chọn tỉnh/thành phố"
                                size="large"
                                style={{ borderRadius: 8 }}
                                onChange={handleCityChange}
                                showSearch
                                filterOption={(input, option) =>
                                    (option?.children as string).toLowerCase().includes(input.toLowerCase())
                                }
                                disabled={loadingProvinces}
                            >
                                {cities.map((city) => (
                                    <Select.Option key={city} value={city}>
                                        {city}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                        <Form.Item
                            label={<span style={{ fontWeight: 500 }}>Quận/Huyện<span style={{ color: '#ff4d4f' }}>*</span></span>}
                            name="district"
                            rules={[{ required: true, message: 'Vui lòng chọn quận/huyện!' }]}
                        >
                            <Select
                                placeholder="Chọn quận/huyện"
                                size="large"
                                style={{ borderRadius: 8 }}
                                onChange={handleDistrictChange}
                                disabled={!selectedCity || loadingProvinces}
                                showSearch
                                filterOption={(input, option) =>
                                    (option?.children as string).toLowerCase().includes(input.toLowerCase())
                                }
                            >
                                {districts.map((district) => (
                                    <Select.Option key={district} value={district}>
                                        {district}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                        <Form.Item
                            label={<span style={{ fontWeight: 500 }}>Phường/Xã<span style={{ color: '#ff4d4f' }}>*</span></span>}
                            name="ward"
                            rules={[{ required: true, message: 'Vui lòng chọn phường/xã!' }]}
                        >
                            <Select
                                placeholder="Chọn phường/xã"
                                size="large"
                                style={{ borderRadius: 8 }}
                                disabled={!selectedDistrict || loadingProvinces}
                                showSearch
                                filterOption={(input, option) =>
                                    (option?.children as string).toLowerCase().includes(input.toLowerCase())
                                }
                            >
                                {wards.map((ward) => (
                                    <Select.Option key={ward} value={ward}>
                                        {ward}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                {/* Chi tiết bổ sung */}
                <Form.Item
                    label={<span style={{ fontWeight: 500 }}>Địa chỉ chi tiết<span style={{ color: '#ff4d4f' }}>*</span></span>}
                    name="specifics"
                    rules={[{ required: true, message: 'Vui lòng nhập địa chỉ chi tiết!' }]}
                >
                    <Input.TextArea
                        placeholder="VD: Số 123, Đường Nguyễn Văn Linh, Tầng 3, căn 301..."
                        rows={3}
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
                    justifyContent: 'flex-end',
                    paddingTop: 12,
                    borderTop: '1px solid #f0f0f0'
                }}>
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
                        Hủy
                    </Button>
                    <Button
                        type="primary"
                        size="large"
                        onClick={handleSubmit}
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
                        {isEditMode ? 'CẬP NHẬT' : 'THÊM ĐỊA CHỈ'}
                    </Button>
                </div>
            </Form>
        </Spin>
    )
}

export default AddressForm
