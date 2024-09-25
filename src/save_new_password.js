import React, { useState, useEffect } from 'react';
import { PlusOutlined, UserOutlined, EyeInvisibleOutlined, EyeTwoTone, RollbackOutlined } from '@ant-design/icons';
import { Button, Tooltip, Modal, Input, Select, message } from 'antd';
import { addPasswordItem } from './crud_operation';
import axios from './axiosConfg';
import { usePasswordContext } from './PasswordContext';
import './styles.css';

const { Option } = Select;

const SaveNewPassword = ({ userId, onPasswordAdd }) => {
    const [open, setOpen] = useState(false);
    const [fieldName, setFieldName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [groupOptions, setGroupOptions] = useState([]);
    const [newGroupName, setNewGroupName] = useState('');
    const [comments, setComments] = useState('');
    const [urlField, setUrlField] = useState('');
    const [urlError, setUrlError] = useState(null);
    const [strengthMessage, setStrengthMessage] = useState('');
    const [strengthScore, setStrengthScore] = useState(0);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/groups/');
                const groupsWithUnlisted = [
                    { groupId: 'null', groupName: 'Unlisted' },
                    ...response.data,
                ];
                setGroupOptions(groupsWithUnlisted);
            } catch (error) {
                console.error('Error fetching groups:', error);
            }
        };

        fetchGroups();
    }, []);

    const showModal = () => {
        setFieldName('');
        setUsername('');
        setPassword('');
        setSelectedGroup(null);
        setNewGroupName('');
        setComments('');
        setUrlField('');
        setStrengthMessage('');
        setStrengthScore(0);
        setOpen(true);
    };

    const handleOk = () => {
        if (selectedGroup === null && newGroupName.trim() === '') {
            message.error("Please select a group or enter a new group name.");
            return;
        }

        const groupIdToUse = selectedGroup === 'null' ? null : selectedGroup;

        if (urlField && !isValidUrl(urlField)) {
            setUrlError('Invalid URL');
            return;
        }

        savePassword(groupIdToUse);
    };

    const savePassword = (groupIdToUse) => {
        const newPasswordItem = {
            itemName: fieldName,
            userName: username,
            password: password,
            groupId: groupIdToUse,
            userId: userId,
            comment: comments || null,
            url: urlField || null,
        };

        addPasswordItem(newPasswordItem, groupIdToUse)
            .then((newItem) => {
                message.success('New password added successfully');
                onPasswordAdd(newItem);
                setOpen(false);
            })
            .catch((error) => {
                console.error('Error adding password: ', error);
                message.error('Failed to add password');
            });
    };

    const handleCancel = () => {
        setOpen(false);
        setUrlError(null);
    };

    const generatePassword = () => {
        axios.post('http://127.0.0.1:8000/api/password-items/generate/', {})
            .then(response => {
                if (response.data && response.data.generated_password) {
                    setPassword(response.data.generated_password);
                    message.success('Password generated successfully');
                    updatePasswordStrength(response.data.generated_password);
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

        if (length > 5) score++;
        if (hasUppercase ) score++;
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

    const isValidUrl = (value) => {
        const urlPattern = new RegExp(
            '^(https?:\\/\\/)?' +
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|(\\d{1,3}\\.){3}\\d{1,3})' +
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
            '(\\?[;&a-z\\d%_.~+=-]*)?' +
            '(\\#[-a-z\\d_]*)?$', 'i'
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
                    style={{ marginBottom: '10px' }}
                />
                <Input
                    placeholder="User-name"
                    prefix={<UserOutlined />}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{ marginBottom: '10px' }}
                />

                <div style={{ marginBottom: '10px' }}>
                    <div style={{
                        height: '10px',
                        width: `${strengthScore * 24.75}%`,
                        backgroundColor: ['#D73F40', '#DC6551', '#F2B84F', '#BDE952', '#3ba62f'][strengthScore],
                        transition: 'width 0.3s',
                        borderRadius: '4px',
                        marginBottom: '10px',
                        marginTop: '10px',
                    }} />
                </div>

                <Input.Password
                    placeholder="Input password"
                    value={password}
                    onChange={handlePasswordChange}
                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                    style={{ width: '45%', marginBottom: '10px' }}
                />
                <Button type="primary" style={{ width: '45%', marginBottom: '10px', marginLeft: '9.5%' }}
                    onClick={generatePassword}>
                    Generate password
                </Button>

                <Select
                    style={{ width: '100%', marginBottom: '10px' }}
                    placeholder="Select a group"
                    value={selectedGroup || undefined}
                    onChange={(value) => setSelectedGroup(value)}
                    allowClear
                    showSearch
                    notFoundContent="No groups found"
                    filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                >
                    {groupOptions.map((group) => (
                        <Option key={group.groupId} value={group.groupId}>
                            {group.groupName}
                        </Option>
                    ))}
                </Select>

                <Input
                    placeholder="Or enter new group name"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    style={{ marginBottom: '10px' }}
                />

                <Input
                    placeholder="Enter URL (optional)"
                    value={urlField}
                    onChange={handleUrlChange}
                    style={{ marginBottom: '10px' }}
                    status={urlError ? 'error' : ''}
                />
                {urlError && <span style={{ color: 'red' }}>{urlError}</span>}

                <Input.TextArea
                    placeholder="Comments (optional)"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    style={{ marginBottom: '10px' }}
                />
            </Modal>
        </>
    );
};

export default SaveNewPassword;
