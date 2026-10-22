export function northwest({ costs, supply, demand }) {
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
    const remainingSupply = []; //preparacion del array iterativo de la oferta que se ira modificando por cada paso
    for (let r = 0; r < rows; r++) {
        remainingSupply.push(supply[r]); //se asigna todos los valores del la oferta al array iterativo de oferta
    }

    const remainingDemand = []; //preparacion del array iterativo de la demanda que se ira modificando por cada paso
    for (let c = 0; c < cols; c++) {
        remainingDemand.push(demand[c]); //se asigna todos los valores del la demanda al array iterativo de demanda
    }

    const allocations = []; //matriz que representa en que partes se le agrego un valor 
    for (let r = 0; r < rows; r++) { //crear arrays
        const newRow = [];
        for (let c = 0; c < cols; c++) { 
            newRow.push(0); //asginar valor del array
        }
        allocations.push(newRow); //asignar array al array correspondiente de la iteracion de la matriz
    }

    const steps = []; //array de pasos el cual guarda objetos de "step"
    let totalCost = 0; //costo total

    // ---------- Metodo esquina noroeste ----------
    let currentRow = 0;
    let currentCol = 0;
    let stepNumber = 1;

    while (currentRow < rows && currentCol < cols) {
        // Se asigna lo máximo posible entre la oferta y la demanda actuales
        let quantity = remainingSupply[currentRow];
        if (remainingDemand[currentCol] < quantity) {
            quantity = remainingDemand[currentCol];
        }

        const unitCost = costs[currentRow][currentCol];
        const stepCost = quantity * unitCost;

        allocations[currentRow][currentCol] = quantity;
        remainingSupply[currentRow] = remainingSupply[currentRow] - quantity;
        remainingDemand[currentCol] = remainingDemand[currentCol] - quantity;
        totalCost = totalCost + stepCost;

        // Se decide hacia dónde moverse
        let movement = "";
        const supplyFinished = remainingSupply[currentRow] === 0;
        const demandFinished = remainingDemand[currentCol] === 0;

        if (supplyFinished && demandFinished) {
            movement = "Se agotaron la oferta y la demanda: avanza a la siguiente fila.";
        } else if (supplyFinished) {
            movement = "Se agotó la oferta: avanza a la siguiente fila.";
        } else {
            movement = "Se cubrió la demanda: avanza a la siguiente columna.";
        }

        // Se guarda una copia de la matriz para poder ver este paso después
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
            cell: [currentRow, currentCol],
            quantity: quantity,
            unitCost: unitCost,
            stepCost: stepCost,
            accumulatedCost: totalCost,
            remainingSupply: remainingSupply.slice(),
            remainingDemand: remainingDemand.slice(),
            allocations: snapshot,
            description:
                "Paso " + stepNumber + ": en la celda (" + currentRow + ", " + currentCol + ") " +
                "se asignan " + quantity + " unidades a costo " + unitCost +
                " = " + stepCost + ". " + movement
        });

        // Movimiento: solo una fila o columna avanza por paso,
        // salvo que ambas se agoten, en cuyo caso se avanza una fila
        // (la columna agotada se saltará en el siguiente paso con cantidad 0)
        if (supplyFinished) {
            currentRow = currentRow + 1;
        } else {
            currentCol = currentCol + 1;
        }

        stepNumber = stepNumber + 1;
    }

    return {
        method: "northwest",
        allocations: allocations,
        totalCost: totalCost,
        steps: steps
    };
}