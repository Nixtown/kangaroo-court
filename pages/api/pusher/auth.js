// pages/api/pusher/auth.js

import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID, // Your app ID (server-side)
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY, // Your public key
  secret: process.env.PUSHER_APP_SECRET, // Your secret key (server-side)
  cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER, // Your cluster
  useTLS: true,
});

export default function handler(req, res) {
  if (req.method === "POST") {
    const { socket_id, channel_name } = req.body;

    try {
      const authResponse = pusher.authenticate(socket_id, channel_name);
      res.status(200).send(authResponse);
    } catch (error) {
      console.error("Pusher authentication error:", error);
      res.status(500).json({ error: "Pusher authentication failed" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}