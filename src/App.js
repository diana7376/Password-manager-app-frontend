import React, { useEffect, useState } from 'react';
import { Breadcrumb, Layout, Menu, theme, Input, Space } from 'antd';
import { DesktopOutlined, PieChartOutlined, UserOutlined, AudioOutlined } from '@ant-design/icons';
import axios from 'axios';
import MainPage from './main_page';
import SaveNewPassword from './save_new_password';
import { dataFetching } from './crud_operation';
import { config } from './crud_operation';
import './styles.css';

const { Header, Content, Footer, Sider } = Layout;
const { Search } = Input;

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
    const [selectedGroupId, setSelectedGroupId] = useState(1);
    const [userId, setUserId] = useState(1);
    const [comment, setCommentId] = useState(null);
    const [url, setUrlId] = useState(null);
    const [selectedKey, setSelectedKey] = useState('1'); // State to track selected menu item
    const [openKeys, setOpenKeys] = useState([]); // Track open submenu keys


    const {
        token: { colorBgContainer },
    } = theme.useToken();

    const fetchData = () => {
        if (selectedGroupId) {
            dataFetching(selectedGroupId, setPasswordItems);
        } else {
            console.error('No group selected');
        }
    };

    // Fetch all groups
    useEffect(() => {
        axios
            .get('http://127.0.0.1:8000/api/groups/', config)
            .then((response) => {
                if (Array.isArray(response.data)) {
                    const fetchedGroups = response.data.map((group) =>
                        getItem(group.groupName, `group-${group.groupId}`)
                    );
                    setGroupItems(fetchedGroups); // Set fetched groups
                } else {
                    console.error('API response is not an array', response.data);
                    setGroupItems([]); // Fallback to an empty array
                }
            })
            .catch((error) => {
                console.error('Error fetching groups:', error);
                setGroupItems([]); // Fallback to an empty array
            });
    }, []); // Empty dependency array ensures it only runs once

    const handleMenuClick = (key) => {
        setSelectedKey(key); // Set the selected key when a menu item is clicked

        if (key.startsWith('group-')) {
            const groupId = key.split('-')[1]; // Extract the groupId
            setSelectedGroupId(groupId); // Update the selected group ID

            // Find the group in the groupItems array by matching the key
            const clickedGroup = groupItems.find(item => item.key === key);

            if (clickedGroup) {
                const groupName = clickedGroup.label; // Use the group name directly from the menu item

                // Update the breadcrumb immediately with the clicked group's name
                setBreadcrumbItems([
                    { title: 'Group' },
                    { title: groupName },
                ]);
            }

            // You can still keep the API call for background data fetching if needed
            axios.get(`http://127.0.0.1:8000/api/groups/${groupId}/`, config)
                .then(response => {
                    const groupName = response.data.groupName;
                    // Optionally update the breadcrumb again if the API call returns different data
                    setBreadcrumbItems([
                        { title: 'Group' },
                        { title: groupName },
                    ]);
                })
                .catch(error => {
                    console.error('Error fetching group details:', error);
                });

            console.log('Selected Group ID:', groupId); // Debugging log
        }
    };

    const onOpenChange = (keys) => {
        setOpenKeys(keys); // Control open submenus
    };

    // Sidebar menu items
    const groupMenuItems = [
        {
            label: 'About us',
            key: '1',
            icon: <PieChartOutlined />
        },
        {
            label: 'Passwords',
            key: '2',
            icon: <DesktopOutlined />
        },
        {
            label: 'Groups',
            key: 'sub1',
            icon: <UserOutlined />,
            children: groupItems.length > 0 ? groupItems : [{ label: 'Loading...', key: 'loading' }],
        },
    ];

    // User menu items for the bottom of the sidebar
    const userItem = [getItem('User', '3', <DesktopOutlined />)];

    const onPasswordAdd = () => {
        fetchData();
    };

    const [breadcrumbItems, setBreadcrumbItems] = useState([
        { title: 'Group' },
        { title: 'Group-name' },
    ]);
    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[selectedKey]} // Highlight the selected menu item
                    openKeys={openKeys} // Control which menus are open
                    onClick={({ key }) => handleMenuClick(key)} // Handle menu click
                    onOpenChange={onOpenChange} // Handle submenu open/close
                    items={groupMenuItems} // Use structured items
                />
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[selectedKey]} // Ensure only one selected item at a time
                    onClick={({ key }) => handleMenuClick(key)} // Handle user menu click
                    items={userItem}
                />
            </Sider>

            <Layout>
                <Search
                    placeholder="input search text"
                    onSearch={onSearch}
                    style={{
                        margin: '0 auto',
                        padding: '50px 0',
                        width: 1050,
                        color: '#0a0a0a',
                    }}
                />
                {/* <Header style={{ padding: 0, background: colorBgContainer }} />*/}

                <Content style={{ margin: '0 16px' }}>
                    <Breadcrumb
                        style={{ margin: '16px 0' }}
                        items={breadcrumbItems}
                    />
                    <MainPage groupId={selectedGroupId} userId={userId} />

                    {/* Plus Button at the bottom-right corner under the table */}
                    <div
                        style={{
                            position: 'fixed',
                            bottom: 24,
                            right: 24,
                            zIndex: 1000, // Ensure it's above other elements
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
        </Layout>
    );
};

export default App;
