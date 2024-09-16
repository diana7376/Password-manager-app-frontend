import React, { useState, useEffect } from 'react';
import { PlusOutlined, UserOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { Button, Tooltip, Modal, Input, Select, message, Flex } from 'antd';
import { addPasswordItem, config } from './crud_operation';
import axios from './axiosConfg';

const { Option } = Select;

const SaveNewPassword = ({ groupId, userId, comment, url, onPasswordAdd }) => {
    const [open, setOpen] = useState(false);
    const [fieldName, setFieldName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [groupOptions, setGroupOptions] = useState([]);
    const [newGroupName, setNewGroupName] = useState('');

    // Fetch existing groups
    useEffect(() => {
        axios.get('http://127.0.0.1:8000/api/groups/', config)
            .then(response => {
                setGroupOptions(response.data); // Update group options
            })
            .catch(error => {
                console.error('Error fetching groups:', error);
            });
    }, []);

    const showModal = () => {
        setOpen(true);
    };

    const handleOk = () => {
        let groupIdToUse = selectedGroup;

        // If a new group name is provided, create the new group
        if (newGroupName) {
            axios.post('http://127.0.0.1:8000/api/groups/', { groupName: newGroupName, userId: userId }, config)
                .then(response => {
                    groupIdToUse = response.data.groupId; // Use newly created group
                    savePassword(groupIdToUse);
                })
                .catch(error => {
                    if (error.response) {
                        console.error('Response error:', error.response.data);  // Log the error from the backend
                    } else if (error.request) {
                        console.error('No response received:', error.request);
                    } else {
                        console.error('Error setting up request:', error.message);
                    }
                    message.error('Failed to create new group');
                });
        } else {
            // If no new group, use the selected group
            savePassword(groupIdToUse);
        }
    };

    // Moved savePassword outside of handleOk
    const savePassword = (groupIdToUse) => {
        const newPasswordItem = {
            itemName: fieldName,
            userName: username,
            password: password,
            groupId: groupIdToUse,  // Use selected or newly created group ID
            userId: userId,
            comment: comment,
            url: url,
        };

        console.log('Sending newPasswordItem:', newPasswordItem);

        addPasswordItem(newPasswordItem, groupIdToUse)
            .then(() => {
                message.success('New password added successfully');
                onPasswordAdd();
                setOpen(false);
            })
            .catch((error) => {
                if (error.response) {
                    console.log('Response error:', error.response.data);
                } else if (error.request) {
                    console.log('No response received:', error.request);
                } else {
                    console.log('Error setting up request:', error.message);
                }
                message.error('Failed to add password');
            });
    };

    const handleCancel = () => {
        setOpen(false);
    };

    return (
        <>
            {/* Plus button to open modal */}
            <Tooltip title="Add new password">
                <Button
                    type="primary"
                    shape="circle"
                    icon={<PlusOutlined />}
                    onClick={showModal} // Show modal when button is clicked
                />
            </Tooltip>

            {/* Modal definition */}
            <Modal
                title="Add New Password"
                centered
                open={open}
                onOk={handleOk}
                onCancel={handleCancel}
                width={600}  // You can adjust the width if needed
            >
                <p>Enter the new password details here...</p>

                {/* Form for password details */}
                <Input
                    placeholder="Field name"
                    value={fieldName}
                    onChange={(e) => setFieldName(e.target.value)}
                    style={{ marginBottom: '10px' }}
                />
                <Input
                    placeholder="User-name"
                    prefix={<UserOutlined />}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{ marginBottom: '10px' }}
                />
                <Input.Password
                    placeholder="Input password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                    style={{ width: '45%', marginBottom: '10px',  }}
                />
                <Button type="primary" style={{ width: '45%', marginBottom: '10px', marginLeft: '9.5%'}}>Generate password</Button>

                {/* Group Selection */}
                <Select
                    style={{ width: '100%', marginBottom: '10px' }}
                    placeholder="Select an existing group"
                    onChange={(value) => setSelectedGroup(value)}
                >
                    {groupOptions.map((group) => (
                        <Option key={group.groupId} value={group.groupId}>
                            {group.groupName}
                        </Option>
                    ))}
                </Select>

                {/* New Group Input */}
                <Input
                    placeholder="Or enter new group name"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    style={{ marginBottom: '10px' }}
                />
            </Modal>
        </>
    );
};
console.log("working")
export default SaveNewPassword;