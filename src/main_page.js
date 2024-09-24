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

const MainPage = ({ groupId, userId, setGroupItems, passwordItems, setPasswordItems }) => {
    const [data, setData] = useState([]);
    const [clickedRow, setClickedRow] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [historyData, setHistoryData] = useState([]);
    const [editedItemName, setEditedItemName] = useState('');
    const [editedUserName, setEditedUserName] = useState('');
    const [editedPassword, setEditedPassword] = useState('');
    const [editedGroup, setEditedGroup] = useState('');
    const [editedComment, setEditedComment] = useState('');
    const [editedUrl, setEditedUrl] = useState(''); // Added for URL field

    const [originalItemName, setOriginalItemName] = useState('');
    const [originalUserName, setOriginalUserName] = useState('');
    const [originalPassword, setOriginalPassword] = useState('');
    const [originalGroup, setOriginalGroup] = useState('');
    const [originalComment, setOriginalComment] = useState('');
    const [originalUrl, setOriginalUrl] = useState(''); // Added for original URL

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
            editedComment === originalComment &&
            editedUrl === originalUrl; // Include URL in the check

        setIsSaveButtonDisabled(isUnchanged);
    }, [editedItemName, editedUserName, editedPassword, editedGroup, editedComment, editedUrl, originalItemName, originalUserName, originalPassword, originalGroup, originalComment, originalUrl]);

    const handleMenuClick = async (record) => {
        setClickedRow(record);
        try {
            const history = await fetchHistory(record.passId);
            // Ensure that if no history exists, historyData is set to an empty array
            if (history && history.length > 0) {
                setHistoryData(history);
            } else {
                setHistoryData([]); // Set to an empty array if no history is found
            }
        } catch (error) {
            //message.error('Failed to fetch history');
            setHistoryData([]); // Ensure we set an empty array in case of an error
        }

        // Set current values in the form
        setEditedItemName(record.itemName);
        setEditedUserName(record.userName);
        setEditedPassword(record.password);
        setEditedGroup(record.groupName);
        setEditedComment(record.comment);
        setEditedUrl(record.url); // Set URL from the record

        // Set original values for comparison
        setOriginalItemName(record.itemName);
        setOriginalUserName(record.userName);
        setOriginalPassword(record.password);
        setOriginalGroup(record.groupName);
        setOriginalComment(record.comment);
        setOriginalUrl(record.url); // Set original URL

        setIsModalOpen(true);
    };

    const handleSaveChanges = () => {
        if (!userId) {
            console.error("userId is not defined");
            return;
        }

        const effectiveGroupId = groupId === -1 ? clickedRow.groupId : groupId;

        const updatedData = {
            passId: clickedRow.passId,
            itemName: editedItemName,
            userName: editedUserName,
            password: editedPassword,
            groupId: effectiveGroupId,
            userId: userId,
            comment: editedComment,
            url: editedUrl // Include the URL in the updated data
        };

        updatePasswordItem(clickedRow.passId, effectiveGroupId, updatedData, setData)
            .then((response) => {
                setPasswordItems(prevData =>
                    prevData.map(item =>
                        item.passId === clickedRow.passId ? { ...updatedData, passId: clickedRow.passId } : item
                    )
                );
                message.success('Item updated successfully');
                setIsModalOpen(false);
            })
            .catch((error) => {
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
                        message.success('Password item deleted successfully');
                        setIsModalOpen(false);
                    }, setGroupItems)
                        .catch(error => {
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
                const passwordMasked = record.password ? '*'.repeat(record.password.length) : '';
                return (
                    <span>
                        {record.isPasswordVisible ? record.password : passwordMasked}
                        <span
                            style={{ marginLeft: 8, cursor: 'pointer' }}
                            onClick={() => {
                                record.isPasswordVisible = !record.isPasswordVisible;
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

    const history_columns = [
        {
            title: 'Date',
            dataIndex: 'updatedAt',
            key: 'date',
            render: (updatedAt) => {
                const [date] = updatedAt.split(' ');  // Extract date (before space)
                return <span>{date}</span>;
            },
        },
        {
            title: 'Time',
            dataIndex: 'updatedAt',
            key: 'time',
            render: (updatedAt) => {
                const [, time] = updatedAt.split(' ');  // Extract time (after space)
                return <span>{time}</span>;
            },
        },
        {
            title: 'Password',
            dataIndex: 'oldPassword',
            key: 'password',
            render: (password) => <span>{password}</span>,
        },
    ];

    return (
        <div>
            <Table
                dataSource={passwordItems}
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
                                <p><strong>Comment:</strong> {clickedRow.comment}</p>
                                <p><strong>URL:</strong> {clickedRow.url ? <a href={clickedRow.url} target="_blank" rel="noopener noreferrer">{clickedRow.url}</a> : 'No URL provided'}</p>
                            </div>
                        )}
                    </TabPane>
                    <TabPane tab="History" key="2">
                        {historyData.length > 0 ? (
                            <Table
                                columns={history_columns}
                                dataSource={historyData}
                                rowKey={(record) => record.updatedAt}
                            />
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
                                        iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
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
                                <div style={{ marginBottom: '10px' }}>
                                    <label style={{ fontWeight: 'bold' }}>URL</label>
                                    <Input
                                        placeholder="URL"
                                        value={editedUrl}
                                        onChange={(e) => setEditedUrl(e.target.value)}
                                    />
                                </div>
                                <Button
                                    type="primary"
                                    onClick={handleSaveChanges}
                                    disabled={isSaveButtonDisabled}
                                >
                                    Save
                                </Button>
                                <Button danger onClick={handleDelete} style={{ marginLeft: 8 }}>
                                    Delete
                                </Button>
                            </div>
                        )}
                    </TabPane>
                </Tabs>
            </Modal>
        </div>
    );
};

export default MainPage;
