import React, { useState, useEffect } from 'react';

import { Table, Modal, Dropdown, Menu, message, Input } from 'antd';
import { MoreOutlined } from '@ant-design/icons';  // Import ellipsis icon
import { dataFetching, deleteData } from './crud_operation';
import './styles.css';


const MainPage = ({ groupId }) => {
    const [data, setData] = useState([]);
    const [selectRow, setSelectRow] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [clickedRow, setClickedRow] = useState(null);

    // Form fields to store edited values
    const [editedItemName, setEditedItemName] = useState('');
    const [editedUserName, setEditedUserName] = useState('');
    const [editedPassword, setEditedPassword] = useState('');    // Fetch data whenever groupId changes
    const [editedGroup, setEditedGroup] = useState('');

    useEffect(() => {
        if (groupId) {
            dataFetching(groupId, setData);
        }
    }, [groupId]);

    // Handle menu click (edit/delete actions)
    const handleMenuClick = ({ key }) => {
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
            deleteData(clickedRow.id, groupId)
                .then(() => {
                    message.success('Password item deleted successfully');
                    setData(prevData => prevData.filter(item => item.id !== clickedRow.id));
                })
                .catch(error => {
                    message.error('Failed to delete password item');
                    console.error(error);
                });
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

    // Define the dropdown menu (for edit/delete)
    const menu = (
        <Menu onClick={handleMenuClick}>
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
        if (groupId) {
            dataFetching(groupId, setData);
        }
    }, [groupId]);

    // Filter data based on the selected groupId
    const filteredData = data.filter(item => item.groupId === Number(groupId));

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
                dataSource={filteredData} // Use the filtered data
                columns={columns}

                 rowKey={(record) => record.id}
                rowKey={(record) => record.itemName}

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
        </div>
    );
};

export default MainPage;
