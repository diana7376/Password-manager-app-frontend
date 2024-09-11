
import React, { useEffect, useState } from 'react';
import { Breadcrumb, Layout, Menu, theme } from 'antd';
import {
    DesktopOutlined,
    PieChartOutlined,
    UserOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import MainPage from './main_page';
import SaveNewPassword from './save_new_password';

const { Header, Content, Footer, Sider } = Layout;



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
    const [groupItems, setGroupItems] = useState([]);
    const [selectedGroupId, setSelectedGroupId] = useState(1);
    const {
        token: { colorBgContainer },
    } = theme.useToken();

    // Fetch all groups from the backend
    useEffect(() => {
        axios.get('http://127.0.0.1:8000/groups/')
            .then((response) => {
                console.log(response.data);
                const fetchedGroups = response.data.map((group) => getItem(group.groupName, group.groupId));
                setGroupItems(fetchedGroups);
            })
            .catch((error) => {
                console.error('Error fetching groups:', error);
            });
    }, []);

    // Fetch data for the selected group when selectedGroupId changes
    useEffect(() => {
        console.log(`Requesting: http://127.0.0.1:8000/groups/${selectedGroupId}/`);
        if (selectedGroupId) {
            axios.get(`http://127.0.0.1:8000/groups/${selectedGroupId}/`)
                .then((response) => {
                    console.log('Selected group data:', response.data);
                })
                .catch((error) => {
                    console.error('Error fetching selected group:', error);
                });
        }
    }, [selectedGroupId]);



    const handleGroupClick = (groupId) => {
        setSelectedGroupId(groupId);
    };
    // Sidebar menu items
    const items = [
        getItem('About us', '1', <PieChartOutlined />),
        getItem('Passwords', '2', <DesktopOutlined />),
        getItem('Groups', 'sub1', <UserOutlined />, groupItems.map((group) => (
            <Menu.Item key={group.key} onClick={() => handleGroupClick(group.key)}>
            {group.label}
        </Menu.Item>
        ))),

    ];

// User menu items for the bottom of the sidebar
    const userItem = [getItem('User', '3', <DesktopOutlined />)];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
                <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={items} />
                <Menu theme="dark" mode="inline" items={userItem} />
            </Sider>

            <Layout>
                <Header style={{ padding: 0, background: colorBgContainer }} />
                <Content style={{ margin: '0 16px' }}>
                  <Breadcrumb
                        style={{ margin: '16px 0' }}
                        items={[
                            { title: 'Group' },
                            { title: 'Group-name' },
                        ]}
                    />
                    {/* MainPage component rendered here */}
                    <MainPage groupId={selectedGroupId}/>


                    {/* Plus Button at the bottom-right corner under the table */}
                    <div style={{
                        position: 'fixed',
                        bottom: 24,
                        right: 24,
                        zIndex: 1000, // Ensure it's above other elements
                    }}>
                        <SaveNewPassword /> {/* Render your button component here */}
                    </div>
                </Content>
                <Footer style={{ textAlign: 'center' }}>LockR</Footer>
            </Layout>
        </Layout>
    );
};

export default App;
