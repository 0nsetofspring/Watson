// client/src/components/ChatBox.jsx

import { useState } from 'react';
import { sendChatMessage } from '../api/game';
import { useAuth } from '../context/AuthContext';

const ChatBox = ({ playthroughId }) => {
  const { token } = useAuth();
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    const currentInput = input.trim();
    if (!currentInput || isLoading) return;

    setInput('');
    setIsLoading(true);

    const userMessage = {
      id: Date.now(), // 임시 고유 ID
      messageText: currentInput,
      isUserMessage: true,
    };
    
    // 1. 사용자 메시지를 화면에 먼저 보여준다.
    setMessages(prev => [...prev, userMessage]);
    
    try {
      // 2. 서버에 메시지를 보내고 NPC 응답을 기다린다.
      const npcMessage = await sendChatMessage(playthroughId, currentInput, token);
      
      // 3. 서버 응답을 기존 메시지 목록에 추가한다.
      //    (주의: userMessage가 포함된 배열에 npcMessage를 추가하는 것이 아님)
      setMessages(prev => [...prev, npcMessage]);

    } catch (error) {
      console.error(error);
      alert(error.message);
      // 4. 에러 발생 시, 미리 보여줬던 사용자 메시지를 제거하고 입력창을 복원한다.
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
      setInput(currentInput);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div style={{ minHeight: 200, border: '1px solid #ccc', padding: 8 }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ textAlign: msg.isUserMessage ? 'right' : 'left' }}>
            <b>{msg.isUserMessage ? '나' : 'NPC'}:</b> {msg.messageText}
          </div>
        ))}
        {isLoading && <div style={{ textAlign: 'left' }}>...</div>}
      </div>
      <form onSubmit={handleSend}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !input.trim()}>전송</button>
      </form>
    </div>
  );
};

export default ChatBox;