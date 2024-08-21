import React, { useState } from "react";
import { Col, DatePicker, Flex, Row, Select } from "antd";
import CustomLayout from "../../components/layout/custom-layout/CustomLayout";
import ProfileSection from "../../components/common/avatar-details/AvatarDetails";
import StatsBox from "../../components/common/profile-card/ProfileCard";
import RecentTradesTable from "../../components/common/table/RecentTrades";
import CustomCalendar from "../../components/common/calendar/Calendar";
import { useParams } from "react-router-dom";
import useFetchData from "../../hooks/useFetchData";
import BarGraph from "../../components/graphs/bar-graph/NewBar";
import DonutChart from "../../components/graphs/donut-chart/DonutChart";
import AreaChart from "../../components/graphs/area-chart/AreaChart";
import dayjs, { Dayjs } from "dayjs";

interface RatingResponse {
  status: string;
  data: {
    _id: string;
    averageRating: number;
  }[];
}

// interface MonthlyJournalEntry{
//   _id:string,
//   date:string
// }

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
  const [graphType, setGraphType] = useState<"line" | "bar">("bar");
  const [overallPnLdateRange, setOverallPnLDateRange] = useState<
    [Dayjs, Dayjs]
  >([dayjs().startOf("month"), dayjs()]);
  const [ratingsDateRange, setRatingsDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(7, "day"),
    dayjs(),
  ]);
  const [selectedMonth, setSelectedMonth] = useState(dayjs().month() + 1); // dayjs months are 0-indexed
  const [selectedYear, setSelectedYear] = useState(dayjs().year());
  //Fetch Personal data
  const {
    data: userData,
    loading,
    error,
  } = useFetchData<{ data: any }>(`/user/${userId}`);

  //Fetch Cards Data
  const { data: profileData } = useFetchData<ProfileDataResponse>(
    `/sales/users/${userId}`
  );
  console.log("profileData = ", profileData);

  //Fetch PnL data
  const { data: pnlDataResponse, loading: pnlLoading } = useFetchData<{
    status: string;
    data: { _id: string; totalPnL: number }[];
  }>(
    `/analytics/pnl/single/${userId}?fromDate=${overallPnLdateRange[0].format(
      "YYYY-MM-DD"
    )}&toDate=${overallPnLdateRange[1].add(1, "day").format("YYYY-MM-DD")}`
  );

  //Fetch Win Loss data
  const { data: winLossData } = useFetchData<{
    data: { win: number; loss: number };
  }>(`/analytics/getWinLossRatio/${userId}`);

  //Fetch ratings data
  const { data: ratingData } = useFetchData<RatingResponse>(
    `/analytics/ratingsTrend/${userId}?fromDate=${ratingsDateRange[0].format(
      "YYYY-MM-DD"
    )}&toDate=${ratingsDateRange[1].add(1, "day").format("YYYY-MM-DD")}`
  );

  //Fetch Monthly journal entries
  const { data: monthlyEntriesData, loading: monthlyEntriesLoading } =
    useFetchData<{
      status: string;
      data: { _id: string; date: string }[];
    }>(
      `/journal/monthlyEntry/admin/${userId}?month=${selectedMonth}&year=${selectedYear}`
    );
  const handleMonthYearChange = (date: Dayjs) => {
    setSelectedMonth(date.month() + 1);
    setSelectedYear(date.year());
  };

  const transformDataToArray = (data: any) => {
    if (!data || !data.data) return [];
    return Object.entries(data.data).map(([key, value]) => ({
      key: key,
      value: value,
      title: key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase()),
    }));
  };

  const dataArray = React.useMemo(
    () => transformDataToArray(profileData),
    [profileData]
  );

  const pnlCategories =
    pnlDataResponse?.data?.map((item) => dayjs(item._id).format("DD MMM")) ||
    [];
  const pnlData =
    pnlDataResponse?.data?.map((item) => Number(item.totalPnL.toFixed(2))) ||
    [];

  const formatValue = (value: string | number): string => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(numValue)) return value.toString();
    if (Number.isInteger(numValue)) return numValue.toString();
    return numValue.toFixed(2);
  };

  const handlePnLDateRangeChange = (dates: any) => {
    if (dates) setOverallPnLDateRange(dates);
  };

  const handleRatingDateRangeChange = (dates: any) => {
    if (dates) setRatingsDateRange(dates);
  };

  const ratingsData = React.useMemo(() => {
    if (!ratingData?.data) return [];
    return [
      {
        name: "Average Rating",
        data: ratingData.data.map((item) => item.averageRating),
      },
    ];
  }, [ratingData]);

  const ratingCategories = React.useMemo(() => {
    return (
      ratingData?.data?.map((item) => dayjs(item._id).format("DD MMM")) || []
    );
  }, [ratingData]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <CustomLayout>
      <div className="p-10 bg-slate-50">
        <ProfileSection user={userData && userData?.data} />
        <Row gutter={16} justify={"space-evenly"} align={"middle"} className="mt-10">
          {profileData?.data?.salesData.map((item) => (
            <React.Fragment key={item._id}>
              <Col span={6}>
                <StatsBox
                  title="Total Leads"
                  value={formatValue(item.usersCount)}
                  color={"black"}
                />
              </Col>
              <Col span={6}>
                <StatsBox
                  title="Total Paid Users"
                  value={formatValue(item.paidUsersCount)}
                  color={"black"}
                />
              </Col>
              <Col span={6}>
                <StatsBox
                  title="Referral Code"
                  value={item.referralCode}
                  color={"black"}
                />
              </Col>
            </React.Fragment>
          ))}
        </Row>
        <Flex justify="space-between" className="mt-10">
          <div className="w-[48%] p-4 h-[350px] flex flex-col border rounded-xl border-slate-200 bg-white">
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
                  darkMode={false}
                  type={graphType}
                />
              </div>
            )}
          </div>
          <div className="w-[48%] p-4 h-[350px] flex flex-col border rounded-xl border-slate-200 bg-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Overall Win Percentage</h2>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <DonutChart
                data={[winLossData?.data.win || 0, winLossData?.data.loss || 0]}
                labels={["Win", "Loss"]}
                title="Win vs Loss"
                colors={["#34D399", "#F87171"]}
              />
            </div>
          </div>
        </Flex>
        <div className="w-full flex flex-col mt-10">
          <div className="w-[100%] p-4 h-[350px] flex flex-col border rounded-xl border-slate-200 bg-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Review Rating Performance
              </h2>
              <div className="flex items-center space-x-2">
                <DatePicker.RangePicker
                  value={ratingsDateRange}
                  onChange={handleRatingDateRangeChange}
                />
              </div>
            </div>
            <AreaChart
              title=""
              data={ratingsData}
              categories={ratingCategories}
              colors={["#1453ff"]}
            />
          </div>
        </div>
        <div className="mt-10">
          <RecentTradesTable userId={userId!} />
        </div>
        <div className="mt-10">
          <div className="mt-10">
            {monthlyEntriesLoading ? (
              <p>Loading calendar data...</p>
            ) : (
              <CustomCalendar
                dailyEntries={monthlyEntriesData?.data || []}
                userId={userId || ""}
                onMonthYearChange={handleMonthYearChange}
              />
            )}
          </div>
        </div>
      </div>
    </CustomLayout>
  );
};

export default BDUserProfile;
