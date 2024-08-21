import { Col, DatePicker, Select, Flex, Row } from "antd";
import StatsBox from "../../components/common/profile-card/ProfileCard";
import CustomLayout from "../../components/layout/custom-layout/CustomLayout";
import BarGraph from "../../components/graphs/bar-graph/NewBar";
import useFetchData from "../../hooks/useFetchData";
import { useEffect, useState } from "react";
import { useAppSelector } from "../../redux/hooks";
import AreaChart from "../../components/graphs/area-chart/AreaChart";
import NoData from "../../components/no-data";
import RadialSemicircle from "../../components/graphs/radial-graph/ConnectedUser";
import dayjs, { Dayjs } from "dayjs";
import DonutChart from "../../components/graphs/donut-chart/DonutChart";

interface Entry {
  date: string;
  entry: number;
  exit: number;
}
interface SummaryData {
  totalHoldings: number;
  totalPnL: number;
  totalTradesQuantity: number;
  totalHoldingsQuantity: number;
}

const AdminDashboard = () => {
  const [summaryData, setSummaryData] = useState<SummaryData>({
    totalHoldings: 0,
    totalHoldingsQuantity: 0,
    totalPnL: 0,
    totalTradesQuantity: 0,
  });
  const [graphType, setGraphType] = useState<"bar" | "line">("bar");
  const [overallPnLdateRange, setOverallPnLDateRange] = useState<
    [dayjs.Dayjs, dayjs.Dayjs]
  >([dayjs().startOf("month"), dayjs()]);

  const [journalDateRange, setJournalDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(7, "day"),
    dayjs(),
  ]);

  //API CALLS
  //CALL 0: To fetch the Journal response trend data
  const {
    data: summaryDataResponse,
    loading: isSummaryDataLoading,
    // error: summaryDataError,
  } = useFetchData<{ status: string; data: any }>(`/analytics/summary`);
  useEffect(() => {
    if (summaryDataResponse?.data?.data) {
      setSummaryData(summaryDataResponse.data.data);
    }
  }, [summaryDataResponse]);

  //CALL1: To fetch the Journal response trend data
  const {
    data: journalResponseTrend,
    loading: isJournalResponseCountLoading,
    // error: journalResponseCountError,
  } = useFetchData<{ status: string; data: Entry[] }>(
    `/analytics/journalTypeTrend?fromDate=${journalDateRange[0].format(
      "YYYY-MM-DD"
    )}&toDate=${journalDateRange[1].add(1,"day").format("YYYY-MM-DD")}`
  );
  //FORMATTING the journal response trend data
  const formattedJournalResponseTrendData =
    journalResponseTrend?.status === "success" &&
    journalResponseTrend?.data?.length > 0
      ? [
          {
            name: "Entry",
            data: journalResponseTrend.data.map((entry) => entry.entry),
          },
          {
            name: "Exit",
            data: journalResponseTrend.data.map((entry) => entry.exit),
          },
        ]
      : [];
  const journalResponseTrendCategory =
    journalResponseTrend?.status === "success"
      ? journalResponseTrend.data.map((entry) => entry.date)
      : [];

  //Fetch Connected Vs Not connected
  const {
    data: connectedUsersRatio,
    // loading: isConnectedUsersRatioLoading,
    error: connectedUsersError,
  } = useFetchData<{
    status: string;
    data: { connected: number };
  }>(`/analytics/getConnectedUsersRatio`);

  //Fetch the overall PnL
  const { data: overallPnl, loading: pnlLoading } = useFetchData<{
    status: string;
    data: { data: { _id: string; totalPnL: number }[] };
  }>(
    `/analytics/pnl/overall?fromDate=${overallPnLdateRange[0].format(
      "YYYY-MM-DD"
    )}&toDate=${overallPnLdateRange[1].add(1,"day").format("YYYY-MM-DD")}`
  );
  const pnlCategories =
    overallPnl?.data?.data?.map((item) => dayjs(item._id).format("DD MMM")) ||
    [];
  const pnlData =
    overallPnl?.data?.data?.map((item) => Number(item.totalPnL.toFixed(2))) ||
    [];

  //Fetch the overall PnL
  const { data: overallWinLossResponse } =
    useFetchData<{
      status: string;
      data: { data: { winCnt: number; lossCnt: number } };
    }>(`/analytics/getOverallWinLossRation`);

  const handlePnLDateRangeChange = (dates: any) => {
    if (dates) {
      setOverallPnLDateRange(dates);
    }
  };
  const darkMode = useAppSelector((state) => state.theme.darkMode);
  const handleJournalDateRangeChange = (dates: any) => {
    if (dates) {
      setJournalDateRange(dates);
    }
  };

  return (
    <CustomLayout>
      <div className="p-10">
        <h1 className="text-3xl font-semibold">Hello Admin 👋</h1>
        {/* THE 1st ROW CARDS */}
        <Row gutter={16} className="mt-10 ">
          <Col span={6}>
            <StatsBox
              loading={isSummaryDataLoading}
              title={"Total Holdings Value"}
              value={summaryData?.totalHoldings.toFixed(2).toString()}
              color={darkMode ? "white" : "black"}
            />
          </Col>
          <Col span={6}>
            <StatsBox
              loading={isSummaryDataLoading}
              title={"Total Holdings Quantity"}
              value={summaryData?.totalHoldingsQuantity.toString()}
              color={darkMode ? "white" : "black"}
            />
          </Col>
          <Col span={6}>
            <StatsBox
              title={"Today's total PnL"}
              loading={isSummaryDataLoading}
              value={summaryData?.totalPnL.toFixed(2).toString()}
              color={darkMode ? "white" : "black"}
            />
          </Col>
          <Col span={6}>
            <StatsBox
              loading={isSummaryDataLoading}
              title={"Total's total trades"}
              value={summaryData?.totalTradesQuantity.toString()}
              color={darkMode ? "white" : "black"}
            />
          </Col>
        </Row>
        <Flex>
          <div className="w-[48%] h-[350px] flex flex-col border rounded-xl border-slate-200 dark:bg-dark-blue bg-white m-5 p-3">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-lg font-semibold">Response trend</h1>
              <DatePicker.RangePicker
                value={journalDateRange}
                onChange={handleJournalDateRangeChange}
              />
            </div>
            {isJournalResponseCountLoading ? (
              <div className="flex-1 flex items-center justify-center">
                Loading...
              </div>
            ) : formattedJournalResponseTrendData.length === 0 ? (
              <NoData />
            ) : (
              <AreaChart
                data={formattedJournalResponseTrendData}
                categories={journalResponseTrendCategory}
                title=""
                colors={["#6366F1", "#34D399"]}
                darkMode={darkMode}
              />
            )}
          </div>
          <div className="w-[48%] flex h-[350px] flex-col border rounded-xl border-slate-200 dark:bg-dark-blue bg-white m-5 p-3">
            <h1>Broker Connected User ratio</h1>
            {connectedUsersError && <h1>{connectedUsersError.message}</h1>}
            <RadialSemicircle
              value={
                Number(connectedUsersRatio?.data?.connected.toFixed(0)) || 0
              }
              darkMode={darkMode}
            />
          </div>
        </Flex>

        <Flex justify="space-between" className="mt-10">
          <div className="w-[48%] p-4 h-[350px] flex flex-col border rounded-xl border-slate-200 dark:bg-dark-blue bg-white m-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Net P&L</h2>
              <div className="flex items-center space-x-2">
                <Select
                  defaultValue="bar"
                  style={{ width: 120 }}
                  onChange={(value: "bar" | "line") => setGraphType(value)}
                  options={[
                    { value: "bar", label: "Bar" },
                    { value: "line", label: "Line" },
                  ]}
                />
                <DatePicker.RangePicker
                  value={overallPnLdateRange}
                  onChange={handlePnLDateRangeChange}
                />
              </div>
            </div>
            {pnlLoading ? (
              <div className="flex-1 flex items-center justify-center">
                Loading...
              </div>
            ) : (
              <div className="flex-1">
                <BarGraph
                  data={pnlData}
                  categories={pnlCategories}
                  title=""
                  colors={["#34D399", "#F87171"]}
                  darkMode={darkMode}
                  type={graphType}
                />
              </div>
            )}
          </div>

          <div className="w-[48%] p-4 h-[350px] flex flex-col border rounded-xl border-slate-200 dark:bg-dark-blue bg-white m-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Overall Win Percentage</h2>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <DonutChart
                title=""
                data={[
                  overallWinLossResponse?.data?.data.winCnt || 0,
                  overallWinLossResponse?.data?.data?.lossCnt || 0,
                ]}
                labels={["Winners", "Losers"]}
                colors={["#34D399", "#F87171"]}
                darkMode={darkMode}
              />
            </div>
          </div>
        </Flex>
      </div>
    </CustomLayout>
  );
};

export default AdminDashboard;
