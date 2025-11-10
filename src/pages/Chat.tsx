import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { LogOut, Send, Plus, MessageSquare } from 'lucide-react';

interface ChatRoom {
  id: number;
  name: string;
}

interface Message {
  id: number;
  sender: number;
  receiver: number[];
  content: string;
  timestamp: string;
  chat_room: number;
}

const Chat = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchChatRooms();
  }, [user, navigate]);

  useEffect(() => {
    if (selectedRoom) {
      fetchMessages();
    }
  }, [selectedRoom]);

  const fetchChatRooms = async () => {
    try {
      const response = await fetch('http://3.27.235.209:8000/api/chat_rooms/', {
        headers: {
          'Authorization': `token ${user?.token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setChatRooms(data);
        if (data.length > 0 && !selectedRoom) {
          setSelectedRoom(data[0]);
        }
      }
    } catch (error) {
      toast.error('Failed to fetch chat rooms');
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch('http://3.27.235.209:8000/api/send_message/');
      if (response.ok) {
        const data = await response.json();
        const roomMessages = data.filter((msg: Message) => msg.chat_room === selectedRoom?.id);
        setMessages(roomMessages);
      }
    } catch (error) {
      toast.error('Failed to fetch messages');
    }
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedRoom) return;

    setIsLoading(true);
    try {
      const response = await fetch('http://3.27.235.209:8000/api/send_message/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: 1,
          receiver: [2],
          content: messageInput,
          timestamp: new Date().toISOString(),
          chat_room: selectedRoom.id,
        }),
      });

      if (response.ok) {
        setMessageInput('');
        fetchMessages();
      }
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <div className="w-80 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-sidebar-foreground">Messages</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-sidebar-foreground/60 mt-2">@{user?.username}</p>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            <div className="flex items-center justify-between px-2 py-3">
              <h3 className="text-xs font-semibold text-sidebar-foreground/60 uppercase">Chat Rooms</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-sidebar-foreground hover:text-sidebar-primary"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-1">
              {chatRooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(room)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedRoom?.id === room.id
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                  }`}
                >
                  <span className="font-medium"># {room.name}</span>
                </button>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-background">
        {selectedRoom ? (
          <>
            <div className="p-4 border-b border-border">
              <h2 className="text-xl font-semibold"># {selectedRoom.name}</h2>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4 max-w-3xl mx-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 1 ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-md px-4 py-2 rounded-2xl ${
                        message.sender === 1
                          ? 'bg-chat-bubble-sent text-white'
                          : 'bg-chat-bubble-received border border-border'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <span className="text-xs opacity-70 mt-1 block">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-border">
              <div className="max-w-3xl mx-auto flex gap-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message..."
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  disabled={isLoading}
                  className="bg-chat-input-bg"
                />
                <Button
                  onClick={sendMessage}
                  disabled={isLoading || !messageInput.trim()}
                  className="bg-gradient-primary hover:opacity-90 transition-opacity"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <p>Select a chat room to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
