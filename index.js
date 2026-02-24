require('dotenv').config();
const express = require('express');
const cors = require("cors");
const { authMiddleware, authorizeRole } = require("./utils/middlewares");

const app = express();
app.use(cors({
    origin: "*"
}));
app.use(express.json());

app.use("/auth", require("./routes/login"));
app.use("/users", authMiddleware, authorizeRole("MANAGER") , require("./routes/users"));
app.use("/tickets", authMiddleware , require("./routes/tickets"));
app.use("/comments", authMiddleware , require("./routes/comments"));

app.listen(process.env.PORT || 3000, () => {
    console.log("Server is running at ", process.env.PORT);

})