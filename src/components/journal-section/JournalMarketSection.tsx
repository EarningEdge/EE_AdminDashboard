import { Button, Carousel, CarouselProps, List, Rate, Tag } from 'antd'

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
    
        slidesToScroll: 1
      }
  return (
    <div className='border p-2 overflow-auto shadow-md dark:bg-gray-900 dark:text-white'>
      {selectedJournal && (
        <div className='border-b-[0.5px] border-slate-300 mb-3 dark:border-gray-700'>
          <div className='flex justify-between'>
            <h2 className='text-xl mb-2'>{text}</h2>
            {selectedJournal?.reviewId ? (
              <Tag
                color='green'
                className='flex items-center dark:bg-green-800'
              >
                {'Reviewed By ' + selectedJournal?.review.reviewerId}
              </Tag>
            ) : (
              <div className='flex flex-col'>
                <Button
                  onClick={() => {
                    setShowAddReviewDrawer(true)
                  }}
                  className='dark:bg-gray-800 dark:text-white'
                >
                  Add Review
                </Button>
                <span className='text-orange-500'>Review pending </span>
              </div>
            )}
          </div>
          {selectedJournal && (
            <>
            <List
              dataSource={selectedJournal.responses}
              renderItem={(item: any, index: number) => (
                <List.Item key={index}>
                  <List.Item.Meta
                    title={
                      <div>
                        <h1 className='dark:text-white'>Question:</h1>
                        <h1 className='w-full px-3 py-2 rounded-md border-[0.5px] border-slate-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white'>
                          {item?.question?.title}
                        </h1>
                      </div>
                    }
                    description={
                      <div>
                        <h1 className='dark:text-white'>Response:</h1>
                        <h1 className='w-full px-3 py-2 rounded-md border-[0.5px] border-slate-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white'>
                          {item?.answer}
                        </h1>
                      </div>
                    }
                  />
                </List.Item>
                
              )}
            />
            <div className='border-b-[0.5px] border-slate-300 pb-3 mb-3 dark:border-gray-700'>
                  <h1 className='text-xl dark:text-white'>Emotions:</h1>
                  <h1 className='w-full text-sm text-gray-400 px-3 py-2 rounded-md bg-slate-100 border-[0.5px] border-slate-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400'>
                    {selectedJournal?.emotion?.value || 'Not recorded'}
                  </h1>
                </div>

                  <div className='border-b-[0.5px] border-slate-300 pb-3 mb-3 dark:border-gray-700'>
                    <h1 className='text-xl mb-2 dark:text-white'>
                      Uploads by user:
                    </h1>
                    {selectedJournal?.uploads?.length === 0 ? (
                      <h1 className='dark:text-white'>No Uploads Found</h1>
                    ) : (
                      <Carousel {...settings}>
                        {selectedJournal?.uploads?.map(
                          (upload: any, ind: number) => (
                            <div
                              className='border-slate-200 border rounded-md dark:border-gray-700'
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
                          )
                        )}
                      </Carousel>
                    )}
                  </div>
                  <div>
                    <h1 className='text-xl mb-2 dark:text-white'>
                      Review By Mentor/Admin:
                    </h1>
                    {!selectedJournal?.reviewId ? (
                      <h1 className='dark:text-white'>No Reviews yet</h1>
                    ) : (
                      <div>
                        <h1 className='w-full px-3 py-2 rounded-md bg-slate-100 border-[0.5px] border-slate-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white'>
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
                  </>
          )}
        </div>
       
      )}
      {!selectedJournal && (
          <h2>No {text} Data Found</h2>
      )}
    </div>
  )
}

export default JournalMarketSection
