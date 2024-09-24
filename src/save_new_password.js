import React, { useState, useEffect } from 'react';
import { PlusOutlined, UserOutlined, EyeInvisibleOutlined, EyeTwoTone,RollbackOutlined  } from '@ant-design/icons';
import { Button, Tooltip, Modal, Input, Select, message, Space } from 'antd';
import { addPasswordItem } from './crud_operation';
import axios from 'axios';
import { usePasswordContext } from './PasswordContext';
import {URLS} from "./apiConstants";
import './styles.css';

const { Option } = Select;

const SaveNewPassword = ({ groupId, userId, comment, url, onPasswordAdd, setGroupItems }) => {
    const [open, setOpen] = useState(false);
    const [fieldName, setFieldName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [groupOptions, setGroupOptions] = useState([]);
    const [newGroupName, setNewGroupName] = useState('');
    const [comments, setComments] = useState(''); // Optional comment field
    const [urlField, setUrlField] = useState(''); // Optional URL field
    const { addPassword } = usePasswordContext();
    const [urlError, setUrlError] = useState(null); // URL validation error state

    useEffect(() => {
        axios.get(URLS.GROUP)
            .then(response => {
                const groupsWithUnlisted = [
                    { groupId: 'null', groupName: 'Unlisted' },  // Add Unlisted group
                    ...response.data,
                ];
                setGroupOptions(groupsWithUnlisted);
            })
            .catch(error => {
                console.error('Error fetching groups:', error);
            });
    }, []);


    // Function to show the modal and clear all input fields
    const showModal = () => {
        // Clear all input data when the modal is opened
        setFieldName('');
        setUsername('');
        setPassword('');
        setSelectedGroup(null);
        setNewGroupName('');
        setComments('');
        setUrlField('');

        // Reset password strength meter
        setStrengthMessage('');
        setStrengthScore(0);

        setOpen(true);
    };

    const handleOk = () => {
        if (selectedGroup && newGroupName) {
            message.error("You cannot create a new group and select an existing group at the same time.");
            return;
        }

        let groupIdToUse = selectedGroup === 'null' ? null : selectedGroup;

        // URL validation check
        if (urlField && !isValidUrl(urlField)) {
            setUrlError('Invalid URL');
            return;
        }

        if (newGroupName) {
            axios.post(URLS.GROUP, { groupName: newGroupName, userId: userId })
                .then(response => {
                    groupIdToUse = response.data.groupId;
                    setGroupItems(prev => [...prev, { key: `group-${groupIdToUse}`, label: newGroupName }]);  // Update the sidebar with the new group
                    savePassword(groupIdToUse);
                })
                .catch(error => {
                    console.error('Failed to create new group:', error);
                    message.error('Failed to create new group');
                });
        } else {
            savePassword(groupIdToUse);
        }
    };

    const savePassword = (groupIdToUse) => {
        const newPasswordItem = {
            itemName: fieldName,
            userName: username,
            password: password,
            groupId: groupIdToUse,
            userId: userId,
            comment: comments || null, // Optional field
            url: urlField || null,     // Optional field
        };

        addPasswordItem(newPasswordItem, groupIdToUse)
            .then((newItem) => {
                message.success('New password added successfully');
                onPasswordAdd(newItem);
                setOpen(false);
            })
            .catch((error) => {
                console.error('Error adding password:', error);
                message.error('Failed to add password');
            });
    };

    const handleCancel = () => {
        setOpen(false);
        setUrlError(null); // Clear URL error on modal close
    };

    const generatePassword = () => {
        axios.post(URLS.GENERATE_PASSWORD)
            .then(response => {
                if (response.data && response.data.generated_password) {
                    setPassword(response.data.generated_password); // Update password state
                    message.success('Password generated successfully');
                    updatePasswordStrength(response.data.generated_password); // Update strength meter
                } else {
                    message.error('Unexpected response structure');
                }
            })
            .catch(error => {
                console.error('Error generating password:', error);
                message.error('Failed to generate password');
            });
    };

    const getPasswordStrength = (value) => {
        let score = 0;
        const length = value.length;
        const hasUppercase = /[A-Z]/.test(value);
        const hasLowercase = /[a-z]/.test(value);
        const hasNumbers = /[0-9]/.test(value);
        const hasSymbols = /[^0-9a-zA-Z]/.test(value);

        if (length > 0) score++;
        if (hasUppercase) score++;
        if (hasLowercase) score++;
        if (hasNumbers) score++;
        if (hasSymbols) score++;

        return {
            score,
            message: ["Very Weak", "Weak", "Medium", "Strong", "Very Strong"][score],
        };
    };

    const updatePasswordStrength = (value) => {
        const { score, message } = getPasswordStrength(value);
        setStrengthMessage(message);
        setStrengthScore(score);
    };

    const handlePasswordChange = (e) => {
        const newValue = e.target.value;
        setPassword(newValue);
        updatePasswordStrength(newValue);
    };

    const [strengthMessage, setStrengthMessage] = useState('');
    const [strengthScore, setStrengthScore] = useState(0);

    // URL validation function
    const isValidUrl = (value) => {
        const urlPattern = new RegExp(
            '^(https?:\\/\\/)?' + // Protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|(\\d{1,3}\\.){3}\\d{1,3})' + // Domain name or IP
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // Port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?' + // Query string
            '(\\#[-a-z\\d_]*)?$', 'i' // Fragment locator
        );
        return !!urlPattern.test(value);
    };

    const handleUrlChange = (e) => {
        const value = e.target.value;
        setUrlField(value);
        if (!isValidUrl(value) && value) {
            setUrlError('Invalid URL');
        } else {
            setUrlError(null);
        }
    };

    // Clear selected group
    const clearSelectedGroup = () => {
        setSelectedGroup(null);
    };

    return (
        <>
            <Tooltip title="Add new password">
                <Button
                    type="primary"
                    shape="circle"
                    icon={<PlusOutlined />}
                    onClick={showModal}
                />
            </Tooltip>

            <Modal
                title="Add New Password"
                centered
                open={open}
                onOk={handleOk}
                onCancel={handleCancel}
                width={600}
            >
                <p>Enter the new password details here...</p>

                <Input
                    placeholder="Field name"
                    value={fieldName}
                    onChange={(e) => setFieldName(e.target.value)}
                    style={{marginBottom: '10px'}}
                />
                <Input
                    placeholder="User-name"
                    prefix={<UserOutlined/>}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{marginBottom: '10px'}}
                />

                {/* Password Strength Meter */}
                <div style={{
                    marginBottom: '10px',
                    // background: '#afafaf10',
                    // borderRadius: '7px',
                    // padding: '2px',
                }}>
                    <div style={{
                        height: '10px',
                        width: `${strengthScore * 24.75}%`,  // Dynamic based on score out of 5
                        backgroundColor: ['#D73F40', '#DC6551', '#F2B84F', '#BDE952', '#3ba62f'][strengthScore],
                        transition: 'width 0.3s',
                        borderRadius: '4px',
                        marginBottom: '10px',
                        marginTop: '10px',
                    }}/>
                    {/*<span style={{*/}
                    {/*    fontWeight: 'bolder',*/}
                    {/*    color: '#333'*/}
                    {/*}}>{strengthMessage}</span>*/}
                </div>

                <Input.Password
                    placeholder="Input password"
                    value={password}
                    onChange={handlePasswordChange}
                    iconRender={(visible) => (visible ? <EyeTwoTone/> : <EyeInvisibleOutlined/>)}
                    style={{width: '45%', marginBottom: '10px'}}
                />
                <Button type="primary" style={{width: '45%', marginBottom: '10px', marginLeft: '9.5%'}}
                        onClick={generatePassword}>
                    Generate password
                </Button>
                    <div style ={{display: 'flex', justifyContent: 'space-between'}}>

                    <Select
                        style={{ width: '90%', marginBottom: '10px' }}  // Make the Select dropdown smaller
                        placeholder="Select an existing group"
                        value={selectedGroup || undefined}
                        onChange={(value) => setSelectedGroup(value)}
                    >
                        {groupOptions.map((group) => (
                            <Option key={group.groupId} value={group.groupId}>
                                {group.groupName}
                            </Option>
                        ))}
                    </Select>

                    <Button
                        icon={<RollbackOutlined />}
                        onClick={clearSelectedGroup}
                        style={{ backgroundColor: '#fff', color: '#BFBFBF', marginBottom: '10px' }}
                        className={'button-reset'}// Whitish background
                    />
                    </div>

                <Input
                    placeholder="Or enter new group name"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    style={{marginBottom: '10px'}}
                />

                {/* URL Input Field */}
                <Input
                    placeholder="Enter URL (optional)"
                    value={urlField}
                    onChange={handleUrlChange}
                    style={{marginBottom: '10px'}}
                    status={urlError ? 'error' : ''}
                />
                {urlError && (
                    <span style={{color: 'red', marginBottom: '10px'}}>{urlError}</span>
                )}

                {/* Optional Comments Field */}
                <Input.TextArea
                    placeholder="Comments (optional)"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    style={{marginBottom: '10px'}}
                />
            </Modal>
        </>
    );
};

export default SaveNewPassword;

