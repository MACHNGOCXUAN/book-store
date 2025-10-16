// import { Client } from "@stomp/stompjs";
// import { useEffect, useRef, useState } from "react";
// import SockJS from "sockjs-client"

// export function useStompClient(userId: string) {
//   const clientRef = useRef<Client | null>(null);
//   const [connected, setConnected] = useState(false);

//   useEffect(() => {
//     const socket = new SockJS("http://localhost:8080/ws");
//     const client = new Client({
//       webSocketFactory: () => socket,
//       reconnectDelay: 5000,
//       onConnect: () => {
//         console.log("✅ STOMP connected");
//         setConnected(true);

//         client.subscribe(`/user/${userId}/queue/messages`, (msg) => {
//           const message = JSON.parse(msg.body);
//           console.log("📩 Received message:", message);
//         });
//       },
//       onDisconnect: () => setConnected(false),
//     });

//     client.activate();
//     clientRef.current = client;

//     return () => {
//       client.deactivate();
//     };
//   }, [userId]);

//   return { client: clientRef.current, connected };
// }



import { Client } from "@stomp/stompjs";
import { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";

export function useStompClient(userId: string) {
  const clientRef = useRef<Client | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = new SockJS("http://localhost:8080/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("STOMP connected");
        setConnected(true);

        client.subscribe(`/topic/messages/${userId}`, (msg) => {
          const message = JSON.parse(msg.body);
          console.log("Received message:", message);
        });
      },
      onDisconnect: () => setConnected(false),
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [userId]);

  return { client: clientRef.current, connected };
}
