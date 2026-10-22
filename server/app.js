import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";


//Las rutas se obtienen de la carpeta router /src/routes
// import xRouter from "./routes/xRouter";
import transportRouter from "./src/routes/transportRouter.js";
import pagesRouter from "./src/routes/pagesRouter.js";

const app = express();

app.set("trust proxy", 1);

dotenv.config();
const PORT = process.env.PORT;


app.use(express.json()); //middleware para poder adoptar jsons en el backend
app.use(cookieParser());

//Routes
// Asegúrate de exponer la carpeta donde realmente viven tus archivos compilados o estáticos

app.use("/api", transportRouter);
app.use("/api/transport", pagesRouter);

app.listen(PORT, () => {
    console.log(`Servidor inciado ruta principal: http://localhost:${PORT}/`);
})