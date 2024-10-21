import express from "express";
import { getData, getDailySummary, createAlert, getAlert} from "../controller/weatherController.js";

const router = express.Router();
router.get("/weather", getData);
router.get("/summaries", getDailySummary);
router.post("/alerts", createAlert);
router.get("/alerts",getAlert)
export default router;
