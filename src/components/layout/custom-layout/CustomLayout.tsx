import React, { useState } from "react";
import { Avatar, ConfigProvider, Dropdown, Layout, Menu,Switch } from "antd";
import { adminItems, mentorItems } from "../../../utils/menuItems";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { LogoutOutlined, EditOutlined } from "@ant-design/icons";
import { logout } from "../../../redux/slices/authSlice";
import EditProfile from "../../modals/edit-profile";
import { toggleDarkMode } from "../../../redux/slices/themeSlice";
import { SunOutlined, MoonOutlined } from "@ant-design/icons";

const { Header, Sider, Content } = Layout;

interface CustomLayoutProps {
  children: React.ReactNode;
}

const lightTheme = {
  token: {
    colorBgBase: "#ffffff",
    colorText: "#000000",
    // Add more tokens as needed
  },
};

const darkTheme = {
  token: {
    colorBgBase: "#262633",
    colorText: "#ffffff",
    colorTextPlaceholder: "#ffffff",
    colorBorder: "#ffffff",
    fill: "#ffffff",
    itemActiveBg: "#ffffff",
    itemColor: "#ffffff",
    itemHoverBg: "#ffffff",

    // Add more tokens as needed
  },
};

const CustomLayout: React.FC<CustomLayoutProps> = ({ children }) => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const menuItems = user?.role === "admin" ? adminItems : mentorItems;

  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleMenuClick = (item: { key: string; path: string }) => {
    navigate(item.path);
  };

  const renderMenuItems = (items: any[]) => {
    return items.map((item) => {
      if (item.children) {
        return (
          <Menu.SubMenu key={item.key} icon={item.icon} title={item.label}>
            {renderMenuItems(item.children)}
          </Menu.SubMenu>
        );
      }
      return (
        <Menu.Item key={item.path} icon={item.icon}>
          <Link to={item.path}>{item.label}</Link>
        </Menu.Item>
      );
    });
  };

  if (!user) {
    return <div></div>;
  }

  const items = [
    {
      label: "Username: " + user.firstName + " " + user.lastName,
      key: "0",
    },
    {
      label: "Email: " + user.email,
      key: "1",
    },
    {
      label: (
        <button onClick={showModal}>
          <EditOutlined /> Edit profile
        </button>
      ),
      key: "3",
    },
    {
      label: (
        <button
          className="text-red-500 font-bold"
          onClick={() => {
            dispatch(logout());
            navigate("/login");
          }}
        >
          <LogoutOutlined /> Logout
        </button>
      ),
      key: "4",
    },
  ];

  const darkMode = useAppSelector((state) => state.theme.darkMode);

  return (
    <Layout style={{ minHeight: "100vh" }}  className={darkMode ? "dark" : ""}>
      <ConfigProvider theme={darkMode ? darkTheme : lightTheme}>
        <Sider
          className="bg-dark-blue"
          style={{
            background: "#262633",
            // boxShadow: "5px 0 5px -2px rgba(0, 0, 0, 0.5)",
            height: "100vh",
            position: "fixed",
            left: 0,
            // overflowY: "auto",
          }}
        >
          <div className="text-xl text-white text-center mt-4 mb-8 font-bold">
            EarningEdge<span className="text-[#637CFF]">.in</span>
          </div>
          <Menu
            
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            onClick={({ key }) => {
              const item = menuItems.find(
                (item: any) =>
                  item.key === key ||
                  (item.children &&
                    item.children.some((child: any) => child.key === key))
              );
              if (item) handleMenuClick(item);
            }}
            style={{ background: "#262633",minHeight:"100vh" }}
          >
            {renderMenuItems(menuItems)}
          </Menu>
          </Sider>
        <Layout style={{ marginLeft: 200 }}>
          <Header className="flex justify-end items-center pr-4 dark:bg-dark-blue bg-white">
            <Switch
            checkedChildren={<SunOutlined />}
            unCheckedChildren={<MoonOutlined />}
            checked={darkMode}
            onChange={() => dispatch(toggleDarkMode())}
          />
            <Dropdown
              menu={{ items }}
              trigger={["click"]}
              className="cursor-pointer"
            >
              <Avatar size={40} src={user.profile_image_url || "/avatar.png"} />
            </Dropdown>
            </Header>
          <Content
            style={{ 
              // height: "calc(100vh - 64px)", 
              overflowY: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
            className="bg-white dark:bg-dark-blue dark:text-white"
          >
            {children}
          </Content>
        </Layout>
        <EditProfile
          isModalOpen={isModalOpen}
          handleOk={handleOk}
          handleCancel={handleCancel}
        />
      </ConfigProvider>
    </Layout>
  );
};

export default CustomLayout;
