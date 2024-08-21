import React, { useEffect, useState } from "react";
import { Button, Input, Tag } from "antd";
// import { CloudDownloadOutlined } from '@ant-design/icons'

import { Flex } from "antd";
import { Switch } from "antd";
import useBDUserService from "../../hooks/useBDUserService";
import { IUser, ISales } from "../../types/data";
import { ColumnsType } from "antd/es/table";
import CustomTable from "../common/table/CustomTable";
import { useAppSelector } from "../../redux/hooks";

const BDUsersDashboard: React.FC = () => {
  const { getAllUsers, getSalesData, toggleBDUser } = useBDUserService();
  const user = useAppSelector((state) => state.auth.user);
  const [users, setUsers] = useState<IUser[]>([]);
  const [originalUsers, setOriginalUsers] = useState<IUser[]>([]);

  const [totalUsers, setTotalUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [salesData, setSalesData] = useState<ISales[]>([]);

  const fetchAllUser = async () => {
    try {
      setIsLoading(true);
      const res = await getAllUsers();
      if (res.status === 200) {
        setUsers(res.data.data);
        setOriginalUsers(res.data.data);
        setTotalUsers(res.data.data.length);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSalesData = async () => {
    try {
      setIsLoading(true);
      const res = await getSalesData();
      if (res.status === 200) {
        setSalesData(res.data.data);
        // setOriginalUsers(res.data.data);
        // setTotalUsers(res.data.data.length);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUser();
    fetchSalesData();
  }, []);
  useEffect(() => {
    if (searchTerm !== "") {
      const filteredUser = users.filter((user) => {
        const lowerSearchTerm = searchTerm.toLowerCase();
        const { email, firstName, lastName } = user;
        if (
          email?.toLowerCase().includes(lowerSearchTerm) ||
          firstName?.toLowerCase().includes(lowerSearchTerm) ||
          lastName?.toLowerCase().includes(lowerSearchTerm)
        )
          return user;
      });
      setUsers(filteredUser);
    } else {
      setUsers(originalUsers);
    }
  }, [searchTerm]);

  const onToggle = async(userId: string) => {
    const res = await toggleBDUser(userId)
  }

  const getUserCount = (userId: string) => {
    // Call API
    const user = salesData.find((data) => data.userId === userId);
    return user?.usersCount;
  };

  const columns: ColumnsType<IUser> = [
    {
      title: "",
      dataIndex: "profile",
      key: "profile",
      render: (_, record) => (
        <img
          height={40}
          width={40}
          src={record.profile_image_url || "/avatar.png"}
        />
      ),
      // sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: "User",
      dataIndex: "firstName",
      key: "firstName",
      render: (_: string, record: IUser) =>
        `${record.firstName ?? "Not Available"} ${
          record.lastName ?? "Not Available"
        }`,
      sorter: (a: IUser, b: IUser) =>
        (a.firstName ?? "").localeCompare(b.firstName ?? ""),
    },
    {
      title: "Contact Number",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      render: (_, record) => `${record.phoneNumber}`,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: "Occupation",
      dataIndex: "occupation",
      key: "occupation",
      render: (_, record) =>
        `${!record.occupation ? "Couldn't fetch" : record.occupation}`,
    },
    {
      title: "User Count",
      dataIndex: "user-count",
      key: "user-count",
      render: (_, record) => {
        return getUserCount(String(record._id));
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button type="link" href={`/admin/sales/${record._id}`}>
          View Profile
        </Button>
      ),
    },
    {
      title: "Toggle BD Status",
      key: "togglebd",
      render: (_, record) =>(
        <Switch value={record.isBD} onChange={()=>{onToggle(String(record._id))}} />
      )
    },
  ];

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">All BD USERS</h1>
      <div className="border border-[#EAECF0]">
        <Flex justify="space-between" align="center" className="px-6 py-6">
          <div>
            <p>
              <span className="text-lg font-bold mr-2"> Users</span>
              <Tag color="cyan">Total Users: {totalUsers}</Tag>
            </p>
          </div>
          <div className="w-1/4">
            <Input.Search
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
              value={searchTerm}
              placeholder="Search"
            />
          </div>
          {/* <Button type='default' icon={<CloudDownloadOutlined />}>
            Export
          </Button> */}
        </Flex>
      </div>
      <CustomTable
        totalDocuments={users.length}
        loading={isLoading}
        data={users}
        columns={columns}
        pageSize={10}
      />
    </div>
  );
};

export default BDUsersDashboard;
