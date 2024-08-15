import React, { useState, useEffect } from "react";
import {
  Tag,
  Button,
  Space,
  Drawer,
  Form,
  Input,
  Select,
  Checkbox,
  Modal,
  Switch,
  message,
} from "antd";

import EditIcon from "../../assets/images/edit.svg";
import DeleteIcon from "../../assets/images/trash.svg";
import axios from "axios";
import { IAlert, IQuestion } from "../../types/data";
import CustomTable from "../../components/common/table/CustomTable";
import useQuestionsService from "../../hooks/useQuestion";
import { PlusCircleOutlined } from "@ant-design/icons";
import useAxios from "../../hooks/useAxios";
import { useAppSelector } from "../../redux/hooks";
import { ReloadOutlined } from "@ant-design/icons";
import CustomLayout from "../../components/layout/custom-layout/CustomLayout";
import useAlertsService from "../../hooks/useAlert";

const { Option } = Select;

const ALERT_URL = import.meta.env.VITE_BASE_URL + "/adminAlert";

const Alerts: React.FC = () => {
  const { getAlerts } = useAlertsService();
  const [alerts, setAlerts] = useState<IQuestion[]>([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerType, setDrawerType] = useState<"add" | "edit">("add");
  const [currentAlert, setCurrentAlert] = useState<IAlert | null>(
    null
  );
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [form] = Form.useForm();
  const axiosInstance = useAxios();

  const token = useAppSelector((state) => state.auth.token);
  console.log("token: ", token);

  useEffect(() => {
    fetchAlerts();
  }, [refresh]);

  const fetchAlerts = async () => {
    try {
      setIsLoading(true);
      const response = await getAlerts();
      if (response.data.status === "success") {
        const fetchedAlerts = response.data.data.map((a: any, index:any) => ({
          key: a._id,
          sno: index +1,
          alert: a.value,
          created: new Date(a.createdAt).toDateString(),
        }));
        setAlerts(fetchedAlerts);
      } else {
        message.error("Failed to fetch alerts");
      }
    } catch (error) {
      message.error("An error occurred while fetching alerts");
    } finally {
      setIsLoading(false);
    }
  };

  const showDrawer = (
    type: "add" | "edit",
    alert: IAlert | null = null
  ) => {
    setDrawerType(type);
    setCurrentAlert(alert);
    setDrawerVisible(true);
    if (alert) {
      form.setFieldsValue(alert);
    } else {
      form.resetFields();
    }
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
    setCurrentAlert(null);
  };

  const showDeleteConfirm = (alert: IAlert) => {
    console.log(alert)
    setCurrentAlert(alert);
    setDeleteModalVisible(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${ALERT_URL}/deleteAlert/${currentAlert?.key}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      message.success("Alert deleted successfully");
      fetchAlerts();
      setDeleteModalVisible(false);
      setCurrentAlert(null);
    } catch (error) {
      message.error("An error occurred while deleting the alert");
    }
  };

  const handleEdit = (record: IAlert) => {
    showDrawer("edit", record);
  };

  const handleFormSubmit = async (values: any) => {
    const payload = {
      ...values,
      value: values.title,
    };

    try {
      if (drawerType === "add") {
        await axios.post(`${ALERT_URL}/createAlert`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        message.success("Alert added successfully");
      } else {
        // console.log(`${QUESTION_URL}/update/${currentQuestion?.key}`)
        await axios.put(
          `${ALERT_URL}/updateAlert/${currentAlert?.key}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        message.success("Alert updated successfully");
      }
      fetchAlerts();
      closeDrawer();
    } catch (error) {
      message.error("An error occurred while submitting the form");
    }
  };

  // const toggleStatus = async (key: string) => {
  //   try {
  //     await axiosInstance.put(`/question/toggle-status/${key}`);
  //     message.success("Status toggled successfully");
  //     fetchAlerts(); // Refresh the list after toggling status
  //   } catch (error) {
  //     console.log(error);
  //     console.log(axiosInstance);
  //     message.error("An error occurred while toggling the status");
  //   }
  // };

  const refreshTable = () => {
    setRefresh(!refresh);
  };

  const columns = [
    {
      title: "SNo",
      dataIndex: "sno",
      key: "sno",
    },
    {
      title: "Alert",
      dataIndex: "alert",
      key: "alert",
    },
    {
      title: "Created",
      dataIndex: "created",
      key: "created",
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: IAlert) => (
        <Space size="middle">
          <img
            src={EditIcon}
            alt="Edit"
            onClick={() => handleEdit(record)}
            className="cursor-pointer"
          />
          <img
            src={DeleteIcon}
            alt="Delete"
            className="cursor-pointer"
            onClick={() => showDeleteConfirm(record)}
          />
        </Space>
      ),
    },
  ];
  const darkMode = useAppSelector((state) => state.theme.darkMode);

  return (
    <CustomLayout>
      <div className="p-10 ">
        <div className="flex w-full justify-between">
          <h2 className="text-xl font-bold mb-4">Manage Admin Alerts</h2>
          <div className="flex gap-4">
            {/* <Button
              type="default"
              shape="circle"
              onClick={refreshTable}
              icon={<ReloadOutlined />}
            /> */}
            <Button
              icon={<PlusCircleOutlined />}
              className=""
              type="dashed"
              onClick={() => showDrawer("add")}
            >
              Add Alert
            </Button>
          </div>
        </div>
        <CustomTable
          data={alerts}
          loading={isLoading}
          totalDocuments={alerts.length}
          columns={columns}
        />
        <Drawer
          title={drawerType === "add" ? "Add Alert" : "Edit Alert"}
          width={560}
          onClose={closeDrawer}
          visible={drawerVisible}
        >
          <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
            <Form.Item
              name="title"
              label="Alert value"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            {/* <Form.Item
              name="type"
              label="Question Type"
              rules={[{ required: true }]}
            >
              <Select>
                <Option value="Text">Text</Option>
                <Option value="Number">Number</Option>
                <Option value="Selection">Selection</Option>
              </Select>
            </Form.Item> */}
            {/* <Form.Item name="isRequired" valuePropName="checked">
              <Checkbox>Required</Checkbox>
            </Form.Item> */}
            {/* <Form.Item
              name="isPre"
              label="Pre-Question"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item> */}
            <Form.Item>
              <Button type={darkMode ? "default" : "primary"} htmlType="submit">
                {drawerType === "add" ? "Submit" : "Update"}
              </Button>
            </Form.Item>
          </Form>
        </Drawer>

        <Modal
          title="Confirm Deletion"
          visible={deleteModalVisible}
          onOk={handleDelete}
          onCancel={() => setDeleteModalVisible(false)}
          okText="Confirm"
          cancelText="Cancel"
        >
          <p>Are you sure you want to delete this Alert?</p>
        </Modal>
      </div>
    </CustomLayout>
  );
};

export default Alerts;
