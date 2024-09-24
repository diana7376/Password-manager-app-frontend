import {useEffect, useState} from 'react'
import {Button, Input, message, Modal, Table, Tabs} from "antd";
import {CheckCircleOutlined, EyeInvisibleOutlined, EyeOutlined, LoadingOutlined} from "@ant-design/icons";
import TabPane from "antd/es/tabs/TabPane";
import {PASSWORD_DELETE, PASSWORD_HISTORY, PASSWORD_UPDATE} from "../urls";
import axiosInstance from "../axiosConfg";


const PasswordItemEditModal = ({passwordItem, open, onSave, onCancel}) => {
    const [historyData, setHistoryData] = useState([]);
    const [editedItemName, setEditedItemName] = useState();
    const [editedUserName, setEditedUserName] = useState();
    const [editedPassword, setEditedPassword] = useState();
    const [editedGroup, setEditedGroup] = useState();
    const [editedComment, setEditedComment] = useState();
    const [editedUrl, setEditedUrl] = useState();

    const [isSaveButtonDisabled, setIsSaveButtonDisabled] = useState(true);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)


    useEffect(() => {
        setIsLoading(true)
        if (!!passwordItem) {
            setEditedItemName(passwordItem.itemName);
            setEditedUserName(passwordItem.userName);
            setEditedPassword(passwordItem.password);
            setEditedGroup(passwordItem.group);
            setEditedComment(passwordItem.comment);
            setEditedUrl(passwordItem.url);

            axiosInstance.get(PASSWORD_HISTORY(passwordItem.passId))
                .then(r => setHistoryData(r.data?.passwords))
                .catch(() => {})
                .finally(() => setIsLoading(false))
        }
    }, [passwordItem])

    useEffect(() => {
        const isUnchanged = !!passwordItem &&
            editedItemName === passwordItem.itemName &&
            editedUserName === passwordItem.userName &&
            editedPassword === passwordItem.password &&
            editedGroup === passwordItem.group &&
            editedComment === passwordItem.comment &&
            editedUrl === passwordItem.url;

        setIsSaveButtonDisabled(isUnchanged);
    }, [editedItemName, editedUserName, editedPassword, editedGroup, editedComment, editedUrl])


    const historyColumns = [
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

    const handleDelete = () => {
        Modal.confirm({
            title: 'Are you sure you want to delete this?',
            okText: 'Delete',
            onOk() {
                if (passwordItem) {
                    axiosInstance.delete(PASSWORD_DELETE(passwordItem.passId, passwordItem.groupId))
                        .then(r => {
                            message.success('Password item deleted successfully');
                        })
                        .catch(error => {
                            message.error('Failed to delete password item or group');
                        });
                }
            }
        });
    };

    const handleSave = () => {
        setIsSaving(true)
        const updatedPasswordItem = {
            passId: passwordItem.passId,
            itemName: editedItemName,
            userName: editedUserName,
            password: editedPassword,
            groupId: editedGroup,
            comment: editedComment,
            url: editedUrl
        }
        axiosInstance.put(PASSWORD_UPDATE(passwordItem.passId, editedGroup), updatedPasswordItem)
            .then(r => {
                onSave(updatedPasswordItem)
            })
            .catch(err => message.error(`Ooopsie... something went wrong: ${err.detail}`))
            .finally(() => setIsSaving(false))
    }

    const ActionButtons = <>
        <Button danger
                style={{ marginLeft: 8 }}
                onClick={handleDelete}>
            Delete
        </Button>
        <Button type="primary"
                icon={isSaving ? <LoadingOutlined/> : <CheckCircleOutlined />}
                onClick={handleSave}
                disabled={isSaveButtonDisabled}> Save </Button>
    </>

    return <Modal title={editedItemName}
                  open={open}
                  loading={isLoading}
                  onCancel={onCancel}
                  footer={ActionButtons}>
        <Tabs defaultActiveKey="1">
            <TabPane tab="Details" key="1">
                {passwordItem && (
                    <div>
                        <p><strong>Name:</strong> {passwordItem.itemName}</p>
                        <p><strong>User Name:</strong> {passwordItem.userName}</p>
                        <p>
                            <strong>Password:</strong>
                            {isPasswordVisible ? passwordItem.password : '*'.repeat(passwordItem.password.length)}
                            <Button
                                type="link"
                                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                            >
                                {isPasswordVisible ? 'Hide' : 'Show'}
                            </Button>
                        </p>
                        <p><strong>Group:</strong> {passwordItem.groupName}</p>
                        <p><strong>Comment:</strong> {passwordItem.comment}</p>
                        <p><strong>URL:</strong> {passwordItem.url ? <a href={passwordItem.url} target="_blank" rel="noopener noreferrer">{passwordItem.url}</a> : 'No URL provided'}</p>
                    </div>
                )}
            </TabPane>
            <TabPane tab="History" key="2">
                {historyData.length > 0 ? (
                    <Table
                        columns={historyColumns}
                        dataSource={historyData}
                        rowKey={(record) => record.updatedAt}
                    />
                ) : (
                    <p>No history available.</p>
                )}
            </TabPane>
            <TabPane tab="Edit" key="3">
                {passwordItem && (
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
                                placeholder="Username"
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
                    </div>
                )}
            </TabPane>
        </Tabs>
    </Modal>
}

export default PasswordItemEditModal;