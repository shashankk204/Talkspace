import React,{useState,useEffect} from 'react'
import { Receiver } from '../components/Receiver'
import { Sender } from '../components/Sender'

function Room() {
    const [socket, setSocket] = useState(null);
    useEffect(() => {
        const socket = new WebSocket('ws://localhost:5000');
        setSocket(socket);
        socket.onopen = () => {
            socket.send(JSON.stringify({
                type: 'ready',
            }));
        }
    }, []);
  return (
    <div>
     <Sender socket={socket}/>
     <Receiver socket={socket}></Receiver>
    </div>
  )
}

export default Room
