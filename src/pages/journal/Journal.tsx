import {
  Button,
  Tag,
  Input,
  message,
  DatePicker,
  ConfigProvider
} from 'antd'

import CustomTable from '../../components/common/table/CustomTable'
import CustomLayout from '../../components/layout/custom-layout/CustomLayout'
import useFetchData from '../../hooks/useFetchData'
import { useAppSelector } from '../../redux/hooks'
import { Link, Navigate } from 'react-router-dom'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
// import { yupResolver } from '@hookform/resolvers/yup'
// import * as yup from 'yup'
import usePostData from '../../hooks/usePostData'
import dayjs from 'dayjs'
import { JournalTypeSelector } from '../../components/common/journal-type-selector'
import { ReviewTypeSelector } from '../../components/common/journal-review-selector'
import { ReloadOutlined } from '@ant-design/icons'
import JournalDrawer from './JournalDrawer'

interface IFormInput {
  review: string
  rating: number
}
// const schema = yup
//   .object({
//     review: yup.string().required('Review is required').min(4).max(1000),
//     rating: yup.number().required('Rating is required')
//   })
//   .required()

const lightTheme = {
  token: {
    colorBgBase: '#ffffff',
    colorText: '#000000'
  }
}

const darkTheme = {
  token: {
    colorBgBase: '#262633',
    colorText: '#ffffff',
    colorTextPlaceholder: '#ffffff',
    colorBorder: '#ffffff',
    fill: '#ffffff',
    itemActiveBg: '#ffffff',
    itemColor: '#ffffff',
    itemHoverBg: '#ffffff'

    // Add more tokens as needed
  }
}
const Journal = () => {
  const user = useAppSelector(state => state.auth.user)
  const [showSideDrawer, setShowSideDrawer] = useState(false)
  const [showAddReviewDrawer, setShowAddReviewDrawer] = useState(false)
  const [selectedJournal, setSelectedJournal] = useState<null | any>(null)
  const [preData, setPreData] = useState<null | any>(null)
  const [postDatas, setPostDatas] = useState<null | any>(null)
  const [refresh, setRefresh] = useState(false)
  const [fileList, setFileList] = useState<any[]>([])
  const { RangePicker } = DatePicker
  const [positions, setPositions] = useState([]);
  // const [positionsLoading, setPositionsLoading] = useState(false);
  const fetchPositions = async () => {
    if (!selectedJournal?.userId?._id) return;
    // setPositionsLoading(true);
    try {
      const response = await fetch(`/api/getPositionsAdmin/${selectedJournal.userId._id}`);
      if (!response.ok) throw new Error('Failed to fetch positions');
      const data = await response.json();
      setPositions(data.data);
    } catch (error) {
      console.error('Error fetching positions:', error);
      message.error('Failed to fetch positions');
    } finally {
      // setPositionsLoading(false);
    }
  };

  const [filters, setFilters] = useState({
    searchTerm: '',
    journalType: '',
    reviewStatus: '',
    dateRange: [dayjs().format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')]
  })

  const {
    // data,
    loading: isReviewAdding,
    error: addReviewError,
    postData
  } = usePostData<any, any>(`/review/add/${user?.role}/${selectedJournal?._id}`)
  if (!user) {
    return <Navigate to={'/login'} />
  }
  const {
    data: journalData,
    loading,
    // error,
    fetchData
  } = useFetchData<any>(
    `journal/all/${user.role}?searchTerm=${filters.searchTerm}&type=${filters.journalType
    }&reviewStatus=${filters.reviewStatus}&fromDate=${filters.dateRange[0]
    }&toDate=${dayjs(filters.dateRange[1]).add(1, 'day').format('YYYY-MM-DD')}`
  )

  useEffect(() => {
    fetchData()
    fetchPositions();

  }, [filters, refresh])
  const handleFilterChange = (filterName: string, value: string | string[]) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterName]: value
    }))
  }
  const {
    // data: uploadData,
    loading: isUploading,
    error: uploadError,
    postData: uploadFiles
  } = usePostData<any, any>(`/review/upload/${selectedJournal?.reviewId}`)

  const handleUpload = async () => {
    const formData = new FormData()
    fileList.forEach(file => {
      formData.append('files', file)
    })
    formData.append('user', selectedJournal?.reviewId)
    try {
      await uploadFiles(formData)
      if (uploadError) {
        message.error(uploadError.message)
      } else {
        message.success('Upload successful')
        setFileList([])
      }
    } catch (error: any) {
      message.error(error?.message || 'Upload failed')
    }
  }

  const handleViewClick = (journal: any) => {
    setSelectedJournal(journal)

    const journalDate = new Date(journal.createdAt).toISOString().split('T')[0] // Extract the date part

    if (journal.type === 'exit') {
      // Assuming `journalData.data` holds all your journal entries
      const entryForSameDate = journalData.data.filter(
        (item: any) =>
          item.date === journal.date &&
          item.type === 'entry' &&
          new Date(item.createdAt).toISOString().split('T')[0] === journalDate
      )

      setPreData(entryForSameDate[0])
      setPostDatas(journal)
    } else {
      const entryForSameDate = journalData.data.filter(
        (item: any) =>
          item.date === journal.date &&
          item.type === 'exit' &&
          new Date(item.createdAt).toISOString().split('T')[0] === journalDate
      )

      setPreData(journal)
      setPostDatas(entryForSameDate[0])
    }

    setShowSideDrawer(true)
    fetchPositions()
  }

  const columns = [
    {
      title: 'Trader',
      dataIndex: 'userId',
      key: 'userId',
      render: (_: string, record: any) => {
        return (
          <div>
            <Link to={`/${user.role}/user/${record?.userId?._id}`}>
              {record?.userId?.firstName
                ? record?.userId?.firstName + ' ' + record?.userId?.lastName
                : "Couldn't fetch name"}
            </Link>
          </div>
        )
      }
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (text: string) => {
        return (
          <Tag color={text == 'exit' ? 'blue' : 'green'}>
            {!text ? "Couldn't get" : text.toUpperCase()}
          </Tag>
        )
      }
    },
    {
      title: 'Submitted',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => {
        return <h1>{moment(text || '').fromNow()}</h1>
      }
    },
    {
      title: 'Status',
      key: 'reviewId',
      dataIndex: 'reviewId',
      render: (status: string | null) => (
        <Tag color={status ? 'green' : 'red'}>
          {status ? 'Reviewed' : 'Pending'}
        </Tag>
      )
    },
    {
      title: 'Action',
      key: 'view',
      dataIndex: 'view',
      render: (_: any, record: any) => (
        <Button
          onClick={() => {
            setShowSideDrawer(true)
            setSelectedJournal(record)
            handleViewClick(record)
          }}
        >
          View
        </Button>
      )
    }
  ]
  const onSubmit: SubmitHandler<IFormInput> = async formData => {
    try {
      await postData({ value: formData.review, rating: formData.rating })
      if (addReviewError) {
        message.error(addReviewError.message)
      } else message.success('Review Added')
    } catch (error: any) {
      message.error(error?.message || 'Failed to add')
    }
  }
  const refreshTable = () => {
    setRefresh(!refresh)
  }

  const darkMode = useAppSelector(state => state.theme.darkMode)
  console.log(selectedJournal, 'selectedJournal')
  console.log(preData, 'preData')
  console.log(postDatas, 'postDatas')

  return (
    <CustomLayout>
      <div className='px-10'>
        <ConfigProvider theme={darkMode ? darkTheme : lightTheme}>
          <div className='flex w-full justify-between py-7'>
            <Input.Search
              placeholder='Search...'
              value={filters.searchTerm}
              allowClear
              onChange={e => handleFilterChange('searchTerm', e.target.value)}
              style={{ width: 200 }}
            />

            <div className='flex space-x-3'>
              <Button type='default' shape="circle" onClick={refreshTable} icon={<ReloadOutlined />} />
              <JournalTypeSelector handleFilterChange={handleFilterChange} />
              <ReviewTypeSelector handleFilterChange={handleFilterChange} />
              <RangePicker
                defaultValue={[dayjs(), dayjs()]}
                disabledDate={current =>
                  current && current > moment().endOf('day')
                }
                onChange={(_, dateStrings) =>
                  handleFilterChange('dateRange', dateStrings)
                }
                ranges={{
                  Today: [dayjs(), dayjs()],
                  Yesterday: [
                    dayjs().subtract(1, 'days'),
                    dayjs().subtract(1, 'days')
                  ],
                  'Last 7 Days': [dayjs().subtract(7, 'days'), dayjs()],
                  'Last 30 Days': [dayjs().subtract(30, 'days'), dayjs()]
                }}
                className='dark:bg-gray-800 dark:text-white'
              />
            </div>
          </div>
          <JournalDrawer
            showSideDrawer={showSideDrawer}
            setShowSideDrawer={setShowSideDrawer}
            selectedJournal={selectedJournal}
            setSelectedJournal={setSelectedJournal}
            preData={preData}
            setPreData={setPreData}
            postDatas={postDatas}
            setPostDatas={setPostDatas}
            showAddReviewDrawer={showAddReviewDrawer}
            setShowAddReviewDrawer={setShowAddReviewDrawer}
            fileList={fileList}
            setFileList={setFileList}
            isUploading={isUploading}
            handleUpload={handleUpload}
            loading={loading}
            positions={positions}
            form={{
              ...useForm()
            }}
            isReviewAdding={isReviewAdding}
            onSubmit={onSubmit}
          />

        </ConfigProvider>
        <CustomTable
          data={journalData && journalData?.data}
          loading={loading}
          totalDocuments={0}
          columns={columns}
        />
      </div>
    </CustomLayout>
  )
}

export default Journal
