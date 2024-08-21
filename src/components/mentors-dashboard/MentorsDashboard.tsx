import React, { useEffect, useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  Drawer,
  List,
  Modal,
  Select,
  Tag,
  message,
} from "antd";
import {
  ArrowRightOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";
import { Flex } from "antd"; // Assuming you have a Flex component from Ant Design
import { Link, useNavigate } from "react-router-dom";
import useMentorService from "../../hooks/useMentor";
import { IUser } from "../../types/data";
import { ColumnsType } from "antd/es/table";
import { useAppSelector } from "../../redux/hooks";
import CustomTable from "../common/table/CustomTable";
import avatar from "../../assets/images/avatar.png";
import { ReloadOutlined } from '@ant-design/icons'

const MentorsDashboard: React.FC = () => {
  const {
    getAllMentors,
    getAllTradersAssigned,
    getAllUnassignedTraders,
    assignTrader,
    removeTrader,
  } = useMentorService();
  const { user } = useAppSelector((state) => {
    return state.auth;
  });
  const [mentors, setMentors] = useState<IUser[]>([]);
  const [assignedTraders, setAssignedTraders] = useState<IUser[]>([]);
  const [unAssignedTraders, setUnassignedTraders] = useState<IUser[]>([]);
  const [totalMentors, setTotalMentors] = useState(0);
  const [showTradersDrawer, setShowTradersDrawer] = useState(false);
  const [showUnasignedTradersDrawer, setShowUnasignedTradersDrawer] =
    useState(false);
  const [showRemoveUserModal, setShowRemoveUserModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<IUser | null>(null);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [mentorSelectedToAssign, setMentorSelectedToAssign] = useState<{
    firstName: string;
    id: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTradersLoading, setIsTradersLoading] = useState(false);
  const [refresh, setRefresh] = useState(false)

  const navigate = useNavigate();

  const fetchAllMentors = async () => {
    try {
      setIsLoading(true);
      const res = await getAllMentors();
      if (res.status === 200) {
        setMentors(res.data.data);
        setTotalMentors(res.data.data.length);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  const fetchAllTraders = async () => {
    try {
      setIsTradersLoading(true);
      const res = await getAllTradersAssigned(selectedMentor?._id!);
      if (res.status === 200) {
        setAssignedTraders(res.data.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsTradersLoading(false);
    }
  };
  const fetchAllUnassignedTraders = async () => {
    try {
      setIsTradersLoading(true);
      const res = await getAllUnassignedTraders();
      if (res.status === 200) {
        setUnassignedTraders(res.data.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsTradersLoading(false);
    }
  };
  const handleAssignTrader = async () => {
    if (!selectedUser && !mentorSelectedToAssign) return;
    try {
      setIsLoading(true);
      const res = await assignTrader(
        selectedUser?._id!,
        mentorSelectedToAssign?.id!
      );
      if (res.status === 200) {
        message.success("Trader Assigned!");
        fetchAllUnassignedTraders();
        fetchAllMentors();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
      setShowAddUserModal(false);
      setSelectedMentor(null)
    }
  };
  const handleRemoveTrader = async () => {
    if (!selectedUser) return;
    try {
      setIsLoading(true);
      const res = await removeTrader(selectedUser?._id!);
      if (res.status === 200) {
        message.success("Trader removed!");
        const filteredList = assignedTraders.filter((e) => {
          return e._id != selectedUser?._id;
        });
        setAssignedTraders(filteredList);
        fetchAllMentors();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setSelectedUser(null)
      setIsLoading(false);
      setShowRemoveUserModal(false);
    }
  };
  const refreshTable = ()=>{
    setRefresh(!refresh)
  }

  useEffect(() => {
    fetchAllMentors();
    fetchAllUnassignedTraders();
  }, [refresh]);
  useEffect(() => {
    if (selectedMentor) {
      fetchAllTraders();
    }
  }, [selectedMentor]);
  useEffect(() => {
    if (showUnasignedTradersDrawer) {
      fetchAllUnassignedTraders();
    }
  }, [showUnasignedTradersDrawer]);
  const columns: ColumnsType<IUser> = [
    {
      title: "Mentor",
      dataIndex: "firstName",
      key: "firstName",
      render: (_, record) => `${record.firstName} ${record.lastName}`,
      sorter: (a, b) => a.firstName.localeCompare(b.firstName),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: "Traders",
      dataIndex: "traderCount",
      key: "traderCount",
      render: (text: number, record: IUser) => {
        return (
          <Button
            onClick={() => {
              setShowTradersDrawer(true);
              setSelectedMentor(record);
            }}
            iconPosition="end"
            icon={<ArrowRightOutlined />}
          >
            {" "}
            {Number(text) == 1 ? text + " Trader" : text + " Traders"}{" "}
          </Button>
        );
      },
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
  ];

  const darkMode = useAppSelector((state) => state.theme.darkMode);

  return (
    <div className="p-10 ">
      {/* SIDE COMPONENT TO DISPLAY TRADER */}
      <Drawer
        open={showTradersDrawer}
        onClose={() => {
          setShowTradersDrawer(false);
        }}
      >
        <h1 className="text-lg">
          Traders assigned to {selectedMentor?.firstName}
        </h1>
        <List
          loading={isTradersLoading}
          dataSource={assignedTraders!}
          renderItem={(item) => (
            <List.Item key={item.email}>
              <List.Item.Meta
                avatar={<Avatar src={item.profile_image_url || avatar} />}
                title={<Link to="/">{item.firstName}</Link>}
                description={item.email}
              />
              <UserDeleteOutlined
                onClick={() => {
                  setShowRemoveUserModal(true);
                  setSelectedUser(item);
                }}
              />
            </List.Item>
          )}
        />
        <Modal
          open={showRemoveUserModal}
          onCancel={() => {
            setShowRemoveUserModal(false);
          }}
          confirmLoading={isLoading}
          onOk={handleRemoveTrader}
        >
          <h1>
            Remove {selectedUser?.firstName} from {selectedMentor?.firstName}'s
            mentorship?
          </h1>
        </Modal>
      </Drawer>
      <Drawer
        style={{ borderTopLeftRadius: "16px", borderTopRightRadius: "16px" }}
        className=" rounded-tr-10"
        height={"90%"}
        placement="bottom"
        open={showUnasignedTradersDrawer}
        onClose={() => {
          setShowUnasignedTradersDrawer(false);
        }}
      >
        <h1 className="text-lg text-">Traders with no mentors assigned</h1>
        <List
          loading={isTradersLoading}
          dataSource={unAssignedTraders!}
          renderItem={(item) => (
            <List.Item onClick={() => {
              setShowAddUserModal(true);
              setSelectedUser(item);
            }} className={`cursor-pointer ${darkMode ? 'hover:bg-slate-400' : 'hover:bg-slate-100'} px-3 text-white`} key={item.email}>
              <List.Item.Meta
                avatar={<Avatar src={item.profile_image_url || avatar} />}
                title={<Link to="/">{ !item.firstName?"Couldn't fetch name": item.firstName+" "+item.lastName}</Link>}
                description={item.email}
              />
              <UserAddOutlined
                onClick={() => {
                  setShowAddUserModal(true);
                  setSelectedUser(item);
                }}
              />
            </List.Item>
          )}
        />
        <Modal
          confirmLoading={isLoading}
          open={showAddUserModal}
          onCancel={() => {
            setShowAddUserModal(false);
            setSelectedUser(null);
            setMentorSelectedToAssign(null);
          }}
          onOk={handleAssignTrader}
        >
          <h1>Select a mentor</h1>
          <Select
            
            onChange={(value: string) => {
              const selectedMentor = mentors.find(
                (mentor) => mentor._id === value
              );
              if (selectedMentor) {
                setMentorSelectedToAssign({
                  id: selectedMentor._id,
                  firstName: selectedMentor.firstName,
                });
              } else {
                setMentorSelectedToAssign(null);
              }
            }}
            style={{ width: "100%" }}
            value={
              mentorSelectedToAssign ? mentorSelectedToAssign.id : undefined
            }
          >
            <Select.Option disabled value={undefined}>Select Mentor</Select.Option>
            {mentors.map((mentor: IUser) => (
              <Select.Option key={mentor._id} value={mentor._id}>
                {mentor.firstName+" "+mentor.lastName}
              </Select.Option>
            ))}
          </Select>
       
        </Modal>
      </Drawer>
      <h1 className="text-2xl font-bold mb-4">All MENTORS</h1>
      <div className="border border-[#EAECF0]">
        <Flex justify="space-between" align="center" className="px-6 py-6">
          <div>
            <p>
              <span className="text-lg font-bold mr-2"> Mentors</span>
              <Tag color="cyan">Total Mentors: {totalMentors}</Tag>
            </p>
            <p className="text-light-grey">List of all mentors </p>
          </div>
          <div className="flex space-x-2">
          <Button type='default' shape="circle" onClick={refreshTable} icon={<ReloadOutlined />}/>

            <Button
              onClick={() => {
                navigate("/admin/create-mentor");
              }}
              type="default"
              icon={<UsergroupAddOutlined />}
            >
              Create Mentor
            </Button>

            <Badge color="blue" size="small" count={unAssignedTraders.length}>
              <Button
                onClick={() => {
                  setShowUnasignedTradersDrawer(true);
                }}
                type="default"
                icon={<UserAddOutlined />}
              >
                Assign Traders
              </Button>
            </Badge>
          </div>
        </Flex>
      </div>

      <CustomTable
        columns={columns}
        data={mentors}
        loading={isLoading}
        totalDocuments={mentors.length}
      />
      {/* <MentorsTable isLoading={isLoading} mentors={mentors} /> */}
    </div>
  );
};

export default MentorsDashboard;
