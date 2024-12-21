import { socket } from '~/socket.client';
import { useEffect, useState } from 'react';

export default function Component() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    socket.connect();

    socket.on('message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="p-4 flex flex-col gap-2 container mx-auto h-[50vh]">
      <h1 className="text-xl font-bold ">Chat</h1>
      <div className="bg-base-100 p-2 border border-gray-300 rounded-lg grow overflow-auto">
        {messages.map((message, index) => (
          <div className="font-mono text-sm" key={index}>
            {message}
          </div>
        ))}
      </div>
      <div className="flex flex-row gap-2">
        <input
          className="input input-bordered w-full font-mono text-sm"
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              socket.emit('message', message);
              setMessage('');
            }
          }}
        />
        <input
          className="btn"
          type="button"
          value="Send"
          onClick={() => {
            socket.emit('message', message);
            setMessage('');
          }}
        />
      </div>
    </div>
  );
}
