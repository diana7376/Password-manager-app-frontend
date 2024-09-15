import React, { useState, useEffect } from 'react';

import { Table, Modal, Dropdown, Menu, message, Input, Typography, Space } from 'antd';
import { MoreOutlined, DownOutlined, SmileOutlined } from '@ant-design/icons';  // Import ellipsis icon
import {
    dataFetching,
    deleteData,
    fetchAllPasswordItems,
    fetchHistory,
    fetchUnlistedPasswordItems,
    updatePasswordItem
} from './crud_operation';
import './styles.css';

const { Text } = Typography;
const { confirm } = Modal;

const MainPage = ({ groupId, userId ,passwordItems }) => {
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

    // Original values for comparison
    const [originalItemName, setOriginalItemName] = useState('');
    const [originalUserName, setOriginalUserName] = useState('');
    const [originalPassword, setOriginalPassword] = useState('');
    const [originalGroup, setOriginalGroup] = useState('');

    // State for disabling/enabling the save button
    const [isSaveButtonDisabled, setIsSaveButtonDisabled] = useState(true);

    const isSaveDisabled = () => {
        return (
            editedItemName === originalItemName &&
            editedUserName === originalUserName &&
            editedPassword === originalPassword &&
            String(editedGroup) === String(originalGroup)  // Convert both to strings for comparison
        );
    };




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
            setEditedGroup(String(clickedRow.groupId));  // Ensure it's set correctly as a string


            // Set original values for comparison
            setOriginalItemName(clickedRow.itemName);
            setOriginalUserName(clickedRow.userName);
            setOriginalPassword(clickedRow.password);
            setOriginalGroup(String(clickedRow.groupId));  // Ensure original value is a string

            // Reset the Save button state
            setIsSaveButtonDisabled(isSaveDisabled());

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

    // Update the Save button's disabled state whenever edited values change
    useEffect(() => {
        setIsSaveButtonDisabled(isSaveDisabled());
    }, [editedItemName, editedUserName, editedPassword, editedGroup]);


    const handleSaveChanges = () => {
        if (!userId) {
            console.error("userId is not defined");
            return;
        }

        // Use clickedRow.groupId if groupId is -1 (i.e., "All" group)
        const effectiveGroupId = groupId === -1 ? clickedRow.groupId : groupId;


        const updatedData = {
            id: clickedRow.id,
            itemName: editedItemName,
            userName: editedUserName,
            password: editedPassword,
            groupId: effectiveGroupId,
            userId: userId,
        };

        // Send PUT request to update the data
        updatePasswordItem(clickedRow.id, effectiveGroupId, updatedData)
            .then(() => {
                message.success('Password item updated successfully');
                setIsModalOpen(false);  // Close the modal
                // Update table with new data
                setData(prevData => prevData.map(item => (item.id === clickedRow.id ? updatedData : item)));

                // Update original values to match the saved data
                setOriginalItemName(editedItemName);
                setOriginalUserName(editedUserName);
                setOriginalPassword(editedPassword);
                setOriginalGroup(editedGroup);  // Update originalGroup to the saved group
            })
            .catch((error) => {
                message.error('Failed to update password item');
                console.error(error);
            });
    };


    const showConfirmSave = () => {
        confirm({
            title: 'Are you sure you want to save these changes?',
            content: 'This will overwrite the existing password information.',
            okText: 'Yes',
            cancelText: 'No',
            onOk() {
                handleSaveChanges(); // Call function to save changes
            },
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

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectRow(null);
    };


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
                    onOpenChange={(visible) => visible && setClickedRow(record)} // Set clicked row
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




    return (
        <div>
            {/* Table to display password items */}
            <Table
                dataSource={passwordItems} // Use the data fetched for the group
                columns={columns}
                rowKey={(record) => record.id}
                onRow={(record) => ({
                    onClick: () => setSelectRow(record),
                })}
            />

            {/* Modal for showing/editing details */}
            <Modal
                title={clickedRow ? clickedRow.itemName : "Details"}
                open={isModalOpen}
                onOk={showConfirmSave}
                onCancel={handleModalClose}
                okText="Save"
                cancelText="Close"
                okButtonProps={{ disabled: isSaveButtonDisabled}}  // Disable Save button if no changes

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
