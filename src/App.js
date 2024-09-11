
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
import { useParams } from 'react-router-dom';
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

// Sidebar menu items
const items = [
    getItem('About us', '1', <PieChartOutlined />),
    getItem('Passwords', '2', <DesktopOutlined />),
    getItem('Groups', 'sub1', <UserOutlined />, [
        getItem('Banking', '3'),
        getItem('Social media', '4'),
        getItem('Gaming', '5'),
        getItem('Unlisted', '6'),
    ]),
];

// User menu items for the bottom of the sidebar
const userItem = [getItem('User', '7', <DesktopOutlined />)];

const App = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [passwordItems, setPasswordItems] = useState([]);
    const groupId = 1;
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const fetchData = () => {
        dataFetching(groupId, setPasswordItems);
    };

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
                    <MainPage groupId={groupId} passwordItems={passwordItems}/>


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
