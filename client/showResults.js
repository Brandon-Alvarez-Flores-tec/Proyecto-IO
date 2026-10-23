const matrixDivResult = document.getElementById("matrix-results");
const btnLeft = document.getElementById("btn-left");
const btnRight = document.getElementById("btn-right");
const descriptionElem = document.querySelector(".description-p");
const methodElem = document.querySelector(".method-p");
const stepElem = document.querySelector(".step-p");
const totalCostElem = document.querySelector(".totalCost-p");
let mainData = null;
let step = 0;

// {
//     "method": "northwest",
//     "allocations": [
//         [
//             5,
//             10
//         ],
//         [
//             0,
//             10
//         ]
//     ],
//     "totalCost": 75,
//     "steps": [
//         {
//             "step": 1,
//             "cell": [
//                 0,
//                 0
//             ],
//             "quantity": 5,
//             "unitCost": 1,
//             "stepCost": 5,
//             "accumulatedCost": 5,
//             "remainingSupply": [
//                 10,
//                 10
//             ],
//             "remainingDemand": [
//                 0,
//                 20
//             ],
//             "allocations": [
//                 [
//                     5,
//                     0
//                 ],
//                 [
//                     0,
//                     0
//                 ]
//             ],
//             "description": "Paso 1: en la celda (0, 0) se asignan 5 unidades a costo 1 = 5. Se cubrió la demanda: avanza a la siguiente columna."
//         },
//         {
//             "step": 2,
//             "cell": [
//                 0,
//                 1
//             ],
//             "quantity": 10,
//             "unitCost": 3,
//             "stepCost": 30,
//             "accumulatedCost": 35,
//             "remainingSupply": [
//                 0,
//                 10
//             ],
//             "remainingDemand": [
//                 0,
//                 10
//             ],
//             "allocations": [
//                 [
//                     5,
//                     10
//                 ],
//                 [
//                     0,
//                     0
//                 ]
//             ],
//             "description": "Paso 2: en la celda (0, 1) se asignan 10 unidades a costo 3 = 30. Se agotó la oferta: avanza a la siguiente fila."
//         },
//         {
//             "step": 3,
//             "cell": [
//                 1,
//                 1
//             ],
//             "quantity": 10,
//             "unitCost": 4,
//             "stepCost": 40,
//             "accumulatedCost": 75,
//             "remainingSupply": [
//                 0,
//                 0
//             ],
//             "remainingDemand": [
//                 0,
//                 0
//             ],
//             "allocations": [
//                 [
//                     5,
//                     10
//                 ],
//                 [
//                     0,
//                     10
//                 ]
//             ],
//             "description": "Paso 3: en la celda (1, 1) se asignan 10 unidades a costo 4 = 40. Se agotaron la oferta y la demanda: avanza a la siguiente fila."
//         }
//     ]
// }



const methodNames = {
    northwest: "Esquina noroeste",
    minimumcost: "Costo mínimo",
    vogel: "Vogel"
};

btnLeft.addEventListener("click", previousStep);
btnRight.addEventListener("click", nextStep);

function previousStep(){
    if (mainData === null) {
        return; //todavia no hay resultado
    }
    if (step > 0) {
        step = step - 1;
        showMatrixResult();
    }
}

function nextStep(){
    if (mainData === null) {
        return;
    }
    if (step < mainData.steps.length - 1) {
        step = step + 1;
        showMatrixResult();
    }
}



function showMatrixResult(){
    const selectedData = mainData.steps[step];
    const allocations = selectedData.allocations;
    const remainingSupply = selectedData.remainingSupply;
    const remainingDemand = selectedData.remainingDemand;

    const numRows = allocations.length;
    const numCols = allocations[0].length;

    matrixDivResult.innerHTML = "";

    for (let i = 0; i < numRows; i++) {
        const boxRowHTML = `
            <div class="box-row box-row-${i}"></div>
        `;
        matrixDivResult.insertAdjacentHTML("beforeend", boxRowHTML);
        const boxRowDiv = matrixDivResult.querySelector(`.box-row-${i}`);

        for (let j = 0; j < numCols; j++) {
            let allocation = "";
            if (allocations[i][j] > 0) {
                allocation = allocations[i][j];
            }

            const boxDiv = `
                <div class="box box-${j}">
                    <div class="box-div">
                        <p>${allocation}</p>
                        <div><p class="box-cost-result">Costo</p></div>
                    </div>
                </div>
            `;
            boxRowDiv.insertAdjacentHTML("beforeend", boxDiv);
        }
        // oferta que queda en esta fila despues del paso
        const supplyDiv = `
            <div class="box box-supply box-supply-${i}">
                <p class="box-supply-result">${remainingSupply[i]}</p>
            </div>
        `;
        boxRowDiv.insertAdjacentHTML("beforeend", supplyDiv);
    }
    // fila de demanda que queda en cada columna despues del paso
    const demandRowHTML = `
        <div class="box-row box-row-demand"></div>
    `;
    matrixDivResult.insertAdjacentHTML("beforeend", demandRowHTML);
    const demandRowDiv = matrixDivResult.querySelector(".box-row-demand");

    for (let j = 0; j < numCols; j++) {
        const demandDiv = `
            <div class="box box-demand box-demand-${j}">
                <p class="box-demand-result">${remainingDemand[j]}</p>
            </div>
        `;

        demandRowDiv.insertAdjacentHTML("beforeend", demandDiv);
    }
    //info del paso
    totalCostElem.textContent = "Costo total: " + mainData.totalCost;
    descriptionElem.textContent = selectedData.description;
    methodElem.textContent = "Método: " + methodNames[mainData.method];
    stepElem.textContent = "Paso " + (step + 1) + " de " + mainData.steps.length;

    // se desactivan los botones en los extremos
    btnLeft.disabled = (step === 0);
    btnRight.disabled = (step === mainData.steps.length - 1);
}
