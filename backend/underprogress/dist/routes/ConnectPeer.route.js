import express from "express";
import { WebConnection } from "../controller/ConnectPeer.controller.js";
const routes = express.Router();
routes.get("/ws", WebConnection);
export default routes;
