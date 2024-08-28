
import useAxios from "./useAxios";
const useNotificationService = () => {
  const api =  useAxios();
  const getNotifications = async (value:boolean) => {
        return await api.get(`/notifications/all?read=${value}`);
  };
  return { getNotifications};
};
export default useNotificationService;
