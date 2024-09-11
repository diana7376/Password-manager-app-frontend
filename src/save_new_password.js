import React, { useState } from 'react';
import { SearchOutlined, PlusOutlined, UserOutlined, EyeInvisibleOutlined, EyeTwoTone, DownOutlined } from '@ant-design/icons'; // Import the Plus icon
import { Button, Divider, Flex, Radio, Space, Tooltip, Modal, Input, Dropdown, message } from 'antd';
import {addPasswordItem} from './crud_operation.js';


const SaveNewPassword = ({groupId, onPasswordAdd}) => {
    const [position, setPosition] = useState('end');
    const [open, setOpen] = useState(false);
    //const [passwordVisible, setPasswordVisible] = useState(false);

    // States for the form fields
    const [fieldName, setFieldName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [selectedGroup, setSelectedGroup] = useState(null);

    const showModal = () => {
        setOpen(true);
    };

    const handleOk = () => {
        const newPasswordItem = {
            itemName: fieldName,
            userName: username,
            password: password,
            groupId: groupId,

        };

        console.log('Sending newPasswordItem:', newPasswordItem);  // Log the data
        console.log('Group ID:', groupId);  // Log the groupId

        addPasswordItem(newPasswordItem, groupId)
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
    const [passwordVisible, setPasswordVisible] = React.useState(false);

    const handleButtonClick = (e) => {
        message.info('Click on left button.');
        console.log('click left button', e);
    };
    const handleMenuClick = (e) => {
        setSelectedGroup(e.key);
    };
    const items = [
        {
            label: 'Banking',
            key: '1',
            icon: <UserOutlined />,
        },
        {
            label: 'Social media',
            key: '2',
            icon: <UserOutlined />,
        },
        {
            label: 'Gaming',
            key: '3',
            icon: <UserOutlined />
        },
        {
            label: 'Unlisted',
            key: '4',
            icon: <UserOutlined />
        },
    ];
    const menuProps = {
        items,
        onClick: handleMenuClick,
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
                    width={1000} // You can adjust the width if needed
                >
                    <p>Enter the new password details here...</p>
                    {/* Form for password details */}

                    <Input placeholder="Field name" value={fieldName} onChange={(e) => setFieldName(e.target.value)} style={{ marginBottom: '10px' }} />
                    <Input placeholder="User-name" prefix={<UserOutlined />} value={username} onChange={(e) => setUsername(e.target.value)} style={{ marginBottom: '10px' }} />
                    <Input.Password
                        placeholder="Input password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                        style={{ marginBottom: '10px' }}
                    />
                    <Dropdown menu={menuProps}>
                        <Button>
                            <Space>
                                Choose group
                                <DownOutlined />
                            </Space>
                        </Button>
                    </Dropdown>
                </Modal>
        </>
    );
};
export default SaveNewPassword;