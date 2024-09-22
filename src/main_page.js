import React, { useState, useEffect } from 'react';
import { Table, Modal, Tabs, Input, Typography, Button, message } from 'antd';
import { MoreOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import {
    dataFetching,
    deleteData,
    fetchAllPasswordItems,
    fetchHistory,
    fetchUnlistedPasswordItems,
    updatePasswordItem
} from './crud_operation';
import './styles.css';

const { TabPane } = Tabs;
const { Text } = Typography;

const MainPage = ({ groupId, userId, setGroupItems,passwordItems,setPasswordItems }) => {
    const [data, setData] = useState([]);  // Use 'data' to hold password items
    const [clickedRow, setClickedRow] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [historyData, setHistoryData] = useState([]);
    const [editedItemName, setEditedItemName] = useState('');
    const [editedUserName, setEditedUserName] = useState('');
    const [editedPassword, setEditedPassword] = useState('');
    const [editedGroup, setEditedGroup] = useState('');
    const [editedComment, setEditedComment] = useState(''); // Added for comments

    const [originalItemName, setOriginalItemName] = useState('');
    const [originalUserName, setOriginalUserName] = useState('');
    const [originalPassword, setOriginalPassword] = useState('');
    const [originalGroup, setOriginalGroup] = useState('');
    const [originalComment, setOriginalComment] = useState(''); // Added for original comments

    const [isSaveButtonDisabled, setIsSaveButtonDisabled] = useState(true);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    // Fetch password items based on groupId
    useEffect(() => {
        if (groupId === -1) {
            fetchAllPasswordItems(setData);
        } else if (groupId) {
            dataFetching(groupId, setData);
        } else {
            fetchUnlistedPasswordItems(setData);
        }
    }, [groupId]);

    useEffect(() => {
        const isUnchanged =
            editedItemName === originalItemName &&
            editedUserName === originalUserName &&
            editedPassword === originalPassword &&
            editedGroup === originalGroup &&
            editedComment === originalComment; // Include comments in the check

        setIsSaveButtonDisabled(isUnchanged);
    }, [editedItemName, editedUserName, editedPassword, editedGroup, editedComment, originalItemName, originalUserName, originalPassword, originalGroup]);

    const handleMenuClick = async (record) => {
        setClickedRow(record);
        console.log()
        try {
            const history = await fetchHistory(record.passId);
            setHistoryData(history);
        } catch (error) {
            message.error('Failed to fetch history');
        }

        setEditedItemName(record.itemName);
        setEditedUserName(record.userName);
        setEditedPassword(record.password);
        setEditedGroup(record.groupName);
        setEditedComment(record.comment); // Set the comment from the record


        setOriginalItemName(record.itemName);
        setOriginalUserName(record.userName);
        setOriginalPassword(record.password);
        setOriginalGroup(record.groupName);
        setOriginalComment(record.comment); // Set original comment


        setIsModalOpen(true);
    };

    const handleSaveChanges = () => {
        if (!userId) {
            console.error("userId is not defined");
            return;
        }

        const effectiveGroupId = groupId === -1 ? clickedRow.groupId : groupId;

        const updatedData = {
            passId: clickedRow.passId,  // Keep the original passId
            itemName: editedItemName,
            userName: editedUserName,
            password: editedPassword,
            groupId: effectiveGroupId,
            userId: userId,
            comment: editedComment, // Include the comment in the updated data

        };
        console.log('Updating password with data:', updatedData);
        updatePasswordItem(clickedRow.passId, effectiveGroupId, updatedData, setData)
            .then((response) => {
                console.log('Update successful:', response);
                setPasswordItems(prevData =>
                    prevData.map(item =>
                        item.passId === clickedRow.passId ? { ...updatedData, passId: clickedRow.passId } : item
                    )
                );
                message.success('Item updated successfully');
                setIsModalOpen(false);
            })
            .catch((error) => {
                console.error('Update failed:', error);
                message.error('Failed to update item');
            });
    };




    const handleDelete = () => {
        Modal.confirm({
            title: 'Are you sure you want to delete this?',
            okText: 'Delete',
            onOk() {
                if (clickedRow && clickedRow.passId) {
                    deleteData(clickedRow.passId, clickedRow.groupId, setPasswordItems, () => {
                        // Success callback: Close the modal on successful deletion
                        message.success('Password item deleted successfully');
                        setIsModalOpen(false);  // Close the modal
                    }, setGroupItems)  // Pass setGroupItems to handle group deletion
                        .then(() => {
                            // message.success('Password item and group (if empty) deleted successfully');
                        })
                        .catch(error => {
                            console.error('Error during deletion:', error);
                            message.error('Failed to delete password item or group');
                        });
                } else {
                    message.error('No valid item selected for deletion.');
                }
            },
        });
    };





    const handleModalClose = () => {
        setIsModalOpen(false);
        setClickedRow(null);
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'itemName',
            key: 'itemName',
        },
        {
            title: 'User Name',
            dataIndex: 'userName',
            key: 'userName',
        },
        {
            title: 'Password',
            dataIndex: 'password',
            key: 'password',
            render: (text, record) => {
                const passwordMasked = record.password ? '*'.repeat(record.password.length) : '';  // Check if password is defined

                return (
                    <span>
                        {record.isPasswordVisible ? record.password : passwordMasked}
                        <span
                            style={{ marginLeft: 8, cursor: 'pointer' }}
                            onClick={() => {
                                record.isPasswordVisible = !record.isPasswordVisible;
                                // setData([...data]);
                                setPasswordItems([...passwordItems]);  // Update the table with visibility toggled

                            }}
                        >
                            {record.isPasswordVisible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                        </span>
                    </span>
                );
            },
        },
        {
            title: '',
            key: 'actions',
            render: (_, record) => (
                <MoreOutlined
                    className="action-icon"
                    style={{ cursor: 'pointer', fontSize: '24px' }}
                    onClick={() => handleMenuClick(record)}
                />
            ),
        },
    ];

    return (
        <div>
            <Table
                dataSource={passwordItems}  // Use 'data' instead of 'passwordItems' from context
                columns={columns}
                rowKey={(record) => record.passId}
            />

            <Modal
                title="Password Item Details"
                open={isModalOpen}
                onCancel={handleModalClose}
                footer={null}
            >
                <Tabs defaultActiveKey="1">
                    <TabPane tab="Details" key="1">
                        {clickedRow && (
                            <div>
                                <p><strong>Name:</strong> {clickedRow.itemName}</p>
                                <p><strong>User Name:</strong> {clickedRow.userName}</p>
                                <p>
                                    <strong>Password:</strong>
                                    {isPasswordVisible ? clickedRow.password : '*'.repeat(clickedRow.password.length)}
                                    <Button
                                        type="link"
                                        onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                                    >
                                        {isPasswordVisible ? 'Hide' : 'Show'}
                                    </Button>
                                </p>
                                <p><strong>Group:</strong> {clickedRow.groupName}</p>
                                <p><strong>Comment:</strong> {clickedRow.comment}</p> {/* Display comment */}

                            </div>
                        )}
                    </TabPane>
                    <TabPane tab="History" key="2">
                        {historyData.length > 0 ? (
                            <ul>
                                {historyData.map((entry, index) => (
                                    <li key={index}>
                                        {entry.timestamp}: {entry.oldPassword}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No history available.</p>
                        )}
                    </TabPane>
                    <TabPane tab="Edit" key="3">
                        {clickedRow && (
                            <div>
                                <div style={{ marginBottom: '10px' }}>
                                    <label style={{ fontWeight: 'bold' }}>Item Name</label>
                                    <Input
                                        placeholder="Item Name"
                                        value={editedItemName}
                                        onChange={(e) => setEditedItemName(e.target.value)}
                                    />
                                </div>
                                <div style={{ marginBottom: '10px' }}>
                                    <label style={{ fontWeight: 'bold' }}>User Name</label>
                                    <Input
                                        placeholder="User Name"
                                        value={editedUserName}
                                        onChange={(e) => setEditedUserName(e.target.value)}
                                    />
                                </div>
                                <div style={{ marginBottom: '10px' }}>
                                    <label style={{ fontWeight: 'bold' }}>Password</label>
                                    <Input.Password
                                        placeholder="Password"
                                        value={editedPassword}
                                        onChange={(e) => setEditedPassword(e.target.value)}
                                    />
                                </div>
                                <div style={{ marginBottom: '10px' }}>
                                    <label style={{ fontWeight: 'bold' }}>Group</label>
                                    <Input
                                        placeholder="Group"
                                        value={editedGroup}
                                        onChange={(e) => setEditedGroup(e.target.value)}
                                    />
                                </div>
                                <div style={{ marginBottom: '10px' }}>
                                    <label style={{ fontWeight: 'bold' }}>Comment</label>
                                    <Input
                                        placeholder="Comment"
                                        value={editedComment}
                                        onChange={(e) => setEditedComment(e.target.value)}
                                    />
                                </div>
                                <Button
                                    type="primary"
                                    onClick={handleSaveChanges}
                                    disabled={isSaveButtonDisabled}
                                >
                                    Save Changes
                                </Button>
                            </div>
                        )}
                    </TabPane>
                    <TabPane tab="Delete" key="4">
                        <Button
                            type="primary"
                            danger
                            onClick={handleDelete}
                        >
                            Delete Password Item
                        </Button>
                    </TabPane>
                </Tabs>
            </Modal>
        </div>
    );
};

export default MainPage;
