export function minimumCost({ costs, supply, demand }) {
    // ---------- Validaciones ----------
    if (!Array.isArray(costs) || !Array.isArray(supply) || !Array.isArray(demand)) {
        throw new Error("Se requieren costs, supply y demand.");
    }

    const rows = costs.length;
    const cols = demand.length;

    if (rows === 0 || cols === 0 || supply.length !== rows) {
        throw new Error("Las dimensiones de la matriz no son válidas.");
    }

    for (let r = 0; r < rows; r++) {
        if (!Array.isArray(costs[r]) || costs[r].length !== cols) {
            throw new Error("Todas las filas de costo deben tener el mismo número de columnas que demanda.");
        }
    }

    for (let r = 0; r < rows; r++) {
        if (!Number.isFinite(supply[r]) || supply[r] < 0) {
            throw new Error("La oferta debe ser un número finito no negativo.");
        }
    }

    for (let c = 0; c < cols; c++) {
        if (!Number.isFinite(demand[c]) || demand[c] < 0) {
            throw new Error("La demanda debe ser un número finito no negativo.");
        }
    }

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (!Number.isFinite(costs[r][c]) || costs[r][c] < 0) {
                throw new Error("Los costos deben ser números finitos no negativos.");
            }
        }
    }

    let totalSupply = 0;
    for (let r = 0; r < rows; r++) {
        totalSupply = totalSupply + supply[r];
    }

    let totalDemand = 0;
    for (let c = 0; c < cols; c++) {
        totalDemand = totalDemand + demand[c];
    }

    if (totalSupply !== totalDemand) {
        throw new Error("La oferta total debe ser igual a la demanda total.");
    }

    // ---------- Preparación ----------
    const remainingSupply = []; //array iterativo de la oferta que se ira modificando por cada paso
    for (let r = 0; r < rows; r++) {
        remainingSupply.push(supply[r]);
    }

    const remainingDemand = []; //array iterativo de la demanda que se ira modificando por cada paso
    for (let c = 0; c < cols; c++) {
        remainingDemand.push(demand[c]);
    }

    const allocations = []; //matriz que representa en que partes se le agrego un valor
    for (let r = 0; r < rows; r++) {
        const newRow = [];
        for (let c = 0; c < cols; c++) {
            newRow.push(0);
        }
        allocations.push(newRow);
    }

    const rowClosed = []; //marca que filas ya no se pueden usar (true = cerrada)
    for (let r = 0; r < rows; r++) {
        rowClosed.push(false);
    }

    const colClosed = []; //marca que columnas ya no se pueden usar (true = cerrada)
    for (let c = 0; c < cols; c++) {
        colClosed.push(false);
    }

    const steps = []; //array de pasos el cual guarda objetos de "step"
    let totalCost = 0; //costo total
    let stepNumber = 1;
    let openRows = rows; //cuantas filas siguen abiertas
    let openCols = cols; //cuantas columnas siguen abiertas

    // ---------- Metodo costo minimo ----------
    while (openRows > 0 && openCols > 0) {
        // se busca la celda con el costo mas bajo entre las filas y columnas abiertas
        let bestRow = -1;
        let bestCol = -1;
        let minCost = 0;

        for (let r = 0; r < rows; r++) {
            if (rowClosed[r] === true) {
                continue; //se salta la fila cerrada
            }
            for (let c = 0; c < cols; c++) {
                if (colClosed[c] === true) {
                    continue; //se salta la columna cerrada
                }
                // si es la primera celda encontrada o tiene un costo menor, se guarda
                // en caso de empate se queda la primera que se encontro
                if (bestRow === -1 || costs[r][c] < minCost) {
                    bestRow = r;
                    bestCol = c;
                    minCost = costs[r][c];
                }
            }
        }

        // se asigna lo maximo posible entre la oferta y la demanda de esa celda
        let quantity = remainingSupply[bestRow];
        if (remainingDemand[bestCol] < quantity) {
            quantity = remainingDemand[bestCol];
        }

        const stepCost = quantity * minCost;

        allocations[bestRow][bestCol] = quantity;
        remainingSupply[bestRow] = remainingSupply[bestRow] - quantity;
        remainingDemand[bestCol] = remainingDemand[bestCol] - quantity;
        totalCost = totalCost + stepCost;

        // se decide que cerrar: fila o columna
        let movement = "";
        const supplyFinished = remainingSupply[bestRow] === 0;
        const demandFinished = remainingDemand[bestCol] === 0;

        if (supplyFinished && demandFinished) {
            movement = "Se agotaron la oferta y la demanda: se cierra la fila.";
        } else if (supplyFinished) {
            movement = "Se agotó la oferta: se cierra la fila.";
        } else {
            movement = "Se cubrió la demanda: se cierra la columna.";
        }

        // se guarda una copia de la matriz para poder ver este paso despues
        const snapshot = [];
        for (let r = 0; r < rows; r++) {
            const snapshotRow = [];
            for (let c = 0; c < cols; c++) {
                snapshotRow.push(allocations[r][c]);
            }
            snapshot.push(snapshotRow);
        }

        steps.push({
            step: stepNumber,
            cell: [bestRow, bestCol],
            quantity: quantity,
            unitCost: minCost,
            stepCost: stepCost,
            accumulatedCost: totalCost,
            remainingSupply: remainingSupply.slice(),
            remainingDemand: remainingDemand.slice(),
            allocations: snapshot,
            description:
                "Paso " + stepNumber + ": el costo más bajo disponible es " + minCost +
                " en la celda (" + bestRow + ", " + bestCol + "), " +
                "se asignan " + quantity + " unidades = " + stepCost + ". " + movement
        });

        // solo se cierra una (fila o columna) por paso
        // si ambas se agotan, se cierra la fila y la columna se usara despues con cantidad 0
        if (supplyFinished) {
            rowClosed[bestRow] = true;
            openRows = openRows - 1;
        } else {
            colClosed[bestCol] = true;
            openCols = openCols - 1;
        }

        stepNumber = stepNumber + 1;
    }

    return {
        method: "minimumcost",
        allocations: allocations,
        totalCost: totalCost,
        steps: steps
    };
}