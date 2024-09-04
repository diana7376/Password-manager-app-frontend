import React from 'react';
import { Table } from 'antd';
import { data } from './data'

const columns = [
  {
    title: 'App Name',
    dataIndex: 'app_name',
    key: 'app_name',
  },
  {
    title: 'Username',
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
  return <Table dataSource={data} columns={columns} rowKey="app_name" />;
};

export default App;


const MyComponent = () => {
  return(
      <div>
        {data.map((item) => (
            <div key={item.app_name}>
              <h3>Name: {item.username}</h3>
              <p>Age: {item.password}</p>
            </div>
        ))}
      </div>
  );
};
