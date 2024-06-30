const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const path=require("path");
const app = express();
const userRoutes = require("./routes/user");


app.use(express.json());

app.use("/api/user", userRoutes);




if (process.env.NODE_ENV !== "development") {
	app.use(express.static(path.join(__dirname, "../frontend/dist")));
	app.get("*", (req, res) => {
		res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
	});
}



mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("connected to db & listening on port", process.env.PORT);
    });
  })
  .catch((error) => {
    console.log(error);
  });
