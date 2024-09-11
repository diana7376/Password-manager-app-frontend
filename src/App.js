
import React, { useEffect, useState } from 'react';
import {Breadcrumb, Layout, Menu, theme, Input, Space} from 'antd';
import {
    DesktopOutlined,
    PieChartOutlined,
    UserOutlined,
    AudioOutlined,
} from '@ant-design/icons';

import axios from 'axios';
import MainPage from './main_page';
import SaveNewPassword from './save_new_password';
import {dataFetching} from "./crud_operation";

const { Header, Content, Footer, Sider } = Layout;

const { Search } = Input;
const suffix = (
    <AudioOutlined
        style={{
            fontSize: 16,
            color: '#1677ff',
        }}
    />
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
    const [groupItems, setGroupItems] = useState([]);
    const [selectedGroupId, setSelectedGroupId] = useState(1);

    const {
        token: { colorBgContainer },
    } = theme.useToken();

    const fetchData = () => {
        dataFetching(groupId, setPasswordItems);
    };
    //fetch groups from backend
    useEffect(() => {
        axios.get('http://127.0.0.1:8000/groups/')
            .then((response) => {
                console.log(response.data);
                const fetchedGroups = response.data.map((group) => getItem(group.groupName, group.groupId));
                setGroupItems(fetchedGroups);
            })
            .catch((error)=> {
                console.error('error fetching groups:', error)
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

    useEffect(() => {
        fetchData();
    }, []);

    const onPasswordAdd = () => {
        fetchData();
    };
    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
                <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={items} />
                <Menu theme="dark" mode="inline" items={userItem} />
            </Sider>

            <Layout>
                <Search
                    placeholder="input search text"
                    onSearch={onSearch}
                    style={{
                        padding: 30,
                        width: 1050,
                    }}
                />
                <Header style={{ padding: 0, background: colorBgContainer }} /> {/**/}

                <Content style={{ margin: '0 16px' }}>

                    {/* MainPage component rendered here */}
                  <Breadcrumb
                        style={{ margin: '16px 0' }}
                        items={[
                            { title: 'Group' },
                            { title: 'Group-name' },
                        ]}
                    />
                    {/* MainPage component rendered here */}
                    <MainPage groupId={selectedGroupId} passwordItems={passwordItems}/>


                    {/* Plus Button at the bottom-right corner under the table */}
                    <div style={{
                        position: 'fixed',
                        //top: 10
                        bottom: 24,
                        right: 24,
                        zIndex: 1000, // Ensure it's above other elements
                    }}>
                        <SaveNewPassword groupId={groupId} onPasswordAdd={onPasswordAdd} /> {/* Render your button component here */}
                    </div>
                </Content>
                <Footer style={{ textAlign: 'center' }}>LockR</Footer>
            </Layout>
        </Layout>
    );
};

export default App;
