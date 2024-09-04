import React from "react";

import {HomeFilled,BookFilled,QuestionCircleFilled,TeamOutlined, UserOutlined,LineChartOutlined, GlobalOutlined, BookOutlined, BellOutlined} from "@ant-design/icons"

export const adminItems = [
  {
    key: "1",
    icon: React.createElement(HomeFilled),
    label: "Dashboard",
    path: "/admin/",
  },
  {
    key: "2",
    icon: React.createElement(TeamOutlined),
    label: "Users",
    path: "/admin/users",
  },
  {
    key: "3",
    icon: React.createElement(UserOutlined),
    label: "Mentors",
    path: "/admin/mentors",
  },
  {
    key: "4",
    icon: React.createElement(QuestionCircleFilled),
    label: "Questions",
    path: "/admin/questions",
    
      // {
      //   key: "6",
      //   label: 'Analytics',
      //   path:"/admin/questions/analytics",
      //   icon: React.createElement(LineChartOutlined),
      // },
      

  },
  {
    key: "7",
    icon: React.createElement(BookFilled),
    label: "Journal",
    path: "/admin/journals",
  },
  {
    key: "8",
    icon: React.createElement(GlobalOutlined),
    label: "Commmunity",
    path: "/admin/community",
  },
  {
    key: "9",
    icon: React.createElement(LineChartOutlined),
    label: "Live Market",
    path: "/admin/live",
  },
  // {
  //   key: "10",
  //   icon: React.createElement(LineChartOutlined),
  //   label: "BD Users",
  //   path: "/admin/sales",
  // },
  {
    key: "11",
    icon: React.createElement(BellOutlined),
    label: "Alerts",
    path: "/admin/alerts",
  }
    
];


  export const mentorItems = [
    {
      key: "1",
      icon: React.createElement(HomeFilled),
      label: "Dashboard",
      path: "/mentor/home",
    },
    {
      key: "2",
      icon: React.createElement(TeamOutlined),
      label: "Users",
      path: "/mentor/users",
    },
    
    {
      key: "3",
      icon: React.createElement(BookOutlined),
      label: "Journal",
      path: "/mentor/journals",
    },

  ];