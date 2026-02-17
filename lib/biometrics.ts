import * as ort from 'onnxruntime-web';

ort.env.wasm.wasmPaths = "/";

let session: ort.InferenceSession | null = null;
let modelLoading: Promise<void> | null = null;

const EMBEDDING_DIM = 512;

const MIN_SAMPLES = 16000 * 2;
const WINDOW_SAMPLES = 16000 * 3;

export const biometrics = {
  async loadModel() {
    if (session) return;
    if (modelLoading) return modelLoading;

    modelLoading = (async () => {
      try {
        const modelPath = "/models/pyannote_embedding.onnx";
        session = await ort.InferenceSession.create(modelPath, {
          executionProviders: ['wasm'],
          graphOptimizationLevel: 'all'
        });
      } catch (e) {
      } finally {
        modelLoading = null;
      }
    })();

    return modelLoading;
  },

  async getEmbedding(audioData: Float32Array): Promise<Float32Array> {
    await this.loadModel();

    if (session) {
      try {
        const embeddings = await this.extractEmbeddings(audioData);
        return embeddings;
      } catch (e) {
        console.error("Inference failed", e);
      }
    }

    return computeSpectralFingerprint(audioData, EMBEDDING_DIM);
  },

  async extractEmbeddings(audioData: Float32Array): Promise<Float32Array> {
    if (!session) throw new Error("Model not loaded");

    let processedAudio = audioData;
    if (audioData.length < MIN_SAMPLES) {
      processedAudio = new Float32Array(MIN_SAMPLES);
      processedAudio.set(audioData, 0);
    }

    const embeddings: Float32Array[] = [];
    const step = Math.floor(WINDOW_SAMPLES / 2);

    if (processedAudio.length >= WINDOW_SAMPLES) {
      for (let start = 0; start + WINDOW_SAMPLES <= processedAudio.length; start += step) {
        const window = processedAudio.slice(start, start + WINDOW_SAMPLES);
        const emb = await this.runInference(window);
        embeddings.push(emb);
      }
    } else {
      const paddedAudio = new Float32Array(WINDOW_SAMPLES);
      paddedAudio.set(processedAudio, 0);
      const emb = await this.runInference(paddedAudio);
      embeddings.push(emb);
    }

    if (embeddings.length === 1) {
      return embeddings[0];
    }

    const avgEmbedding = new Float32Array(EMBEDDING_DIM);
    for (const emb of embeddings) {
      for (let i = 0; i < EMBEDDING_DIM; i++) {
        avgEmbedding[i] += emb[i];
      }
    }
    for (let i = 0; i < EMBEDDING_DIM; i++) {
      avgEmbedding[i] /= embeddings.length;
    }

    let norm = 0;
    for (let i = 0; i < EMBEDDING_DIM; i++) {
      norm += avgEmbedding[i] * avgEmbedding[i];
    }
    norm = Math.sqrt(norm);
    if (norm > 0) {
      for (let i = 0; i < EMBEDDING_DIM; i++) {
        avgEmbedding[i] /= norm;
      }
    }

    return avgEmbedding;
  },

  async runInference(audioWindow: Float32Array): Promise<Float32Array> {
    if (!session) throw new Error("Model not loaded");

    const tensor = new ort.Tensor('float32', audioWindow, [1, audioWindow.length]);
    const feeds: Record<string, ort.Tensor> = { 'waveform': tensor };

    const results = await session.run(feeds);
    const output = results['embeddings'];

    return new Float32Array(output.data as Float32Array);
  },

  computeCosineSimilarity(vecA: Float32Array, vecB: Float32Array): number {
    if (vecA.length !== vecB.length) return 0;

    let dot = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dot += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }
};

function computeSpectralFingerprint(data: Float32Array, dim: number): Float32Array {
  const vec = new Float32Array(dim).fill(0);
  const step = Math.floor(data.length / dim);

  for (let i = 0; i < dim; i++) {
    let sum = 0;
    for (let j = 0; j < step; j++) {
      const idx = i * step + j;
      if (idx < data.length) sum += Math.abs(data[idx]);
    }
    const avgAmp = sum / step;

    let zcr = 0;
    for (let j = 1; j < step; j++) {
      const idx = i * step + j;
      if (idx < data.length) {
        if ((data[idx] >= 0 && data[idx - 1] < 0) || (data[idx] < 0 && data[idx - 1] >= 0)) zcr++;
      }
    }
    vec[i] = avgAmp * (1 + zcr);
  }

  let norm = 0;
  for (let i = 0; i < dim; i++) norm += vec[i] * vec[i];
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < dim; i++) vec[i] /= norm;
  }
  return vec;
}