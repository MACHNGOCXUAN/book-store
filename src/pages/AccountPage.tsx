import { ExclamationCircleOutlined } from '@ant-design/icons'
import { Alert, Col, Row } from 'antd'
import { useState } from 'react'
import AccountSidebar from '../components/account/AccountSidebar'
import AddressProfile from '../components/account/AddressProfile'
import ChangePassword from '../components/account/ChangePassword'
import FavoriteProduct from '../components/account/FavoriteProduct'
import UserProfile from '../components/account/UserProfile'
import Voucher from '../components/account/Voucher'

const AccountPage = () => {
    const [selectedMenu, setSelectedMenu] = useState('profile')
    const [showAlert, setShowAlert] = useState(true)
    // Mock user data - replace with real data from API/Redux
    const userData = {
        userName: 'Nguyễn Văn A',
        userLevel: 'Thành viên Bạc',
        fPoint: 0,
        fPointNextLevel: 30000,
        stats: {
            fPoint: 0,
            freeship: 0,
            orders: 0,
            paid: 0,
        },
        profile: {
            firstName: '',
            lastName: '',
            phone: '0974122850',
            email: '',
            gender: 'male' as const,
            birthday: {
                day: '',
                month: '',
                year: '',
            },
        },
    }

    const handleSaveProfile = (data: any) => {
        console.log('Profile saved:', data)
        // Here you would typically call an API to save the data
    }

    const handleSaveAddress = (data: any) => {
        console.log('Address saved:', data)
        // API call to save address
    }

    const handleSavePassword = (data: any) => {
        console.log('Password changed:', data)
        // API call to change password
    }

    const handleRemoveFavorite = (bookId: string) => {
        console.log('Removed from favorites:', bookId)
        // API call to remove from favorites
    }

    // Render content based on selected menu
    const renderContent = () => {
        switch (selectedMenu) {
            case 'profile':
                return (
                    <>
                        <UserProfile
                            initialData={userData.profile}
                            onSave={handleSaveProfile}
                        />
                    </>
                )
            case 'address':
                return <AddressProfile onSave={handleSaveAddress} />
            case 'change-password':
                return <ChangePassword onSave={handleSavePassword} />
            case 'vouchers':
                return <Voucher />
            case 'favorites':
                return <FavoriteProduct onRemove={handleRemoveFavorite} />
            case 'orders':
                return (
                    <div style={{
                        background: 'white',
                        padding: '40px',
                        borderRadius: 8,
                        textAlign: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                        <h3>Đơn hàng của tôi</h3>
                        <p style={{ color: '#666' }}>Tính năng đang được phát triển...</p>
                    </div>
                )
            default:
                return (
                    <>
                        <UserStats
                            fPoint={userData.stats.fPoint}
                            freeship={userData.stats.freeship}
                            orders={userData.stats.orders}
                            paid={userData.stats.paid}
                        />
                        <UserProfile
                            initialData={userData.profile}
                            onSave={handleSaveProfile}
                        />
                    </>
                )
        }
    }

    return (
        <div style={{ background: '#f5f5f5', minHeight: '100vh', paddingTop: 20, paddingBottom: 40 }}>
            <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>
                {/* Warning Alert */}
                {showAlert && selectedMenu === 'profile' && (
                    <Alert
                        message={
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span>
                                    <ExclamationCircleOutlined style={{ marginRight: 8 }} />
                                    Bạn vui lòng cập nhật thông tin tài khoản.
                                </span>
                                <a
                                    href="#"
                                    style={{
                                        color: '#C92127',
                                        fontWeight: 600,
                                        textDecoration: 'none'
                                    }}
                                >
                                    Cập nhật thông tin ngay
                                </a>
                            </div>
                        }
                        type="error"
                        closable
                        onClose={() => setShowAlert(false)}
                        style={{
                            marginBottom: 20,
                            borderRadius: 8,
                            border: '1px solid #ff4d4f'
                        }}
                    />
                )}

                {/* Main Content */}
                <Row gutter={[24, 24]}>
                    {/* Sidebar */}
                    <Col xs={24} lg={6}>
                        <AccountSidebar
                            userName={userData.userName}
                            userLevel={userData.userLevel}
                            fPoint={userData.fPoint}
                            fPointNextLevel={userData.fPointNextLevel}
                            selectedKey={selectedMenu}
                            onMenuSelect={setSelectedMenu}
                        />
                    </Col>

                    {/* Main Content Area */}
                    <Col xs={24} lg={18}>
                        {renderContent()}
                    </Col>
                </Row>
            </div>
        </div>
    )
}

export default AccountPage
