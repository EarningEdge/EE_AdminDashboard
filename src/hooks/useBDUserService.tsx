import useAxios from "./useAxios";
const useBDUserService = () => {
  const api = useAxios();
  const getAllUsers = async () => {
    return await api.get("/sales/users/all/");
  };
  const getSalesData = async () => {
    return await api.get("/sales/data/");
  };
  const toggleBDUser = async (userId:string) => {
    return await api.put(`/sales/toggle/${userId}/`);
  };
  return { getAllUsers, getSalesData, toggleBDUser };
};
export default useBDUserService;
