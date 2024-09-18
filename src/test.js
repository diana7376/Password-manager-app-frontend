import React, { useEffect, useState, useRef } from 'react';

import { Breadcrumb, Layout, Menu, theme, Input, Button, Modal, Space } from 'antd';
import { DesktopOutlined, PieChartOutlined, UserOutlined, AudioOutlined } from '@ant-design/icons';
import {Route, Routes, useNavigate, useLocation, Navigate} from 'react-router-dom';

import axios from './axiosConfg';
import fuzzysort from 'fuzzysort';
import MainPage from './main_page';
import SaveNewPassword from './save_new_password';
import { dataFetching, fetchAllPasswordItems, fetchUnlistedPasswordItems } from './crud_operation';
import './styles.css';
import Login from './auth/auth';
import Register from './auth/register';
import PrivateRoute from './auth/PrivateRoute';
import AboutUs from './AboutUs';


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

    const [selectedKey, setSelectedKey] = useState('2'); // State to track selected menu item
    const [openKeys, setOpenKeys] = useState([]); // Track open submenu keys
    const [filteredItems, setFilteredItems] = useState([]); // For storing search results
    const [isSearching, setIsSearching] = useState(false); // Flag to track whether search is active

    const searchRef = useRef(null);
    const searchInputRef = useRef(null);
    const [loggedIn, setLoggedIn] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const {
        token: { colorBgContainer },
    } = theme.useToken();

    useEffect(() => {
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setLoggedIn(!!token);
    }, []);

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
        axios.get('http://127.0.0.1:8000/api/groups/', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
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
            ...resultsUrl,
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
        setSelectedKey(key); // Set the selected key when a menu item is clicked
        setIsSearching(false); // Reset search state


        if (key === '2') { // If "Passwords" option is clicked (with key '2')
            // "All" group selected, fetch all data
            setSelectedGroupId(-1); // Set null or some flag to indicate all groups
            setBreadcrumbItems([
                { title: 'Group' },
                { title: 'All' },
            ]);
            fetchDataForAllGroups(); // Fetch data for all groups
        }

        else if (key.startsWith('group-')) {
            const groupId = key.split('-')[1]; // Extract the groupId

            if (groupId === '0') {
                // "All" group selected, fetch all data
                setSelectedGroupId(-1); // Set null or some flag to indicate all groups
                setBreadcrumbItems([
                    { title: 'Group' },
                    { title: 'All' },
                ]);
                fetchDataForAllGroups();
            }
            else if (groupId === 'X') {
                // "Unlisted" group selected, fetch all data
                setSelectedGroupId(null); // Set -1 or some flag to indicate unlisted groups
                setBreadcrumbItems([
                    { title: 'Group' },
                    { title: 'Unlisted' },
                ]);
                fetchDataForUnlistedGroups();
            }
            else {
                setSelectedGroupId(groupId); // Update the selected group ID
                const clickedGroup = groupItems.find(item => item.key === key);

                if (clickedGroup) {
                    const groupName = clickedGroup.label;

                    setBreadcrumbItems([
                        { title: 'Group' },
                        { title: groupName },
                    ]);
                }

                // Fetch group-specific data
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
            }
        }

        // Define the onMenuSelect function to handle menu selection logic
        else if (key === '1') {
            navigate('/about');
        } else if (key === 'login') {
            navigate('/login');
        } else if (key === 'register') {
            navigate('/register'); // Navigate to the registration page

        } else if (key === 'logout') {
            handleLogout();
        }
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
            },
            {
                label: 'Groups',
                key: 'sub1',
                icon: <UserOutlined />,
                children: groupItems.length > 0 ? groupItems : [{ label: 'Loading...', key: 'loading' }],
            }
        ] : []),
        {
            label: loggedIn ? 'Logout' : 'Register',
            key: loggedIn ? 'logout' : 'register',
            icon: <UserOutlined />,
            onClick: () => loggedIn ? handleLogout() : navigate('/register')  // Navigate to /register when not logged in
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

    const onPasswordAdd = () => {
        fetchData();
    };

    useEffect(() => {
        if (selectedKey === '2') {
            fetchDataForAllGroups(); // Fetch all password items for the default "Passwords" selection
        }
    }, [selectedKey]);


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
                    onClick={onMenuSelect} // Use the defined onMenuSelect function here
                    onOpenChange={setOpenKeys}
                    items={groupMenuItems}
                />
            </Sider>

            <Layout>
                {/* Conditionally render the search bar based on the route */}
                {location.pathname !== '/register' && location.pathname !== '/login' && (
                    <div ref={searchRef}>
                        <Search
                            placeholder="input search text"
                            onSearch={onSearch}
                            style={{
                                margin: '0 auto',
                                padding: '50px 10px',
                                color: '#0a0a0a',
                            }}
                            ref={(input) => {
                                if (input) {
                                    searchInputRef.current = input.input;
                                }
                            }}
                        />
                    </div>
                )}

                <Content style={{ margin: '0 16px' }}>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/about" element={<AboutUs />} />

                        {/* Default route*/}
                        <Route path="/" element={<Navigate to="/about" />} />

                        <Route path="/main" element={
                            <PrivateRoute>
                                <MainPage
                                    passwordItems = {isSearching ? filteredItems : passwordItems} groupId={selectedGroupId} userId={userId} />

                            </PrivateRoute>
                        } />
                    </Routes>
                </Content>
                <Footer style={{ textAlign: 'center' }}>© 2024 LockR</Footer>
            </Layout>
        </Layout>
    );
};

export default App;