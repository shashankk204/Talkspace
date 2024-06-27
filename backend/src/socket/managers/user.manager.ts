import { wss } from "../socket.js";
import { WebSocket } from "ws";

export interface User{
    name:string
    socket:WebSocket,
}




