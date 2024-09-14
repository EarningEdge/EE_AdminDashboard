import { Avatar, Button, Flex, Modal } from "antd";

// import exportIcon from '../../../assets/images/dashboard/Icon.svg'
import { IUser } from "../../../types/data";
import { useState } from "react";
import UserSalesModal from "../../user-sales-modal/UserSalesModal";

interface ProfileSectionProps {
  user: IUser;
}
const ProfileSection: React.FC<ProfileSectionProps> = ({ user }) => {
  // console.log(user)
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
  return (
    <div className="bg-dark-blue relative flex w-full rounded-xl p-6 dark:border dark:border-white">
      <Avatar
        size={198}
        src={user?.profile_image_url || "/avatar.png"}
        className="mx-8"
      />
      <div className="mt-4 rounded-full">
        <Flex align="center">
          <h2 className=" mr-2 text-3xl text-white">
            {user?.firstName} {user?.lastName}
          </h2>
          {/* <Badge
            count={user.label}
            style={{ backgroundColor: 'white', color: 'black' }}
          /> */}
        </Flex>

        <div className="mt-2 text-[#C5C5C5]">
          {/* <p>Client ID: {user.clientId} </p> */}
          <p>Email - {user?.email}</p>
          <p>Contact - {user?.phoneNumber} </p>
          <p>Occupation: {user?.occupation || "N/A"} </p>
        </div>
      </div>
      <Button
        className="absolute right-5 top-5 h-10 px-4 rounded-lg"
        onClick={showModal}
      >
        Sales
      </Button>
      <Modal
        title="User Sales Data"
        centered
        width={1000}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[]}
      >
        <UserSalesModal />
      </Modal>
    </div>
  );
};

export default ProfileSection;
