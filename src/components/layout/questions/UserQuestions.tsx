import React, { useState, useEffect } from 'react'
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
  message
} from 'antd'

import EditIcon from '../../../assets/images/edit.svg'
import DeleteIcon from '../../../assets/images/trash.svg'
import axios from 'axios'
import { IQuestion } from '../../../types/data'
import CustomTable from '../../common/table/CustomTable'
import useQuestionsService from '../../../hooks/useQuestion'
import { PlusCircleOutlined } from '@ant-design/icons'
import useAxios from '../../../hooks/useAxios'
import { useAppSelector } from '../../../redux/hooks'
import { ReloadOutlined } from '@ant-design/icons'

const { Option } = Select

const QUESTION_URL = import.meta.env.VITE_BASE_URL + '/question'

const JournalManagement: React.FC = () => {
  const { getAllQuestions } = useQuestionsService()
  const [questions, setQuestions] = useState<IQuestion[]>([])
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [drawerType, setDrawerType] = useState<'add' | 'edit'>('add')
  const [currentQuestion, setCurrentQuestion] = useState<IQuestion | null>(null)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const [form] = Form.useForm()
  const axiosInstance = useAxios()

  const token = useAppSelector(state => state.auth.token)
  console.log('token: ', token)

  useEffect(() => {
    fetchQuestions()
  }, [refresh])

  const fetchQuestions = async () => {
    try {
      setIsLoading(true)
      const response = await getAllQuestions()
      if (response.data.status === 'success') {
        const fetchedQuestions = response.data.data.map((q: any) => ({
          key: q._id,
          question: q.title,
          type: q.type,
          responses: 0,
          created: new Date(q.createdAt).toDateString(),
          status: q.status ? 'Active' : 'Inactive',
          isPre: q.isPre,
          isRequired: q.isRequired
        }))
        setQuestions(fetchedQuestions)
      } else {
        message.error('Failed to fetch questions')
      }
    } catch (error) {
      message.error('An error occurred while fetching questions')
    } finally {
      setIsLoading(false)
    }
  }

  const showDrawer = (
    type: 'add' | 'edit',
    question: IQuestion | null = null
  ) => {
    setDrawerType(type)
    setCurrentQuestion(question)
    setDrawerVisible(true)
    if (question) {
      form.setFieldsValue(question)
    } else {
      form.resetFields()
    }
  }

  const closeDrawer = () => {
    setDrawerVisible(false)
    setCurrentQuestion(null)
  }

  const showDeleteConfirm = (question: IQuestion) => {
    setCurrentQuestion(question)
    setDeleteModalVisible(true)
  }

  const handleDelete = async () => {
    try {
      await axios.delete(`${QUESTION_URL}/delete/${currentQuestion?.key}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      message.success('Question deleted successfully')
      fetchQuestions()
      setDeleteModalVisible(false)
      setCurrentQuestion(null)
    } catch (error) {
      message.error('An error occurred while deleting the question')
    }
  }

  const handleEdit = (record: IQuestion) => {
    showDrawer('edit', record)
  }

  const handleFormSubmit = async (values: any) => {
    const payload = {
      ...values,
      question: values.title,
      status: true // Set status to true by default
    }

    try {
      if (drawerType === 'add') {
        await axios.post(`${QUESTION_URL}/create`, payload, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        message.success('Question added successfully')
      } else {
        // console.log(`${QUESTION_URL}/update/${currentQuestion?.key}`)
        await axios.put(
          `${QUESTION_URL}/update/${currentQuestion?.key}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
        message.success('Question updated successfully')
      }
      fetchQuestions()
      closeDrawer()
    } catch (error) {
      message.error('An error occurred while submitting the form')
    }
  }

  const toggleStatus = async (key: string) => {
    try {
      await axiosInstance.put(`/question/toggle-status/${key}`)
      message.success('Status toggled successfully')
      fetchQuestions() // Refresh the list after toggling status
    } catch (error) {
      console.log(error)
      console.log(axiosInstance)
      message.error('An error occurred while toggling the status')
    }
  }

  const refreshTable = () => {
    setRefresh(!refresh)
  }

  const columns = [
    {
      title: 'Question',
      dataIndex: 'question',
      key: 'question'
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type'
    },
    {
      title: 'Responses',
      dataIndex: 'responses',
      key: 'responses'
    },
    {
      title: 'Created',
      dataIndex: 'created',
      key: 'created'
    },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'status',
      render: (status: string, record: any) => (
        <Tag
          color={status === 'Active' ? 'green' : 'red'}
          onClick={() => toggleStatus(record.key)}
          className='cursor-pointer'
        >
          {status.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: IQuestion) => (
        <Space size='middle'>
          <img
            src={EditIcon}
            alt='Edit'
            onClick={() => handleEdit(record)}
            className='cursor-pointer'
          />
          <img
            src={DeleteIcon}
            alt='Delete'
            className='cursor-pointer'
            onClick={() => showDeleteConfirm(record)}
          />
        </Space>
      )
    }
  ]
  const darkMode = useAppSelector(state => state.theme.darkMode)

  return (
    <div className='p-10 '>
      <div className='flex w-full justify-between'>
        <h2 className='text-xl font-bold mb-4'>Manage Journal Questions</h2>
        <div className='flex gap-4'>
          <Button
            type='default'
            shape='circle'
            onClick={refreshTable}
            icon={<ReloadOutlined />}
          />
          <Button
            icon={<PlusCircleOutlined />}
            className=''
            type='dashed'
            onClick={() => showDrawer('add')}
          >
            Add Question
          </Button>
        </div>
      </div>
      <CustomTable
        data={questions}
        loading={isLoading}
        totalDocuments={questions.length}
        columns={columns}
      />
      <Drawer
        title={drawerType === 'add' ? 'Add Question' : 'Edit Question'}
        width={560}
        onClose={closeDrawer}
        visible={drawerVisible}
      >
        <Form form={form} layout='vertical' onFinish={handleFormSubmit}>
          <Form.Item
            name='title'
            label='Question Title'
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name='type'
            label='Question Type'
            rules={[{ required: true }]}
          >
            <Select>
              <Option value='Text'>Text</Option>
              <Option value='Number'>Number</Option>
              <Option value='Selection'>Selection</Option>
            </Select>
          </Form.Item>
          <Form.Item name='isRequired' valuePropName='checked'>
            <Checkbox>Required</Checkbox>
          </Form.Item>
          <Form.Item name='isPre' label='Pre-Question' valuePropName='checked'>
            <Switch />
          </Form.Item>
          <Form.Item>
            <Button type={darkMode ? 'default' : 'primary'} htmlType='submit'>
              {drawerType === 'add' ? 'Submit' : 'Update'}
            </Button>
          </Form.Item>
        </Form>
      </Drawer>

      <Modal
        title='Confirm Deletion'
        visible={deleteModalVisible}
        onOk={handleDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okText='Confirm'
        cancelText='Cancel'
      >
        <p>Are you sure you want to delete this question?</p>
      </Modal>
    </div>
  )
}

export default JournalManagement
