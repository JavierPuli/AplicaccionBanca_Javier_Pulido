const form = document.getElementById("predictionForm");

const emptyState = document.getElementById("emptyState");
const loadingState = document.getElementById("loadingState");
const errorState = document.getElementById("errorState");
const resultState = document.getElementById("resultState");

const submitBtn = document.getElementById("submitBtn");
const buttonText = document.getElementById("buttonText");

function mostrarEstado(estado) {
    emptyState.classList.add("hidden");
    loadingState.classList.add("hidden");
    errorState.classList.add("hidden");
    resultState.classList.add("hidden");

    if (estado === "empty") emptyState.classList.remove("hidden");
    if (estado === "loading") loadingState.classList.remove("hidden");
    if (estado === "error") errorState.classList.remove("hidden");
    if (estado === "result") resultState.classList.remove("hidden");
}

function obtenerDatosFormulario() {
    const datos = Object.fromEntries(new FormData(form).entries());

    // ID automático requerido por el esquema de la API (se descarta en el preprocesamiento)
    datos.id_cliente = "CLI-" + Date.now().toString().slice(-6);

    // Conversión de datos numéricos
    datos.edad = Number(datos.edad);
    datos.ingresos_anuales = Number(datos.ingresos_anuales);
    datos.salario_mensual_aprox = Number(datos.salario_mensual_aprox);
    datos.antiguedad_meses = Number(datos.antiguedad_meses);
    datos.num_productos = Number(datos.num_productos);

    // Conversión de cadenas a booleanos reales
    datos.saldo_cuenta = datos.saldo_cuenta === "true";
    datos.tiene_tarjeta = datos.tiene_tarjeta === "true";

    // Campo opcional: si queda vacío o con menos de 2 caracteres, enviar valor por defecto para Pydantic
    const comentario = (datos.comentarios_cliente || "").trim();
    datos.comentarios_cliente = comentario.length >= 2 ? comentario : "Sin comentarios";

    return datos;
}

function mostrarResultado(data) {
    const probabilidad = Math.min(
        100,
        Math.max(0, Number(data.probabilidad_abandono) * 100)
    );

    const riesgo = String(data.nivel_riesgo).toLowerCase();

    const riskCard = document.getElementById("riskCard");
    const progressBar = document.getElementById("progressBar");

    riskCard.className = "risk-card " + riesgo;
    progressBar.className = "progress-bar " + riesgo;

    document.getElementById("riskLevel").textContent =
        data.nivel_riesgo;

    document.getElementById("riskDescription").textContent =
        riesgo === "alto"
            ? "El cliente presenta una elevada probabilidad de abandono."
            : riesgo === "medio"
                ? "El cliente presenta un riesgo moderado de abandono."
                : "El cliente presenta una baja probabilidad de abandono.";

    document.getElementById("probabilityValue").textContent =
        probabilidad.toFixed(2) + "%";

    progressBar.style.width = probabilidad + "%";

    document.getElementById("resultPrediction").textContent =
        Number(data.abandono) === 1
            ? "Posible abandono"
            : "No se prevé abandono";

    document.getElementById("recommendedAction").textContent =
        data.accion_recomendada;

    mostrarEstado("result");
}

form.addEventListener("submit", async function(event) {
    event.preventDefault();

    if (!form.reportValidity()) return;

    mostrarEstado("loading");

    submitBtn.disabled = true;
    buttonText.textContent = "Procesando...";

    try {
        const datosCliente = obtenerDatosFormulario();

        const response = await fetch("/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datosCliente)
        });

        const data = await response.json();

        if (!response.ok) {
            let mensaje = data.detail || "Error al realizar la predicción.";

            if (Array.isArray(mensaje)) {
                mensaje = mensaje
                    .map(error => error.msg || "Error de validación")
                    .join(". ");
            }

            throw new Error(mensaje);
        }

        mostrarResultado(data);

    } catch (error) {
        document.getElementById("errorMessage").textContent =
            error.message || "No se pudo conectar con el servidor.";

        mostrarEstado("error");

    } finally {
        submitBtn.disabled = false;
        buttonText.textContent = "Analizar cliente";
    }
});

// Al limpiar el formulario, volver al estado inicial
form.addEventListener("reset", function() {
    setTimeout(() => {
        mostrarEstado("empty");
    }, 0);
});