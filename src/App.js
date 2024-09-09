import React, { useEffect, useState } from 'react';
import { Breadcrumb, Layout, Menu, theme, Table, Modal } from 'antd';
import {
    DesktopOutlined,
    PieChartOutlined,
    UserOutlined,
} from '@ant-design/icons';
import axios from 'axios';

const { Header, Content, Footer, Sider } = Layout;

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

// Table columns
const columns = [
    {
        title: 'Name',
        dataIndex: 'app_name',
        key: 'app_name',
    },
    {
        title: 'User_name',
        dataIndex: 'username',
        key: 'username',
    },
    {
        title: 'Password',
        dataIndex: 'password',
        key: 'password',
    },
];

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
    // Sidebar state
    const [collapsed, setCollapsed] = useState(false);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    // Handle row click to open modal
    const handleRowClick = (record) => {
        setSelectedRow(record);
        setIsModalOpen(true);
    };

    // Close modal
    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedRow(null);
    };

    // State for fetched data
    const [data, setData] = useState([]);

    //TO DO:
    // const [newData, setNewData] = useState({ name: '' });
    // const [selectedData, setSelectedData] = useState(null);

    useEffect(() => {
        dataFetching();
    }, []);

    // API call to fetch data
    function dataFetching() {
        axios.get('https://jsonplaceholder.typicode.com/posts')
            .then(response => {
                // Map the API response to fit table columns structure
                const mappedData = response.data.map(item => ({
                    app_name: item.title,        // Mapping title as app_name
                    username: `User ${item.userId}`, // Mocked username
                    password: '******',         // Mocked password
                }));
                setData(mappedData);
            })
            .catch(error => {
                console.error(error);
            });
    }

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* Sidebar */}
            <Sider
                collapsible
                collapsed={collapsed}
                onCollapse={(value) => setCollapsed(value)}
                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            >
                {/* Top menu items */}
                <div>
                    <div className="demo-logo-vertical" />
                    <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={items} />
                </div>

                {/* Bottom "User" menu items */}
                <div>
                    <Menu theme="dark" mode="inline" items={userItem} />
                </div>
            </Sider>

            {/* Main Layout */}
            <Layout>
                {/* Header */}
                <Header style={{ padding: 0, background: colorBgContainer }} />

                {/* Content */}
                <Content style={{ margin: '0 16px' }}>
                    {/* Breadcrumb */}
                    <Breadcrumb style={{ margin: '16px 0' }}>
                        <Breadcrumb.Item>Group</Breadcrumb.Item>
                        <Breadcrumb.Item>Group-name</Breadcrumb.Item>
                    </Breadcrumb>

                    {/* Table content */}
                    <div
                        style={{
                            padding: 24,
                            minHeight: 360,
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}
                    >
                        <Table
                            dataSource={data}  // Use the fetched data here
                            columns={columns}
                            rowKey="app_name"
                            onRow={(record) => ({
                                onClick: () => handleRowClick(record),
                            })}
                        />
                    </div>
                </Content>

                {/* Footer */}
                <Footer style={{ textAlign: 'center' }}>LockR</Footer>
            </Layout>

            {/* Modal for displaying row details */}
            <Modal
                title={selectedRow ? selectedRow.app_name : "Details"}
                open={isModalOpen}
                onOk={handleModalClose}
                onCancel={handleModalClose}
                okText="Save"
                cancelText="Close"
            >
                {selectedRow && (
                    <div>
                        <p><strong>Name:</strong> {selectedRow.app_name}</p>
                        <p><strong>User_name:</strong> {selectedRow.username}</p>
                        <p><strong>Password:</strong> {selectedRow.password}</p>
                    </div>
                )}
            </Modal>
        </Layout>
    );
};

export default App;
