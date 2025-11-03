const messageDisplay1 = document.getElementById("message_error_input_files");
const messageDisplay2 = document.getElementById("message_error_stop_words");
const messageDisplay3 = document.getElementById("message_error_lematizacion");

/**
 * Muestra un mensaje en el elemento con id "message" con el color correspondiente según el tipo.
 *
 * @param string message - El mensaje a mostrar.
 * @param string type - El tipo de mensaje ("error" para rojo, cualquier otro valor para verde).
 */
function showMessage(messageDisplay, message, type) {
  messageDisplay.textContent = message;
  messageDisplay.style.color = type === "error" ? "red" : "green";
  messageDisplay.style.fontSize = "12px";
}

/**
 * Lee los ficheros de entrada.
 * @returns Promise<string[]> - Array con el contenido de los ficheros.
 */
export function leeFicherosEntrada() {
  const ficheros_entrada = document.getElementById("ficheros_entrada");

  if (
    !ficheros_entrada ||
    !ficheros_entrada.files ||
    ficheros_entrada.files.length === 0
  ) {
    showMessage(messageDisplay1, "No hay archivos seleccionados", "error");
    return Promise.reject("No hay archivos seleccionados");
  }

  const archivos = ficheros_entrada.files;
  const promesas = [];

  // Crear una promesa para cada archivo
  for (let i = 0; i < archivos.length; i++) {
    const promesa = new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        try {
          // Leer todo el contenido del archivo
          let contenido = reader.result;

          // Limpiar: mantener solo letras (incluyendo tildes, eñes), espacios y apóstrofes
          // Conservamos tanto el apóstrofo simple (') como el tipográfico (’)
          // Eliminar números, otra puntuación y símbolos
          contenido = contenido.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'’]/g, " ");

          // Eliminar espacios múltiples y trim
          contenido = contenido.replace(/\s+/g, " ").trim();

          resolve(contenido);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject("Error al leer el archivo");
      };

      reader.readAsText(archivos[i]);
    });

    promesas.push(promesa);
  }

  // Esperar a que todos los archivos se lean
  return Promise.all(promesas)
    .then((matriz) => {
      console.log("Matriz de documentos:", matriz);
      return matriz;
    })
    .catch((error) => {
      showMessage(
        messageDisplay1,
        "Error leyendo los ficheros. Inténtelo de nuevo.",
        "error"
      );
      return Promise.reject(error);
    });
}

/**
 * Lee el fichero de stop words.
 * @returns Promise<string[]> - Array de stop words.
 */
export function leerFicheroStopWords() {
  const fichero_stop_words =
    document.getElementById("fichero_stop_words").files[0];

  if (!fichero_stop_words) {
    showMessage(messageDisplay2, "No hay archivo seleccionado", "error");
    return Promise.reject("No hay archivo seleccionado");
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const stop_words = [];
        const lineas = reader.result.split("\n");

        for (let i = 0; i < lineas.length; i++) {
          if (lineas[i].trim() !== "") {
            stop_words.push(lineas[i].trim());
          }
        }
        resolve(stop_words);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => {
      showMessage(
        messageDisplay2,
        "Error leyendo el fichero. Inténtelo de nuevo.",
        "error"
      );
      reject("Error al leer el archivo");
    };
    reader.readAsText(fichero_stop_words);
  });
}

/**
 * Lee el fichero de lematización de términos.
 * @returns Promise<Map<string, string>> - Un mapa con los términos y sus lemas.
 */
export function leeFicheroLematizacion() {
  const input_diccionario = document.getElementById("fichero_lematizacion");

  if (
    !input_diccionario ||
    !input_diccionario.files ||
    input_diccionario.files.length === 0
  ) {
    showMessage(messageDisplay3, "No hay fichero seleccionado", "error");
    return Promise.reject("No hay fichero seleccionado");
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        // Parsear el JSON
        const diccionario = JSON.parse(reader.result);

        console.log(
          "Diccionario cargado:",
          Object.keys(diccionario).length,
          "palabras"
        );
        resolve(diccionario);
      } catch (error) {
        showMessage(
          messageDisplay3,
          "Error: El archivo no es un JSON válido",
          "error"
        );
        reject("Error al parsear el JSON: " + error.message);
      }
    };

    reader.onerror = () => {
      showMessage(
        messageDisplay3,
        "Error leyendo el fichero de lematizacion. Inténtelo de nuevo.",
        "error"
      );
      reject("Error al leer el archivo");
    };

    reader.readAsText(input_diccionario.files[0]);
  });
}

/**
 * Esta función elimina términos específicos de una lista de textos.
 * @param string[] textos - Array de textos a procesar.
 * @param string[] descartes - Array de términos a eliminar.
 * @returns string[] - Array de textos con los términos eliminados.
 */
export function descarteTerminos(textos, descartes) {
  return textos.map((texto) => {
    const palabras = texto.split(" ");
    const palabrasFiltradas = palabras.filter(
      (palabra) => !descartes.includes(palabra.toLowerCase())
    );
    return palabrasFiltradas.join(" ");
  });
}

/**
 * Esta función realiza una lematización simple en una lista de textos.
 * @param string[] textos - Array de textos a procesar.
 * @param Map lemas - Map donde las claves son palabras y los valores son sus lemas correspondientes.
 * @returns string[] - Array de textos lematizados.
 */
export function lematizacionSimple(textos, lemas) {
  // Validaciones y soporte para distintos formatos de 'lemas'
  if (!lemas) {
    console.warn(
      "lematizacionSimple: 'lemas' es null o undefined — se devuelve el texto original"
    );
    return textos;
  }

  // Normalizar 'lemas' a una lista de entradas [palabra, lema]
  let entradas;
  if (lemas instanceof Map) {
    entradas = Array.from(lemas.entries());
  } else if (Array.isArray(lemas)) {
    // Asumimos que ya es un array de pares [palabra, lema]
    entradas = lemas;
  } else if (typeof lemas === "object") {
    // JSON.parse devuelve un objeto; convertir a entries
    entradas = Object.entries(lemas);
  } else {
    console.warn("lematizacionSimple: formato de 'lemas' no soportado:", lemas);
    return textos;
  }

  return textos.map((texto) => {
    let textoLematizado = texto;
    for (const [palabra, lema] of entradas) {
      // Escapar caracteres especiales en la palabra antes de usar en regex
      const palabraEscapada = String(palabra).replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );
      const regex = new RegExp(`\\b${palabraEscapada}\\b`, "gi");
      textoLematizado = textoLematizado.replace(regex, lema);
    }
    return textoLematizado;
  });
}

