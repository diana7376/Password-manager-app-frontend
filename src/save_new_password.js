import React, { useState } from 'react';
import { SearchOutlined, PlusOutlined, UserOutlined, EyeInvisibleOutlined, EyeTwoTone, DownOutlined } from '@ant-design/icons'; // Import the Plus icon
import { Button, Divider, Flex, Radio, Space, Tooltip, Modal, Input, Dropdown, message } from 'antd';
const SaveNewPassword = () => {
    const [position, setPosition] = useState('end');
    const [open, setOpen] = useState(false);

    const showModal = () => {
        setOpen(true);
    };

    const handleOk = () => {
        setOpen(false);
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
        message.info('Click on menu item.');
        console.log('click', e);
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
            icon: <UserOutlined />,
            danger: true,
        },
        {
            label: 'Unlisted',
            key: '4',
            icon: <UserOutlined />,
            danger: true,
            disabled: true,
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

                    <Input placeholder="Field name" style={{ marginBottom: '10px' }} />
                    <Input placeholder="User-name" prefix={<UserOutlined />} style={{ marginBottom: '10px' }} />
                    <Input.Password
                        placeholder="Input password"
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