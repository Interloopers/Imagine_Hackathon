import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const Feature = () => {
  const [socket, setSocket] = useState(null);
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [activity, setActivity] = useState("");
  const chatDisplayRef = useRef(null);
  let activityTimer;

  useEffect(() => {
    const newSocket = io("ws://localhost:8080");
    setSocket(newSocket);

    newSocket.on("message", (data) => {
      setActivity("");
      setMessages((prev) => [...prev, data]);
    });

    newSocket.on("activity", (userName) => {
      setActivity(`${userName} is typing...`);
      clearTimeout(activityTimer);
      activityTimer = setTimeout(() => setActivity(""), 3000);
    });

    newSocket.on("userList", ({ users }) => {
      setUsers(users);
    });

    newSocket.on("roomList", ({ rooms }) => {
      setRooms(rooms);
    });

    return () => newSocket.disconnect();
  }, []);

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (name && room) {
      socket.emit("enterRoom", { name, room });
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (name && room && message) {
      socket.emit("message", { name, text: message });
      setMessage("");
    }
  };

  const handleTyping = () => {
    if (name) {
      socket.emit("activity", name);
    }
  };

  useEffect(() => {
    if (chatDisplayRef.current) {
      chatDisplayRef.current.scrollTop = chatDisplayRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 py-8">
      <form
        className="flex flex-col md:flex-row items-center gap-4 mb-6"
        onSubmit={handleJoinRoom}
      >
        <input
          type="text"
          id="name"
          maxLength="8"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="px-4 py-2 border rounded-md shadow-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="text"
          id="room"
          placeholder="Chat room"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          required
          className="px-4 py-2 border rounded-md shadow-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 transition"
        >
          Join
        </button>
      </form>

      <div className="w-full max-w-3xl bg-white shadow-md rounded-lg overflow-hidden">
        <div
          className="chat-display h-64 overflow-y-auto p-4 bg-gray-50"
          ref={chatDisplayRef}
        >
          {messages.map(({ name: sender, text, time }, index) => (
            <div
              key={index}
              className={`mb-4 flex ${
                sender === name ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  sender === name
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                <div className="text-sm font-medium">{sender}</div>
                <div className="text-sm">{text}</div>
                <div className="text-xs text-gray-500 text-right">{time}</div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-500 py-2">{activity}</p>

        <form
          className="flex items-center gap-4 p-4 border-t"
          onSubmit={handleSendMessage}
        >
          <input
            type="text"
            id="message"
            placeholder="Your message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleTyping}
            required
            className="flex-grow px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-green-500 text-white rounded-md shadow-md hover:bg-green-600 transition"
          >
            Send
          </button>
        </form>
      </div>

      <div className="w-full max-w-3xl mt-6">
        <p className="text-gray-700">
          <strong>Users in {room}:</strong> {users.map((user) => user.name).join(", ")}
        </p>
        <p className="text-gray-700">
          <strong>Active Rooms:</strong> {rooms.join(", ")}
        </p>
      </div>
    </div>
  );
};

export default Feature;
