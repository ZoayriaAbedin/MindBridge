import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import messagingAPI from '../services/messaging';
import './Messages.css';

const Messages = () => {
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user'));
  const currentUserId = user?.id || user?.userId;

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Auto-select conversation if passed via navigation state
  useEffect(() => {
    if (location.state?.selectedConversation) {
      setSelectedConversation(location.state.selectedConversation);
    }
  }, [location.state]);

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation?.id) {
      loadMessages(selectedConversation.id);
      
      // Poll for new messages every 5 seconds
      const interval = setInterval(() => {
        loadMessages(selectedConversation.id, true);
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const response = await messagingAPI.getConversations();
      setConversations(response.data || []);
    } catch (error) {
      console.error('Failed to load conversations:', error);
      setConversations([]);
    }
  };

  const loadMessages = async (conversationId, silent = false) => {
    if (!conversationId) return;
    
    try {
      if (!silent) setLoading(true);
      const response = await messagingAPI.getMessages(conversationId);
      setMessages(response.data || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
      if (error.response?.status === 403) {
        alert('You do not have access to this conversation');
        setSelectedConversation(null);
      }
      setMessages([]);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation || sending) return;

    try {
      setSending(true);
      const recipientId = selectedConversation.other_user_id;
      const response = await messagingAPI.sendMessage(recipientId, newMessage.trim());
      
      // Add new message to the list
      setMessages([...messages, response.data]);
      setNewMessage('');
      
      // Refresh conversations to update last message
      loadConversations();
    } catch (error) {
      console.error('Failed to send message:', error);
      alert(error.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const formatMessageTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="messages-container">
      {/* Sidebar - Conversations List */}
      <div className="messages-sidebar">
        <div className="sidebar-header">
          <h2>Messages</h2>
        </div>
        <div className="conversations-list">
          {conversations.length === 0 ? (
            <div className="no-conversations">
              <p>No conversations yet</p>
              <small>Start chatting with a {user.role === 'patient' ? 'doctor' : 'patient'}</small>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={`conversation-item ${selectedConversation?.id === conv.id ? 'active' : ''}`}
                onClick={() => setSelectedConversation(conv)}
              >
                <div className="conversation-avatar">
                  {conv.other_user_picture ? (
                    <img src={conv.other_user_picture} alt={conv.other_user_name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {conv.other_user_name?.charAt(0) || '?'}
                    </div>
                  )}
                </div>
                <div className="conversation-info">
                  <div className="conversation-header">
                    <h4>{conv.other_user_name || 'Unknown'}</h4>
                    <span className="conversation-time">
                      {formatTime(conv.last_message_at)}
                    </span>
                  </div>
                  <p className="last-message">{conv.last_message || 'No messages yet'}</p>
                  {conv.unread_count > 0 && (
                    <span className="unread-badge">{conv.unread_count}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="messages-main">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="chat-header">
              <div className="chat-user-info">
                <div className="chat-avatar">
                  {selectedConversation.other_user_picture ? (
                    <img 
                      src={selectedConversation.other_user_picture} 
                      alt={selectedConversation.other_user_name} 
                    />
                  ) : (
                    <div className="avatar-placeholder">
                      {selectedConversation.other_user_name?.charAt(0) || '?'}
                    </div>
                  )}
                </div>
                <div>
                  <h3>{selectedConversation.other_user_name || 'Unknown'}</h3>
                  <span className="user-role">{selectedConversation.other_user_role}</span>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="messages-area">
              {loading ? (
                <div className="loading">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="no-messages">
                  <p>No messages yet</p>
                  <small>Start the conversation</small>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`message ${message.sender_id === currentUserId ? 'sent' : 'received'}`}
                  >
                    <div className="message-content">
                      <p>{message.message_text}</p>
                      <span className="message-time">
                        {formatMessageTime(message.created_at)}
                      </span>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form className="message-input-area" onSubmit={handleSendMessage}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="message-input"
                disabled={sending}
              />
              <button 
                type="submit" 
                className="send-button"
                disabled={!newMessage.trim() || sending}
              >
                {sending ? 'Sending...' : 'Send'}
              </button>
            </form>
          </>
        ) : (
          <div className="no-conversation-selected">
            <h3>Select a conversation</h3>
            <p>Choose a conversation from the sidebar to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
