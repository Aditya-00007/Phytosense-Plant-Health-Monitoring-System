const list = (v) => (Array.isArray(v) ? v : v ? [String(v)] : []);

export const Diagnosis = {
  // Normalises whatever the backend returns into one shape for the views.
  fromApi(raw = {}, imageUri = null) {
    let confidence = Number(raw.confidence ?? raw.score ?? 0);
    if (confidence > 1) confidence /= 100;
    return {
      disease: raw.disease ?? raw.prediction ?? raw.label ?? 'Unknown',
      crop: raw.crop ?? 'Tomato',
      confidence,
      explanation: raw.explanation ?? raw.description ?? '',
      causes: list(raw.causes),
      treatment: list(raw.treatment),
      prevention: list(raw.prevention),
      irrigation: list(raw.irrigation),
      imageUri,
    };
  },
  isLowConfidence: (d) => d.confidence < 0.6,
  percent: (d) => `${Math.round(d.confidence * 100)}%`,
};
