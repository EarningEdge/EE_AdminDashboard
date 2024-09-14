import { Button, Dropdown, Menu, MenuProps, Select } from "antd";

type MenuItem = Required<MenuProps>["items"][number];

// const menuItems: MenuItem[] = [
//   {
//     key: "all",
//     label: "All",
//   },
//   {
//     key: "entry",
//     label: "Entry",
//   },
//   {
//     key: "exit",
//     label: "Exit",
//   },
// ];

export const JournalTypeSelector = ({
  handleFilterChange,
}: {
  handleFilterChange: (key: string, value: string) => void;
}) => {
  // const handleDropdownSelect: MenuProps["onClick"] = ({ key }) => {
  //   handleFilterChange("journalType", key);
  // };
  const handleChange = (value: string) => {
    handleFilterChange("journalType", value);
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
          { value: "entry", label: "Entry" },
          { value: "exit", label: "Exit" },
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
        <Button>Journal Type</Button>
      </Dropdown> */}
    </>
  );
};
