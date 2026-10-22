import express from "express";
import * as transportController from "../controllers/transportController.js";

const router = express.Router();

router.post(
    "/transport/solve",
    transportController.solveTransportModelController
);

export default router;