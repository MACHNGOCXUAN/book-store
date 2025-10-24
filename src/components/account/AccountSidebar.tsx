import { HeartOutlined, ShoppingOutlined, UserOutlined, WalletOutlined } from '@ant-design/icons'
import { Avatar, Badge, Menu } from 'antd'
import { useState } from 'react'

interface AccountSidebarProps {
    userName?: string
    userLevel?: string
    fPoint?: number
    fPointNextLevel?: number
    onMenuSelect?: (key: string) => void
    selectedKey?: string
}

const AccountSidebar = ({
    userName = 'Người dùng',
    userLevel = 'Thành viên Bạc',
    fPoint = 0,
    fPointNextLevel = 30000,
    onMenuSelect,
    selectedKey: externalSelectedKey,
}: AccountSidebarProps) => {
    const [internalSelectedKey, setInternalSelectedKey] = useState('profile')
    const selectedKey = externalSelectedKey || internalSelectedKey

    const menuItems = [
        {
            key: 'account-info',
            icon: <UserOutlined />,
            label: 'Thông tin tài khoản',
            children: [
                { key: 'profile', label: 'Hồ sơ cá nhân' },
                { key: 'address', label: 'Số địa chỉ' },
                { key: 'change-password', label: 'Đổi mật khẩu' }
            ],
        },
        {
            key: 'orders',
            icon: <ShoppingOutlined />,
            label: 'Đơn hàng của tôi',
        },
        {
            key: 'vouchers',
            icon: <WalletOutlined />,
            label: (
                <span>
                    Ví voucher
                    <Badge count={12} style={{ marginLeft: 8, backgroundColor: '#C92127' }} />
                </span>
            ),
        },
        {
            key: 'favorites',
            icon: <HeartOutlined />,
            label: 'Sản phẩm yêu thích',
        }
    ]

    return (
        <div style={{
            background: 'white',
            borderRadius: 8,
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
            {/* User Info Section */}
            <div style={{
                padding: '24px',
                textAlign: 'center',
                borderBottom: '1px solid #f0f0f0'
            }}>
                <Avatar
                    size={80}
                    icon={<UserOutlined />}
                    style={{
                        backgroundColor: '#f0f0f0',
                        border: '4px solid white',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                />
                <div style={{ marginTop: 16 }}>
                    <div style={{
                        fontWeight: 600,
                        fontSize: 16,
                        color: '#333',
                        marginBottom: 4
                    }}>
                        {userName}
                    </div>
                    <div style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        background: 'linear-gradient(135deg, #C0C0C0 0%, #E8E8E8 100%)',
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 500,
                        color: '#666'
                    }}>
                        {userLevel}
                    </div>
                </div>

            </div>

            {/* Menu */}
            <Menu
                mode="inline"
                selectedKeys={[selectedKey]}
                defaultOpenKeys={['account-info']}
                items={menuItems}
                style={{
                    border: 'none',
                    fontSize: 14
                }}
                onSelect={({ key }) => {
                    setInternalSelectedKey(key)
                    if (onMenuSelect) {
                        onMenuSelect(key)
                    }
                }}
            />
        </div>
    )
}

export default AccountSidebar
