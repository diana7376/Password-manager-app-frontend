import React, { useState, useEffect } from 'react';
import { Table, Modal } from 'antd';
import {dataFetching} from './crud_operation'

const MainPage = ({ groupId }) => {
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
    ];

    const [data, setData] = useState([]);
    const [selectRow, setSelectRow] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

        useEffect(() => {
            if (groupId) {
                dataFetching(groupId,setData);
            }

        }, [groupId]);

    const handleRowClick = (record) => {
        setSelectRow(record);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectRow(null);
    };

    return (
        <div>
            <Table
                dataSource={data}
                columns={columns}
                rowKey= {(record) => record.itemName}
                onRow={(record) => ({
                    onClick: () => handleRowClick(record),
                })}
            />

            <Modal
                title={selectRow ? selectRow.app_name : "Details"}
                open={isModalOpen}
                onOk={handleModalClose}
                onCancel={handleModalClose}
                okText="Save"
                cancelText="Close"
            >
                {selectRow && (
                    <div>
                        <p><strong>Name:</strong> {selectRow.itemName}</p>
                        <p><strong>User_name:</strong> {selectRow.userName}</p>
                        <p><strong>Password:</strong> {selectRow.password}</p>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default MainPage;
