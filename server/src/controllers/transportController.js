import * as transportService from "../services/transportService.js";

export function solveTransportModelController(req, res) {
    try {
        const result = transportService.solveTransportModel(req.body);

        return res.status(200).json({
            success: true,
            result
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: error.message
        });
    }
}