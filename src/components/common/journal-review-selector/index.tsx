import { Button, Dropdown, Menu, MenuProps } from "antd";

type MenuItem = Required<MenuProps>["items"][number];
const menuItems: MenuItem[] = [
  {
    key: "all",
    label: "All",
  },
  {
    key: "reviewed",
    label: "Reviewed",
  },
  {
    key: "pending",
    label: "Pending",
  },
];


export const ReviewTypeSelector = ({
  handleFilterChange,
}: {
  handleFilterChange: (key: string, value: string) => void;
}) => {
  const handleDropdownSelect: MenuProps["onClick"] = ({ key }) => {
    handleFilterChange("reviewStatus", key);
  };
  return (
    <>
      <Dropdown
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
      </Dropdown>
    </>
  );
};
