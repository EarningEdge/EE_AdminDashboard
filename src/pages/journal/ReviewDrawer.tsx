import React from 'react';
import { Button, Carousel, CarouselProps, Tag, Rate, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

interface ReviewDrawerProps {
  selectedJournal: any;
  setShowAddReviewDrawer: (show: boolean) => void;
  fileList: any[];
  setFileList: (files: any[]) => void;
  isUploading: boolean;
  handleUpload: () => void;
}

const ReviewDrawer: React.FC<ReviewDrawerProps> = ({
  selectedJournal,
  setShowAddReviewDrawer,
  fileList,
  setFileList,
  isUploading,
  handleUpload
}) => {
  const settings: CarouselProps = {
    dots: true,
    infinite: true,
    draggable: true,
    arrows: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1
  };

  const uploadProps = {
    onRemove: (file: any) => {
      setFileList(fileList.filter(f => f.uid !== file.uid));
    },
    beforeUpload: (file: any) => {
      setFileList([...fileList, file]);
      return false;
    },
    fileList
  };

  return (
    <div className='border p-2 overflow-auto shadow-md'>
      <div className='border-b-[0.5px] border-slate-300 mb-3'>
        <div className='flex justify-between'>
          <h1 className='text-xl'>Reviews</h1>
          {selectedJournal?.reviewId ? (
            <Tag color='green' className='flex items-center'>
              {'Reviewed By ' + selectedJournal?.review.reviewerId}
            </Tag>
          ) : (
            <div className='flex flex-col'>
              <Button onClick={() => setShowAddReviewDrawer(true)}>
                Add Review
              </Button>
              <span className='text-orange-500'>Review pending</span>
            </div>
          )}
        </div>
      </div>

      <div className='border-b-[0.5px] border-slate-300 pb-3 mb-3'>
        <h1 className='text-xl'>Emotions:</h1>
        <h1 className='w-full text-sm text-gray-400 px-3 py-2 rounded-md bg-slate-100 border-[0.5px] border-slate-300'>
          {selectedJournal?.emotion?.value || 'Not recorded'}
        </h1>
      </div>

      <div>
        <div className='border-b-[0.5px] border-slate-300 pb-3 mb-3'>
          <h1 className='text-xl mb-2'>Uploads by user:</h1>
          {selectedJournal?.uploads?.length === 0 ? (
            <h1>No Uploads Found</h1>
          ) : (
            <Carousel {...settings}>
              {selectedJournal?.uploads?.map((upload: any, ind: number) => (
                <div className='border-slate-200 border rounded-md' key={ind}>
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
          <h1 className='text-xl mb-2'>Review By Mentor/Admin:</h1>
          {!selectedJournal?.reviewId ? (
            <h1>No Reviews available for {selectedJournal?.type}</h1>
          ) : (
            <div>
              <h1 className='w-full px-3 py-2 rounded-md bg-slate-100 border-[0.5px] border-slate-300'>
                {selectedJournal?.review?.value}
              </h1>
              {selectedJournal?.review && (
                <div className='flex items-center my-3 space-x-2'>
                  <Rate disabled value={selectedJournal?.review?.rating} />
                  <Tag>{selectedJournal?.review?.rating + ' stars'}</Tag>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedJournal && selectedJournal?.review && (
        <div>
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />}>
              Select Files
            </Button>
          </Upload>
          <Button
            onClick={handleUpload}
            disabled={fileList.length === 0 || isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReviewDrawer;