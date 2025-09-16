import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Plus, Search, Paperclip, Smile, X } from 'lucide-react';
import authService from '../../services/authService';
import apiService from '../../services/api';

const StudentMessagesView = () => {
  const [activeChat, setActiveChat] = useState(null);
  const [message, setMessage] = useState('');
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [websocket, setWebsocket] = useState(null);
  const [userWebsocket, setUserWebsocket] = useState(null);  // New: user-specific WebSocket
  const [connectionStatus, setConnectionStatus] = useState('disconnected');  // Connection status
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  useEffect(() => {
    fetchConversations();
    fetchAvailableUsers();
    
    // Connect to user-specific WebSocket for global message notifications
    connectUserWebSocket();
    
    // Cleanup WebSocket on component unmount
    return () => {
      if (websocket) {
        websocket.close();
      }
      if (userWebsocket) {
        userWebsocket.close();
      }
    };
  }, []);

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat);
      connectWebSocket(activeChat);
    }
  }, [activeChat]);

  const fetchConversations = async () => {
    try {
      console.log('Fetching conversations...');
      const response = await apiService.get('/discussions/messages/conversations/');
      console.log('Conversations response:', response.data);
      setConversations(response.data.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await apiService.get(`/discussions/messages/conversations/${conversationId}/`);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const markMessagesAsRead = async (conversationId) => {
    try {
      await apiService.post(`/discussions/messages/conversations/${conversationId}/mark-read/`);
      console.log('Student Dashboard: Messages marked as read for conversation:', conversationId);
      // Update conversation list to reflect the read status change
      fetchConversations();
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const connectUserWebSocket = () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('Student Dashboard: No access token found for user WebSocket connection');
      return;
    }
    
    const wsUrl = `ws://localhost:8000/ws/user/?token=${token}`;
    console.log('Student Dashboard: Connecting to user WebSocket URL:', wsUrl);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('Student Dashboard: User WebSocket connected');
      setUserWebsocket(ws);
      setConnectionStatus('connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Student Dashboard: User WebSocket message received:', data);
        
        if (data.type === 'chat_message') {
          // Always update conversation list for any message
          fetchConversations();
          
          // Handle both old and new message formats
          let messageData;
          if (data.message && typeof data.message === 'object') {
            // New format from API
            messageData = data.message;
          } else {
            // Old format from WebSocket
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
          
          // If this message is for the currently active conversation, add it to messages
          if (messageData.conversation_id === activeChat) {
            console.log('Student Dashboard: Adding message from user WebSocket to current conversation');
            setMessages(prev => {
              // Check if message already exists to avoid duplicates
              if (prev.some(msg => msg.id === messageData.id)) {
                console.log('Student Dashboard: Message already exists, skipping duplicate');
                return prev;
              }
              
              const newMessages = [...prev, messageData];
              console.log('Student Dashboard: Updated messages from user WebSocket:', newMessages);
              return newMessages;
            });
            
            // Mark message as read if it's not from the current user and the conversation is active
            if (!messageData.is_own_message) {
              markMessagesAsRead(messageData.conversation_id);
            }
          }
        }
      } catch (error) {
        console.error('Student Dashboard: Error parsing user WebSocket message:', error);
      }
    };

    ws.onclose = (event) => {
      console.log('Student Dashboard: User WebSocket disconnected. Code:', event.code, 'Reason:', event.reason);
      setUserWebsocket(null);
      setConnectionStatus('disconnected');
      
      // Attempt to reconnect after 3 seconds if not intentionally closed
      if (event.code !== 1000) {
        setTimeout(() => {
          console.log('Student Dashboard: Attempting to reconnect user WebSocket...');
          connectUserWebSocket();
        }, 3000);
      }
    };

    ws.onerror = (error) => {
      console.error('Student Dashboard: User WebSocket error:', error);
      setConnectionStatus('error');
    };
  };

  const connectWebSocket = (conversationId) => {
    console.log('Student Dashboard: Connecting to WebSocket for conversation:', conversationId);
    
    // Close existing connection
    if (websocket) {
      console.log('Student Dashboard: Closing existing WebSocket connection');
      websocket.close();
    }

    // Create new WebSocket connection
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('Student Dashboard: No access token found for WebSocket connection');
      return;
    }
    
    const wsUrl = `ws://localhost:8000/ws/chat/${conversationId}/?token=${token}`;
    console.log('Student Dashboard: Connecting to WebSocket URL:', wsUrl);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('Student Dashboard: WebSocket connected to conversation:', conversationId);
      setWebsocket(ws);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Student Dashboard: WebSocket message received:', data);
        
        if (data.type === 'chat_message') {
          // Handle both old and new message formats
          let messageData;
          if (data.message && typeof data.message === 'object') {
            // New format from API
            messageData = data.message;
          } else {
            // Old format from WebSocket
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
          
          // Only add message if it belongs to the current active conversation
          if (messageData.conversation_id === conversationId) {
            console.log('Student Dashboard: Adding message to current conversation:', messageData.conversation_id);
            setMessages(prev => {
              // Check if message already exists to avoid duplicates
              if (prev.some(msg => msg.id === messageData.id)) {
                console.log('Student Dashboard: Message already exists in conversation, skipping duplicate');
                return prev;
              }
              
              const newMessages = [...prev, messageData];
              console.log('Student Dashboard: Updated messages array:', newMessages);
              return newMessages;
            });
            
            // Mark message as read if it's not from the current user and the conversation is active
            if (!messageData.is_own_message) {
              markMessagesAsRead(messageData.conversation_id);
            }
          } else {
            console.log('Student Dashboard: Message for different conversation, not adding to current view. Expected:', conversationId, 'Got:', messageData.conversation_id);
          }
          
          // Update conversation list to show latest message
          fetchConversations();
        } else if (data.type === 'typing') {
          // Handle typing indicators here if needed
          console.log('Student Dashboard: Typing indicator:', data);
        }
      } catch (error) {
        console.error('Student Dashboard: Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = (event) => {
      console.log('Student Dashboard: WebSocket disconnected. Code:', event.code, 'Reason:', event.reason);
      setWebsocket(null);
      
      // Attempt to reconnect if not intentionally closed and still on same conversation
      if (event.code !== 1000 && activeChat === conversationId) {
        setTimeout(() => {
          console.log('Student Dashboard: Attempting to reconnect WebSocket for conversation:', conversationId);
          connectWebSocket(conversationId);
        }, 2000);
      }
    };

    ws.onerror = (error) => {
      console.error('Student Dashboard: WebSocket error:', error);
    };
  };

  const sendMessage = async () => {
    if (!message.trim() || !activeChat || sending) return;

    setSending(true);
    
    try {
      // Get recipient ID from the active conversation
      const activeConversation = conversations.find(c => c.id === activeChat);
      if (!activeConversation) return;

      const response = await apiService.post('/discussions/messages/send/', {
        recipient_id: activeConversation.other_user.id,
        content: message.trim(),
      });

      if (response.status >= 200 && response.status < 300) {
        // Don't add message to local state - let WebSocket handle it to prevent duplicates
        setMessage('');
        
        // Update conversation list to show latest message
        fetchConversations();
        
        console.log('Student Dashboard: Message sent via API, WebSocket will handle adding to UI');
      } else {
        console.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      console.log('Fetching available users...');
      const response = await apiService.get('/discussions/messages/users/');
      console.log('Available users response:', response.data);
      setAvailableUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching available users:', error);
    }
  };

  const startNewConversation = async (userId) => {
    try {
      const response = await apiService.post('/discussions/messages/send/', {
        recipient_id: userId,
        content: 'Hello!'
      });

      if (response.status >= 200 && response.status < 300) {
        fetchConversations();
        setShowNewChatModal(false);
        
        // Find and select the new conversation
        setTimeout(() => {
          fetchConversations().then(() => {
            const newConv = conversations.find(conv => conv.other_user.id === userId);
            if (newConv) {
              setActiveChat(newConv.id);
              fetchMessages(newConv.id);
            }
          });
        }, 500);
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-120px)] bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Left Sidebar - Conversations List */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length > 0 ? (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setActiveChat(conv.id)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  activeChat === conv.id ? 'bg-indigo-50 border-indigo-200' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="relative">
                    <img
                      src={conv.other_user.avatar}
                      alt={conv.other_user.name}
                      className="w-12 h-12 rounded-full"
                    />
                    {/* You can add online status here later */}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {conv.other_user.name}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {new Date(conv.last_message_time).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-1 capitalize">
                      {conv.other_user.user_type}
                    </p>
                    <p className="text-sm text-gray-600 truncate">{conv.last_message}</p>
                  </div>
                  {conv.unread_count > 0 && (
                    <div className="bg-indigo-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                      {conv.unread_count}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No conversations yet</p>
              <p className="text-sm">Start a conversation with your instructors</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Active Chat */}
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {(() => {
                    const conv = conversations.find(c => c.id === activeChat);
                    return conv ? (
                      <>
                        <img
                          src={conv.other_user.avatar}
                          alt={conv.other_user.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {conv.other_user.name}
                          </h3>
                          <p className="text-sm text-gray-500 capitalize">
                            {conv.other_user.user_type}
                          </p>
                        </div>
                      </>
                    ) : null;
                  })()}
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.is_own_message ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.is_own_message
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}>
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-xs mt-1 ${
                      msg.is_own_message ? 'text-indigo-200' : 'text-gray-500'
                    }`}>
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-end space-x-2">
                <button className="p-2 text-gray-500 hover:text-gray-700">
                  <Paperclip size={20} />
                </button>
                <div className="flex-1 relative">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows="1"
                    disabled={sending}
                  />
                </div>
                <button className="p-2 text-gray-500 hover:text-gray-700">
                  <Smile size={20} />
                </button>
                <button
                  onClick={sendMessage}
                  disabled={!message.trim() || sending}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {sending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          /* No Chat Selected */
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-600">
                Choose a conversation from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
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
              {availableUsers
                .filter(user =>
                  user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  user.email.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((user) => (
                <div
                  key={user.id}
                  onClick={() => startNewConversation(user.id)}
                  className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                >
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 font-medium text-sm">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentMessagesView;