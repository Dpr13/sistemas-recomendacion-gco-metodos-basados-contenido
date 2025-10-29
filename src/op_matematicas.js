
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

export function analyzeDocumentsHTML(documents) {
  // Tokenizar cada documento
  const docsTokens = documents.map(tokenize);

  // Vocabulario único
  const vocabulary = [...new Set(docsTokens.flat())];

  // Calcular TF, IDF y TF-IDF
  const tfMatrix = docsTokens.map(doc => computeTF(doc, vocabulary));
  const idfVector = computeIDF(docsTokens, vocabulary);
  const tfidfMatrix = computeTFIDF(tfMatrix, idfVector);

  // Crear una tabla HTML por documento
  const htmlTables = documents.map((doc, i) => {
    let html = `
      <table class="tfidf-table">
        <caption>📄 Documento ${i + 1}</caption>
        <thead>
          <tr>
            <th>Índice</th>
            <th>Término</th>
            <th>TF</th>
            <th>IDF</th>
            <th>TF-IDF</th>
          </tr>
        </thead>
        <tbody>
    `;

    vocabulary.forEach((term, idx) => {
      html += `
        <tr>
          <td>${idx}</td>
          <td>${term}</td>
          <td>${tfMatrix[i][idx].toFixed(3)}</td>
          <td>${idfVector[idx].toFixed(3)}</td>
          <td>${tfidfMatrix[i][idx].toFixed(3)}</td>
        </tr>
      `;
    });

    html += `
        </tbody>
      </table>
    `;

    return html.trim();
  });

  return htmlTables; // Array con una tabla HTML por documento
}


