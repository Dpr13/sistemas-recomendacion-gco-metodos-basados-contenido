import {
  leeDiccionario,
  leeFicheroLematizacion,
  leeFicherosEntrada,
  leerFicheroStopWords,
  descarteTerminos,
  lematizacionSimple,
} from "./utilidades";

document.getElementById("formulario").addEventListener("submit", function (e) {
  e.preventDefault(); // Evitar recarga
  ejecutar();
});

/**
 * Función principal para ejecutar el sistema de recomendación.
 * Lee la matriz de utilidad, obtiene las opciones seleccionadas por el usuario,
 * Calcula las correlaciones y predicciones, y actualiza la interfaz de usuario.
 */
async function ejecutar() {
  try {
    // Limpiar resultados anteriores
    document.getElementById("resultado_ejercicio").innerHTML = "";
    document.getElementById("coseno_resultado").innerHTML = "";

    // Mensaje espera
    document.getElementById("mensaje_espera").innerHTML =
      "<p>Espere por favor...</p>";

    // Leer los ficheros que pasa el usuario
    const matriz = await leeFicherosEntrada();
    const stop_words = await leerFicheroStopWords();
    const diccionario = await leeFicheroLematizacion();

    // Descartamos los términos con el stop words
    let matrizSinStopWords = descarteTerminos(matriz, stop_words);

    // Lematizamos la matriz
    let matrizProcesada = lematizacionSimple(matrizSinStopWords, diccionario);

    // Mostrar mensaje de espera
    document.getElementById("mensaje_espera").innerHTML = "";

    analyzeDocuments(matrizProcesada);

    // Mostrar matriz con resultados
    document.getElementById("resultado_ejercicio").innerHTML =
      matrizSinCalculoPredicciones;
  } catch (error) {
    console.error("Error:", error);
    document.getElementById(
      "resultado"
    ).innerHTML = `<p style='color:red;'>Error: ${error.message || error}</p>`;
  }
}
