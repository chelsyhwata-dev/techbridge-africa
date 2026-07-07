import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, MessageSquare } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export default function Messages() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(params.get('to') ? Number(params.get('to')) : null);
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState('');
  const bottomRef = useRef(null);

  const loadConversations = () => api.get('/messages').then((res) => setConversations(res.data)).catch(() => {});

  useEffect(() => { loadConversations(); }, []);

  useEffect(() => {
    if (!activeId) return;
    api.get(`/messages/${activeId}`).then((res) => setMessages(res.data)).catch(() => {});
  }, [activeId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!body.trim() || !activeId) return;
    try {
      await api.post('/messages', { recipientId: activeId, body });
      setBody('');
      const res = await api.get(`/messages/${activeId}`);
      setMessages(res.data);
      loadConversations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send');
    }
  };

  const activeConvo = conversations.find((c) => c.counterpart_id === activeId);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="text-gold-500" size={28} />
        <h1 className="text-3xl font-bold text-navy-900">Messages</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-4 card p-0 overflow-hidden" style={{ height: '65vh' }}>
        <div className="border-r border-gray-100 overflow-y-auto">
          {conversations.length === 0 ? (
            <p className="text-sm text-gray-400 p-4">No conversations yet.</p>
          ) : conversations.map((c) => (
            <button key={c.counterpart_id} onClick={() => setActiveId(c.counterpart_id)}
              className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-navy-50/50 ${activeId === c.counterpart_id ? 'bg-navy-50' : ''}`}>
              <div className="flex justify-between">
                <p className="font-medium text-navy-900 text-sm">{c.counterpart_name}</p>
                {c.unread_count > 0 && <span className="badge-gold text-[10px]">{c.unread_count}</span>}
              </div>
              <p className="text-xs text-gray-500 line-clamp-1">{c.last_message}</p>
            </button>
          ))}
        </div>

        <div className="md:col-span-2 flex flex-col">
          {activeId ? (
            <>
              <div className="px-4 py-3 border-b border-gray-100 font-medium text-navy-900">{activeConvo?.counterpart_name || 'Conversation'}</div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {messages.map((m) => (
                  <div key={m.id} className={`max-w-xs px-3 py-2 rounded-2xl text-sm ${m.sender_id === user.id ? 'bg-navy-900 text-white ml-auto rounded-br-sm' : 'bg-gray-100 text-navy-900 rounded-bl-sm'}`}>
                    {m.body}
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <form onSubmit={send} className="p-3 border-t border-gray-100 flex gap-2">
                <input value={body} onChange={(e) => setBody(e.target.value)} className="input-field flex-1" placeholder="Type a message..." />
                <button type="submit" className="btn-gold px-4"><Send size={16} /></button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Select a conversation</div>
          )}
        </div>
      </div>
    </div>
  );
}
