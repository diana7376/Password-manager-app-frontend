import React, { useState, useEffect } from 'react';
import { Table, Modal, Dropdown, Menu, message, Input } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import { dataFetching, deleteData, updatePasswordItem} from './crud_operation';
import './styles.css';

const { confirm } = Modal;

const MainPage = ({ groupId, userId }) => {
    const [data, setData] = useState([]);
    const [selectRow, setSelectRow] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [clickedRow, setClickedRow] = useState(null);

    // Form fields to store edited values
    const [editedItemName, setEditedItemName] = useState('');
    const [editedUserName, setEditedUserName] = useState('');
    const [editedPassword, setEditedPassword] = useState('');
    const [editedGroup, setEditedGroup] = useState('');

    const [originalItemName, setOriginalItemName] = useState('');
    const [originalUserName, setOriginalUserName] = useState('');
    const [originalPassword, setOriginalPassword] = useState('');
    const [originalGroup, setOriginalGroup] = useState('');

    const showConfirmSave = () => {
        confirm({
            title: 'Are you sure you want to save these changes?',
            content: 'This will overwrite the existing password information.',
            okText: 'Yes',
            cancelText: 'No',
            onOk() {
                handleSaveChanges();
            },
        });
    };

    // Handle menu click (edit/delete actions)
    const handleMenuClick = ({ key }) => {
        if (!clickedRow || !clickedRow.id) {
            console.error('No row selected or row has no id');
            message.error('Failed to delete the password: no ID');
            return;
        }

        if (key === 'edit') {
            // existing password details in the modal
            setEditedItemName(clickedRow.itemName);
            setEditedUserName(clickedRow.userName);
            setEditedPassword(clickedRow.password);
            setEditedGroup(clickedRow.groupId);

            // set original values to compare
            setOriginalItemName(clickedRow.itemName);
            setOriginalUserName(clickedRow.userName);
            setOriginalPassword(clickedRow.password);
            setOriginalGroup(clickedRow.groupId);

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

    //handle saved changes and update the DB
    const handleSaveChanges = () => {
        const updatedData = {
            itemName: editedItemName,
            userName: editedUserName,
            password: editedPassword,
            groupId: editedGroup,
            userId: userId
        };

        updatePasswordItem(clickedRow.id, groupId, updatedData)
            .then(() => {
                message.success('Password item updated successfully');
                setIsModalOpen(false);
                setData(prevData => prevData.map(item => (item.id === clickedRow.id ? updatedData : item)));
            })
            .catch((error) => {
                if (error.response) {
                    console.error('Response error:', error.response.data); // Log detailed response error
                }
                message.error('Failed to update password item');
                console.error(error);
            });
    };

    //compare original and edited values
    const isSaveDisabled = () => {
        return (
            editedItemName === originalItemName &&
            editedUserName === originalUserName &&
            editedPassword === originalPassword &&
            editedGroup === originalGroup
        );
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectRow(null);
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
            // Fetch the password items for the selected group directly from the backend
            dataFetching(groupId, setData);
        }
    }, [groupId]);


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
                onOk={showConfirmSave}
                onCancel={handleModalClose}
                okText="Save"
                cancelText="Close"
                okButtonProps={{ disabled: isSaveDisabled() }}  // Disable the save button if no changes

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
