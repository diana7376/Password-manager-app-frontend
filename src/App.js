import React, { useEffect, useState, useRef } from 'react';
import { Breadcrumb, Layout, Menu, theme, Input, Button, Modal, Space } from 'antd';
import { DesktopOutlined, PieChartOutlined, UserOutlined, AudioOutlined } from '@ant-design/icons';
import axios from './axiosConfg';
import fuzzysort from 'fuzzysort';
import MainPage from './main_page';
import SaveNewPassword from './save_new_password';
import { dataFetching, config, fetchAllPasswordItems, fetchUnlistedPasswordItems } from './crud_operation';
import './styles.css';
import { Route, Routes, useNavigate } from 'react-router-dom';
import Login from './auth'; // Import Login component
import Register from './register'; // Import Register component
import PrivateRoute from './PrivateRoute'; // Ensure this is the correct path


const { Search } = Input;


const { Header, Content, Footer, Sider } = Layout;


const suffix = (
    <AudioOutlined style={{ fontSize: 16, color: '#1677ff' }} />
);

const onSearch = (value, _e, info) => console.log(info?.source, value);

// Function to get menu items for the sidebar
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
    const [groupItems, setGroupItems] = useState([]); // Initialize as an array
    const [selectedGroupId, setSelectedGroupId] = useState(-1);
    const [userId, setUserId] = useState(1);
    const [comment, setCommentId] = useState(null);
    const [url, setUrlId] = useState(null);
    const [selectedKey, setSelectedKey] = useState('group-0'); // State to track selected menu item
    const [openKeys, setOpenKeys] = useState([]); // Track open submenu keys
    const [filteredItems, setFilteredItems] = useState([]); // For storing search results
    const [isSearching, setIsSearching] = useState(false); // Flag to track whether search is active
    const searchRef = useRef(null);
    const searchInputRef = useRef(null); // Create ref for the actual input element

    const [loggedIn, setLoggedIn] = useState(false); // State to track if user is logged in
    const [showAuthModal, setShowAuthModal] = useState(false); // State to control the authentication modal

    const navigate = useNavigate();

    // Focus on the input when the component mounts
    useEffect(() => {
        if (searchInputRef.current) {
            searchInputRef.current.focus(); // Focus on the input element
        }
    }, []);

    const {
        token: { colorBgContainer },
    } = theme.useToken();

    // Check if the user is logged in
    useEffect(() => {
        const token = localStorage.getItem('token');
        setLoggedIn(!!token);
    }, []);

    const fetchData = () => {
        if (selectedGroupId === -1) {
            // Fetch data for all groups
            fetchAllPasswordItems(setPasswordItems);
        }
        else if (selectedGroupId) {
            // Fetch data for a specific group
            dataFetching(selectedGroupId, setPasswordItems);
        }
        else {
            // Fetch unlisted data
            fetchUnlistedPasswordItems(setPasswordItems);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedGroupId]);

    // Fetch all groups
    useEffect(() => {
        axios
            .get('http://127.0.0.1:8000/api/groups/', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
            .then((response) => {
                if (Array.isArray(response.data)) {

                    // Create the default "All" and "Unlisted" groups
                    const allGroup = getItem('All', 'group-0');
                    const unlistedGroup = getItem('Unlisted', 'group-X');

                    // Map fetched groups and prepend "All" and "Unlisted" groups
                    const fetchedGroups = [
                        allGroup, // Insert "All" group first
                        unlistedGroup,
                        ...response.data.map((group) => getItem(group.groupName, `group-${group.groupId}`))
                    ];

                    setGroupItems(fetchedGroups); // Set the complete group list

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

    // Set up click event listener to detect clicks outside search bar
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSearching(false); // Clear search state
                setFilteredItems([]); // Clear search results
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const onSearch = (value) => {
        setIsSearching(true);

        if (value.trim() === '') {
            setIsSearching(false);
            setFilteredItems([]); // Clear search results if the query is empty
            return;
        }

        // Perform separate searches for each field
        const resultsItemName = fuzzysort.go(value, passwordItems, { key: 'itemName', threshold: -10000 });
        const resultsUserName = fuzzysort.go(value, passwordItems, { key: 'userName', threshold: -10000 });
        const resultsComment = fuzzysort.go(value, passwordItems, { key: 'comment', threshold: -10000 });
        const resultsUrl = fuzzysort.go(value, passwordItems, { key: 'url', threshold: -10000 });

        // Combine the results, ensuring itemName results are prioritized
        const combinedResults = [
            ...resultsItemName,            // Prioritize itemName results
            ...resultsUserName,            // Followed by userName results
            ...resultsComment,             // Then comment results
            ...resultsUrl                  // Finally URL results
        ];

        // Create a Map to deduplicate entries (since items might appear in multiple fields)
        const uniqueResults = new Map();
        combinedResults.forEach(result => {
            if (!uniqueResults.has(result.obj.id)) {
                uniqueResults.set(result.obj.id, result);
            }
        });

        // Convert the Map back to an array of unique items
        const filtered = Array.from(uniqueResults.values()).map(result => ({
            ...result.obj,
            similarityScore: result.score // Optionally include similarity score
        }));

        setFilteredItems(filtered); // Update the filteredItems with the search results
    };

    const handleMenuClick = (key) => {
        setSelectedKey(key); // Set the selected key when a menu item is clicked
        setIsSearching(false); // Reset search state

        if (key === '2') {
            // If "Passwords" is clicked, fetch all passwords (same as "All" group)
            setSelectedGroupId(-1); // Treat it like the "All" group
            setBreadcrumbItems([
                { title: 'Passwords' },
                { title: 'All' },
            ]);
            fetchDataForAllGroups(); // Fetch all password data
        } else if (key.startsWith('group-')) {
            const groupId = key.split('-')[1]; // Extract the groupId

            if (groupId === '0') {
                // "All" group selected, fetch all data
                setSelectedGroupId(-1); // Set null or some flag to indicate all groups
                setBreadcrumbItems([
                    { title: 'Group' },
                    { title: 'All' },
                ]);
                fetchDataForAllGroups();
            } else if (groupId === 'X') {
                // "Unlisted" group selected, fetch all data
                setSelectedGroupId(null); // Set null or some flag to indicate unlisted groups
                setBreadcrumbItems([
                    { title: 'Group' },
                    { title: 'Unlisted' },
                ]);
                fetchDataForUnlistedGroups();
            } else {
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
    };
    const fetchDataForAllGroups = () => {
        axios
            .get('http://127.0.0.1:8000/api/password-items/', config) // Adjust API endpoint if necessary
            .then((response) => {
                setPasswordItems(response.data); // Assuming response contains all password items
            })
            .catch((error) => {
                console.error('Error fetching all password items:', error);
            });
    };

    const fetchDataForUnlistedGroups = () => {
        axios
            .get('http://127.0.0.1:8000/api/password-items/unlisted/', config) // Adjust API endpoint if necessary
            .then((response) => {
                setPasswordItems(response.data); // Assuming response contains unlisted password items
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
                <div ref={searchRef}>
                    <Search
                        placeholder="input search text"
                        onSearch={onSearch}
                        style={{
                            margin: '0 auto',
                            padding: '50px 10px',
                            // width: 1050,
                            color: '#0a0a0a',
                        }}
                        ref={(input) => {
                            // Attach the ref to the input DOM element inside the Search component
                            if (input) {
                                searchInputRef.current = input.input;
                            }
                        }}
                    />
                </div>
                {/* <Header style={{ padding: 0, background: colorBgContainer }} />*/}

                <Content style={{ margin: '0 16px' }}>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route
                            path="/"
                            element={
                                <PrivateRoute>
                                    <Breadcrumb style={{ margin: '16px 0' }} items={breadcrumbItems} />
                                    <MainPage
                                        passwordItems={isSearching ? filteredItems : passwordItems}
                                        groupId={selectedGroupId}
                                        userId={userId}
                                    />
                                </PrivateRoute>
                            }
                            exact
                        />
                    </Routes>

                    {/* Plus Button at the bottom-right corner under the table */}
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
