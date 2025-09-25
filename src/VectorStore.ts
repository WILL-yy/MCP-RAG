export interface VectorStoreItem {
    embedding: number[],
    document: string
}

export default class VectorStore{
    private vectorStore: VectorStoreItem[];

    constructor(){
        this.vectorStore = []
    }

    async addItem(item: VectorStoreItem){
        this.vectorStore.push(item)
    }
        
    async search(queryEmbedding: number[], topK: number = 3) {
        const scored = this.vectorStore.map(item => ({
            document: item.document,
            score: this.cosineSimilarity(queryEmbedding, item.embedding)
        }));
        return scored.sort((a, b) => b.score - a.score).slice(0, topK);
    }

    private cosineSimilarity(vecA: number[], vecB: number[]): number {
        const dotProduct = vecA.reduce((sum, a, idx) => sum + a * vecB[idx], 0);
        const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
        const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
        return dotProduct / (magnitudeA * magnitudeB);
    }
    
}