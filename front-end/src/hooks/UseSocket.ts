import { io } from "socket.io-client";
import { socketOrigin } from "../config/apiBase";

const socket = io(socketOrigin(), {
  autoConnect: true,
});

export default socket;
