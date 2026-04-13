import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db, auth } from './firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';

function Chat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const user = auth.currentUser;

  useEffect(() => {
    if (!id) return;
    const q = query(collection(db, 'chats', id, 'messages'), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = [];
      snapshot.forEach((doc) => msgs.push({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
    return () => unsubscribe();
  }, [id]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    await addDoc(collection(db, 'chats', id, 'messages'), {
      text: newMessage,
      senderId: user?.uid,
      timestamp: serverTimestamp(),
    });
    setNewMessage('');
  };

  return (
    <div className="h-screen flex flex-col bg-gray-200">
      <div className="bg-green-600 text-white p-4 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="text-2xl">←</button>
        <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center text-white font-semibold">
          {id?.[0]?.toUpperCase() || 'C'}
        </div>
        <div className="flex-1">
          <h2 className="font-semibold">Chat Room</h2>
          <p className="text-xs text-green-100">Online</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg) => {
          const isMe = msg.senderId === user?.uid;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-lg px-4 py-2 ${isMe ? 'bg-green-100' : 'bg-white'}`}>
                <p className="text-sm">{msg.text}</p>
                <p className="text-[10px] text-gray-500 text-right mt-1">
                  {msg.timestamp?.toDate?.().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) || 'Baru saja'}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="bg-white p-4 border-t flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Ketik pesan..."
          className="flex-1 px-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-green-300"
        />
        <button type="submit" disabled={!newMessage.trim()} className="px-6 bg-green-600 text-white rounded-full font-semibold disabled:opacity-50">
          Kirim
        </button>
      </form>
    </div>
  );
}

export default Chat;
