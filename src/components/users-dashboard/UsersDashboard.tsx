import React, { useEffect, useState } from "react";
import { Button, Input, message, Tag } from "antd";
// import { CloudDownloadOutlined } from '@ant-design/icons'


import { Flex } from "antd";
import { Switch } from "antd";
import useUserService from "../../hooks/useUserService";
import { IUser } from "../../types/data";
import { ColumnsType } from "antd/es/table";
import CustomTable from "../common/table/CustomTable";
import { useAppSelector } from "../../redux/hooks";
import useBDUserService from "../../hooks/useBDUserService";


const UsersDashboard: React.FC = () => {
  const { getAllUsers } = useUserService();
  const { toggleOrAssignBDUser } = useBDUserService();
  const user = useAppSelector((state) => state.auth.user);
  const [users, setUsers] = useState<IUser[]>([]);
  const [originalUsers, setOriginalUsers] = useState<IUser[]>([]);

  const [totalUsers, setTotalUsers] = useState(0);

  const [isLoading,setIsLoading] = useState(false);
  const [searchTerm,setSearchTerm] = useState("");
  // const [refresh, setRefresh] = useState(false)


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

  useEffect(() => {
    fetchAllUser();
  }, []);

  useEffect(()=>{
    if(searchTerm!==""){
      const filteredUser = users.filter((user)=>{

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
    try {
      const res = await toggleOrAssignBDUser(userId)
      if(res.status===200){
        message.success("Done")
      }
    } catch (error:any) {
      message.error(error.message)
    }
  };

  const columns: ColumnsType<IUser> = [
    {
      title: "",
      dataIndex: "profile",
      key: "email",
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
      title: "Mentor",
      dataIndex: "mentor",
      key: "mentor",
      render: (_, record: any) =>
        record.mentor
          ? record.mentor.firstName + " " + record.mentor.lastName
          : `Not assigned`,
    },
    {
      title: "Occupation",
      dataIndex: "occupation",
      key: "occupation",
      render: (_, record) =>
        `${!record.occupation ? "Couldn't fetch" : record.occupation}`,
    },
    {
      title: "Broker Connected",
      dataIndex: "isBrokerConnected",
      key: "isBrokerConnected",
      render: (isBrokerConnected: boolean) => (
        <Tag color={isBrokerConnected ? "green" : "red"}>
          {isBrokerConnected ? "Connected" : "Not Connected"}
        </Tag>
      ),
      sorter: (a, b) =>
        Number(a.isBrokerConnected) - Number(b.isBrokerConnected),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button type="link" href={`/${user?.role}/user/${record._id}`}>
          View Profile
        </Button>
      ),
    },
    {
      title: "Toggle BD Status",
      key: "togglebd",
      render: (_, record) => (
        <Switch
          checked={record.isBD}
          onChange={() => onToggle(String(record._id))}
        />
      ),
    }
  ];
  // const refreshTable = ()=>{
  //   setRefresh(!refresh)
  // }

  return (

    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">All USERS</h1>
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

export default UsersDashboard;
