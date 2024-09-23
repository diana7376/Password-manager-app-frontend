import React, { useEffect, useState, useRef } from 'react';

import { Breadcrumb, Layout, Menu, theme, Input, Button, Modal, message } from 'antd';
import {
    DesktopOutlined,
    PieChartOutlined,
    UserOutlined,
    AudioOutlined,
    LogoutOutlined,
    LoginOutlined
} from '@ant-design/icons';
import axios from './axiosConfg';
import fuzzysort from 'fuzzysort';
import MainPage from './main_page';
import SaveNewPassword from './save_new_password';
import { dataFetching, config, fetchAllPasswordItems, fetchUnlistedPasswordItems } from './crud_operation';
import './styles.css';
import {Navigate, Route, Routes, useNavigate} from 'react-router-dom';
import Login from './authorisation/login';
import Register from './authorisation/register';
import PrivateRoute from './authorisation/PrivateRoute';
import AboutUs from "./aboutUs";
import { useLocation } from 'react-router-dom';
import { PasswordProvider } from './PasswordContext';

const { Search } = Input;
const { Header, Content, Footer, Sider } = Layout;

const suffix = (
    <AudioOutlined style={{ fontSize: 16, color: '#1677ff' }} />
);

const onSearch = (value, _e, info) => console.log(info?.source, value);

function getItem(label, key, icon, children) {
    return {
        key,
        icon,
        children,
        label,
    };
}

