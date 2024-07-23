import React, { useState, useEffect } from "react";
import { useSupabase } from "../../context/supaBaseContext";
import { useAppSelector } from "../../redux/hooks";
import { Navigate } from "react-router-dom";
import {
  ExchangeSegment,
  IPosition,
  OptionType,
  PositionType,
  ProductType,
} from "../../types/data";
import { RealtimeChannel } from "@supabase/supabase-js";
import CustomLayout from "../../components/layout/custom-layout/CustomLayout";
import {  Modal, Tag } from "antd";
import { ExpandOutlined, UserOutlined } from "@ant-design/icons";
import Table, { ColumnsType } from "antd/es/table";

interface UserPositions {
  user: string;
  userProfile: string;
  userFirstName: string;
  userLastName: string;
  mentorId?: string | null;
  positions: IPosition[];
  PnL: number;
  totalTradesBrought: number;
  totalTradesSold: number;
  netTrades: number;
  totalTradeValue: number;
  balance:number;
}

const Live: React.FC = () => {
  const [liveData, setLiveData] = useState<UserPositions[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserPositions | null>(null);
  const showModal = (userData: UserPositions) => {
    setSelectedUser(userData);
    setIsModalVisible(true);
  };
  const columns: ColumnsType<IPosition> = [
    {
      title: "Trading Symbol",
      dataIndex: "tradingSymbol",
      key: "tradingSymbol",
    },
    {
      title: "Position Type",
      dataIndex: "positionType",
      key: "positionType",
      render:(text)=><Tag color={text=="CLOSED"?"orange":"blue"}>{text}</Tag>
    },
    {
      title: "Buy Qty",
      dataIndex: "buyQty",
      key: "buyQty",
    },
    {
      title: "Sell Qty",
      dataIndex: "sellQty",
      key: "sellQty",
    },
    {
      title: "Net Qty",
      dataIndex: "netQty",
      key: "netQty",
    },
    {
      title: "Realized Profit",
      dataIndex: "realizedProfit",
      key: "realizedProfit",
      render: (value: number) => {
        return (
          <p
            className={`${value < 0 ? "text-red-600" : "text-green-600"}`}
          >{`₹${value.toFixed(2)}`}</p>
        );
      },
    },
    {
      title: "Unrealized Profit",
      dataIndex: "unrealizedProfit",
      key: "unrealizedProfit",
      render: (value: number) => {
        return (
          <p className={`${value < 0 ? "text-red-600" : "text-green-600"}`}>
            {" "}
            {`₹${value.toFixed(2)}`}
          </p>
        );
      },
    },
    {
      title: "Total Profit",
      dataIndex: "totalProfit",
      key: "totalProfit",
      render: (_: number, record) => {
        const totalProfit =
          Number(record.realizedProfit) + Number(record.unrealizedProfit);
        return (
          <div>
            <p
              className={`${
                totalProfit < 0 ? "text-red-600" : "text-green-600"
              }`}
            >
              {totalProfit.toFixed(2)}
            </p>
          </div>
        );
      },
    },
  ];
  const user = useAppSelector((state) => state.auth.user);
  if (!user) return <Navigate to={"/login"} />;
  const supabase = useSupabase();
  useEffect(() => {
    const fetchInitialData = async () => {
      let query = supabase.from("positions").select("*");
      if (user.role === "mentor") {
        query = query.eq("mentor_id", user._id);
      } else if (user.role !== "admin") {
        query = query.eq("user_id", user._id);
      }
      const { data, error } = await query;

      if (error) {
        console.error("Error fetching initial data:", error);
        return;
      }

      const formattedData = formatData(data);
      setLiveData(formattedData);
    };

    fetchInitialData();

    const channel: RealtimeChannel = supabase
      .channel("table-db-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "positions",
        },
        (payload) => handleRealtimeUpdate(payload)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const formatData = (data: any[]): UserPositions[] => {
    const groupedData: { [key: string]: UserPositions } = {};

    data.forEach((position) => {
      const userId = position.user_id as string;
      console.log(position.profile_image_url);
      if (!groupedData[userId]) {
        groupedData[userId] = {
          balance:position.balance,
          user: userId,
          userFirstName: position.user_firstname || "",
          userLastName: position.user_lastname || "",
          userProfile: position.profile_image_url || "/avatar.png",
          mentorId: position.mentor_id,
          positions: [],
          PnL: 0,
          totalTradesBrought: 0,
          totalTradesSold: 0,
          netTrades: 0,
          totalTradeValue: 0,
        };
      }
      const mappedPosition: IPosition = {
        userId: position.user_id,
        dhanClientId: position.dhan_client_id,
        tradingSymbol: position.trading_symbol,
        securityId: position.security_id,
        positionType: position.position_type as PositionType,
        exchangeSegment: position.exchange_segment as ExchangeSegment,
        productType: position.product_type as ProductType,
        buyAvg: position.buy_avg,
        buyQty: position.buy_qty,
        costPrice: position.cost_price,
        sellAvg: position.sell_avg,
        sellQty: position.sell_qty,
        netQty: position.net_qty,
        realizedProfit: position.realized_profit,
        unrealizedProfit: position.unrealized_profit,
        rbiReferenceRate: position.rbi_reference_rate,
        multiplier: position.multiplier,
        carryForwardBuyQty: position.carry_forward_buy_qty,
        carryForwardSellQty: position.carry_forward_sell_qty,
        carryForwardBuyValue: position.carry_forward_buy_value,
        carryForwardSellValue: position.carry_forward_sell_value,
        dayBuyQty: position.day_buy_qty,
        daySellQty: position.day_sell_qty,
        dayBuyValue: position.day_buy_value,
        daySellValue: position.day_sell_value,
        drvExpiryDate: position.drv_expiry_date,
        drvOptionType: position.drv_option_type as OptionType,
        drvStrikePrice: position.drv_strike_price,
        crossCurrency: position.cross_currency,
      };
      groupedData[userId].positions.push(mappedPosition);
      //   groupedData[userId].PnL= mappedPosition.positionType=="CLOSED"? groupedData[userId].PnL+mappedPosition.realizedProfit: groupedData[userId].PnL+ mappedPosition.realizedProfit + mappedPosition.unrealizedProfit;
      groupedData[userId].PnL +=
        mappedPosition.realizedProfit + mappedPosition.unrealizedProfit;
      groupedData[userId].totalTradesBrought += mappedPosition.dayBuyQty;
      groupedData[userId].totalTradesSold += mappedPosition.daySellQty;
      groupedData[userId].totalTradeValue += mappedPosition.dayBuyValue;
      groupedData[userId].netTrades +=
        mappedPosition.dayBuyQty - mappedPosition.daySellQty;
    });

    return Object.values(groupedData);
  };

  const handleRealtimeUpdate = (payload: any) => {
    setLiveData((prevData) => {
      const newData = [...prevData];
      const { new: newPosition, old: _, eventType } = payload;

      const mappedPosition: IPosition = {
        userId: newPosition.user_id,
        dhanClientId: newPosition.dhan_client_id,
        tradingSymbol: newPosition.trading_symbol,
        securityId: newPosition.security_id,
        positionType: newPosition.position_type as PositionType,
        exchangeSegment: newPosition.exchange_segment as ExchangeSegment,
        productType: newPosition.product_type as ProductType,
        buyAvg: newPosition.buy_avg,
        buyQty: newPosition.buy_qty,
        costPrice: newPosition.cost_price,
        sellAvg: newPosition.sell_avg,
        sellQty: newPosition.sell_qty,
        netQty: newPosition.net_qty,
        realizedProfit: newPosition.realized_profit,
        unrealizedProfit: newPosition.unrealized_profit,
        rbiReferenceRate: newPosition.rbi_reference_rate,
        multiplier: newPosition.multiplier,
        carryForwardBuyQty: newPosition.carry_forward_buy_qty,
        carryForwardSellQty: newPosition.carry_forward_sell_qty,
        carryForwardBuyValue: newPosition.carry_forward_buy_value,
        carryForwardSellValue: newPosition.carry_forward_sell_value,
        dayBuyQty: newPosition.day_buy_qty,
        daySellQty: newPosition.day_sell_qty,
        dayBuyValue: newPosition.day_buy_value,
        daySellValue: newPosition.day_sell_value,
        drvExpiryDate: newPosition.drv_expiry_date,
        drvOptionType: newPosition.drv_option_type as OptionType,
        drvStrikePrice: newPosition.drv_strike_price,
        crossCurrency: newPosition.cross_currency,
        
      };

      const userIndex = newData.findIndex(
        (item) => item.user === mappedPosition.userId
      );

      if (eventType === "INSERT" && userIndex === -1) {
        newData.push({
            user: mappedPosition.userId,
            userFirstName: newPosition.user_firstname || "",
            userLastName: newPosition.user_lastname || "",
            userProfile: newPosition.profile_image_url || "",
            mentorId: newPosition.mentor_id,
            positions: [mappedPosition],
            PnL: 0,
            totalTradesBrought: 0,
            totalTradesSold: 0,
            netTrades: 0,
            totalTradeValue: 0,
            balance:newPosition?.balance,
        });
      } else if (userIndex !== -1) {
        const positionIndex = newData[userIndex].positions.findIndex(
          (p) => p.securityId === mappedPosition.securityId
        );

        if (eventType === "INSERT" || eventType === "UPDATE") {
          if (positionIndex === -1) {
            newData[userIndex].positions.push(mappedPosition);
          } else {
            newData[userIndex].positions[positionIndex] = mappedPosition;
          }
          // Update PnL and totalTrades
          newData[userIndex].PnL = newData[userIndex].positions.reduce(
            (total, pos) => total + (pos.realizedProfit + pos.unrealizedProfit),
            0
          );
          newData[userIndex].totalTradeValue = newData[
            userIndex
          ].positions.reduce((total, pos) => total + pos.dayBuyValue, 0);
          newData[userIndex].totalTradesBrought = newData[
            userIndex
          ].positions.reduce((total, pos) => total + pos.dayBuyQty, 0);
          newData[userIndex].totalTradesSold = newData[
            userIndex
          ].positions.reduce((total, pos) => total + pos.daySellQty, 0);
          newData[userIndex].netTrades = newData[userIndex].positions.reduce(
            (total, pos) => total + (pos.dayBuyQty - pos.daySellQty),
            0
          );
        } else if (eventType === "DELETE") {
          if (positionIndex !== -1) {
            newData[userIndex].positions.splice(positionIndex, 1);
            // Update PnL and totalTrades after deletions
            newData[userIndex].PnL = newData[userIndex].positions.reduce(
              (total, pos) =>
                total + (pos.realizedProfit + pos.unrealizedProfit),
              0
            );

            newData[userIndex].totalTradeValue = newData[
              userIndex
            ].positions.reduce((total, pos) => total + pos.dayBuyValue, 0);
            newData[userIndex].totalTradesBrought = newData[
              userIndex
            ].positions.reduce((total, pos) => total + pos.dayBuyQty, 0);
            newData[userIndex].totalTradesSold = newData[
              userIndex
            ].positions.reduce((total, pos) => total + pos.daySellQty, 0);
            newData[userIndex].netTrades = newData[userIndex].positions.reduce(
              (total, pos) => total + (pos.dayBuyQty - pos.daySellQty),
              0
            );
          }
          if (newData[userIndex].positions.length === 0) {
            newData.splice(userIndex, 1);
          }
        }
      }

      return newData;
    });
  };

  return (
    <CustomLayout>
      <div>
        <h1 className=" text-3xl font-semibold px-5 py-4">Live Positions</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-6">
          {liveData.map((userData) => (
            <div
              key={userData.user}
              className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105"
            >
              <div className="relative p-4 ">
                <img
                  src={userData.userProfile || "/avatar.png"}
                  alt="User Profile"
                  className="h-32 w-32 object-cover  rounded-full"
                />
              </div>
              <div className="p-4 pt-0">
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                  {userData.userFirstName} {userData.userLastName}
                </h2>
                <div className="text-sm text-gray-600 space-y-2">
                  <p className="flex justify-between">
                    <span>P&L:</span>
                    <span
                      className={`font-medium ${
                        userData.PnL >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      ₹{userData.PnL.toFixed(2)}
                    </span>
                  </p>
                  {/* <p className="flex justify-between">
                    <span>Trades Brought:</span>
                    <span className="font-medium">
                      {userData.totalTradesBrought}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span>Trades Sold:</span>
                    <span className="font-medium">
                      {userData.totalTradesSold}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span>Net Trades:</span>
                    <span className="font-medium">{userData.netTrades}</span>
                  </p> */}
                  <p className="flex justify-between ">
                    <span>Total Trade Value:</span>
                    <span className="font-medium">
                      ₹{userData.totalTradeValue.toLocaleString()}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span>Capital Balance:</span>
                    <span className="font-medium">
                      ₹{userData?.balance?.toLocaleString()}
                    </span>
                  </p>
                </div>
              </div>
              <div className="px-4 py-3 bg-gray-100 flex  flex-wrap">
              <button
                  className="w-full bg-white mb-2 hover:bg-blue-600 text-blue-500 font-medium py-2 px-4 rounded-md transition duration-300 ease-in-out flex items-center justify-center"
                  onClick={() => showModal(userData)}
                >
                  <UserOutlined className="mr-2" />
                  Visit profile
                </button>
                <button
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition duration-300 ease-in-out flex items-center justify-center"
                  onClick={() => showModal(userData)}
                >
                  <ExpandOutlined className="mr-2" />
                  View positions
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Modal
        title={`Positions for ${selectedUser?.userFirstName} ${selectedUser?.userLastName}`}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={1000}
      >
        <Table
          columns={columns}
          dataSource={selectedUser?.positions}
          rowKey="securityId"
          pagination={{ pageSize: 10 }}
        />
      </Modal>
    </CustomLayout>
  );
};

export default Live;