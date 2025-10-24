import { HeartOutlined, ShoppingOutlined, UserOutlined, WalletOutlined } from '@ant-design/icons'
import { Avatar, Badge, Menu } from 'antd'
import { useState } from 'react'
import { useAppSelector } from "../../store/hooks"

interface AccountSidebarProps {
    userLevel?: string
    onMenuSelect?: (key: string) => void
    selectedKey?: string
}

const AccountSidebar = ({
    onMenuSelect,
    selectedKey: externalSelectedKey,
}: AccountSidebarProps) => {
    const authUser = useAppSelector((s) => s.auth.user)
    const [fullname, setFullname] = useState(authUser?.fullName || "")
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
                        {fullname}
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
