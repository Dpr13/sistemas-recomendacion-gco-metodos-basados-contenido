/**
 * 
 * @param string|array text - Texto o array de texto a tokenizar.
 * @returns string[] - Array de tokens.
 */
function tokenize(text) {
  if (Array.isArray(text)) {
    text = text.join(' ');
  }
  return String(text)
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * 
 * @param string[] docTokens - Tokens del documento.
 * @param string[] vocabulary - Vocabulario único.
 * @returns number[] - Vector TF.
 */
function computeTF(docTokens, vocabulary) {
  const termCounts = {};
  docTokens.forEach(term => {
    termCounts[term] = (termCounts[term] || 0) + 1;
  });
  const totalTerms = docTokens.length;
  return vocabulary.map(term => (termCounts[term] || 0) / totalTerms);
}

/**
 * 
 * @param string[][] docsTokens - Array de documentos tokenizados.
 * @param string[] vocabulary - Vocabulario único.
 * @returns number[] - Vector IDF.
 */
function computeIDF(docsTokens, vocabulary) {
  const numDocs = docsTokens.length;
  return vocabulary.map(term => {
    const docsWithTerm = docsTokens.filter(doc => doc.includes(term)).length;
    if (docsWithTerm === 0) {
      return 0;
    }
    return Math.log(numDocs / docsWithTerm);
  });
}

/**
 * 
 * @param number[][] tfMatrix - Matriz TF.
 * @param number[] idfVector - Vector IDF.
 * @returns number[][] - Matriz TF-IDF.
 */
function computeTFIDF(tfMatrix, idfVector) {
  return tfMatrix.map(tfVector =>
    tfVector.map((tf, i) => tf * idfVector[i])
  );
}

/**
 * 
 * @param string[] documents - Array de documentos como strings.
 * @returns string[] - Array de tablas HTML con TF, IDF y TF-IDF por documento.
 */
export function analyzeDocumentsHTML(documents) {
  // Tokenizar cada documento
  const docsTokens = documents.map(tokenize);

  // Vocabulario único
  const vocabulary = [...new Set(docsTokens.flat())];

  // Calcular TF, IDF y TF-IDF
  const tfMatrix = docsTokens.map(doc => computeTF(doc, vocabulary));
  const idfVector = computeIDF(docsTokens, vocabulary);
  const tfidfMatrix = computeTFIDF(tfMatrix, idfVector);

  // Crear una tabla HTML por documento, ordenando términos por TF descendente
  const docHtmlArray = documents.map((doc, i) => {
    // Construir filas con datos y ordenar por TF (desc)
    const rows = vocabulary.map((term, idx) => ({
      term,
      vocabIndex: idx,
      tf: tfMatrix[i][idx],
      idf: idfVector[idx],
      tfidf: tfidfMatrix[i][idx]
    })).sort((a, b) => b.tf - a.tf);

    let html = `
      <div class="document-scroll" style="max-height:260px; overflow-y:auto; overflow-x:auto; box-sizing:border-box; border:1px solid #ddd; padding:8px; margin-bottom:1rem; background:#fff;">
      <table class="tfidf-table" style="width:100%; border-collapse:collapse;">
        <caption>Documento ${i + 1}</caption>
        <thead>
        <tr>
          <th style="text-align:left; padding:4px;">Índice</th>
          <th style="text-align:left; padding:4px;">Término</th>
          <th style="text-align:right; padding:4px;">TF</th>
          <th style="text-align:right; padding:4px;">IDF</th>
          <th style="text-align:right; padding:4px;">TF-IDF</th>
        </tr>
        </thead>
        <tbody>
    `;

    // Renderizar filas ya ordenadas por TF
    rows.forEach(row => {
      html += `
      <tr>
        <td style="padding:4px;">${row.vocabIndex}</td>
        <td style="padding:4px;">${row.term}</td>
        <td style="padding:4px; text-align:right;">${row.tf.toFixed(3)}</td>
        <td style="padding:4px; text-align:right;">${row.idf.toFixed(3)}</td>
        <td style="padding:4px; text-align:right;">${row.tfidf.toFixed(3)}</td>
      </tr>
      `;
    });

    html += `
        </tbody>
      </table>
      </div>
    `;

    return html.trim();
  });

  // Envolver todos los documentos en un contenedor que NO tenga scroll.
  // De este modo solo cada .document-scroll mostrará su propio scrollbar.
  const htmlTables = `
    <div class="documents-wrapper" style="overflow:visible; max-height:none;">
      ${docHtmlArray.join('\n')}
    </div>
  `;

  return htmlTables; 
}

/**
 * 
 * @param number[] vecA - Vector A.
 * @param number[] vecB - Vector B.
 * @returns number - Similitud coseno entre los vectores A y B.
 */
function cosineSimilarity(vecA, vecB) {
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < vecA.length; i++) {
    const a = vecA[i] || 0;
    const b = vecB[i] || 0;
    dot += a * b;
    magA += a * a;
    magB += b * b;
  }
  if (magA === 0 || magB === 0) return 0; // evitar división por cero
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

/**
 * 
 * @param number[][] tfidfMatrix - Matriz TF-IDF.
 * @returns number[][] - Matriz de similitud coseno.
 */
function computeCosineSimilarityMatrix(tfidfMatrix) {
  const n = tfidfMatrix.length;
  const simMatrix = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      const sim = cosineSimilarity(tfidfMatrix[i], tfidfMatrix[j]);
      simMatrix[i][j] = sim;
      simMatrix[j][i] = sim;
    }
  }
  return simMatrix;
}

/**
 * 
 * @param string[] documents - Array de documentos como strings.
 * @returns string - Tabla HTML con la matriz de similitud coseno.
 */
export function computeCosineDistances(documents) {
  const docsTokens = documents.map(tokenize);
  const vocabulary = [...new Set(docsTokens.flat())];
  const tfMatrix = docsTokens.map(doc => computeTF(doc, vocabulary));
  const idfVector = computeIDF(docsTokens, vocabulary);
  const tfidfMatrix = computeTFIDF(tfMatrix, idfVector);

  const similarityMatrix = computeCosineSimilarityMatrix(tfidfMatrix);

      let html = `
        <div>
        <h3 style="text-align:center; margin:0 0 10px;">Similitud coseno</h3>
        <table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;">
          <thead>
          <tr>
            <th></th>
            ${similarityMatrix.map((_, i) => `<th>Doc ${i + 1}</th>`).join('')}
          </tr>
          </thead>
          <tbody>
          ${similarityMatrix.map((row, i) => `
            <tr>
            <th>Doc ${i + 1}</th>
            ${row.map(v => `<td>${v.toFixed(3)}</td>`).join('')}
            </tr>
          `).join('')}
          </tbody>
        </table>
        </div>
      `;

  return html.trim();
}