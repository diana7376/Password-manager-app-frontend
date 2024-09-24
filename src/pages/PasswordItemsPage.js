import {Breadcrumb, Flex, Layout} from "antd";
import PasswordItemsTable from "../components/PasswordItemsTable";
import React from "react";
import {Content, Header} from "antd/es/layout/layout";
import Search from "antd/es/input/Search";
import SaveNewPassword from "../save_new_password";
import {PasswordProvider} from "../PasswordContext";


const PasswordItemsPage = () => {

    return <Layout>
        <Header style={{height: 'auto'}}>
            <Flex justify={'center'} align={'center'}>
                <Search
                    placeholder="What are you looking for?"
                    // onSearch={onSearch}
                    className="custom-search-bar"
                    // onBlur={onSearchBlur}
                    // ref={searchInputRef}
                />
            </Flex>
            <Breadcrumb style={{ margin: '16px 0' }} items={[]} />
        </Header>
        <Content>
            <PasswordItemsTable/>
            <div style={{
                position: 'fixed',
                bottom: 24,
                right: 24,
                zIndex: 9999,
            }}
            >
                <PasswordProvider> {/*TODO refactor SaveNewPassword*/}
                <SaveNewPassword
                    // onPasswordAdd={(newItem) => {
                    //     setPasswordItems((prevItems) => [...prevItems, newItem]);  // Add new password to the table
                    // }}
                    // setGroupItems={setGroupItems}
                />
                </PasswordProvider>
            </div>
        </Content>
    </Layout>

}

export default PasswordItemsPage