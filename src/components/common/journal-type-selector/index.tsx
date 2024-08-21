import {
  Button,
  Dropdown,
  Menu,
  MenuProps,
} from "antd";

type MenuItem = Required<MenuProps>["items"][number];

const menuItems: MenuItem[] = [
  {
    key: "all",
    label: "All",
  },
  {
    key: "entry",
    label: "Entry",
  },
  {
    key: "exit",
    label: "Exit",
  },
];

export const JournalTypeSelector = ({
  handleFilterChange,
}: {
  handleFilterChange: (key: string, value: string) => void;
}) => {
  const handleDropdownSelect: MenuProps["onClick"] = ({ key }) => {
    handleFilterChange("journalType", key);
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
        <Button>Journal Type</Button>
      </Dropdown>
    </>
  );
};
