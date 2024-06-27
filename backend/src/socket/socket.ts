import express, { request } from "express";
import WebSocket,{WebSocketServer} from "ws";
import http from "http";
import { onSocketError } from "../utils/handleSocketError.js";
import { RoomManager } from "./managers/room.manager.js";
import { User } from "./managers/user.manager.js";


const app = express();
const server = http.createServer(app);
// const wss = new WebSocketServer ({server});


const wss=new WebSocketServer({noServer:true});



let senderSocket: null | WebSocket = null;
let receiverSocket: null | WebSocket = null;

wss.on('connection', function connection(ws) {
    ws.on('error', console.error);
  
    ws.on('message', function message(data: any) {
      const message = JSON.parse(data);
      if (message.type === 'sender') {
        senderSocket = ws;
      } else if (message.type === 'receiver') {
        receiverSocket = ws;
      } else if (message.type === 'createOffer') {
        if (ws !== senderSocket) {
          return;
        }
        receiverSocket?.send(JSON.stringify({ type: 'createOffer', sdp: message.sdp }));
      } else if (message.type === 'createAnswer') {
          if (ws !== receiverSocket) {
            return;
          }
          senderSocket?.send(JSON.stringify({ type: 'createAnswer', sdp: message.sdp }));
      } else if (message.type === 'iceCandidate') {
        if (ws === senderSocket) {
          receiverSocket?.send(JSON.stringify({ type: 'iceCandidate', candidate: message.candidate }));
        } else if (ws === receiverSocket) {
          senderSocket?.send(JSON.stringify({ type: 'iceCandidate', candidate: message.candidate }));
        }
      }
    });
  });


server.on("upgrade",(req,socket,head)=>{
    socket.on("error",onSocketError);
    // This function is not defined on purpose. Implement it with your own logic.
//   authenticate(request, function next(err, client) {
//     if (err || !client) {
//       socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
//       socket.destroy();
//       return;
//     }
    
    socket.removeListener("error",onSocketError);
    
    wss.handleUpgrade(req,socket,head,(ws)=>{
        wss.emit('connection', ws, req);
    })

})


export {app,server,wss};
