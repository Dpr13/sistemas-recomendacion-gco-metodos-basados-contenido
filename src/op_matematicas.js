
// Tokenizar texto
function tokenize(text) {
  if (Array.isArray(text)) {
    text = text.join(' ');
  }
  return String(text)
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

// Calcular TF (Frecuencia de Términos) para un documento
function computeTF(docTokens, vocabulary) {
  const termCounts = {};
  docTokens.forEach(term => {
    termCounts[term] = (termCounts[term] || 0) + 1;
  });
  const totalTerms = docTokens.length;
  return vocabulary.map(term => (termCounts[term] || 0) / totalTerms);
}

// Calcular IDF (Frecuencia Inversa de Documento) para todos los documentos
function computeIDF(docsTokens, vocabulary) {
  const numDocs = docsTokens.length;
  return vocabulary.map(term => {
    const docsWithTerm = docsTokens.filter(doc => doc.includes(term)).length;
    return Math.log(numDocs / (1 + docsWithTerm)); // +1 para evitar división por cero
  });
}

// Calcular TF-IDF
function computeTFIDF(tfMatrix, idfVector) {
  return tfMatrix.map(tfVector =>
    tfVector.map((tf, i) => tf * idfVector[i])
  );
}

// Similitud coseno
function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

// Matriz de similitud coseno
function cosineSimilarityMatrix(tfidfMatrix) {
  const numDocs = tfidfMatrix.length;
  const matrix = Array.from({ length: numDocs }, () => Array(numDocs).fill(0));

  for (let i = 0; i < numDocs; i++) {
    for (let j = i; j < numDocs; j++) {
      const sim = cosineSimilarity(tfidfMatrix[i], tfidfMatrix[j]);
      matrix[i][j] = sim;
      matrix[j][i] = sim; // simétrica
    }
  }
  return matrix;
}

// === FUNCIÓN PRINCIPAL ===
/**
 * Recibe un array de strings (cada string = contenido de un documento)
 * Devuelve un objeto con:
 * - vocabulary
 * - matrices TF, IDF, TF-IDF
 * - matriz de similitud coseno
 * - tabla detallada por documento
 */
function analyzeDocuments(documents) {
  // Tokenizar cada documento
  const docsTokens = documents.map(tokenize);

  // Vocabulario único
  const vocabulary = [...new Set(docsTokens.flat())];

  // Calcular TF, IDF y TF-IDF
  const tfMatrix = docsTokens.map(doc => computeTF(doc, vocabulary));
  const idfVector = computeIDF(docsTokens, vocabulary);
  const tfidfMatrix = computeTFIDF(tfMatrix, idfVector);

  // Calcular similitud coseno
  const cosineMatrix = cosineSimilarityMatrix(tfidfMatrix);

  // Construir resultados detallados por documento
  const resultados = documents.map((doc, i) => {
    const tabla = vocabulary.map((term, idx) => ({
      Indice: idx,
      Termino: term,
      TF: parseFloat(tfMatrix[i][idx].toFixed(3)),
      IDF: parseFloat(idfVector[idx].toFixed(3)),
      TF_IDF: parseFloat(tfidfMatrix[i][idx].toFixed(3)),
    }));
    return {
      documento: i + 1,
      contenido: doc,
      tabla,
    };
  });

  // Devolver toda la información como objeto
  return {
    vocabulary,
    tfMatrix,
    idfVector,
    tfidfMatrix,
    cosineMatrix,
    resultados,
  };
}


