const { env, AutoTokenizer, AutoModel } = require("@xenova/transformers");

env.allowLocalModels = true;
env.allowRemoteModels = true;

const embeddingCache = new Map();
let model = null;
let tokenizer = null;

async function initializeModel() {
  if (model && tokenizer) return;
  
  try {
    console.log("Loading MiniLM model...");
    tokenizer = await AutoTokenizer.from_pretrained("Xenova/all-MiniLM-L6-v2");
    model = await AutoModel.from_pretrained("Xenova/all-MiniLM-L6-v2");
    console.log("MiniLM loaded successfully!");
  } catch (err) {
    console.error("Model initialization failed:", err);
    throw err;
  }
}

// Normalize vector to unit length
function normalizeVector(vec) {
  const magnitude = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
  if (magnitude === 0) return vec;
  return vec.map(v => v / magnitude);
}

const generateEmbedding = async (text) => {
  if (!text || typeof text !== "string") {
    throw new Error("Invalid text for embedding");
  }

  const trimmed = text.trim().slice(0, 512);
  
  if (embeddingCache.has(trimmed)) {
    return embeddingCache.get(trimmed);
  }

  try {
    if (!model || !tokenizer) {
      await initializeModel();
    }

    const encoded = tokenizer(trimmed, { padding: true, truncation: true });
    const { last_hidden_state } = await model(encoded);
    
    // Extract embeddings and normalize
    const embeddingArray = Array.from(last_hidden_state.data);
    const normalizedEmbedding = normalizeVector(embeddingArray);
    
    embeddingCache.set(trimmed, normalizedEmbedding);
    return normalizedEmbedding;
  } catch (err) {
    console.error("Embedding generation failed:", err);
    throw err;
  }
};

module.exports = generateEmbedding;