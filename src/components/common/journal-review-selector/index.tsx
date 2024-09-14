import { Select } from "antd";

// type MenuItem = Required<MenuProps>["items"][number];
// const menuItems: MenuItem[] = [
//   {
//     key: "all",
//     label: "All",
//   },
//   {
//     key: "reviewed",
//     label: "Reviewed",
//   },
//   {
//     key: "pending",
//     label: "Pending",
//   },
// ];


export const ReviewTypeSelector = ({
  handleFilterChange,
}: {
  handleFilterChange: (key: string, value: string) => void;
}) => {
  // const handleDropdownSelect: MenuProps["onClick"] = ({ key }) => {
  //   handleFilterChange("reviewStatus", key);
  // };
  const handleChange = (value: string) => {
    handleFilterChange("reviewStatus", value);
    console.log(`selected ${value}`);
  };
  return (
    <>
    <Select
        defaultValue="all"
        style={{ width: 120 }}
        onChange={handleChange}
        options={[
          { value: "all", label: "All" },
          { value: "reviewed", label: "Reviewed" },
          { value: "pending", label: "Pending" },
        ]}
      />
      {/* <Dropdown
        overlay={
          <Menu
            items={menuItems}
            selectable
            defaultSelectedKeys={["all"]}
            onClick={handleDropdownSelect}
          />
        }
        placement="bottomRight"
        arrow
      >
        <Button>Journal Status</Button>
      </Dropdown> */}
    </>
  );
};
