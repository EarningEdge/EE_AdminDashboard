export interface IUser{
    _id:string;
    firstName:string;
    lastName:string;
    email:string;
    phoneNumber:string;
    role?:"mentor"|"admin";
    occupation?:string;
    isBrokerConnected?:boolean;
    profile_url_image?:string;
}
export interface IQuestion{
    key: string;
    question: string;
    type: string;
    responses: number;
    created: string;
    status: string;
    isPre: boolean;
    isRequired: boolean;
}


type PositionType = "LONG" | "SHORT" | "CLOSED";
type ExchangeSegment =
  | "NSE_EQ"
  | "NSE_FNO"
  | "NSE_CURRENCY"
  | "BSE_EQ"
  | "BSE_FNO"
  | "BSE_CURRENCY"
  | "MCX_COMM";
type ProductType = "CNC" | "INTRADAY" | "MARGIN" | "MTF" | "CO" | "BO";
type OptionType = "CALL" | "PUT";

export interface IPosition {
  userId:string;
  dhanClientId: string;
  tradingSymbol: string;
  securityId: string;
  positionType: PositionType;
  exchangeSegment: ExchangeSegment;
  productType: ProductType;
  buyAvg: number;
  buyQty: number;
  costPrice: number;
  sellAvg: number;
  sellQty: number;
  netQty: number;
  realizedProfit: number;
  unrealizedProfit: number;
  rbiReferenceRate: number;
  multiplier: number;
  carryForwardBuyQty: number;
  carryForwardSellQty: number;
  carryForwardBuyValue: number;
  carryForwardSellValue: number;
  dayBuyQty: number;
  daySellQty: number;
  dayBuyValue: number;
  daySellValue: number;
  drvExpiryDate: string;
  drvOptionType: OptionType;
  drvStrikePrice: number;
  crossCurrency: boolean;
}


type Exchange = "NSE" | "BSE" | "MCX" | "NCDEX";

export interface IHoldings {
  exchange: Exchange;
  tradingSymbol: string;
  securityId: string;
  isin: string;
  totalQty: number;
  dpQty: number;
  t1Qty: number;
  availableQty: number;
  collateralQty: number;
  avgCostPrice: number;
  userId: string;
}
