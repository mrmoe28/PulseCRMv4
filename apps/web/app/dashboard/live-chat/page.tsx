'use client';
import React, { useState, useRef, useEffect } from 'react';
import DashboardLayout from '../../../components/dashboard-layout';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function LiveChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/perplexity-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || 'No response.';
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Error connecting to support.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Live Chat">
      <div className="p-8 flex flex-col h-[70vh]">
        <h1 className="text-2xl font-bold text-white mb-4">Live Chat</h1>
        <div className="flex-1 overflow-y-auto bg-gray-800 border border-gray-700 rounded-xl p-6 mb-4">
          {messages.length === 0 && (
            <div className="text-gray-400 text-center">How can we help you today?</div>
          )}
          {messages.map((msg, idx) => (
            <div key={idx} className={`mb-2 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`px-4 py-2 rounded-lg max-w-xs ${msg.role === 'user' ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-100'}`}>{msg.content}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            className="flex-1 rounded-lg px-4 py-2 bg-gray-700 text-white border border-gray-600 focus:outline-none"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            autoFocus
          />
          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            disabled={loading || !input.trim()}
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
} 