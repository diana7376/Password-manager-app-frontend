import React, {useEffect, useState} from 'react'
import {useLocation, useNavigate} from 'react-router-dom'
import {Layout, Menu, Modal} from 'antd'
import {
    DesktopOutlined,
    LogoutOutlined,
    LoginOutlined,
    PieChartOutlined,
    UserOutlined
} from '@ant-design/icons';
import {AppActionTypes, useAppContext} from '../AppContext'


const MenuItemKeys = {
  LOGIN: '/login',
  LOGOUT: '/logout',
  ABOUT_US: '/about',
  PASSWORD_ITEMS: '/passwords',
  GROUPS: '/groups',
}

const MenuItems = [
  {
    label: 'About Us',
    key: MenuItemKeys.ABOUT_US,
    icon: <DesktopOutlined/>,
  },
  {
    label: 'Passwords',
    key: MenuItemKeys.PASSWORD_ITEMS,
    icon: <PieChartOutlined/>,
  },
  {
    label: 'Groups',
    key: MenuItemKeys.GROUPS,
    icon: <UserOutlined/>,
    children: []
  },
  {
    label: 'Login',
    key: MenuItemKeys.LOGIN,
    icon: <LoginOutlined />
  },
  {
    label: 'Logout',
    key: MenuItemKeys.LOGOUT,
    icon: <LogoutOutlined/>
  }
]

const ItemsVisibleByLoggedIn = [MenuItemKeys.PASSWORD_ITEMS, MenuItemKeys.GROUPS, MenuItems, MenuItemKeys.LOGOUT]

const SidebarMenu = ({}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { loggedIn, dispatch } = useAppContext()
  const [collapsed, setCollapsed] = useState(false)

  const menuItems = loggedIn
      ? MenuItems.filter(item => ItemsVisibleByLoggedIn.includes(item.key) || item.key === MenuItemKeys.ABOUT_US)
      : MenuItems.filter(item => !ItemsVisibleByLoggedIn.includes(item.key) || item.key === MenuItemKeys.ABOUT_US)

  const onSelect = ({key}) => {
    if (key === MenuItemKeys.LOGOUT) {
      dispatch({type: AppActionTypes.LOGOUT})
      navigate()
    } else {
      navigate(key)
    }
  }

  return <>
    <Layout.Sider collapsible
                  collapsed={collapsed}
                  onCollapse={(value) => setCollapsed(value)}>
      <Menu
          onSelect={onSelect}
          theme="dark"
          mode="inline"
          selectedKeys={location.pathname}
          items={menuItems}
      />
    </Layout.Sider>
  </>
}

export default SidebarMenu
