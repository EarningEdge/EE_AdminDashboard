
import { Col, Row, Table } from "antd";
import CustomLayout from "../../components/layout/custom-layout/CustomLayout";
import ProfileSection from "../../components/common/avatar-details/AvatarDetails";
import StatsBox from "../../components/common/profile-card/ProfileCard";

import { useParams } from "react-router-dom";
import useFetchData from "../../hooks/useFetchData";


interface SalesDataItem {
  _id: string;
  referralCode: string;
  userId: string;
  usersCount: number;
  paidUsersCount: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ProfileDataResponse {
  status: string;
  data: {
    user: any;
    salesData: SalesDataItem[];
  };
}

const BDUserProfile = () => {
  const { userId } = useParams<{ userId: string }>();

  //Fetch Personal data
  const {
    data: userData,
    loading,
    error,
  } = useFetchData<{ data: any }>(`/user/${userId}`);
  const { data: leadsData, loading: leadsLoading, error: leadsError } = useFetchData(`/sales/getLeads/${userId}`);
  const columns = [
    {
      title: 'Profile Image',
      dataIndex: 'profile_image',
      key: 'profile_image',
      render: (text: string) => <img src={text} alt="Profile" style={{ width: 50, height: 50, borderRadius: '50%' }} />,
    },
    {
      title: 'Full Name',
      dataIndex: 'full_name',
      key: 'full_name',
    },
    {
      title: 'Contact Number',
      dataIndex: 'contact_number',
      key: 'contact_number',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
  ];
  

  //Fetch Cards Data
  const { data: profileData } = useFetchData<ProfileDataResponse>(
    `/sales/users/${userId}`
  );
  console.log("profileData = ", profileData?.data.user);



  const formatValue = (value: string | number): string => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(numValue)) return value?.toString();
    if (Number.isInteger(numValue)) return numValue?.toString();
    return numValue.toFixed(2);
  };


  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  return (
    <CustomLayout>
      <div className="p-10 bg-slate-50">
        <ProfileSection user={userData && userData?.data} />
        <Row justify={"space-between"} align={"middle"} className="mt-10">
          <Col span={6}>
            <StatsBox
              title="Total Leads"
              value={formatValue(profileData?.data?.user.usersCount)}
              color={"black"}
            />
          </Col>
          <Col span={6}>
            <StatsBox
              title="Total Paid Users"
              value={formatValue(profileData?.data?.user.paidUsersCount)}
              color={"black"}
            />
          </Col>
          <Col span={6}>
            <StatsBox
              title="Referral Code"
              value={formatValue(profileData?.data?.user.referralCode)}
              color={"black"}
            />
          </Col>
        </Row>
        
        
        <div className="mt-10">
          <h1>Leads</h1>
          {leadsLoading ? (
            <p>Loading Leads...</p>
          ) : leadsError ? (
            <p>Error: {leadsError.message}</p>
          ) : (
            //@ts-ignore
            <Table  columns={columns} dataSource={leadsData?.data} rowKey="_id" />
          )}
        </div>
        
      </div>
    </CustomLayout>
  );
  
};

export default BDUserProfile;
