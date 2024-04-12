import exress from "express";
import cors from "cors";
import transportRouter from "./routers/transport.router.js";
import "dotenv/config.js"

const PORT = process.env.PORT || 3000

const app = exress()
app.use(cors())
app.use(exress.json())
app.use(transportRouter)

app.listen(PORT , ()=> {
  console.log("server listen on port 3000")
})