
import useAxios from "./useAxios";
const useAlertsService = () => {
  const api =  useAxios();
  const getAlerts = async () => {
        return await api.get("/adminAlert/getAlerts");
  };
  return { getAlerts};
};
export default useAlertsService;
