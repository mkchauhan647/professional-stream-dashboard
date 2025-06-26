// import { useEffect,useRef,useState } from "react";
// import socket from "../services/rawWsSocket";

// interface User {
//     id: string;
// }

// export default function WebRTCMessage() {


//     const [users, setUsers] = useState<User[]>([]);
//     const [messages, setMessages] = useState([]);
//     const [selectedUser, setSelectedUser] = useState<string>();
//     const messageRef = useRef(null);
//     const [dataChannel, setDataChannel] = useState<RTCDataChannel>();
//     const [peerConnections,setPeerConnections] =

//     useEffect(() => {
//         if(socket.readyState === WebSocket.OPEN) {
//             console.log('WebSocket is already open');
//             socket.send(JSON.stringify({ type: 'greeting', message: 'Hello from WebRTCMessage!' }));
//         } else {
//             socket.onopen = () => {
//                 console.log('WebSocket connection established');
//                 socket.send(JSON.stringify({ type: 'greeting', message: 'Hello from WebRTCMessage!' }));
//             }
//             socket.onerror = (error) => {
//                 console.error('WebSocket error:', error);
//             };
//         }
//     }, []);


//     const setupPeerConnection = async (destinationSocketId:string) => {

//         const queueIceCandidates = [];
//         const sender = new RTCPeerConnection();
//         const receiver = new RTCPeerConnection();

//         const senderDataChannel = sender.createDataChannel('chat');
//         setDataChannel(senderDataChannel);
//         // const recieverDataChannel =

//         receiver.ondatachannel = (event) => {
//             const channel = event.channel;
//             // console.log("message Recieved from Sender:",event.d)
//             channel.onmessage = (event) => {
//                 console.log("Message Recieved from Sender: ", event.data);
//             }
//         }

//         // Handle ICE candidates
//         sender.onicecandidate = (event) => {
//             if (event.candidate) {
//                 socket.send(JSON.stringify({
//                     type: 'iceCandidate',
//                     candidate: event.candidate,
//                     target:destinationSocketId
//                 }))
//             }
//         }

//         receiver.onicecandidate = (event) => {
//             if (event.candidate) {
//                 socket.send(JSON.stringify({
//                     type: 'iceCandidate',
//                     candidate: event.candidate,
//                     target: destinationSocketId
//                 }))
//             }
//         }


//         const offer = await sender.createOffer();
//         await sender.setLocalDescription(offer);
//         socket.send(JSON.stringify({
//             type: 'offer',
//             offer: offer,
//             target: destinationSocketId
//         }))

//         const answer = await receiver.createAnswer();
//         await receiver.setLocalDescription(answer);

//         socket.onmessage = async (event) => {
//             const data = JSON.parse(event.data);

//             if (data.type == 'offer') {
//                 await receiver.setRemoteDescription(data.offer);
//                 receiver.addIceCandidate(new RTCIceCandidate(data.iceCandidate));
//             }

//             if (data.type == 'answer') {
//                 await sender.setRemoteDescription(data.answer);
//                 sender.addIceCandidate(new RTCIceCandidate(data.iceCandidate));
//             }

//             if (data.type == 'iceCandidate') {

//                 if (receiver.remoteDescription && sender.remoteDescription) {
//                     sender.addIceCandidate(new RTCIceCandidate(data.iceCandidate));
//                     receiver.addIceCandidate( new RTCIceCandidate(data.iceCandidate));
//                 } else if (sender.remoteDescription) {
//                     sender.addIceCandidate(new RTCIceCandidate(data.iceCandidate));
//                 } else if (receiver.remoteDescription) {
//                     receiver.addIceCandidate(new RTCIceCandidate(data.iceCandidate));
//                 } else {
//                     queueIceCandidates.push(data.iceCandidate);
//                 }
                
//             }
//         }



//     }

//     const handleSendMessage = (user: string) => {




        
//     }


//     return (
//         <div>
//         <h1>WebRTC Message Component</h1>
//             <p>This component handles WebRTC messages.</p>
            
//             {
//                 users && users.map((user:User, index) => {
//                     return (
//                         <div key={index} onClick={() => setSelectedUser(user.id)} className=" flex gap-4">
//                             <p>{user.id}</p>
//                             <input type="text" name="message" placeholder="Send Message..."  ref={messageRef}/>
//                             <button onClick={() => handleSendMessage(user.id)}>Send Message</button>
//                         </div>
//                     )
//                 })
//             }

//         </div>
//     );
//     }


import React, { useEffect, useRef, useState } from 'react';

type ChatMessage = {
  from: string;
  to: string;
  text: string;
};


