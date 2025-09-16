import React, { useState, useEffect, useRef } from 'react';
import { Plus, MessageSquare, Paperclip, Smile, Send, X } from 'lucide-react';
import api from '../../services/api';
import authService from '../../services/authService';

// This is a complex component that was extracted as-is from InstructorDashboard
// It handles real-time messaging with WebSocket connections
const MessagesView = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [socket, setSocket] = useState(null);
  const [userSocket, setUserSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Helper function to safely get user initials
  const getUserInitials = (user) => {
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    const firstInitial = firstName.length > 0 ? firstName[0].toUpperCase() : '';
    const lastInitial = lastName.length > 0 ? lastName[0].toUpperCase() : '';
    return firstInitial + lastInitial || user.email?.[0]?.toUpperCase() || '?';
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // WebSocket connection logic (preserved from original)
  useEffect(() => {
    connectUserWebSocket();
    
    return () => {
      if (userSocket) {
        try {
          userSocket.close();
        } catch (error) {
          console.warn('Error closing user WebSocket:', error);
        }
      }
    };
  }, []);

  const connectUserWebSocket = () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('Instructor Dashboard: No access token found for user WebSocket connection');
      return;
    }
    
    const wsUrl = `ws://localhost:8000/ws/user/?token=${token}`;
    console.log('Instructor Dashboard: Connecting to user WebSocket URL:', wsUrl);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('Instructor Dashboard: User WebSocket connected');
      setUserSocket(ws);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Instructor Dashboard: User WebSocket message received:', data);
        
        if (data.type === 'chat_message') {
          fetchConversations();
          
          let messageData;
          if (data.message && typeof data.message === 'object') {
            messageData = data.message;
          } else {
            const currentUser = authService.getCurrentUser();
            messageData = {
              id: data.message_id,
              content: data.message,
              sender: {
                id: data.sender_id,
                name: data.sender_name
              },
              created_at: data.timestamp,
              conversation_id: data.conversation_id,
              is_own_message: data.sender_id === currentUser?.id
            };
          }
          
          if (messageData.conversation_id === selectedConversation?.id) {
            console.log('Instructor Dashboard: Adding message from user WebSocket to current conversation');
            setMessages(prev => {
              if (prev.some(msg => msg.id === messageData.id)) {
                console.log('Instructor Dashboard: Message already exists, skipping duplicate');
                return prev;
              }
              
              const newMessages = [...prev, messageData];
              console.log('Instructor Dashboard: Updated messages from user WebSocket:', newMessages);
              return newMessages;
            });
            
            if (!messageData.is_own_message) {
              markMessagesAsRead(messageData.conversation_id);
            }
          }
        }
      } catch (error) {
        console.error('Instructor Dashboard: Error parsing user WebSocket message:', error);
      }
    };

    ws.onclose = (event) => {
      console.log('Instructor Dashboard: User WebSocket disconnected. Code:', event.code, 'Reason:', event.reason);
      setUserSocket(null);
      
      if (event.code !== 1000) {
        setTimeout(() => {
          console.log('Instructor Dashboard: Attempting to reconnect user WebSocket...');
          connectUserWebSocket();
        }, 3000);
      }
    };

    ws.onerror = (error) => {
      console.error('Instructor Dashboard: User WebSocket error:', error);
    };
  };

  // WebSocket connection for conversation
  useEffect(() => {
    if (!selectedConversation) {
      if (socket) {
        try {
          socket.close();
        } catch (error) {
          console.warn('Error closing WebSocket:', error);
        }
        setSocket(null);
      }
      return;
    }

    const connectWebSocket = () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.warn('Instructor Dashboard: No access token found for WebSocket connection');
        return null;
      }
      
      const wsUrl = `ws://localhost:8000/ws/chat/${selectedConversation.id}/?token=${token}`;
      console.log('Instructor Dashboard: Connecting to WebSocket URL:', wsUrl);
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('Instructor Dashboard: WebSocket connected to conversation:', selectedConversation.id);
        setSocket(ws);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Instructor Dashboard: WebSocket message received:', data);
          
          if (data.type === 'chat_message') {
            let messageData;
            if (data.message && typeof data.message === 'object') {
              messageData = data.message;
            } else {
              const currentUser = authService.getCurrentUser();
              messageData = {
                id: data.message_id,
                content: data.message,
                sender: {
                  id: data.sender_id,
                  name: data.sender_name
                },
                created_at: data.timestamp,
                conversation_id: data.conversation_id,
                is_own_message: data.sender_id === currentUser?.id
              };
            }

            if (messageData.conversation_id === selectedConversation?.id) {
              console.log('Instructor Dashboard: Adding message to current conversation:', messageData.conversation_id);
              setMessages(prev => {
                if (prev.some(msg => msg.id === messageData.id)) {
                  console.log('Instructor Dashboard: Message already exists in conversation, skipping duplicate');
                  return prev;
                }
                
                const newMessages = [...prev, messageData];
                console.log('Instructor Dashboard: Updated messages array:', newMessages);
                return newMessages;
              });
              
              if (!messageData.is_own_message) {
                markMessagesAsRead(messageData.conversation_id);
              }
            }
            
            fetchConversations();
          } else if (data.type === 'typing_indicator') {
            if (data.conversation_id === selectedConversation?.id) {
              setIsTyping(data.is_typing);
            }
          }
        } catch (error) {
          console.error('Instructor Dashboard: Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('Instructor Dashboard: WebSocket disconnected. Code:', event.code, 'Reason:', event.reason);
        setSocket(null);
      };

      ws.onerror = (error) => {
        console.error('Instructor Dashboard: WebSocket error:', error);
      };

      return ws;
    };

    const ws = connectWebSocket();
    return () => {
      if (ws && ws.close) {
        try {
          ws.close();
        } catch (error) {
          console.warn('Error closing WebSocket:', error);
        }
      }
    };
  }, [selectedConversation]);

  // API functions
  const fetchConversations = async () => {
    try {
      const response = await api.get('/discussions/messages/conversations/');
      setConversations(response.data.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const response = await api.get('/discussions/messages/users/');
      setAvailableUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await api.get(`/discussions/messages/conversations/${conversationId}/`);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const markMessagesAsRead = async (conversationId) => {
    try {
      await api.post(`/discussions/messages/conversations/${conversationId}/mark-read/`);
      console.log('Instructor Dashboard: Messages marked as read for conversation:', conversationId);
      fetchConversations();
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const response = await api.post('/discussions/messages/send/', {
        recipient_id: selectedConversation.other_user.id,
        content: newMessage
      });

      setNewMessage('');
      fetchConversations();
      
      console.log('Instructor Dashboard: Message sent via API, WebSocket will handle adding to UI');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const startNewConversation = async (userId) => {
    try {
      const response = await api.post('/discussions/messages/send/', {
        recipient_id: userId,
        content: 'Hello!'
      });

      fetchConversations();
      setShowNewChatModal(false);
      
      setTimeout(() => {
        fetchConversations().then(() => {
          const newConv = conversations.find(conv => conv.other_user.id === userId);
          if (newConv) {
            setSelectedConversation(newConv);
            fetchMessages(newConv.id);
          }
        });
      }, 500);
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  const handleTyping = () => {
    if (socket && socket.readyState === WebSocket.OPEN && selectedConversation) {
      socket.send(JSON.stringify({
        type: 'typing_indicator',
        conversation_id: selectedConversation.id,
        is_typing: true
      }));

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({
            type: 'typing_indicator',
            conversation_id: selectedConversation.id,
            is_typing: false
          }));
        }
      }, 1000);
    }
  };

  useEffect(() => {
    fetchConversations();
    fetchAvailableUsers();
  }, []);

  const filteredUsers = availableUsers.filter(user =>
    (user.first_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.last_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="h-[600px] bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="flex h-full">
          {/* Conversations List */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
                <button
                  onClick={() => setShowNewChatModal(true)}
                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <MessageSquare size={48} className="mx-auto mb-2 text-gray-300" />
                  <p>No conversations yet</p>
                  <button
                    onClick={() => setShowNewChatModal(true)}
                    className="mt-2 text-indigo-600 hover:text-indigo-800"
                  >
                    Start a conversation
                  </button>
                </div>
              ) : (
                conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => {
                      setSelectedConversation(conversation);
                      fetchMessages(conversation.id);
                    }}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedConversation?.id === conversation.id
                        ? 'bg-indigo-50 border-indigo-200'
                        : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 font-medium">
                            {getUserInitials(conversation.other_user)}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {conversation.other_user.name || `${conversation.other_user.first_name || ''} ${conversation.other_user.last_name || ''}`.trim() || conversation.other_user.email}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {conversation.last_message_time && 
                              new Date(conversation.last_message_time).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            }
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mb-1 capitalize">
                          {conversation.other_user.user_type}
                        </p>
                        <p className="text-sm text-gray-600 truncate">
                          {conversation.last_message || 'No messages yet'}
                        </p>
                      </div>
                      {conversation.unread_count > 0 && (
                        <div className="bg-indigo-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                          {conversation.unread_count}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-indigo-600 font-medium text-sm">
                        {getUserInitials(selectedConversation.other_user)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {selectedConversation.other_user.name || `${selectedConversation.other_user.first_name || ''} ${selectedConversation.other_user.last_name || ''}`.trim() || selectedConversation.other_user.email}
                      </h3>
                      <p className="text-sm text-gray-500">{selectedConversation.other_user.email}</p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.is_own_message ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.is_own_message
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.is_own_message
                            ? 'text-indigo-200'
                            : 'text-gray-500'
                        }`}>
                          {message.created_at && new Date(message.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg px-4 py-2">
                        <p className="text-sm text-gray-500">Typing...</p>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <Paperclip size={20} />
                    </button>
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => {
                          setNewMessage(e.target.value);
                          handleTyping();
                        }}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type a message..."
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <Smile size={20} />
                    </button>
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                  <p className="text-gray-500">Choose a conversation from the sidebar to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* New Chat Modal */}
        {showNewChatModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Start New Conversation</h3>
                <button
                  onClick={() => setShowNewChatModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="max-h-60 overflow-y-auto">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => startNewConversation(user.id)}
                    className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                  >
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-indigo-600 font-medium text-sm">
                        {getUserInitials(user)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email}
                      </p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MessagesView;