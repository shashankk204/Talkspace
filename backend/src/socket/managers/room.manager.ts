import { wss } from "../socket.js";
import { WebSocket } from "ws";
let GLOBAL_ROOM_ID = 1;
export interface User {
    name: number,
    socket: WebSocket
}



interface Room {
    user1: User,
    user2: User
}

export class RoomManager {
    private rooms: Map<string, User[]>

    constructor() {
        this.rooms = new Map<string, User[]>()
    }

    addtoRoom(user: User, roomID: string) {
        const roomId = this.generate().toString();
        if (!this.rooms.has(roomID)) {
            this.rooms.set(roomID, []);
        }
        if (this.rooms.get(roomID)?.length === 2) {
            user.socket.send(JSON.stringify({ error: "Room-Full" }));
            return;
        }

        // Push element to the array

        this.rooms.get(roomID)?.push(user);

        if (this.rooms.get(roomID)?.length === 2) {
            let users: User[] | undefined = this.rooms.get(roomID)
            // lets do for the first user
            // @ts-ignore
            let uid1 = users[0];
            // @ts-ignore
            let uid2 = users[1];
            // uid1.socket.send(JSON.stringify({ message: "sendOffer" }));
            
            const messageListener1 = (data: any) => {
                // console.log(data); 

                const message = JSON.parse(data);
                console.log(message);
                if(message.type === 'iceCandidate')
                {
                    uid2.socket.send(JSON.stringify({for:"receiver", type: 'iceCandidate', candidate: message.candidate }))
                }
                else if(message.type === 'createOffer')
                {
                    uid2.socket.send(JSON.stringify({ for:"receiver",type: 'createOffer', sdp: message.sdp }))
                }
            
            
            };



            const messageListener2 = (data: any) => {
                 const message=JSON.parse(data)
                console.log(message);
                if(message.type === 'createAnswer')
                {
                    uid1.socket.send(JSON.stringify({for:"sender", type: 'createAnswer', sdp: message.sdp }))
                }
                if(message.type === 'iceCandidate' )
                {
                    uid1.socket.send(JSON.stringify({for:"sender", type: 'iceCandidate', candidate: message.candidate }))
                }

                // uid2.socket.off("message", messageListener2);
            };
            console.log("listeners are on");
            
            uid1.socket.on("message", messageListener1);
            uid2.socket.on("message", messageListener2);



        }
    }
    onOffer(sdp: string, receivingUser: User) {

        // @ts-ignores
        receivingUser?.socket.send(JSON.stringify({
            messsage: "offer",
            sdp: sdp,
        }))
    }

    onAnswer(roomId: string, sdp: string, senderSocketid: WebSocket) {
        const room = this.rooms.get(roomId);
        if (!room) {
            return;
        }
        // @ts-ignores-
        const receivingUser = room.user1.socket === senderSocketid ? room.user2 : room.user1;
        receivingUser?.socket.emit("answer", {
            sdp,
            roomId
        });
    }
    onIceCandidates(roomId: string, senderSocketid: string, candidate: any, type: "sender" | "receiver") {
        const room = this.rooms.get(roomId);
        if (!room) {
            return;
        }
        // @ts-ignores-
        const receivingUser = room.user1.socket === senderSocketid ? room.user2 : room.user1;
        receivingUser.socket.emit("add-ice-candidate", ({ candidate, type }));
    }


    generate() {
        return GLOBAL_ROOM_ID++;
    }
}