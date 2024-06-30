let GLOBAL_ROOM_ID = 1;
export class RoomManager {
    constructor() {
        this.rooms = new Map();
        this.users = new Map();
    }
    addtoRoom(user, roomID) {
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
            let users = this.rooms.get(roomID);
            // lets do for the first user
            // @ts-ignore
            let uid1 = users[0];
            // @ts-ignore
            let uid2 = users[1];
            // uid1.socket.send(JSON.stringify({ message: "sendOffer" }));
            const messageListener1 = (data) => {
                // console.log(data); 
                const message = JSON.parse(data);
                console.log(message.for, 1);
                if (message.type === 'iceCandidate' && message.for === "receiver") {
                    uid2.socket.send(JSON.stringify({ for: "receiver", type: 'iceCandidate', candidate: message.candidate }));
                }
                else if (message.type === 'createOffer' && message.for === "receiver") {
                    uid2.socket.send(JSON.stringify({ for: "receiver", type: 'createOffer', sdp: message.sdp }));
                }
                if (message.type === 'createAnswer' && message.for === "sender") {
                    uid2.socket.send(JSON.stringify({ for: "sender", type: 'createAnswer', sdp: message.sdp }));
                }
            };
            const messageListener2 = (data) => {
                const message = JSON.parse(data);
                console.log(message);
                if (message.type === 'createAnswer' && message.for === "sender") {
                    uid1.socket.send(JSON.stringify({ for: "sender", type: 'createAnswer', sdp: message.sdp }));
                    console.log(message.for, 2);
                }
                if (message.type === 'iceCandidate' && message.for === "receiver") {
                    uid1.socket.send(JSON.stringify({ for: "receiver", type: 'iceCandidate', candidate: message.candidate }));
                }
                else if (message.type === 'createOffer' && message.for === "receiver") {
                    uid1.socket.send(JSON.stringify({ for: "receiver", type: 'createOffer', sdp: message.sdp }));
                }
                // uid2.socket.off("message", messageListener2);
            };
            console.log("listeners are on");
            uid1.socket.on("message", messageListener1);
            uid2.socket.on("message", messageListener2);
        }
    }
    onOffer(sdp, receivingUser) {
        // @ts-ignores
        receivingUser?.socket.send(JSON.stringify({
            messsage: "offer",
            sdp: sdp,
        }));
    }
    onAnswer(roomId, sdp, senderSocketid) {
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
    onIceCandidates(roomId, senderSocketid, candidate, type) {
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
