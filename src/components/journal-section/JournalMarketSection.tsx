import { Button, Carousel, CarouselProps, List, Rate, Tag } from 'antd'
import { useAppSelector } from '../../redux/hooks'

const JournalMarketSection = ({
  selectedJournal,
  setShowAddReviewDrawer,
  text
}: {
  selectedJournal: any
  setShowAddReviewDrawer: (s: boolean) => void
  text: string
}) => {
  const settings: CarouselProps = {
    dots: true,
    infinite: true,
    draggable: true,
    arrows: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  }

  const darkMode = useAppSelector((state) => state.theme.darkMode)

  const getClassName = (lightClass: string, darkClass: string) => 
    darkMode ? darkClass : lightClass;

  return (
    <div className={`border p-2 overflow-auto shadow-md ${getClassName('bg-white text-black', 'bg-gray-900 text-white')}`}>
      {selectedJournal ? (
        <div className={`border-b-[0.5px] mb-3 ${getClassName('border-slate-300', 'border-gray-700')}`}>
          <div className='flex justify-between'>
            <h2 className='text-xl mb-2'>{text}</h2>
            {selectedJournal?.reviewId ? (
              <Tag
                color='green'
                className={`flex items-center ${getClassName('', 'bg-green-800')}`}
              >
                {'Reviewed By ' + selectedJournal?.review.reviewerId}
              </Tag>
            ) : (
              <div className='flex flex-col'>
                <Button
                  onClick={() => {
                    setShowAddReviewDrawer(true)
                  }}
                  className={getClassName('', 'bg-gray-800 text-white')}
                >
                  Add Review
                </Button>
                <span className='text-orange-500'>Review pending</span>
              </div>
            )}
          </div>
          <List
            dataSource={selectedJournal.responses}
            renderItem={(item: any, index: number) => (
              <List.Item key={index}>
                <List.Item.Meta
                  title={
                    <div>
                      <h1 className={getClassName('', 'text-white')}>Question:</h1>
                      <h1 className={`w-full px-3 py-2 rounded-md border-[0.5px] ${getClassName('border-slate-300', 'border-gray-700 bg-gray-800 text-white')}`}>
                        {item?.question?.title}
                      </h1>
                    </div>
                  }
                  description={
                    <div>
                      <h1 className={getClassName('', 'text-white')}>Response:</h1>
                      <h1 className={`w-full px-3 py-2 rounded-md border-[0.5px] ${getClassName('border-slate-300', 'border-gray-700 bg-gray-800 text-white')}`}>
                        {item?.answer}
                      </h1>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
          <div className={`border-b-[0.5px] pb-3 mb-3 ${getClassName('border-slate-300', 'border-gray-700')}`}>
            <h1 className={`text-xl ${getClassName('', 'text-white')}`}>Emotions:</h1>
            <h1 className={`w-full text-sm text-gray-400 px-3 py-2 rounded-md bg-slate-100 border-[0.5px] ${getClassName('border-slate-300', 'border-gray-700 bg-gray-800 text-gray-400')}`}>
              {selectedJournal?.emotion?.value || 'Not recorded'}
            </h1>
          </div>

          <div className={`border-b-[0.5px] pb-3 mb-3 ${getClassName('border-slate-300', 'border-gray-700')}`}>
            <h1 className={`text-xl mb-2 ${getClassName('', 'text-white')}`}>
              Uploads by user:
            </h1>
            {selectedJournal?.uploads?.length === 0 ? (
              <h1 className={getClassName('', 'text-white')}>No Uploads Found</h1>
            ) : (
              <Carousel {...settings}>
                {selectedJournal?.uploads?.map((upload: any, ind: number) => (
                  <div
                    className={`border rounded-md ${getClassName('border-slate-200', 'border-gray-700')}`}
                    key={ind}
                  >
                    <img
                      src={upload.fileUrl}
                      alt={`Upload ${ind + 1}`}
                      style={{
                        width: '100%',
                        height: 'auto',
                        maxHeight: '150px',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                ))}
              </Carousel>
            )}
          </div>

          <div>
            <h1 className={`text-xl mb-2 ${getClassName('', 'text-white')}`}>
              Review By Mentor/Admin:
            </h1>
            {!selectedJournal?.reviewId ? (
              <h1 className={getClassName('', 'text-white')}>No Reviews yet</h1>
            ) : (
              <div>
                <h1 className={`w-full px-3 py-2 rounded-md bg-slate-100 border-[0.5px] ${getClassName('border-slate-300', 'border-gray-700 bg-gray-800 text-white')}`}>
                  {selectedJournal?.review?.value}
                </h1>
                {selectedJournal?.review && (
                  <div className='flex items-center my-3 space-x-2'>
                    <Rate
                      disabled
                      value={selectedJournal?.review?.rating}
                    />
                    <Tag>
                      {selectedJournal?.review?.rating + ' stars'}
                    </Tag>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <h2>No {text} Data Found</h2>
      )}
    </div>
  )
}

export default JournalMarketSection
