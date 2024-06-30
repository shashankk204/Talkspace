import { server } from "./socket/socket.js";
server.listen(5000, () => {
    console.log("listening to port 5000");
});
