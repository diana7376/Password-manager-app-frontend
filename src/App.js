
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
    const {
        token: { colorBgContainer },
    } = theme.useToken();

    //fetch groups from backend
    useEffect(() => {
        axios.get('http://127.0.0.1:8000/api/groups/')
            .then((response) => {
                const fetchedGroups = response.data.map((group) => getItem(group.name, group.id));
                setGroupItems(fetchedGroups);
            })
            .catch((error)=> {
                console.error('error fetching groups:', error)
            });
    }, []);

    // Sidebar menu items
    const items = [
        getItem('About us', '1', <PieChartOutlined />),
        getItem('Passwords', '2', <DesktopOutlined />),
        getItem('Groups', 'sub1', <UserOutlined />, groupItems),
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
                    <MainPage groupId={1}/>


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
