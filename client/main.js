const rows = document.getElementById("rowInput");
rows.value = 4;
const cols = document.getElementById("colInput");
cols.value = 4;
const importantInputs = document.querySelectorAll(".inputCheckAlwaysChanges");
const methodSelect = document.getElementById("method-select");
const viewResultsBtn = document.getElementById("btn-results");
let matrix = [];

updateMatrix();
updateTable();

importantInputs.forEach((input) => {
    console.log(input)
    input.addEventListener("input",(e) => {
        console.log(e);
        updateMatrix();
        updateTable();
        console.log(matrix);
    })
})

viewResultsBtn.addEventListener("click",viewResults);

function updateMatrix(){
    matrix = []
    const numRows = Number(rows.value);
    const numCols = Number(cols.value);
    for(let i = 0; i < numRows; i++){
        const array = [];
        for(let j = 0; j < numCols; j++){
            array.push(0);
        }
        matrix.push(array);
    }
}


function updateTable() {
    const matrixHTML = document.getElementById("matrix");
    matrixHTML.innerHTML = "";

    const numRows = Number(rows.value);
    const numCols = Number(cols.value);

    for (let i = 0; i < numRows; i++) {
        const boxRowHTML = `
            <div class="box-row box-row-${i}"></div>
        `;

        matrixHTML.insertAdjacentHTML("beforeend", boxRowHTML);

        const boxRowDiv = matrixHTML.querySelector(`.box-row-${i}`);


        for (let j = 0; j < numCols; j++) {
            const boxDiv = `
                <div class="box box-${j}">
                    <div class="box-div">
                        <p></p>
                        <div><input class="box-cost-input box-cost-input${j}" type="number"></>
                    </div>
                </div>
            `;

            boxRowDiv.insertAdjacentHTML("beforeend", boxDiv);
        }
    }


    //inputs para oferta y demanda

    //demanda
    const boxRowHTML = `
        <div class="box-row box-row-demand"></div>
    `;
    matrixHTML.insertAdjacentHTML("beforeend",boxRowHTML);
    const boxRowDiv = matrixHTML.querySelector(`.box-row-demand`);
    for(let i = 0; i < numCols; i++){
        const boxDiv = `
                <div class="box box-demand box-demand-${i}">
                    <input class="box-demand-input" type="number" name="" id="">
                </div>
            `;

            boxRowDiv.insertAdjacentHTML("beforeend", boxDiv);
    }

    //oferta
    for(let i = 0; i < numRows; i++){
        const boxRowDiv = matrixHTML.querySelector(`.box-row-${i}`);
        const boxDiv = `
            <div class="box box-supply box-supply-${i}">
                <input class="box-supply-input" type="number" name="" id="">
            </div>
        `;

        boxRowDiv.insertAdjacentHTML("beforeend", boxDiv);
    }
}

async function viewResults(){
    //obtencion de todos los costos
const costDivs = document.querySelectorAll(".box-cost-input");
    const costs = [];
    const matrixCosts = [];
    let currentRow = [];

    for (const elementDiv of costDivs) {
        const value = elementDiv.value;

        if (value === "" || value == null) {
            alert("Error: no hay un valor asignado al costo");
            return;
        }

        const num = parseInt(value);
        costs.push(num);
        currentRow.push(num);

        if (currentRow.length === Number(cols.value)) {
            matrixCosts.push(currentRow);
            currentRow = [];
        }
    }
    console.log(matrixCosts);


    const supplyDivs = document.querySelectorAll(".box-supply-input");
    const supplys = [];
    for (const elementDiv of supplyDivs) {
        const value = elementDiv.value;
        if(value === "" || value == null){
            alert("Error: no hay un valor asignado a la oferta");
            return; 
        }
        supplys.push(parseInt(value));
    }

    const demandDivs = document.querySelectorAll(".box-demand-input");
    const demands = [];
    for (const elementDiv of demandDivs) {
        const value = elementDiv.value;
        if(value === "" || value == null){
            alert("Error: no hay un valor asignado a la demanda");
            return;
        }
        demands.push(parseInt(value));
    }
    console.log(costs,supplys, demands);

    let totalSupply = 0;
    let totalDemand = 0;

    supplys.forEach((supply) => {
        totalSupply += supply;
    })
    demands.forEach((demand) => {
        totalDemand +=demand;
    })

    let msg = "";

    if(totalSupply !== totalDemand){
        msg =" eh error";
    }

    if(!(msg === "")){
        alert(msg)
        return null;
    }

    const dataToSend = {
        method: methodSelect.value,
        costs: matrixCosts,
        supply: supplys,
        demand: demands,
    }
    console.log(dataToSend);
    const res = await sendData(dataToSend);
    mainData = res.data.result;
    step = mainData.steps.length - 1;
    console.log(step);
    console.log(res)
    showMatrixResult();


}

async function sendData(data){
    try{
        const response = await axios.post("http://localhost:3000/api/transport/solve", data);
        return response;
    }catch(error){
        console.error("Error en la petición", error);
    }
}

// {
//   "method": "northwest",
//   "costs": [[4, 8, 6], [5, 3, 7],[3,2,1]],
//   "supply": [30, 40,10], 
//   "demand": [20, 25, 35]
// }
