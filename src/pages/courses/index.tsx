import { useState } from "react";
import CustomLayout from "../../components/layout/custom-layout/CustomLayout";
import { Drawer, Modal, Input, Button, List, Spin, message, Typography } from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";
import useFetchData from "../../hooks/useFetchData";
import usePostData from "../../hooks/usePostData";
import useUpdateData from "../../hooks/useUpdateData";
import useAxios from "../../hooks/useAxios";
import { Link } from "react-router-dom";

const { Title } = Typography;

const PlaylistPage = () => {
    const api = useAxios();
    
    // State to manage drawers and modals
    const [createPlaylistDrawer, setCreatePlaylistDrawer] = useState(false);
    const [updatePlaylistDrawer, setUpdatePlaylistDrawer] = useState(false);
    const [deletePlaylistModal, setDeletePlaylistModal] = useState(false);

    // State for playlist title input and editing playlist
    const [newPlaylistTitle, setNewPlaylistTitle] = useState("");
    const [currentPlaylist, setCurrentPlaylist] = useState<{ _id: string; title: string } | null>(null);
  
    // Fetch all playlists with the fetchData method included
    const { data: playlists, error: fetchError, loading, fetchData } = useFetchData("/playlist/getAll");

    // Post new playlist
    const { postData: createPlaylist } = usePostData<{ title: string }, any>("/playlist/create");
    
    // Update playlist
    const { putData: updatePlaylist } = useUpdateData<{ title: string }, any>(`/playlist/rename/${currentPlaylist?._id}`);
    
    // Handle create new playlist
    const handleCreatePlaylist = async () => {
        if (!newPlaylistTitle) return message.error("Please enter a playlist title");
        await createPlaylist({ title: newPlaylistTitle });
        message.success("Playlist created successfully");
        setCreatePlaylistDrawer(false);
        setNewPlaylistTitle("");
        // Refetch playlists after creating a new one
        fetchData();
    };

    // Handle update playlist
    const handleUpdatePlaylist = async () => {
        if (!newPlaylistTitle) return message.error("Please enter a playlist title");
        await updatePlaylist({ title: newPlaylistTitle });
        message.success("Playlist renamed successfully");
        setUpdatePlaylistDrawer(false);
        setNewPlaylistTitle("");
        // Refetch playlists after renaming one
        fetchData();
    };

    // Handle delete playlist
    const handleDeletePlaylist = async () => {
        try {
            await api.delete(`/playlist/delete/${currentPlaylist?._id}`);
            message.success("Playlist deleted successfully");
            setDeletePlaylistModal(false);
            // Refetch playlists after deleting one
            fetchData();
        } catch (error) {
            message.error("Failed to delete playlist");
        }
    };

    // UI rendering
    return (
        <CustomLayout>
            <section style={{ padding: '20px' }}>
                <Title level={2} style={{ marginBottom: '20px' }}>Playlists</Title>
                <Button
                    type="primary"
                    icon={<PlusCircleOutlined />}
                    onClick={() => setCreatePlaylistDrawer(true)}
                    style={{ marginBottom: '20px' }}
                >
                    Create Playlist
                </Button>

                {/* Playlist List */}
                {loading ? (
                    <Spin size="large" tip="Loading playlists..." style={{ display: 'block', margin: '20px auto' }} />
                ) : fetchError ? (
                    <p style={{ color: 'red' }}>Error fetching playlists</p>
                    //@ts-ignore
                ) : playlists && playlists.data?.length > 0 ? (
                    <List
                        itemLayout="horizontal"
                        //@ts-ignore
                        dataSource={playlists.data}
                        renderItem={(playlist: any) => (
                            <List.Item
                                actions={[
                                    <Link
                                        to={`/admin/courses/playlist/${playlist.playlist._id}`}
                                        onClick={() => {
                                            setCurrentPlaylist(playlist.playlist);
                                            setUpdatePlaylistDrawer(true);
                                        }}
                                    >
                                        View
                                    </Link>,
                                    <Button
                                        type="link"
                                        onClick={() => {
                                            setCurrentPlaylist(playlist.playlist);
                                            setUpdatePlaylistDrawer(true);
                                        }}
                                    >
                                        Edit
                                    </Button>,
                                    <Button
                                        type="link"
                                        danger
                                        onClick={() => {
                                            setCurrentPlaylist(playlist.playlist);
                                            setDeletePlaylistModal(true);
                                        }}
                                    >
                                        Delete
                                    </Button>,
                                ]}
                            >
                                <List.Item.Meta
                                    title={playlist.playlist.title}
                                    description={`${playlist.videoCount} Videos`}
                                />
                            </List.Item>
                        )}
                    />
                ) : (
                    <p>No playlists available</p>
                )}

                {/* Create Playlist Drawer */}
                <Drawer
                    title="Create New Playlist"
                    placement="right"
                    onClose={() => setCreatePlaylistDrawer(false)}
                    open={createPlaylistDrawer}
                    width={400}
                >
                    <Input
                        placeholder="Enter playlist title"
                        value={newPlaylistTitle}
                        onChange={(e) => setNewPlaylistTitle(e.target.value)}
                        style={{ marginBottom: '20px' }}
                    />
                    <Button type="primary" onClick={handleCreatePlaylist} style={{ width: '100%' }}>
                        Create
                    </Button>
                </Drawer>

                {/* Update Playlist Drawer */}
                <Drawer
                    title="Rename Playlist"
                    placement="right"
                    onClose={() => setUpdatePlaylistDrawer(false)}
                    open={updatePlaylistDrawer}
                    width={400}
                >
                    <Input
                        placeholder="Enter new playlist title"
                        value={newPlaylistTitle}
                        onChange={(e) => setNewPlaylistTitle(e.target.value)}
                        style={{ marginBottom: '20px' }}
                    />
                    <Button type="primary" onClick={handleUpdatePlaylist} style={{ width: '100%' }}>
                        Rename
                    </Button>
                </Drawer>

                {/* Delete Playlist Modal */}
                <Modal
                    title="Confirm Delete"
                    open={deletePlaylistModal}
                    onCancel={() => setDeletePlaylistModal(false)}
                    onOk={handleDeletePlaylist}
                    okText="Delete"
                    cancelText="Cancel"
                >
                    <p>Are you sure you want to delete this playlist?</p>
                </Modal>
            </section>
        </CustomLayout>
    );
};

export default PlaylistPage;
