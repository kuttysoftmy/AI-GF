import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, MenuIcon } from 'lucide-react';
import OpenAI from 'openai';
import axios from 'axios';

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
};

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: 'your-api-key', // Replace with your actual API key
  dangerouslyAllowBrowser: true
});

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAIResponse = async (userMessage: string) => {
    try {
      const res = await axios.post('http://localhost:8000/advice/', {
        message: userMessage
      });
      return res.data.response || "I apologize, but I'm unable to provide advice at the moment.";
    } catch (error) {
      console.error('Error getting AI response:', error);
      return "I apologize, but I'm having trouble connecting to the advice service at the moment.";
    }
  };
  

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Get AI response
    const aiResponse = await getAIResponse(inputText);
    
    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: aiResponse,
      isUser: false,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, botMessage]);
    setIsTyping(false);
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col text-gray-100">
      {/* Header */}
      <div className="bg-[#2a2a2a] p-4 flex items-center justify-between shadow-lg border-b border-[#333]">
        <div className="flex items-center space-x-3">
          <MenuIcon className="h-6 w-6 text-[#64B5F6]" />
          <div className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-[#64B5F6]" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-[#64B5F6] to-[#2196F3] bg-clip-text text-transparent">
              RelationshipGPT
            </h1>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-10">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-[#64B5F6]" />
            <p className="text-lg">Hi, How's going?</p>
            <p className="text-sm">Share your thoughts</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] md:max-w-[70%] rounded-lg p-3 ${
                message.isUser
                  ? 'bg-[#2196F3] text-white rounded-br-none'
                  : 'bg-[#2a2a2a] text-gray-100 rounded-bl-none border border-[#333]'
              } shadow-lg`}
            >
              <div className="flex items-center space-x-2 mb-1">
                {!message.isUser && <Sparkles className="h-4 w-4 text-[#64B5F6]" />}
                <span className="text-sm opacity-75">
                  {message.isUser ? 'You' : 'RelationshipGPT'}
                </span>
              </div>
              <p className="text-sm md:text-base">{message.text}</p>
              <div className="text-right mt-1">
                <span className="text-xs opacity-75">
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-[#2a2a2a] rounded-lg p-4 shadow-lg border border-[#333]">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-[#64B5F6] rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-[#64B5F6] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-[#64B5F6] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="bg-[#2a2a2a] p-4 shadow-lg border-t border-[#333]">
        <div className="max-w-4xl mx-auto flex items-center space-x-4">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 px-6 rounded-full bg-[#1a1a1a] border border-[#333] text-gray-100 focus:outline-none focus:border-[#64B5F6] focus:ring-1 focus:ring-[#64B5F6] placeholder-gray-500"
          />
          <button
            type="submit"
            className="bg-[#2196F3] text-white p-2 rounded-full hover:bg-[#1976D2] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!inputText.trim()}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
}

export default App;