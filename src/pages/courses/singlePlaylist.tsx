import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Drawer, Form, Input, Upload, message } from "antd";
import {
  UploadIcon,
  PlayCircleIcon,
  MoreVertical,
  AlertCircle,
} from "lucide-react";
import CustomLayout from "../../components/layout/custom-layout/CustomLayout";
import useFetchData from "../../hooks/useFetchData";
import usePostData from "../../hooks/usePostData";
import useAxios from "../../hooks/useAxios";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "videojs-hls-quality-selector";
import Player from "video.js/dist/types/player";
import VideoPlayer from "./videoplayer";

const Alert: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6"
    role="alert"
  >
    {children}
  </div>
);
interface Video {
  _id: string;
  title: string;
  description: string;
  views: number;
  url: string;
  thumbnail: string;
}

interface UploadResponse {
  video: Video;
  preSignedUrl: string;
}

const SinglePlaylist: React.FC = () => {
  const api = useAxios();
  const { id: playlistId } = useParams<{ id: string }>();
  const {
    data: videos,
    loading,
    error,
    fetchData,
  } = useFetchData<{ data: {videos:Video[],playlistName:string} }>("/playlist/getAllVideos/" + playlistId);
  const {
    data: uploadResponse,
    loading: uploading,
    error: uploadError,
    postData: getPresignedUrl,
  } = usePostData<FormData, { data: UploadResponse }>("/video/getPresignedUrl");

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingVideoId, setDeletingVideoId] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "processing" | "completed"
  >("idle");
  const [processingVideos, setProcessingVideos] = useState<Video[]>([]);
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const [form] = Form.useForm();
  const playerRef = useRef(null);

  useEffect(() => {
    if (uploadResponse?.data) {
      handleUploadToS3(uploadResponse.data);
    }
  }, [uploadResponse]);

  useEffect(() => {
    if (uploadError) {
      message.error("Failed to get pre-signed URL");
    }
  }, [uploadError]);

  useEffect(() => {
    const videoElement = playerRef.current;
    let player: Player | null = null;

    if (videoElement && activeVideo) {
      console.log(activeVideo.url);
      player = videojs(videoElement, {
        controls: true,
        autoplay: false,
        preload: "auto",
        fluid: true,
        sources: [
          {
            src: activeVideo.url,
            type: "application/x-mpegURL",
          },
        ],
      });
    }

    return () => {
      if (player) {
        player.dispose();
      }
    };
  }, [activeVideo]);

  const showDrawer = (video?: Video) => {
    if (video) {
      setEditingVideo(video);
      form.setFieldsValue(video);
    } else {
      setEditingVideo(null);
      form.resetFields();
    }
    setDrawerVisible(true);
  };

  const onClose = () => {
    setDrawerVisible(false);
    setEditingVideo(null);
  };

  const onFinish = async (values: any) => {
    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("description", values.description);
    if (values.video && values.video.file) {
      const fileExtension = values.video.file.name.split(".").pop();
      formData.append("fileExtension", fileExtension);
      formData.append("filetype", values.video.file.type);
    }
    if (values.thumbnail && values.thumbnail.file) {
      formData.append("thumbnail", values.thumbnail.file);
    }
    formData.append("playlist", playlistId!);

    if (editingVideo) {
      await handleEditVideo(editingVideo._id, formData);
    } else {
      await getPresignedUrl(formData);
    }
  };

  const handleUploadToS3 = async (response: UploadResponse) => {
    const { preSignedUrl } = response;
    const videoFile = form.getFieldValue("video").file;

    try {
      setUploadStatus("uploading");
      console.log("Uploading to:", preSignedUrl);

      const uploadResult = await fetch(preSignedUrl, {
        method: "PUT",
        body: videoFile,
        headers: {
          "Content-Type": videoFile.type,
        },
      });

      if (!uploadResult.ok) {
        throw new Error(`Upload failed with status ${uploadResult.status}`);
      }

      setUploadStatus("processing");
      setProcessingVideos((prev) => [...prev, response.video]);
      await pollVideoStatus(response.video._id);

      message.success("Video uploaded and processed successfully");
      form.resetFields();
      setDrawerVisible(false);
      fetchData();
    } catch (err) {
      console.error(err);
      message.error("Failed to upload video to S3");
      setUploadStatus("idle");
    }
  };

  const pollVideoStatus = async (videoId: string) => {
    const maxAttempts = 50;
    const interval = 5000; // 5 seconds
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const response = await api.get(`/video/${videoId}`);
      if (response.data?.data?.video?.url) {
        setUploadStatus("completed");
        setProcessingVideos((prev) => prev.filter((v) => v._id !== videoId));
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, interval));
    }

    message.warning(
      "Video processing is taking longer than expected. Please check back later."
    );
    setUploadStatus("idle");
  };

  const handleEditVideo = async (videoId: string, formData: FormData) => {
    try {
      const response = await api.put(`/video/${videoId}`, formData);

      if (response.status !== 200) {
        throw new Error(`Edit failed with status ${response.status}`);
      }

      message.success("Video updated successfully");
      setDrawerVisible(false);
      fetchData();
    } catch (err) {
      console.error(err);
      message.error("Failed to update video");
    }
  };

  const handleDeleteVideo = async () => {
    if (!deletingVideoId) return;

    try {
      const response = await api.delete(`/video/${deletingVideoId}`);

      if (response.status !== 200) {
        throw new Error(`Delete failed with status ${response.status}`);
      }

      message.success("Video deleted successfully");
      setDeleteModalVisible(false);
      setDeletingVideoId(null);
      fetchData();
    } catch (err) {
      console.error(err);
      message.error("Failed to delete video");
    }
  };

  const handleMenuClick = (action: string, video: Video) => {
    switch (action) {
      case "edit":
        showDrawer(video);
        break;
      case "delete":
        setDeletingVideoId(video._id);
        setDeleteModalVisible(true);
        break;
      case "analytics":
        // Implement analytics view
        console.log("View analytics for", video.title);
        break;
      default:
        break;
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="text-red-500 text-center">Error: {error.message}</div>
    );

  return (
    <CustomLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Video Dashboard</h1>
        <button
          onClick={() => showDrawer()}
          className="mb-6 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Upload Video
        </button>

        {processingVideos.length > 0 && (
          <Alert>
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span>
                {processingVideos.map((video) => (
                  <span key={video._id} className="mr-2">
                    {video.title} is currently being processed
                  </span>
                ))}
              </span>
            </div>
          </Alert>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {videos?.data.videos.map((video: Video) => (
            <div
              key={video._id}
              className="bg-white rounded-lg shadow-md overflow-hidden relative"
            >
              <div className="relative">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-48 object-cover"
                />
                {video.url ? (
                  <PlayCircleIcon
                    className="absolute inset-0 m-auto text-white opacity-70 hover:opacity-100 cursor-pointer"
                    size={48}
                    onClick={() => setActiveVideo(video)}
                  />
                ) : (
                  <AlertCircle
                    className="absolute inset-0 m-auto text-white opacity-70"
                    size={48}
                  />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{video.title}</h3>
                <p className="text-gray-600 mb-2">Views: {video.views}</p>
              </div>
              <div className="absolute top-2 right-2">
                <div className="relative">
                  <MoreVertical
                    className="text-white cursor-pointer"
                    onClick={() => handleMenuClick("menu", video)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {activeVideo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-4 rounded-lg w-full max-w-4xl">
              <VideoPlayer url={activeVideo.url} />
              <button
                onClick={() => setActiveVideo(null)}
                className="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
              >
                Close
              </button>
            </div>
          </div>
        )}
        <Drawer
          title={editingVideo ? "Edit Video" : "Upload Video"}
          width={720}
          onClose={onClose}
          visible={drawerVisible}
          bodyStyle={{ paddingBottom: 80 }}
        >
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item
              name="title"
              label="Title"
              rules={[{ required: true, message: "Please input the title!" }]}
            >
              <Input className="w-full px-3 py-2 border rounded-md" />
            </Form.Item>
            <Form.Item
              name="description"
              label="Description"
              rules={[
                { required: true, message: "Please input the description!" },
              ]}
            >
              <Input.TextArea
                rows={4}
                className="w-full px-3 py-2 border rounded-md"
              />
            </Form.Item>
            <Form.Item
              name="thumbnail"
              label="Thumbnail"
              rules={[
                {
                  required: !editingVideo,
                  message: "Please upload a thumbnail!",
                },
              ]}
            >
              <Upload accept="image/*" beforeUpload={() => false}>
                <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center">
                  <UploadIcon className="mr-2" />
                  Select Thumbnail
                </button>
              </Upload>
            </Form.Item>
            {!editingVideo && (
              <Form.Item
                name="video"
                label="Video"
                rules={[{ required: true, message: "Please upload a video!" }]}
              >
                <Upload accept="video/*" beforeUpload={() => false}>
                  <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center">
                    <UploadIcon className="mr-2" />
                    Select Video
                  </button>
                </Upload>
              </Form.Item>
            )}
            <Form.Item>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Submit"}
              </button>
            </Form.Item>
          </Form>
          {uploadStatus !== "idle" && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Upload Status:</h4>
              <div className="flex items-center">
                <div
                  className={`w-4 h-4 rounded-full mr-2 ${
                    uploadStatus === "uploading"
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                ></div>
                <span>Uploading</span>
              </div>
              <div className="flex items-center mt-2">
                <div
                  className={`w-4 h-4 rounded-full mr-2 ${
                    uploadStatus === "processing"
                      ? "bg-yellow-500"
                      : uploadStatus === "completed"
                      ? "bg-green-500"
                      : "bg-gray-300"
                  }`}
                ></div>
                <span>Processing</span>
              </div>
              <div className="flex items-center mt-2">
                <div
                  className={`w-4 h-4 rounded-full mr-2 ${
                    uploadStatus === "completed"
                      ? "bg-green-500"
                      : "bg-gray-300"
                  }`}
                ></div>
                <span>Completed</span>
              </div>
            </div>
          )}
        </Drawer>
        {deleteModalVisible && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
              <p className="mb-4">
                Are you sure you want to delete this video?
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => setDeleteModalVisible(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteVideo}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </CustomLayout>
  );
};

export default SinglePlaylist;
