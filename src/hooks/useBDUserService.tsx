import useAxios from "./useAxios";
const useBDUserService = () => {
  const api = useAxios();
  const getAllUsers = async () => {
    return await api.get("/sales/users/all/");
  };
  const getSalesData = async () => {
    return await api.get("/sales/data/");
  };
  const toggleOrAssignBDUser = async (userId:string) => {
    return await api.put(`/sales/toggle-assign/${userId}/`);
  };
  
  return { getAllUsers, getSalesData, toggleOrAssignBDUser };
};
export default useBDUserService;
