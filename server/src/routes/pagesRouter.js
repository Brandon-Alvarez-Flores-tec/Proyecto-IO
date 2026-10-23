import express from "express";
import path from "path";
const router = express.Router();

router.use(express.static(path.join(import.meta.dirname, '../../../client/')));
console.log(import.meta.dirname);
router.get("/",(req,res) => {
    res.sendFile(path.join(import.meta.dirname, "../../../client/home.html"));
})
router.get("/methodSolver",(req,res) => {
    res.sendFile(path.join(import.meta.dirname, "../../../client/methodSolver.html"));
})

export default router;