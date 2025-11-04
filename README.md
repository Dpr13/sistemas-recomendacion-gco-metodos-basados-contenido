# Sistema de Recomendación GCO - Métodos Basados en Contenido

Aplicación web para análisis de documentos mediante modelos basados en contenido.

## Instalación y Despliegue

### Opción 1: Uso en GitHub Pages

La aplicación está desplegada y lista para usar en:
**[https://dpr13.github.io/sistemas-recomendacion-gco-metodos-basados-contenido/](https://dpr13.github.io/sistemas-recomendacion-gco-metodos-basados-contenido/)**

No requiere instalación. Simplemente abre el enlace en tu navegador.

### Componentes Principales

- **`index.html`**: Formulario con inputs de ficheros, selección de métricas y opciones de predicción. Usa Tailwind CSS para el diseño.
- **`src/index.js`**: Coordina la carga de ficheros, procesa los documentos y muestra los resultados.
- **`src/utilidades.js`**:
  - `leeFicherosEntrada()`: Lee múltiples documentos de texto
  - `leerFicheroStopWords()`: Carga palabras de parada
  - `leeFicheroLematizacion()`: Lee diccionario JSON de lematización
  - `descarteTerminos()`: Filtra stop words de los textos
  - `lematizacionSimple()`: Aplica lematización usando el diccionario
- **`src/op_matematicas.js`**: Implementa métricas de similitud y algoritmos de predicción.

## Ejemplo de Uso

1. **Sube ficheros de entrada**: Selecciona varios documentos de texto (puedes usar los de la carpeta `textos/`)

2. **Sube fichero de stop words**: Elige `stop-words/stop-words-es.txt` para español o `stop-words/stop-words-en.txt` para inglés

3. **Sube fichero de lematización**: Proporciona un JSON con el formato:

   ```json
   {
     "corriendo": "correr",
     "corres": "correr",
     "casas": "casa"
   }
   ```

4. **Ejecuta el análisis**: Haz clic en "Ejecutar Análisis"

5. **Revisa los resultados**: La aplicación mostrará las correlaciones entre documentos, matriz de similitud y predicciones.
