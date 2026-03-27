const express = require("express")
const cors = require("cors")

const app = express()

app.use(cors())
app.use(express.json())
require('dotenv').config();
app.use("/uploads", express.static("uploads"));
// // Import models to trigger table creation
require("./models/table/table.js")

const routes = require("./routes/api.routes")
const { viewWebsite } = require("./controllers/create_website/template.js")
app.get('/@:link', viewWebsite);

app.use("/api", routes)

const PORT = process.env.PORT || 4341;

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
})     