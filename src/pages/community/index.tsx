import React, { useState, useEffect } from "react";
import { Layout, Menu, message, Modal, Avatar } from "antd";
import {
  UserOutlined,
  // UserAddOutlined,
} from "@ant-design/icons";
import { GLOBAL_CHANNEL_ID } from "../../constants/values";
import useSupabase from "../../hooks/useSupabase";
import { useAppSelector } from "../../redux/hooks";
import CustomLayout from "../../components/layout/custom-layout/CustomLayout";
import { Message, Conversation, IUser } from "../../types/data";
import UserList from "../users-list-modal";
import useFetchData from "../../hooks/useFetchData";
import Chats from "../../components/chat-item";
import { Content } from "antd/es/layout/layout";
import { RealtimeChannel } from "@supabase/supabase-js";

const { Sider } = Layout;

const ChatPage: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const supabase = useSupabase();

  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);

  const [isUserListVisible, setIsUserListVisible] = useState(false);

  let { data: traders } = useFetchData<{ status: string; data: IUser[] }>(
    `/user/all`
  );
  let filteredTraders: IUser[]=[]
  //After fetching all the traders to start a convo, we will remove the user who are already in conversation
  if(traders){
    filteredTraders = traders?.data?.filter((user:IUser)=> !conversations.some((e)=>{return e.participants.includes(user._id)}))
  }

  //USE_EFFECTs
  useEffect(() => {
    if (!supabase) return;
    fetchConversations();
    const conversationChannel: RealtimeChannel = supabase
      .channel('public:conversations')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversations' },
        (payload) => handleConversationChange(payload)
      )
      .subscribe((status) => {
        console.log('Conversation subscription status:', status);
      });

    const messageDeleteChannel = supabase
      .channel('public:messages:delete')
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'messages' },
        (payload) => {
          handleDeleteMessage(payload);
        }
      )
      .subscribe((status) => {
        console.log('Messages delete subscription status:', status);
      });

    const messageUpdateChannel = supabase
      .channel('public:messages:update')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages' },
        (payload) => {
          handleEditMessage(payload);
        }
      )
      .subscribe((status) => {
        console.log('Messages update subscription status:', status);
      });

    const messageInsertChannel = supabase
      .channel('public:messages:insert')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          handleNewMessage(payload);
        }
      )
      .subscribe((status) => {
        console.log('Messages insert subscription status:', status);
      });

    return () => {
      console.log('Removing channels');
      supabase.removeChannel(conversationChannel);
      supabase.removeChannel(messageDeleteChannel);
      supabase.removeChannel(messageUpdateChannel);
      supabase.removeChannel(messageInsertChannel);
    };
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
    } else {
      fetchGlobalMessages();
    }
  }, [selectedConversation]);

 

  const handleConversationChange = (payload: any) => {
    if (payload.new && payload.new.participants.includes(user?._id)) {
      setConversations((prev) => [...prev, payload.new]);
    }
  };

  const handleNewMessage = (payload: any) => {
    const newMessage = payload.new as Message;
    if (
      newMessage.conversationId === selectedConversation ||
      (!selectedConversation && newMessage.conversationId === GLOBAL_CHANNEL_ID)
    ) {
      setMessages((prev) => [...prev, newMessage]);
    }
  };
  const deleteMessage = async (messageId: string) => {
    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("id", messageId);

    if (error) {
      console.error("Error deleting message:", error);
      message.error("Failed to delete message");
    } else {
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      message.success("Message deleted successfully");
    }
  };
  const editMessage = async (messageId: string, newContent: string) => {
    const { error } = await supabase
      .from("messages")
      .update({ content: newContent })
      .eq("id", messageId);

    if (error) {
      console.error("Error editing message:", error);
      message.error("Failed to edit message");
    } else {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, content: newContent } : msg
        )
      );
      message.success("Message edited successfully");
    }
  };
  const handleDeleteMessage = (payload: any) => {
    const deletedMessage = payload.old as Message;
    if (
      deletedMessage.conversationId === selectedConversation ||
      (!selectedConversation &&
        deletedMessage.conversationId === GLOBAL_CHANNEL_ID)
    ) {
      setMessages((prev) => prev.filter((msg) => msg.id !== deletedMessage.id));
    }
  };
  const handleEditMessage = (payload: any) => {
    const editedMessage = payload.new as Message;
    if (
      editedMessage.conversationId === selectedConversation ||
      (!selectedConversation &&
        editedMessage.conversationId === GLOBAL_CHANNEL_ID)
    ) {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === editedMessage.id ? editedMessage : msg))
      );
    }
  };
  const fetchConversations = async () => {
    //Fetch all the conversation from the database which include this userID in any of the Participants list.
    //Where
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .filter("participants", "cs", `{${user?._id}}`);

    if (error) {
      console.error("Error fetching conversations:", error);
    } else {
      setConversations(data || []);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    //Fetch all the messages from a given conversationID
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversationId", conversationId)
      .order("createdAt", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
    } else {
      setMessages(data || []);
    }
  };

  const fetchGlobalMessages = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversationId", GLOBAL_CHANNEL_ID)
      .order("createdAt", { ascending: true });

    if (error) {
      console.error("Error fetching global messages:", error);
    } else {
      setMessages(data || []);
    }
  };

  const startNewConversation = async (participantId: string) => {

    const { data, error } = await supabase
      .from("conversations")
      .insert({ participants: [user?._id, participantId] })
      .select()
      .single();

    if (error) {
      console.error("Error creating conversation:", error);
      message.error("Failed to create conversation");
    } else {
      setConversations([...conversations, data]);
      setSelectedConversation(data.id);
      setIsUserListVisible(false);
    }
  };

  return (
    <CustomLayout>
    <Layout style={{ height: "100%", display: "flex" }}>
      <Sider
        width={200}
        theme="light"
        style={{
          overflowY: "auto",
          height: "100%",
          borderRight: "1px solid #f0f0f0",
        }}
      >
        <Menu
          mode="inline"
          selectedKeys={[selectedConversation || GLOBAL_CHANNEL_ID]}
          style={{ height: "100%" }}
          onClick={({ key }) =>
            setSelectedConversation(key === GLOBAL_CHANNEL_ID ? null : key)
          }
        >
              <Menu.Item key={GLOBAL_CHANNEL_ID}>
                <Avatar icon={<UserOutlined />} />
                <span style={{ marginLeft: "10px" }}>Global Channel</span>
              </Menu.Item>

              {conversations.map((conv) => {
                const otherUser = conv.participants.find(
                  (p) => p !== user?._id
                );
                const otherUserData = traders?.data.find(
                  (u) => u._id === otherUser
                );
                return (
                  <Menu.Item key={conv.id}>
                    <Avatar
                      src={otherUserData?.profile_image_url}
                      icon={<UserOutlined />}
                    />
                    <span style={{ marginLeft: "10px" }}>
                      {otherUserData
                        ? `${otherUserData.firstName} ${otherUserData.lastName}`
                        : "Unknown User"}
                    </span>
                  </Menu.Item>
                );
              })}

              <Menu.Item
                onClick={() => {
                  setIsUserListVisible(true);
                }}
                key="new"
              >
                <Avatar icon={<UserOutlined />} />
                <span style={{ marginLeft: "10px" }}>New Conversation</span>
              </Menu.Item>
              </Menu>
      </Sider>
      <Layout style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Content
          style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            padding: "20px",
          }}
        >
          <Chats
            messages={messages}
            selectedConversation={selectedConversation}
            deleteMessage={deleteMessage}
            editMessage={editMessage}
            setMessages={setMessages}
          />
        </Content>
      </Layout>
    </Layout>
    <Modal
      title="Start New Conversation"
      visible={isUserListVisible}
      onCancel={() => setIsUserListVisible(false)}
      footer={null}
    >
      <UserList traders={filteredTraders} onSelectUser={startNewConversation} />
    </Modal>
  </CustomLayout>
  );
};
export default ChatPage;