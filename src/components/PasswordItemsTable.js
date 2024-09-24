import React, {useEffect, useState} from 'react';
import {Table} from "antd";
import {EyeInvisibleOutlined, EyeOutlined, MoreOutlined} from "@ant-design/icons";
import {PASSWORD_ITEMS} from "../urls";
import axiosInstance from "../axiosConfg";
import PasswordItemEditModal from "./PasswordItemEditModal";

const PasswordItemsTable = ({}) => {
    const [passwordItems, setPasswordItems] = useState()
    const [loading, setLoading] = useState(false)

    const [showModal, setShowModal] = useState(false)
    const [selectedPasswordItem, setSelectedPasswordItem] = useState(null)

    useEffect(() => {
        setLoading(true)
        axiosInstance.get(PASSWORD_ITEMS)
            .then(r => setPasswordItems(r.data?.passwords))
            .finally(() => setLoading(false))
    }, [])

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
            render: (text, record, index) => {
                const maskedPassword = record.password ? '*'.repeat(record.password.length) : '';
                return (
                    <span>
                        { record.isPasswordVisible ? record.password : maskedPassword }
                        <span style={{ marginLeft: 8, cursor: 'pointer' }}
                              onClick={() => {
                                  record.isPasswordVisible = !record.isPasswordVisible;
                                  setPasswordItems([...passwordItems]);  // Update the table with visibility toggled
                              }}>
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
                    onClick={() => { setSelectedPasswordItem(record); setShowModal(true)}}
                />
            ),
        },
    ];

    return <>
        <Table loading={loading}
                  dataSource={passwordItems}
                  columns={columns}
                  rowKey={(record) => record.passId}/>
        <PasswordItemEditModal open={showModal}
                               passwordItem={selectedPasswordItem}
                               onSave={(updatedPasswordItem) => {
                                   setPasswordItems(prevData =>
                                       prevData.map(item =>
                                           item.passId === updatedPasswordItem.passId ? { ...updatedPasswordItem } : item
                                       )
                                   );
                                   setShowModal(false)
                               } }
                               onCancel={() => setShowModal(false)}/>
        </>
}

export default PasswordItemsTable
