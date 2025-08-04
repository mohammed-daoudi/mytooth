"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from './AuthProvider';
import { useSocket } from './SocketProvider';
import {
  MessageSquare,
  Send,
  Search,
  Plus,
  User,
  Clock,
  CheckCircle2,
  Circle,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  X,
  Users,
  Stethoscope,
  Shield,
  ChevronLeft
} from 'lucide-react';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'dentist' | 'patient';
  avatar?: string;
  createdAt: string;
}

interface Message {
  _id: string;
  sender: User;
  recipient: User;
  content: string;
  messageType: 'text' | 'image' | 'file';
  attachments: string[];
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

interface Conversation {
  user: User;
  lastMessage: Message;
  unreadCount: number;
}

const UserRoleIcon = ({ role }: { role: string }) => {
  const icons = {
    admin: Shield,
    dentist: Stethoscope,
    patient: User
  };

  const Icon = icons[role as keyof typeof icons] || User;
  const colors = {
    admin: 'text-red-600',
    dentist: 'text-blue-600',
    patient: 'text-green-600'
  };

  return <Icon className={`h-3 w-3 ${colors[role as keyof typeof colors]}`} />;
};

const MessageBubble = ({ message, isOwn }: { message: Message; isOwn: boolean }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {!isOwn && (
          <Avatar className="h-6 w-6">
            <AvatarImage src={message.sender.avatar} alt={message.sender.name} />
            <AvatarFallback className="text-xs bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
              {message.sender.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
        )}

        <div className={`rounded-lg px-3 py-2 ${
          isOwn
            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
            : 'bg-slate-100 text-slate-900'
        }`}>
          <p className="text-sm">{message.content}</p>
          <div className={`flex items-center space-x-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <span className={`text-xs ${isOwn ? 'text-cyan-100' : 'text-slate-500'}`}>
              {new Date(message.createdAt).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
            {isOwn && (
              <div className="ml-1">
                {message.isRead ? (
                  <CheckCircle2 className="h-3 w-3 text-cyan-100" />
                ) : (
                  <Circle className="h-3 w-3 text-cyan-200" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ConversationItem = ({
  conversation,
  isSelected,
  onClick
}: {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`p-3 rounded-lg cursor-pointer transition-colors ${
        isSelected
          ? 'bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200'
          : 'hover:bg-slate-50'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarImage src={conversation.user.avatar} alt={conversation.user.name} />
            <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
              {conversation.user.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          {conversation.unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs">
              {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
            </Badge>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <h4 className="font-medium text-slate-900 truncate">{conversation.user.name}</h4>
              <UserRoleIcon role={conversation.user.role} />
            </div>
            <span className="text-xs text-slate-500">
              {new Date(conversation.lastMessage.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="text-sm text-slate-600 truncate">
            {conversation.lastMessage.content}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default function Chat() {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<{admin: User[], dentist: User[], patient: User[]}>({
    admin: [], dentist: [], patient: []
  });
  const [isMobileView, setIsMobileView] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch('/api/chat/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for selected conversation
  const fetchMessages = async (userId: string) => {
    try {
      setMessagesLoading(true);
      const token = localStorage.getItem('auth-token');
      const response = await fetch(`/api/chat?with=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  // Fetch available users for new conversations
  const fetchAvailableUsers = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch('/api/chat/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching available users:', error);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return;

    try {
      setSending(true);
      const token = localStorage.getItem('auth-token');

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipient: selectedConversation.user._id,
          content: newMessage.trim()
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, data.data]);
        setNewMessage('');

        // Update conversations list
        fetchConversations();

        // Emit real-time message if socket is connected
        if (socket && isConnected) {
          socket.emit('newMessage', {
            recipientId: selectedConversation.user._id,
            message: data.data
          });
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  // Handle new conversation start
  const startNewConversation = (selectedUser: User) => {
    const newConversation: Conversation = {
      user: selectedUser,
      lastMessage: {} as Message,
      unreadCount: 0
    };

    setSelectedConversation(newConversation);
    setMessages([]);
    setShowNewChat(false);
    setIsMobileView(true);
  };

  // Handle key press in message input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (user) {
      fetchConversations();
      fetchAvailableUsers();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.user._id);
    }
  }, [selectedConversation]);

  // Real-time message handling
  useEffect(() => {
    if (socket && isConnected) {
      socket.on('newMessage', (message: Message) => {
        // If message is for current conversation, add it to messages
        if (selectedConversation &&
            (message.sender._id === selectedConversation.user._id ||
             message.recipient._id === selectedConversation.user._id)) {
          setMessages(prev => [...prev, message]);
        }

        // Refresh conversations list
        fetchConversations();
      });

      return () => {
        socket.off('newMessage');
      };
    }
  }, [socket, isConnected, selectedConversation]);

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv =>
    conv.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Card className="h-[600px] border-0 shadow-xl">
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[600px] border-0 shadow-xl overflow-hidden">
      <div className="flex h-full">
        {/* Conversations List */}
        <div className={`${isMobileView && selectedConversation ? 'hidden' : 'flex'} flex-col w-full md:w-80 border-r border-slate-200`}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Messages</CardTitle>
              <Dialog open={showNewChat} onOpenChange={setShowNewChat}>
                <DialogTrigger asChild>
                  <Button size="sm" className="dental-gradient">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Start New Conversation</DialogTitle>
                    <DialogDescription>
                      Select a person to start a new conversation with.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {['admin', 'dentist', 'patient'].map(role => {
                      const users = availableUsers[role as keyof typeof availableUsers];
                      if (users.length === 0) return null;

                      return (
                        <div key={role}>
                          <h4 className="font-medium text-sm text-slate-700 mb-2 capitalize flex items-center">
                            <UserRoleIcon role={role} />
                            <span className="ml-1">{role}s</span>
                          </h4>
                          <div className="space-y-2">
                            {users.map(availableUser => (
                              <div
                                key={availableUser._id}
                                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer"
                                onClick={() => startNewConversation(availableUser)}
                              >
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={availableUser.avatar} alt={availableUser.name} />
                                  <AvatarFallback className="text-xs bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                                    {availableUser.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-sm">{availableUser.name}</p>
                                  <p className="text-xs text-slate-500">{availableUser.email}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full px-4">
              <div className="space-y-2">
                {filteredConversations.length > 0 ? (
                  filteredConversations.map(conversation => (
                    <ConversationItem
                      key={conversation.user._id}
                      conversation={conversation}
                      isSelected={selectedConversation?.user._id === conversation.user._id}
                      onClick={() => {
                        setSelectedConversation(conversation);
                        setIsMobileView(true);
                      }}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <p>No conversations yet</p>
                    <p className="text-sm">Start a new conversation to get started</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </div>

        {/* Chat Area */}
        <div className={`${!selectedConversation || (!isMobileView && !selectedConversation) ? 'hidden md:flex' : 'flex'} flex-col flex-1`}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="md:hidden"
                      onClick={() => setIsMobileView(false)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedConversation.user.avatar} alt={selectedConversation.user.name} />
                      <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                        {selectedConversation.user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-slate-900">{selectedConversation.user.name}</h3>
                        <UserRoleIcon role={selectedConversation.user.role} />
                      </div>
                      <p className="text-sm text-slate-500 capitalize">{selectedConversation.user.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="p-4">
                    {messagesLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                            <Skeleton className={`h-16 w-48 rounded-lg`} />
                          </div>
                        ))}
                      </div>
                    ) : messages.length > 0 ? (
                      messages.map(message => (
                        <MessageBubble
                          key={message._id}
                          message={message}
                          isOwn={message.sender._id === user?.userId}
                        />
                      ))
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                        <p>No messages yet</p>
                        <p className="text-sm">Send a message to start the conversation</p>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800">
                <div className="flex items-end space-x-2">
                  <Button variant="ghost" size="sm">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <div className="flex-1">
                    <Textarea
                      ref={messageInputRef}
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="min-h-[40px] max-h-32 resize-none"
                      rows={1}
                    />
                  </div>
                  <Button variant="ghost" size="sm">
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sending}
                    className="dental-gradient"
                  >
                    {sending ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-slate-50">
              <div className="text-center space-y-4">
                <MessageSquare className="h-16 w-16 mx-auto text-slate-300" />
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Select a conversation</h3>
                  <p className="text-slate-500">Choose a conversation from the list to start messaging</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
