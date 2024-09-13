import React, { useEffect, useState } from 'react';
import { Breadcrumb, Layout, Menu, theme, Input, Button, Modal } from 'antd';
import { DesktopOutlined, PieChartOutlined, UserOutlined } from '@ant-design/icons';
import axios from './axiosConfg'; // Ensure this is the correct path
import MainPage from './main_page';
import SaveNewPassword from './save_new_password';
import { dataFetching } from './crud_operation';
import { config } from './crud_operation';
import './styles.css';
import { Route, Routes, useNavigate } from 'react-router-dom';
import Login from './auth'; // Import Login component
import Register from './register'; // Import Register component
import PrivateRoute from './PrivateRoute'; // Ensure this is the correct path

const { Content, Footer, Sider } = Layout;
const { Search } = Input;

const App = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [passwordItems, setPasswordItems] = useState([]);
    const [groupItems, setGroupItems] = useState([]);
    const [selectedGroupId, setSelectedGroupId] = useState(1);
    const [userId, setUserId] = useState(1);
    const [comment, setCommentId] = useState(null);
    const [url, setUrlId] = useState(null);
    const [selectedKey, setSelectedKey] = useState('1');
    const [openKeys, setOpenKeys] = useState([]);
    const [loggedIn, setLoggedIn] = useState(false); // State to track if user is logged in
    const [showAuthModal, setShowAuthModal] = useState(false); // State to control the authentication modal
    const {
        token: { colorBgContainer },
    } = theme.useToken();

    const navigate = useNavigate();

    // Check if the user is logged in
    useEffect(() => {
        const token = localStorage.getItem('token');
        setLoggedIn(!!token);
    }, []);

    const fetchData = () => {
        if (selectedGroupId) {
            dataFetching(selectedGroupId, setPasswordItems);
        } else {
            console.error('No group selected');
        }
    };

   useEffect(() => {
        axios
            .get('http://127.0.0.1:8000/api/groups/', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
            .then((response) => {
                if (Array.isArray(response.data)) {
                    const fetchedGroups = response.data.map((group) => ({
                        label: group.groupName, // Use the correct property for the name
                        key: `group-${group.groupId}`, // Ensure the key is unique
                    }));
                    setGroupItems(fetchedGroups);
                } else {
                    console.error('API response is not an array', response.data);
                    setGroupItems([]);
                }
            })
            .catch((error) => {
                console.error('Error fetching groups:', error);
                setGroupItems([]);
            });
    }, []);

    const handleMenuClick = (key) => {
        setSelectedKey(key);

        if (key.startsWith('group-')) {
            const groupId = key.split('-')[1];
            setSelectedGroupId(groupId);

            axios.get(`http://127.0.0.1:8000/api/groups/${groupId}/`, config)
                .then(response => {
                    const groupName = response.data.groupName;
                    setBreadcrumbItems([
                        { title: 'Group' },
                        { title: groupName },
                    ]);
                })
                .catch(error => {
                    console.error('Error fetching group details:', error);
                });
        } else if (key === 'logout') {
            handleLogout(); // Call logout function when logout menu item is clicked
        }
    };

    const onOpenChange = (keys) => {
        setOpenKeys(keys);
    };

 const groupMenuItems = [
        {
            label: 'About us',
            key: '1',
            icon: <DesktopOutlined />,
        },
        {
            label: 'Passwords',
            key: '2',
            icon: <PieChartOutlined />,
        },
        {
            label: 'Groups',
            key: 'sub1',
            icon: <UserOutlined />,
            children: groupItems.length > 0
                ? groupItems
                : [{ label: 'Loading...', key: 'loading' }],
        },
        {
            label: 'Logout',
            key: 'logout',
            icon: <UserOutlined />,
        },
    ];

    const [breadcrumbItems, setBreadcrumbItems] = useState([
        { title: 'Group' },
        { title: 'Group-name' },
    ]);

    const onMenuSelect = ({ key }) => {
        handleMenuClick(key);
    };

    const handleLogin = () => {
        navigate('/login');
        setShowAuthModal(false);
    };

    const handleRegister = () => {
        navigate('/register');
        setShowAuthModal(false);
    };

    const onPasswordAdd = () => {
        fetchData();
    };

    const handleLogout = () => {
        localStorage.removeItem('token'); // Remove the token from local storage
        setLoggedIn(false); // Update the loggedIn state
        navigate('/login'); // Redirect to the login page
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[selectedKey]}
                    openKeys={openKeys}
                    onClick={onMenuSelect}
                    onOpenChange={onOpenChange}
                    items={groupMenuItems}
                />
            </Sider>

            <Layout>
                <Search
                    placeholder="input search text"
                    style={{
                        margin: '0 auto',
                        padding: '50px 0',
                        width: 1050,
                        color: '#0a0a0a',
                    }}
                />
                <Content style={{ margin: '0 16px' }}>
                    <Breadcrumb
                        style={{ margin: '16px 0' }}
                        items={breadcrumbItems}
                    />

                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/" element={<PrivateRoute><MainPage groupId={selectedGroupId} /></PrivateRoute>} exact />
                    </Routes>

                    <div
                        style={{
                            position: 'fixed',
                            bottom: 24,
                            right: 24,
                            zIndex: 1000,
                        }}
                    >
                        <SaveNewPassword
                            groupId={selectedGroupId}
                            userId={userId}
                            comment={comment}
                            url={url}
                            onPasswordAdd={onPasswordAdd}
                        />
                    </div>
                </Content>
                <Footer style={{ textAlign: 'center' }}>© 2024 LockR</Footer>
            </Layout>

            <Modal
                title="Authentication"
                visible={showAuthModal}
                onCancel={() => setShowAuthModal(false)}
                footer={null}
            >
                {loggedIn ? (
                    <p>You are logged in.</p>
                ) : (
                    <div>
                        <p>Please log in to continue.</p>
                        <Button type="primary" onClick={handleLogin} style={{ marginRight: 8 }}>
                            Login
                        </Button>
                        <Button type="default" onClick={handleRegister}>
                            Create Account
                        </Button>
                    </div>
                )}
            </Modal>
        </Layout>
    );
};

export default App;