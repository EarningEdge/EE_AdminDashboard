import React, { useEffect, useState } from 'react';
import { Button, Drawer } from 'antd';
import { SubmitHandler, UseFormReturn } from 'react-hook-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./Tabs";
import JournalMarketSection from '../../components/journal-section/JournalMarketSection';
import CustomTable from '../../components/common/table/CustomTable';
import { profitLossColumns } from './profitLossColumnsData';
import { LayoutGrid, LayoutPanelTop } from 'lucide-react';
import ReviewDrawer from './ReviewDrawer';

interface IFormInput {
  review: string;
  rating: number;
}

interface JournalDrawerProps {
  showSideDrawer: boolean;
  setShowSideDrawer: (show: boolean) => void;
  selectedJournal: any;
  setSelectedJournal: (journal: any) => void;
  preData: any;
  setPreData: (data: any) => void;
  postDatas: any;
  setPostDatas: (data: any) => void;
  showAddReviewDrawer: boolean;
  setShowAddReviewDrawer: (show: boolean) => void;
  fileList: any[];
  setFileList: (files: any[]) => void;
  isUploading: boolean;
  handleUpload: () => void;
  loading: boolean;
  positions: any[];
  form: UseFormReturn<IFormInput>;
  isReviewAdding: boolean;
  onSubmit: SubmitHandler<IFormInput>;
}

const JournalDrawer: React.FC<JournalDrawerProps> = ({
  showSideDrawer,
  setShowSideDrawer,
  selectedJournal,
  setSelectedJournal,
  preData,
  setPreData,
  postDatas,
  setPostDatas,
  showAddReviewDrawer,
  setShowAddReviewDrawer,
  fileList,
  setFileList,
  isUploading,
  handleUpload,
  loading,
  positions,
  // form,
  // isReviewAdding,
  onSubmit
}) => {
  const [isGridView, setIsGridView] = useState(false);
  const [hasReview, setHasReview] = useState(false);

  useEffect(() => {
    if (selectedJournal?.reviewId) {
      setHasReview(true);
    } else {
      setHasReview(false);
    }
  }, [selectedJournal]);

  const switchButton = (
    <div className="flex  justify-between items-center w-full">
      <div></div> {/* Empty div to maintain spacing */}
      <Button
        onClick={() => setIsGridView(!isGridView)}
        className="flex items-center gap-2"
      >
        {isGridView ? (
          <div className='flex items-center gap-2'>
            <LayoutPanelTop className="h-4 w-4" />
            Switch to Tabs
          </div>
        ) : (
          <div className='flex items-center gap-2'>
            <LayoutGrid className="h-4 w-4" />
            Switch to Grid
          </div>
        )}
      </Button>
    </div>
  )

  return (
    <>
      <Drawer
        open={showSideDrawer}
        onClose={() => {
          setShowSideDrawer(false);
          setSelectedJournal(null);
          setPostDatas(null);
          setPreData(null);
        }}
        width={'85%'}
        title={switchButton}
      >

        {isGridView ? (
          <div className='grid grid-cols-2 grid-rows-2 gap-2 h-full'>
            <JournalMarketSection
              selectedJournal={preData}
              setShowAddReviewDrawer={setShowAddReviewDrawer}
              text='Pre Market'
            />
            <JournalMarketSection
              selectedJournal={postDatas}
              setShowAddReviewDrawer={setShowAddReviewDrawer}
              text='Post Market'
            />
            <div className='border p-2 overflow-auto shadow-md'>
              <h2 className='text-xl mb-2'>Profit & Loss</h2>
              <CustomTable
                columns={profitLossColumns}
                data={positions}
                totalDocuments={positions.length}
                loading={loading}
              />
            </div>
            <ReviewDrawer
              hasReview={hasReview}
              selectedJournal={selectedJournal}
              setShowAddReviewDrawer={setShowAddReviewDrawer}
              fileList={fileList}
              setFileList={setFileList}
              isUploading={isUploading}
              handleUpload={handleUpload}
              onSubmit={onSubmit}
            />
          </div>
        ) : (
          <Tabs defaultValue="pre-market" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pre-market">Pre Market</TabsTrigger>
              <TabsTrigger value="post-market">Post Market</TabsTrigger>
              <TabsTrigger value="profit-loss">Profit & Loss</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            <TabsContent value="pre-market" className="mt-4">
              <JournalMarketSection
                selectedJournal={preData}
                setShowAddReviewDrawer={setShowAddReviewDrawer}
                text='Pre Market'
              />
            </TabsContent>
            <TabsContent value="post-market" className="mt-4">
              <JournalMarketSection
                selectedJournal={postDatas}
                setShowAddReviewDrawer={setShowAddReviewDrawer}
                text='Post Market'
              />
            </TabsContent>
            <TabsContent value="profit-loss" className="mt-4">
              <div className='border p-2 overflow-auto shadow-md'>
                <h2 className='text-xl mb-2'>Profit & Loss</h2>
                <CustomTable
                  columns={profitLossColumns}
                  data={positions}
                  totalDocuments={positions.length}
                  loading={loading}
                />
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="mt-4">
              <ReviewDrawer
                hasReview={hasReview}
                selectedJournal={selectedJournal}
                setShowAddReviewDrawer={setShowAddReviewDrawer}
                fileList={fileList}
                setFileList={setFileList}
                isUploading={isUploading}
                handleUpload={handleUpload}
                onSubmit={onSubmit}
              />
            </TabsContent>
          </Tabs>
        )}

        <Drawer
          width={'60%'}
          onClose={() => setShowAddReviewDrawer(false)}
          open={showAddReviewDrawer}
        >
          <ReviewDrawer
            hasReview={hasReview}
            selectedJournal={selectedJournal}
            setShowAddReviewDrawer={setShowAddReviewDrawer}
            fileList={fileList}
            setFileList={setFileList}
            isUploading={isUploading}
            handleUpload={handleUpload}
            onSubmit={onSubmit}
          />
        </Drawer>
      </Drawer>
    </>
  );
};

export default JournalDrawer;