const App = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [passwordItems, setPasswordItems] = useState([]);
    const [groupItems, setGroupItems] = useState([]);
    const [selectedGroupId, setSelectedGroupId] = useState(-1);
    const [userId, setUserId] = useState(1);
    const [comment, setCommentId] = useState(null);
    const [url, setUrlId] = useState(null);
    const [selectedKey, setSelectedKey] = useState('1');
    const [openKeys, setOpenKeys] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchRef = useRef(null);
    const searchInputRef = useRef(null);

    const [loggedIn, setLoggedIn] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const navigate = useNavigate();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedPasswordItem, setSelectedPasswordItem] = useState(null);
    const location = useLocation();

    const isLoginPage = location.pathname === '/login';
    const isRegisterPage = location.pathname === '/register';
    const isAboutUsPage = location.pathname === '/about';


    // Focus on the input when the component mounts

    useEffect(() => {
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, []);

    const {
        token: { colorBgContainer },
    } = theme.useToken();

    // Check if the user is logged in and automatically fetch groups after login
    useEffect(() => {
        const token = localStorage.getItem('token');
        setLoggedIn(!!token);

        if (token) {
            axios
                .get('http://127.0.0.1:8000/api/groups/', { headers: { Authorization: `Bearer ${token}` } })
                .then((response) => {
                    if (Array.isArray(response.data)) {
                        const allGroup = getItem('All', 'group-0');
                        const unlistedGroup = getItem('Unlisted', 'group-X');

                        const fetchedGroups = [
                            allGroup,
                            unlistedGroup,
                            ...response.data.map((group) => getItem(group.groupName, `group-${group.groupId}`))
                        ];

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
        }
    }, [loggedIn]);

    const fetchData = () => {
        if (selectedGroupId === -1) {
            fetchAllPasswordItems(setPasswordItems);
        } else if (selectedGroupId) {
            dataFetching(selectedGroupId, setPasswordItems);
        } else {
            fetchUnlistedPasswordItems(setPasswordItems);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedGroupId]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSearching(false);
                setFilteredItems([]);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const onSearch = (value) => {
        setIsSearching(true);

        if (value.trim() === '') {
            setIsSearching(false);
            setFilteredItems([]);
            return;
        }

        const resultsItemName = fuzzysort.go(value, passwordItems, { key: 'itemName', threshold: -10000 });
        const resultsUserName = fuzzysort.go(value, passwordItems, { key: 'userName', threshold: -10000 });
        const resultsComment = fuzzysort.go(value, passwordItems, { key: 'comment', threshold: -10000 });
        const resultsUrl = fuzzysort.go(value, passwordItems, { key: 'url', threshold: -10000 });

        const combinedResults = [
            ...resultsItemName,
            ...resultsUserName,
            ...resultsComment,
            ...resultsUrl
        ];

        const uniqueResults = new Map();
        combinedResults.forEach(result => {
            if (!uniqueResults.has(result.obj.id)) {
                uniqueResults.set(result.obj.id, result);
            }
        });

        const filtered = Array.from(uniqueResults.values()).map(result => ({
            ...result.obj,
            similarityScore: result.score
        }));

        setFilteredItems(filtered);
    };

    const handleMenuClick = (key) => {
        setSelectedKey(key);
        setIsSearching(false);

        if (key === '2') {
            setSelectedGroupId(-1);
            setBreadcrumbItems([
                { title: 'Group' },
                { title: 'All' },
            ]);
            fetchDataForAllGroups();
        } else if (key.startsWith('group-')) {
            const groupId = key.split('-')[1];
            setSelectedGroupId(groupId);

            if (groupId === '0') {
                setSelectedGroupId(-1);
                setBreadcrumbItems([
                    { title: 'Group' },
                    { title: 'All' },
                ]);
                fetchDataForAllGroups();
            } else if (groupId === 'X') {
                setSelectedGroupId(null);
                setBreadcrumbItems([
                    { title: 'Group' },
                    { title: 'Unlisted' },
                ]);
                fetchDataForUnlistedGroups();
            } else {
                setSelectedGroupId(groupId);
                const clickedGroup = groupItems.find(item => item.key === key);

                if (clickedGroup) {
                    const groupName = clickedGroup.label;
                    setBreadcrumbItems([
                        { title: 'Group' },
                        { title: groupName },
                    ]);
                }

                axios.get(`http://127.0.0.1:8000/api/groups/${groupId}/password-items/`, config)
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
            }
        } else if (key === 'logout') {
            showLogoutConfirmation();
        }
    };

    const fetchDataForAllGroups = () => {
        axios
            .get('http://127.0.0.1:8000/api/password-items/', config)
            .then((response) => {
                setPasswordItems(response.data.passwords);
            })
            .catch((error) => {
                console.error('Error fetching all password items:', error);
            });
    };

    const fetchDataForUnlistedGroups = () => {
        axios
            .get('http://127.0.0.1:8000/api/password-items/unlisted/', config)
            .then((response) => {
                setPasswordItems(response.data.passwords);
            })
            .catch((error) => {
                console.error('Error fetching unlisted password items:', error);
            });
    };

    const onOpenChange = (keys) => {
        setOpenKeys(keys);
    };

    const groupMenuItems = [
        {
            label: 'About us',
            key: '1',
            icon: <DesktopOutlined />,
            onClick: () => navigate('/about'),
        },
        ...(loggedIn ? [
            {
                label: 'Passwords',
                key: '2',
                icon: <PieChartOutlined />,
                onClick: () => navigate('/passwords'),
            },
            {
                label: 'Groups',
                key: 'sub1',
                icon: <UserOutlined />,
                children: groupItems.length > 0 ? groupItems : [{ label: 'Loading...', key: 'loading' }],
            }
        ] : []),
        {
        label: loggedIn ? 'Logout' : 'Login',
        key: loggedIn ? 'logout' : 'login',
        icon: loggedIn ? <LogoutOutlined /> : <LoginOutlined />,
        onClick: () => loggedIn ? showLogoutConfirmation() : navigate('/login')  // Show confirmation modal for logout
    }
];


    const [breadcrumbItems, setBreadcrumbItems] = useState([
        { title: 'Group' },
        { title: 'All' },
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
    // User menu items for the bottom of the sidebar
    const userItem = [getItem('User', '3', <DesktopOutlined />)];

    const onPasswordAdd = (newItem) => {
        setPasswordItems((prevItems) => [...prevItems, newItem]);  // Add the new password to the current state
    };

    useEffect(() => {
        if (selectedKey === '2') {
            fetchDataForAllGroups(); // Fetch all password items for the default "Passwords" selection
        }
    }, [selectedKey]);

const showLogoutConfirmation = () => {
    setShowLogoutConfirm(true); // Show the logout confirmation modal
};

const handleLogout = () => {
    localStorage.removeItem('token'); // Remove the token
    setLoggedIn(false); // Update the login state
    message.success('You have successfully logged out. See you soon..');
    setShowLogoutConfirm(false); // Close the logout confirmation modal
    navigate('/login'); // Redirect to the login page
};

const handleCancelLogout = () => {
    setShowLogoutConfirm(false); // Close the confirmation modal without logging out
    setSelectedKey('2');
};

    const showModal = (item) => {
    setSelectedPasswordItem(item); // Set the selected password item
    setIsModalVisible(true); // Show the modal
    };

    const handleCancel = () => {
    setIsModalVisible(false); // Hide the modal
    };

    return (
        <PasswordProvider>
        <Layout style={{ minHeight: '100vh' }}>
            <Sider collapsible
                   collapsed={collapsed}
                   onCollapse={(value) => setCollapsed(value)}>

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
                {/* Conditionally render search bar and add password button */}

                {!isLoginPage && !isRegisterPage && !isAboutUsPage && loggedIn &&  (
                <div ref={searchRef}>
                    <Search
                        placeholder="What are you looking for?"
                        onSearch={onSearch}
                        className = "custom-search-bar"

                        ref={(input) => {
                            // Attach the ref to the input DOM element inside the Search component
                            if (input) {
                                searchInputRef.current = input.input;
                            }
                        }}
                    />
                </div>

                )}
                {/* <Header style={{ padding: 0, background: colorBgContainer }} />*/}

                <Content style={{ margin: '0 16px' }}>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/about" element={<AboutUs />} />

                        <Route path="/" element={<Navigate to="/about" />} />

                        <Route path="/passwords" element={
                            <PrivateRoute>
                                <Breadcrumb style={{ margin: '16px 0' }} items={breadcrumbItems} />
                                <MainPage
                                    groupId={selectedGroupId}
                                    userId={userId}
                                    setGroupItems={setGroupItems}
                                    passwordItems={passwordItems} // Pass down the password items
                                    setPasswordItems={setPasswordItems}
                                />
                            </PrivateRoute>
                        }
                               exact
                        />
                    </Routes>


                </Content>
                <Footer style={{ textAlign: 'center' }}>© 2024 LockR</Footer>
            </Layout>

            {/* Plus Button at the bottom-right corner under the table */}
            {/* Conditionally render the "Add New Password" button */}

            {!isLoginPage && !isRegisterPage && !isAboutUsPage && loggedIn && (
                <div style={{
                    position: 'fixed',
                    bottom: 24,
                    right: 24,
                    zIndex: 9999,
                }}
                >
                    <SaveNewPassword
                        groupId={selectedGroupId}
                        userId={userId}
                        comment={comment}
                        url={url}
                        onPasswordAdd={(newItem) => {
                            setPasswordItems((prevItems) => [...prevItems, newItem]);  // Add new password to the table
                        }}
                        setGroupItems={setGroupItems}
                    />
                </div>

            )}
            <Modal
                title="Authentication"
                open={showAuthModal}
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
            <Modal
                title="Confirm Logout"
                visible={showLogoutConfirm}
                onOk={handleLogout}
                onCancel={handleCancelLogout}
                okText="Yes"
                cancelText="No"
            >
                <p>Are you sure you want to log out?</p>
            </Modal>
            <Modal
                title="Password Details"
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null} // You can add footer actions if needed
            >
                {selectedPasswordItem ? (
                    <div>
                        <p><strong>Item Name:</strong> {selectedPasswordItem.itemName}</p>
                        <p><strong>Username:</strong> {selectedPasswordItem.userName}</p>
                        <p><strong>Password:</strong> {selectedPasswordItem.password}</p>
                        <p><strong>URL:</strong> {selectedPasswordItem.url}</p>
                        <p><strong>Comment:</strong> {selectedPasswordItem.comment}</p>
                    </div>
                ) : (
                    <p>No details available</p>
                )}
            </Modal>

        </Layout>
        </PasswordProvider>
    );
};

export default App;
