import React, { useState, useEffect } from 'react';

import { Table, Modal, Dropdown, Menu, message, Input, Typography, Space } from 'antd';
import { MoreOutlined, DownOutlined, SmileOutlined } from '@ant-design/icons';  // Import ellipsis icon
import {
    dataFetching,
    deleteData,
    fetchAllPasswordItems,
    fetchHistory,
    fetchUnlistedPasswordItems
} from './crud_operation';
import './styles.css';

const { Text } = Typography;

const MainPage = ({ groupId }) => {
    const [data, setData] = useState([]);
    const [selectRow, setSelectRow] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [clickedRow, setClickedRow] = useState(null);
    const [historyData, setHistoryData] = useState([]);

    // Form fields to store edited values
    const [editedItemName, setEditedItemName] = useState('');
    const [editedUserName, setEditedUserName] = useState('');
    const [editedPassword, setEditedPassword] = useState('');    // Fetch data whenever groupId changes
    const [editedGroup, setEditedGroup] = useState('');
    const [readModalOpen, setReadModalOpen] = useState(false);
    const [readModalContent, setReadModalContent] = useState(null);


    //history drop down
    const items = [
        {
            key: '1',
            label: (
                <a target="_blank" rel="noopener noreferrer">
                    1st menu item
                </a>
            ),
        },
        {
            key: '2',
            label: (
                <a target="_blank" rel="noopener noreferrer">
                    2nd menu item
                </a>
            ),

        },
    ];


    // Handle menu click (edit/delete actions)
    const handleMenuClick = async ({key}) => {
        if (!clickedRow || !clickedRow.id) {
            console.error('No row selected or row has no id');
            message.error('Failed to delete the password: no ID');
            return;
        }

        console.log('clickedRow:', clickedRow);  // Debugging log for clickedRow
        console.log('groupId:', groupId);  // Debugging log for groupId

        if (key === 'edit') {
            setEditedItemName(clickedRow.itemName);
            setEditedUserName(clickedRow.userName);
            setEditedPassword(clickedRow.password);
            setEditedGroup(clickedRow.group);
            setIsModalOpen(true);
        } else if (key === 'delete') {
            // Use the item's groupId if we are in the "All" group view
            const effectiveGroupId = groupId === -1 ? clickedRow.groupId : groupId;

            deleteData(clickedRow.id, effectiveGroupId)
                .then(() => {
                    message.success('Password item deleted successfully');
                    setData(prevData => prevData.filter(item => item.id !== clickedRow.id));
                })
                .catch(error => {
                    message.error('Failed to delete password item');
                    console.error(error);
                });
        } else if (key === 'read') {
            try {
                const history = await fetchHistory(clickedRow.id);
                setHistoryData(history);
                setReadModalOpen(true);
                setReadModalContent(clickedRow);
            } catch (error) {
                message.error('Failed to fetch history');
            }
        }
    };
    const handleSaveChanges = () => {
        const updatedData = {
            id: clickedRow.id,
            itemName: editedItemName,
            userName: editedUserName,
            password: editedPassword,
            group: editedGroup,
        };

        updatePasswordItem(clickedRow.id, groupId, updatedData)
            .then(() => {
                message.success('Password item updated successfully');
                setIsModalOpen(false);  // Close the modal
                setData(prevData => prevData.map(item => (item.id === clickedRow.id ? updatedData : item)));
            })
            .catch((error) => {
                message.error('Failed to update password item');
                console.error(error);
            });
    };
    const historyMenuItems = historyData.map((entry, index) => ({
        key: `${index}`,
        label: (
            <a target="_blank" rel="noopener noreferrer">
                {entry.timestamp}: {entry.oldPassword} {/* Adjust based on your history data structure */}
            </a>
        ),
    }));

    // Define the dropdown menu (for edit/delete)
    const menu = (
        <Menu onClick={handleMenuClick}>
            <Menu.Item key="read">Read</Menu.Item>
            <Menu.Item key="edit">Edit</Menu.Item>
            <Menu.Item key="delete">Delete</Menu.Item>
        </Menu>
    );

    const columns = [
        {
            title: 'Name',
            dataIndex: 'itemName',
            key: 'itemName',
        },
        {
            title: 'User_name',
            dataIndex: 'userName',
            key: 'userName',
        },
        {
            title: 'Password',
            dataIndex: 'password',
            key: 'password',
        },
        {
            title: '',
            key: 'actions',
            render: (_, record) => (
                <Dropdown
                    overlay={menu}
                    trigger={['click']}
                    onVisibleChange={(visible) => visible && setClickedRow(record)} // Set clicked row
                >
                    <MoreOutlined className="action-icon" style={{ cursor: 'pointer', fontSize: '24px' }} />
                </Dropdown>
            ),
        },
    ];


    useEffect(() => {
        if (groupId === -1) {
            // Fetch the password items for the selected group directly from the backend
            fetchAllPasswordItems(setData);
        }
        else if (groupId) {
            // Fetch the password items for the selected group directly from the backend
            dataFetching(groupId, setData);
        } else {
            // Fetch all password items when "All" group is selected
            fetchUnlistedPasswordItems(setData);
        }
    }, [groupId]);


    // Filter data based on the selected groupId

    //const filteredData = groupId ? data.filter(item => item.groupId === Number(groupId)) : data;

    const handleRowClick = (record) => {
        setSelectRow(record);
        setIsModalOpen(true);
    };


    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectRow(null);
    };

    return (
        <div>
            {/* Table to display password items */}
            <Table
                dataSource={data} // Use the data fetched for the group
                columns={columns}
                rowKey={(record) => record.id}
                onRow={(record) => ({
                    onClick: () => setSelectRow(record),
                })}
            />

            {/* Modal for showing/editing details */}
            <Modal
                title={selectRow ? selectRow.itemName : "Details"}
                open={isModalOpen}
                onOk={handleModalClose}
                onCancel={handleModalClose}
                okText="Save"
                cancelText="Close"
            >
                <Input
                    placeholder="Item Name"
                    value={editedItemName}
                    onChange={(e) => setEditedItemName(e.target.value)}
                    style={{ marginBottom: '10px' }}
                />
                <Input
                    placeholder="User Name"
                    value={editedUserName}
                    onChange={(e) => setEditedUserName(e.target.value)}
                    style={{ marginBottom: '10px' }}
                />
                <Input.Password
                    placeholder="Password"
                    value={editedPassword}
                    onChange={(e) => setEditedPassword(e.target.value)}
                    style={{ marginBottom: '10px' }}
                />
                <Input.Group
                    placeholder="Group"
                    value={editedGroup}
                    onChange={(e) => setEditedGroup(e.target.value)}
                    style={{ marginBottom: '10px' }}
                />
            </Modal>
            <Modal
                title="Read Password Details"
                open={readModalOpen}
                onOk={() => setReadModalOpen(false)}
                onCancel={() => setReadModalOpen(false)}
                okText="Close"
                cancelText="Close"
            >
                {readModalContent && (
                    <div>
                        <p><strong>Name:</strong> {readModalContent.itemName}</p>
                        <p><strong>User Name:</strong> {readModalContent.userName}</p>
                        <p><strong>Password:</strong> {readModalContent.password}</p>
                        <p><strong>Group:</strong> {readModalContent.group}</p>
                        <Dropdown
                            menu={{
                                items: historyMenuItems, // Use historyMenuItems here
                            }}
                        >
                            <a onClick={(e) => e.preventDefault()}>
                                <Space>
                                    History
                                    <DownOutlined />
                                </Space>
                            </a>
                        </Dropdown>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default MainPage;
