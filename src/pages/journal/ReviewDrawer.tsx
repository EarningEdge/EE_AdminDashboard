import React, { useEffect, useState } from 'react';
import { Button, Carousel, CarouselProps, Tag, Rate, Spin, Input, message } from 'antd';
import { LoadingOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { SubmitHandler } from 'react-hook-form';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;
const { TextArea } = Input;

interface IFormInput {
  review: string;
  rating: number;
}

interface ReviewDrawerProps {
  hasReview: boolean;
  selectedJournal: any;
  setShowAddReviewDrawer: (show: boolean) => void;
  fileList: any[];
  setFileList: (files: any[]) => void;
  isUploading: boolean;
  handleUpload: () => void;
  onSubmit: SubmitHandler<IFormInput>;
}

const ReviewDrawer: React.FC<ReviewDrawerProps> = ({
  hasReview,
  selectedJournal,
  setShowAddReviewDrawer,
  // fileList,
  // setFileList,
  // isUploading,
  // handleUpload,
  onSubmit
}) => {
  const [isGeneratingReview, setIsGeneratingReview] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);

  const settings: CarouselProps = {
    dots: true,
    infinite: true,
    draggable: true,
    arrows: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1
  };

  // const uploadProps = {
  //   onRemove: (file: any) => {
  //     setFileList(fileList.filter(f => f.uid !== file.uid));
  //   },
  //   beforeUpload: (file: any) => {
  //     setFileList([...fileList, file]);
  //     return false;
  //   },
  //   fileList
  // };


  // Empty the reviewText and rating when a new journal is selected
  useEffect(() => {
    setReviewText('');
    setRating(0);
  }, [selectedJournal]);


  const generateAIReview = async () => {
    try {
      setIsGeneratingReview(true);

      const response = await axios.post(`${BASE_URL}/geminiLLM/reviewByGemini`, {
        data: JSON.stringify(selectedJournal)
      });

      if (response.data.status === 'success') {
        setReviewText(response.data.data.review);
        setRating(response.data.data.rating);
        message.success('AI Review generated successfully!');
      }
    } catch (error) {
      message.error('Failed to generate AI review. Please try again.');
    } finally {
      setIsGeneratingReview(false);
    }
  };

  const handleSubmit = () => {
    if (!reviewText.trim() || !rating) {
      message.warning('Please provide both review text and rating');
      return;
    }

    onSubmit({ review: reviewText, rating });
    message.success('Review submitted successfully!');
    setReviewText('');
    setRating(0);
    setShowAddReviewDrawer(false);
  };

  return (
    <div className='border p-4 overflow-auto shadow-md rounded-lg bg-white'>
      <div className='border-b-[0.5px] border-slate-300 mb-4'>
        <div className='flex justify-between items-center'>
          <h1 className='text-xl font-semibold'>Review</h1>
          {!hasReview && (
            <Button
              type="primary"
              icon={<ThunderboltOutlined className="text-yellow-200 text-lg" />}
              onClick={generateAIReview}
              loading={isGeneratingReview}
              className="m-2 h-auto py-2 px-4 flex items-center gap-2 bg-blue-500"
            >
              <span className="font-medium tracking-wide">Generate AI Review</span>
            </Button>
          )}
        </div>
      </div>



      <div className='space-y-4'>
        {isGeneratingReview ? (
          <div className='flex flex-col items-center justify-center p-8 space-y-4'>
            <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
            <span className='text-gray-600'>Generating AI Review...</span>
          </div>
        ) : (
          <>
            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-700'>Your Review:</label>
              <TextArea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Enter your review here or generate one using AI..."
                className='w-full px-4 py-3 rounded-md border-slate-300'
                rows={4}
              />
            </div>

            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-700'>Rating:</label>
              <Rate
                value={rating}
                onChange={setRating}
              />
              {rating > 0 && (
                <Tag color="blue" className='ml-2'>
                  {rating + ' stars'}
                </Tag>
              )}
            </div>

            <div className='flex justify-end space-x-3 pt-4'>
              <Button onClick={() => { setReviewText(""); setRating(0); setShowAddReviewDrawer(false) }}>
                Cancel
              </Button>
              <Button
                type="primary"
                onClick={handleSubmit}
                disabled={!reviewText.trim() || !rating}
                className='bg-green-500 hover:bg-green-600'
              >
                Submit Review
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Only show emotions if they exist */}
      {selectedJournal?.emotion?.value && (
        <div className='border-b-[0.5px] border-slate-300 pb-3 mb-4'>
          <h1 className='text-xl font-medium mb-2'>Emotions:</h1>
          <div className='w-full text-sm text-gray-600 px-4 py-3 rounded-md bg-slate-50 border-[0.5px] border-slate-300'>
            {selectedJournal.emotion.value}
          </div>
        </div>
      )}

      {/* Only show uploads if they exist */}
      {selectedJournal?.uploads?.length > 0 && (
        <div className='border-b-[0.5px] border-slate-300 pb-3 mb-4'>
          <h1 className='text-xl font-medium mb-2'>Uploads:</h1>
          <Carousel {...settings}>
            {selectedJournal.uploads.map((upload: any, ind: number) => (
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
        </div>
      )}
    </div>
  );
};

export default ReviewDrawer;