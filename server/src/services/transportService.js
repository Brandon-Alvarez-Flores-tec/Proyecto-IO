
import { northwest } from "../algorithms/northwest.js";
import { minimumCost } from "../algorithms/minimumcost.js";
import { vogel } from "../algorithms/vogel.js";

const algorithms = {
    northwest: northwest,
    minimumCost: minimumCost,
    vogel: vogel,
};

export function solveTransportModel(data) {
    if (!data || typeof data !== "object") {
        throw new Error("Se deben proporcionar los datos del problema.");
    }

    const algorithm = algorithms[data.method];

    if (!algorithm) {
        throw new Error("Método no válido o no implementado.");
    }

    return algorithm(data);
}
