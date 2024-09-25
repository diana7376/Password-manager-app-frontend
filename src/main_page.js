import React, { useState, useEffect } from 'react';
import { Table, Modal, Tabs, Input, Typography, Button, message } from 'antd';
import { MoreOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import {
    config,
    dataFetching,
    deleteData,
    fetchAllPasswordItems,
    fetchHistory,
    fetchUnlistedPasswordItems,
    updatePasswordItem
} from './crud_operation';
import axios from './axiosConfg';
import './styles.css';

const { Search } = Input;

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
    const [nextPage, setNextPage] = useState(null);
    const [prevPage, setPrevPage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);  // State to track the current page number
    const [searchMode, setSearchMode] = useState(false); // To track if we are in search mode

    // Pagination state for search results
    const [currentPageSearch, setCurrentPageSearch] = useState(1);
    const [nextPageSearch, setNextPageSearch] = useState(null);
    const [prevPageSearch, setPrevPageSearch] = useState(null);

    // Pagination state for the history table
    const [historyCurrentPage, setHistoryCurrentPage] = useState(1);
    const [historyNextPage, setHistoryNextPage] = useState(null);
    const [historyPrevPage, setHistoryPrevPage] = useState(null);
    const [historyLoading, setHistoryLoading] = useState(false);  // History loading state




    // Function to fetch data based on the group
    const fetchData = (url = null, page = 1) => {
        setLoading(true);

        // Determine the appropriate endpoint based on the groupId
        let endpoint;
        if (url) {
            // If a URL is provided, use it for pagination (next/previous page)
            endpoint = url;
        } else if (groupId === -1) {
            // Case 1: Fetch all passwords (default "Passwords" option)
            endpoint = 'http://127.0.0.1:8000/api/password-items/?page=' + page;
        } else if (groupId === null) {
            // Case 2: Fetch unlisted passwords (groupId is 'null')
            endpoint = 'http://127.0.0.1:8000/api/groups/null/password-items/?page=' + page;
        } else {
            // Case 3: Fetch passwords for a specific group
            endpoint = `http://127.0.0.1:8000/api/groups/${groupId}/password-items/?page=` + page;
        }


        // Use Axios to fetch the data from the determined endpoint
        axios.get(endpoint)
            .then((response) => {
                const data = response.data;
                setPasswordItems(data.passwords);  // Set the table data
                setNextPage(data.next_page);       // Set the next page URL
                setPrevPage(data.previous_page);   // Set the previous page URL
                setCurrentPage(page);
                setSearchMode(false);  // Not in search mode
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    // Fetch data when the component mounts or the groupId changes
    useEffect(() => {
        fetchData();
    }, [groupId]);

    const onSearch = (value) => {
        const trimmedQuery = value.trim();
        setSearchMode(Boolean(trimmedQuery)); // Enter search mode only if a query is provided

        if (!trimmedQuery) {
            fetchData(null, currentPage);  // Clear the search and go back to normal data
            return;
        }

        // Reset search pagination
        setCurrentPageSearch(1);

        let endpoint;
        if (groupId === -1) {
            endpoint = `http://127.0.0.1:8000/api/password-items/?page=1&search=${encodeURIComponent(trimmedQuery)}`;
        } else if (groupId === null) {
            endpoint = `http://127.0.0.1:8000/api/groups/null/password-items/?page=1&search=${encodeURIComponent(trimmedQuery)}`;
        } else {
            endpoint = `http://127.0.0.1:8000/api/groups/${groupId}/password-items/?page=1&search=${encodeURIComponent(trimmedQuery)}`;
        }

        axios.get(endpoint)
            .then((response) => {
                const data = response.data;
                setPasswordItems(data.passwords);
                setNextPageSearch(data.next_page);
                setPrevPageSearch(data.previous_page);
            })
            .catch((error) => {
                console.error('Error during search:', error);
            });
    };


    // Change page in search results
    const fetchSearchResults = (url, page) => {
        setLoading(true);
        axios.get(url)
            .then((response) => {
                const data = response.data;
                setPasswordItems(data.passwords);
                setNextPageSearch(data.next_page);
                setPrevPageSearch(data.previous_page);
                setCurrentPageSearch(page);
            })
            .catch((error) => {
                console.error('Error fetching search results:', error);
            })
            .finally(() => {
                setLoading(false);
            });
    };


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

    // Fetch history data for a specific password item with pagination
    const fetchHistoryData = (passId, url = null, page = 1) => {
        setHistoryLoading(true);
        let endpoint = url || `http://127.0.0.1:8000/api/password-history/${passId}/?page=${page}`;

        axios.get(endpoint)
            .then((response) => {
                const data = response.data;
                setHistoryData(data.passwords);  // Set history data
                setHistoryNextPage(data.next_page);  // Set next page
                setHistoryPrevPage(data.previous_page);  // Set previous page
                setHistoryCurrentPage(page);  // Update current history page
            })
            .catch((error) => {
                console.error('Error fetching history data:', error);
            })
            .finally(() => {
                setHistoryLoading(false);
            });
    };

    const handleMenuClick = async (record) => {
        setClickedRow(record);
        fetchHistoryData(record.passId);  // Fetch first page of history when opening the modal
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

                <Search
                    placeholder="What are you looking for?"
                    onSearch={onSearch}
                    className="custom-search-bar"
                    //onBlur={onSearchBlur}

                   // ref={searchInputRef}
                />


            <Table
                dataSource={passwordItems}
                columns={columns}
                rowKey={(record) => record.passId}
                loading={loading}
                pagination={false}
            />
            <div style={{display: 'flex', justifyContent: 'center', marginTop: 16}}>
                <Button
                    onClick={() => searchMode ? fetchSearchResults(prevPageSearch, currentPageSearch - 1) : fetchData(prevPage, currentPage - 1)}
                    disabled={searchMode ? !prevPageSearch : !prevPage}  // Fix: !prevPage (instead of searchMode ? !prevPageSearch : prevPage)
                    style={{ marginRight: 8 }}
                >
                    Previous Page
                </Button>
                <div style={{
                    width: '40px',
                    height: '40px',
                    lineHeight: '40px',
                    textAlign: 'center',
                    border: '1px solid #d9d9d9',
                    borderRadius: '4px',
                    margin: '0 12px',
                    fontSize: '16px',
                }}>
                    {searchMode ? currentPageSearch : currentPage} {/* Show currentPageSearch in search mode */}
                </div>

                <Button

                    onClick={() => searchMode ? fetchSearchResults(nextPageSearch, currentPageSearch + 1) : fetchData(nextPage, currentPage + 1)}
                    disabled={searchMode ? !nextPageSearch : !nextPage}  // Fix: !nextPage (instead of searchMode ? !prevPageSearch : prevPage)
                    style={{ marginRight: 8 }}
                >
                    Next Page
                </Button>
            </div>
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
                                <p><strong>URL:</strong> {clickedRow.url ? <a href={clickedRow.url} target="_blank"
                                                                              rel="noopener noreferrer">{clickedRow.url}</a> : 'No URL provided'}
                                </p>
                            </div>
                        )}
                    </TabPane>
                    <TabPane tab="History" key="2">
                        {historyData.length > 0 ? (
                            <div>
                                <Table
                                    columns={history_columns}
                                    dataSource={historyData}
                                    rowKey={(record) => record.updatedAt}
                                    loading={historyLoading}
                                    pagination={false}
                                />
                                <div style={{display: 'flex', justifyContent: 'center', marginTop: 16}}>
                                    <Button
                                        onClick={() => fetchHistoryData(clickedRow.passId, historyPrevPage, historyCurrentPage - 1)}
                                        disabled={!historyPrevPage}
                                        style={{marginRight: 8}}
                                    >
                                        Previous Page
                                    </Button>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        lineHeight: '40px',
                                        textAlign: 'center',
                                        border: '1px solid #d9d9d9',
                                        borderRadius: '4px',
                                        margin: '0 12px',
                                        fontSize: '16px',
                                    }}>
                                        {historyCurrentPage}
                                    </div>
                                    <Button
                                        onClick={() => fetchHistoryData(clickedRow.passId, historyNextPage, historyCurrentPage + 1)}
                                        disabled={!historyNextPage}
                                    >
                                        Next Page
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <p>No history available.</p>
                        )}
                    </TabPane>
                    <TabPane tab="Edit" key="3">
                        {clickedRow && (
                            <div>
                                <div style={{marginBottom: '10px'}}>
                                    <label style={{fontWeight: 'bold'}}>Item Name</label>
                                    <Input
                                        placeholder="Item Name"
                                        value={editedItemName}
                                        onChange={(e) => setEditedItemName(e.target.value)}
                                    />
                                </div>
                                <div style={{marginBottom: '10px'}}>
                                    <label style={{fontWeight: 'bold'}}>User Name</label>
                                    <Input
                                        placeholder="Username"
                                        value={editedUserName}
                                        onChange={(e) => setEditedUserName(e.target.value)}
                                    />
                                </div>
                                <div style={{marginBottom: '10px'}}>
                                    <label style={{fontWeight: 'bold'}}>Password</label>
                                    <Input.Password
                                        placeholder="Password"
                                        value={editedPassword}
                                        onChange={(e) => setEditedPassword(e.target.value)}
                                        iconRender={(visible) => (visible ? <EyeOutlined/> : <EyeInvisibleOutlined/>)}
                                    />
                                </div>
                                <div style={{marginBottom: '10px'}}>
                                    <label style={{fontWeight: 'bold'}}>Group</label>
                                    <Input
                                        placeholder="Group"
                                        value={editedGroup}
                                        onChange={(e) => setEditedGroup(e.target.value)}
                                    />
                                </div>
                                <div style={{marginBottom: '10px'}}>
                                    <label style={{fontWeight: 'bold'}}>Comment</label>
                                    <Input
                                        placeholder="Comment"
                                        value={editedComment}
                                        onChange={(e) => setEditedComment(e.target.value)}
                                    />
                                </div>
                                <div style={{marginBottom: '10px'}}>
                                    <label style={{fontWeight: 'bold'}}>URL</label>
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
                                <Button danger onClick={handleDelete} style={{marginLeft: 8}}>
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
