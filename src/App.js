import { ChatContainer, MainContainer, Message, MessageInput, MessageList, TypingIndicator } from '@chatscope/chat-ui-kit-react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { Box } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from 'recharts';
import { API_KEY, INACTIVITY_TIMEOUT } from './constants/apiConstants';
import './styles/App.css';


function App() {
  const [timer, setTimer] = useState(null);
  const [chatStarted, setChatStarted] = useState(false);
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      message: "Hello, I am ChatGPT",
      sender: "CHATGPT",
      direction: "incoming",
    }
  ]);

  const handleSend = async (message) => {
    resetTimer();
    const newMessage = {
      message: message,
      sender: "user",
      direction: "outgoing"
    };
    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setTyping(true);
    await processMessageToChatGPT(newMessages);
  };

  const endChat = () => {
    localStorage.setItem('chatHistory', JSON.stringify(messages));
    setChatStarted(false);
    setMessages([]);
    clearTimeout(timer);
  };
  const resetTimer = () => {
    clearTimeout(timer);
    const newTimer = setTimeout(() => {
      endChat();
      alert('Chat ended due to inactivity.');
    }, INACTIVITY_TIMEOUT);
    setTimer(newTimer);
  };

  useEffect(() => {
    if (chatStarted) {
      resetTimer();
    }
    return () => clearTimeout(timer);
  }, [chatStarted]);


  async function processMessageToChatGPT(chatMessages) {
    const apiMessage = chatMessages.map((messageObject) => ({
      role: messageObject.sender === "ChatGPT" ? "assistant" : "user",
      content: messageObject.message
    }));

    const systemMessage = {
      role: "system",
      content: "Explain all concepts like I am 10 years old."
    };

    const apiRequestBody = {
      model: "gpt-3.5-turbo",
      messages: [systemMessage, ...apiMessage]
    };


  await fetch("https://api.openai.com/v1/chat/completions",{

    method:"POST",
    headers:{
      "Authorization": "Bearer " + API_KEY,
      "Content-Type" : "application/json"
    },

    body : JSON.stringify(apiRequestBody)
  }).then((data) => {
    return data.json();
  }).then((data) =>{
    console.log(data);
    console.log(data.choices[0].message.content);
    setMessages(
      [
        ...chatMessages,{
          message : data.choices[0].message.content,
          sender : "ChatGPT"
        }
      ]
    );
    setTyping(false);
  });
  
}

 
  const data = [
    { name: 'Incoming', count: messages.filter(msg => msg.direction === 'incoming').length },
    { name: 'Outgoing', count: messages.filter(msg => msg.direction === 'outgoing').length }
  ];

  return (
    <div className="App">
      <Box sx={{ position: "center", height: "600px", width: "600px", display: "flex", flexDirection: "column" }}>
        <MainContainer style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <ChatContainer style={{ flex: 9 }}>
            <MessageList scrollBehavior="smooth" typingIndicator={typing ? <TypingIndicator content="ChatGPT is Typing" /> : null}>
              {messages.map((message, i) => (
                <Message key={i} model={{ message: message.message, direction: message.direction }}
                  className={message.direction === "incoming" ? "incoming-message" : "outgoing-message"} />
              ))}
            </MessageList>
            {chatStarted && (
              <MessageInput placeholder="Type message here" onSend={handleSend} />
            )}
          </ChatContainer>
          {chatStarted ? (
            <button onClick={endChat} style={{ padding: '10px 30px', width: '100%', marginTop: '10px' }}>
              End Chat
            </button>
          ) : (
            <button onClick={() => setChatStarted(true)} style={{ padding: '10px 30px', width: '100%', marginTop: '10px' }}>
              Start Chat
            </button>
          )}
        </MainContainer>
        {chatStarted && (
          <BarChart width={600} height={300} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        )}
      </Box>
    </div>
  );
}

export default App;