const signalingUrl = 'ws://localhost:8080';
const activeUsersUrl = 'http://localhost:3000/active-users';

export default function WebRTCMsg() {
  const [socketId, setSocketId] = useState<string>('');
  const [users, setUsers] = useState<string[]>([]);
  const [targetId, setTargetId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState<string>('');

  const socket = useRef<WebSocket>(null);
  const pc = useRef<RTCPeerConnection>(null);
  const dc = useRef<RTCDataChannel>(null);

  useEffect(() => {
    // Connect to signaling server
    socket.current = new WebSocket(signalingUrl);

    socket.current.onmessage = async (event) => {
      const msg = JSON.parse(event.data);

        if (msg.offer) {
            console.log("offer rec", msg.offer, msg.target);
        pc.current = createPeer(false);
        await pc.current.setRemoteDescription(msg.offer);
        const answer = await pc.current.createAnswer();
        await pc.current.setLocalDescription(answer);

        socket.current?.send(JSON.stringify({
          answer,
          target: msg.from
        }));
      }

        if (msg.answer && pc.current) {
            console.log("answer rec", msg.answer, msg.target);
        await pc.current.setRemoteDescription(msg.answer);
      }

        if (msg.candidate && pc.current) {
            console.log("ice Candidate", msg.candidate, msg.target);
          
        try {
          await pc.current.addIceCandidate(msg.candidate);
        } catch (err) {
          console.error('ICE Error:', err);
        }
      }

      if (msg.type === 'id') {
        setSocketId(msg.socketId);
        fetchUsers();
      }
    };

    socket.current.onopen = () => {
      console.log('WebSocket connected');
    };
  }, []);

  const fetchUsers = async () => {
      try {
        const res = await fetch(activeUsersUrl);
      const { activeUsers } = await res.json();
      console.log("activeUsers", activeUsers);
    const others = activeUsers.filter((id: string) => id !== socketId);
    setUsers(others);
      } catch (err: any) {
          console.log("I am getting error??")
    }
  };

  const createPeer = (isInitiator: boolean) => {
    const peer = new RTCPeerConnection();

    peer.onicecandidate = (e) => {
      if (e.candidate) {
        socket.current?.send(JSON.stringify({
          iceCandidate: e.candidate,
          target: targetId
        }));
      }
    };

    if (isInitiator) {
      const channel = peer.createDataChannel('chat');
      setupDataChannel(channel);
      dc.current = channel;
    } else {
      peer.ondatachannel = (e) => {
        setupDataChannel(e.channel);
      };
    }

    return peer;
  };

 const setupDataChannel = (channel: RTCDataChannel) => {
  channel.onmessage = (e) => {
    const msg: ChatMessage = JSON.parse(e.data);
    setMessages(prev => [...prev, msg]);
  };
  channel.onopen = () => console.log('Data channel open');
};


  const startConnection = async (id: string) => {
    setTargetId(id);
    pc.current = createPeer(true);

    const offer = await pc.current.createOffer();
    await pc.current.setLocalDescription(offer);

    socket.current?.send(JSON.stringify({
      offer,
      target: id
    }));
  };

//   const sendMessage = () => {
//     if (dc.current?.readyState === 'open') {
//       dc.current.send(message);
//       setMessages(prev => [...prev, `You: ${message}`]);
//       setMessage('');
//     }
    //   };
    
    const sendMessage = () => {
  if (dc.current?.readyState === 'open') {
    const msg: ChatMessage = {
      from: socketId,
      to: targetId,
      text: message,
    };

    dc.current.send(JSON.stringify(msg));
    setMessages(prev => [...prev, msg]);
    setMessage('');
  }
};


  return (
    <div style={{ padding: 20 }}>
      <h2>Socket ID: {socketId}</h2>

      <h3>Available Peers:</h3>
      <ul>
        {users.map(id => (
          <li key={id}>
            {id} <button onClick={() => startConnection(id)}>Connect</button>
          </li>
        ))}
      </ul>

      <hr />

      <div>
        <h3>Messages</h3>
        {/* <div style={{ height: 200, border: '1px solid #ccc', padding: 10, overflowY: 'scroll' }}>
          {messages.map((msg, i) => <div key={i}>{msg}</div>)}
        </div> */}
              <div>
  {messages.map((msg, i) => (
    <MessageItem key={i} msg={msg} />
  ))}
</div>


        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}


function MessageItem({ msg }: { msg: ChatMessage }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <strong>{msg.from}</strong> ➡️ <strong>{msg.to}</strong>: {msg.text}
    </div>
  );
}
