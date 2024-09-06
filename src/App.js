import React, { useState } from 'react';
import { data } from './data'
import { Table, Modal } from 'antd';


const columns = [
  {
    title: 'Name',
    dataIndex: 'app_name',
    key: 'app_name',
  },
  {
    title: 'User_name',
    dataIndex: 'username',
    key: 'username',
  },
  {
    title: 'Password',
    dataIndex: 'password',
    key: 'password',
  },
];

const App = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  //store cliked row data and open modal
  const handleRowClick = (record) => {
    setSelectedRow(record);
    setIsModalOpen(true);
  };

  //close modal and clear row data
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedRow(null);
  };

  return (
      //main table
      <>

        <Table dataSource={data}
               columns={columns}
               rowKey="app_name"
               onRow={(record) => {
                 return {
                   onClick: () => handleRowClick(record),
                 };
               }}

        />
        <br />

        <Modal
            title={selectedRow ? selectedRow.app_name : "Details"}
            open={isModalOpen}
            onOk={handleModalClose}
            onCancel={handleModalClose}
            okText="Save"
        >
          {selectedRow && (
              <div>
                <p><strong>Name:</strong> {selectedRow.app_name}</p>
                <p><strong>User_name:</strong> {selectedRow.username}</p>
                <p><strong>Password:</strong> {selectedRow.password}</p>
              </div>
          )}
        </Modal>
      </>
  );
};

export default App;



