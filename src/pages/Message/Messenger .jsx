import React, { useState, useEffect } from "react";

const Messenger = () => {
  const [conversations, setConversations] = useState([
    { id: 1, name: "Duy Hau", messages: ["Hello!", "How are you?"] },
    { id: 2, name: "Minh Anh", messages: ["Hi!", "What's up?"] },
  ]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [newMessage, setNewMessage] = useState("");

  // Hàm để chọn cuộc hội thoại
  const selectConversation = (conversation) => {
    setCurrentConversation(conversation);
  };

  // Hàm gửi tin nhắn từ người dùng
  const sendMessage = () => {
    if (newMessage && currentConversation) {
      const updatedConversations = conversations.map((conv) => {
        if (conv.id === currentConversation.id) {
          const updatedConv = {
            ...conv,
            messages: [...conv.messages, `You: ${newMessage}`],
          };
          setCurrentConversation(updatedConv); // Cập nhật currentConversation luôn
          return updatedConv;
        }
        return conv;
      });
      setConversations(updatedConversations);
      setNewMessage("");

      // Giả lập bên kia trả lời sau 1 giây
      setTimeout(() => {
        simulateReply(currentConversation.id);
      }, 1000);
    }
  };

  // Giả lập trả lời từ phía bên kia
  const simulateReply = (conversationId) => {
    const botReplies = [
      "Sure!",
      "I see.",
      "That sounds great!",
      "Let me think about it.",
      "What do you mean?",
      "I'm not sure about that.",
    ];

    const randomReply =
      botReplies[Math.floor(Math.random() * botReplies.length)];

    const updatedConversations = conversations.map((conv) => {
      if (conv.id === conversationId) {
        const updatedConv = {
          ...conv,
          messages: [...conv.messages, `Bot: ${randomReply}`],
        };
        if (currentConversation?.id === conversationId) {
          setCurrentConversation(updatedConv); // Cập nhật currentConversation nếu nó đang mở
        }
        return updatedConv;
      }
      return conv;
    });

    setConversations(updatedConversations);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar danh sách cuộc hội thoại */}
      <div className="w-1/4 bg-white p-4 border-r shadow-lg">
        <h2 className="text-xl font-bold mb-4">Conversations</h2>
        <ul>
          {conversations.map((conversation) => (
            <li
              key={conversation.id}
              className={`p-3 cursor-pointer rounded-lg mb-2 transition-colors duration-300 ${
                currentConversation?.id === conversation.id
                  ? "bg-blue-100 text-blue-600"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => selectConversation(conversation)}
            >
              {conversation.name}
            </li>
          ))}
        </ul>
      </div>

      {/* Cửa sổ chat */}
      <div className="w-3/4 h-3/4 flex flex-col bg-white shadow-lg">
        {currentConversation ? (
          <>
            <div className="flex-grow p-4 overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4 border-b pb-2">
                {currentConversation.name}
              </h2>
              <div className="space-y-4">
                {currentConversation.messages.map((msg, index) => (
                  <p
                    key={index}
                    className={`p-3 rounded-lg shadow-sm ${
                      msg.startsWith("You")
                        ? "bg-blue-100 text-blue-900 self-end"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    {msg}
                  </p>
                ))}
              </div>
            </div>

            {/* Form gửi tin nhắn */}
            <div className="p-4 border-t bg-gray-50 flex items-center">
              <input
                type="text"
                className="flex-grow p-3 border rounded-full shadow-sm focus:outline-none focus:ring focus:ring-blue-300 transition-all"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
              />
              <button
                className="ml-3 bg-blue-500 text-white px-6 py-3 rounded-full shadow-md hover:bg-blue-600 transition-colors"
                onClick={sendMessage}
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex-grow p-4 flex items-center justify-center">
            <p className="text-lg text-gray-500">
              Select a conversation to start chatting
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messenger;
