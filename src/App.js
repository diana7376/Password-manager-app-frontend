
import React, { useEffect, useState } from 'react';
import { Breadcrumb, Layout, Menu, theme, Table, Modal } from 'antd';
import {
    DesktopOutlined,
    PieChartOutlined,
    UserOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import MainPage from './main_page';
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

// Sidebar menu items
const items = [
    getItem('About us', '1', <PieChartOutlined />),
    getItem('Passwords', '2', <DesktopOutlined />),
    getItem('Groups', 'sub1', <UserOutlined />, [
        getItem('Banking', '3'),
        getItem('Social media', '4'),
        getItem('Home', '5'),
    ]),
];

// User menu items for the bottom of the sidebar
const userItem = [getItem('User', '6', <DesktopOutlined />)];



// function addData() {
//     axios.post('https://jsonplaceholder.typicode.com/posts', newData)
//         .then(response => {
//             setData([...data, response.data]);
//             setNewData({name:''});
//         })
//         .catch(error =>{
//             console.log(error);
//         })
// }
//
// function updateData() {
//     axios.put(`https://jsonplaceholder.typicode.com/posts${selectedData.id}`, selectedData)
//         .then(response => {
//             const newData = data.map(item => {
//                 if (item.id === selectedData.id){
//                     return response.data;
//                 }
//                 return item;
//             });
//             setData(newData);
//             setSelectedData(null);
//         })
//         .catch(error =>{
//             console.log(error);
//         })
//
// }
//
// function deleteData(id) {
//     axios.delete(`https://jsonplaceholder.typicode.com/posts${id}`)
//         .then(() => {
//             const newData = data.filter(item => item.id !== id);
//             setData(newData);
//         })
//         .catch(error => {
//             console.log(error);
//         })
// }

const App = () => {
    const [collapsed, setCollapsed] = useState(false);
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();


    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                collapsible
                collapsed={collapsed}
                onCollapse={(value) => setCollapsed(value)}
                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            >
                <div>
                    <div className="demo-logo-vertical" />
                    <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={items} />
                </div>

                <div>
                    <Menu theme="dark" mode="inline" items={userItem} />
                </div>
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
                    <MainPage />

                </Content>

                <Footer style={{ textAlign: 'center' }}>LockR</Footer>
            </Layout>
        </Layout>
    );
};

export default App;