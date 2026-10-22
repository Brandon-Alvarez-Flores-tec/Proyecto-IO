// ---------- explicacion de cada atributo del objeto step ----------
// step: numero del paso (empieza en 1)
// chosenType: tipo de linea con la penalizacion mas alta ("fila" o "columna")
// chosenIndex: posicion de esa fila o columna (empieza en 0)
// penalty: valor de la penalizacion mas alta que se encontro en ese paso
// rowPenalties: penalizacion de cada fila en ese paso (-1 si la fila ya esta cerrada)
// colPenalties: penalizacion de cada columna en ese paso (-1 si la columna ya esta cerrada)
// cell: [fila, columna] de la celda donde se asigno, es la de menor costo dentro de la linea elegida
// quantity: unidades que se asignaron en esa celda
// unitCost: costo por unidad de esa celda
// stepCost: costo de este paso (quantity * unitCost)
// accumulatedCost: suma de los costos de todos los pasos hasta este
// remainingSupply: oferta que queda en cada fila despues del paso
// remainingDemand: demanda que queda en cada columna despues del paso
// allocations: copia de la matriz de asignaciones tal como quedo en este paso
// description: texto que explica el paso en lenguaje humano

export function vogel({ costs, supply, demand }) {
    // ---------- validaciones ----------
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

    // ---------- preparacion ----------
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

    // ---------- metodo de vogel ----------
    while (openRows > 0 && openCols > 0) {
        // se calcula la penalizacion de cada fila abierta
        // la penalizacion es la diferencia entre los dos costos mas bajos de la fila
        const rowPenalties = [];
        for (let r = 0; r < rows; r++) {
            if (rowClosed[r] === true) {
                rowPenalties.push(-1); //-1 indica que la fila esta cerrada
                continue;
            }

            let smallest = -1;
            let secondSmallest = -1;

            for (let c = 0; c < cols; c++) {
                if (colClosed[c] === true) {
                    continue; //se salta la columna cerrada
                }
                const value = costs[r][c];
                if (smallest === -1 || value < smallest) {
                    secondSmallest = smallest;
                    smallest = value;
                } else if (secondSmallest === -1 || value < secondSmallest) {
                    secondSmallest = value;
                }
            }

            // si solo queda una celda abierta en la fila, la penalizacion es el costo de esa celda
            if (secondSmallest === -1) {
                rowPenalties.push(smallest);
            } else {
                rowPenalties.push(secondSmallest - smallest);
            }
        }

        // se calcula la penalizacion de cada columna abierta
        const colPenalties = [];
        for (let c = 0; c < cols; c++) {
            if (colClosed[c] === true) {
                colPenalties.push(-1); //-1 indica que la columna esta cerrada
                continue;
            }

            let smallest = -1;
            let secondSmallest = -1;

            for (let r = 0; r < rows; r++) {
                if (rowClosed[r] === true) {
                    continue; //se salta la fila cerrada
                }
                const value = costs[r][c];
                if (smallest === -1 || value < smallest) {
                    secondSmallest = smallest;
                    smallest = value;
                } else if (secondSmallest === -1 || value < secondSmallest) {
                    secondSmallest = value;
                }
            }

            if (secondSmallest === -1) {
                colPenalties.push(smallest);
            } else {
                colPenalties.push(secondSmallest - smallest);
            }
        }

        // se busca la penalizacion mas alta entre filas y columnas
        // en caso de empate se queda la primera (primero filas, luego columnas)
        let bestPenalty = -1;
        let chosenType = "";
        let chosenIndex = -1;

        for (let r = 0; r < rows; r++) {
            if (rowPenalties[r] > bestPenalty) {
                bestPenalty = rowPenalties[r];
                chosenType = "fila";
                chosenIndex = r;
            }
        }

        for (let c = 0; c < cols; c++) {
            if (colPenalties[c] > bestPenalty) {
                bestPenalty = colPenalties[c];
                chosenType = "columna";
                chosenIndex = c;
            }
        }

        // dentro de la linea elegida se busca la celda con el costo mas bajo
        // en caso de empate se queda la primera que se encontro
        let bestRow = -1;
        let bestCol = -1;
        let minCost = 0;

        if (chosenType === "fila") {
            for (let c = 0; c < cols; c++) {
                if (colClosed[c] === true) {
                    continue;
                }
                if (bestRow === -1 || costs[chosenIndex][c] < minCost) {
                    bestRow = chosenIndex;
                    bestCol = c;
                    minCost = costs[chosenIndex][c];
                }
            }
        } else {
            for (let r = 0; r < rows; r++) {
                if (rowClosed[r] === true) {
                    continue;
                }
                if (bestRow === -1 || costs[r][chosenIndex] < minCost) {
                    bestRow = r;
                    bestCol = chosenIndex;
                    minCost = costs[r][chosenIndex];
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
            chosenType: chosenType,
            chosenIndex: chosenIndex,
            penalty: bestPenalty,
            rowPenalties: rowPenalties,
            colPenalties: colPenalties,
            cell: [bestRow, bestCol],
            quantity: quantity,
            unitCost: minCost,
            stepCost: stepCost,
            accumulatedCost: totalCost,
            remainingSupply: remainingSupply.slice(),
            remainingDemand: remainingDemand.slice(),
            allocations: snapshot,
            description:
                "Paso " + stepNumber + ": la penalización más alta es " + bestPenalty +
                " en la " + chosenType + " " + chosenIndex + ". " +
                "El costo más bajo de esa línea es " + minCost +
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
        method: "vogel",
        allocations: allocations,
        totalCost: totalCost,
        steps: steps
    };
}