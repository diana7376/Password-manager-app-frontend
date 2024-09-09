import React, { useState, useEffect } from 'react';
import { Table, Modal } from 'antd';
import axios from 'axios';

const MainPage = () => {
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
    const [selectRow, setSelectRow] = useState(null);  // Corrected to selectRow
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        dataFetching();
    }, []);

    function dataFetching() {
        axios.get('http://127.0.0.1:8000/api/password-items/')
            .then(response => {
                const mappedData = response.data.map(item => ({
                    itemName: item.itemName,
                    userName: item.userName,
                    password: item.password,
                }));
                setData(mappedData);
            })
            .catch(error => {
                console.error(error);
            });
    }

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
                rowKey="app_name"
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
                        <p><strong>Name:</strong> {selectRow.app_name}</p>
                        <p><strong>User_name:</strong> {selectRow.username}</p>
                        <p><strong>Password:</strong> {selectRow.password}</p>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default MainPage;
