import VectorStore from "./VectorStore";

export default class EmbeddingRetrieval {
    private embeddingModel: string;
    private vectorStore: VectorStore;

    constructor(embeddingModel: string) {
        this.embeddingModel = embeddingModel;
        this.vectorStore = new VectorStore;
    }

    async embedQuery(query: string): Promise<number[]> {
        const embedding = await this.embed(query);
        return embedding
    }

    async embedDocument(document: string): Promise<number[]> {
        const embedding = await this.embed(document);
        this.vectorStore.addItem({
            embedding: embedding,
            document: document
        });
        return embedding
    }

    private async embed(document: string): Promise<number[]> {
        const response = await fetch(
            `${process.env.EMBEDDING_BASE_URL}/${this.embeddingModel}/pipeline/feature-extraction`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' , Authorization: `Bearer ${process.env.HF_API_KEY}`},
                body: JSON.stringify({ inputs: document }),
            }
        );
        const embedding = await response.json();
        console.log(embedding);
        return embedding;
    }

    async retrieve(query: string, topK: number = 3){
        const queryEmbedding = await this.embedQuery(query);
        console.log('queryEmbedding:', queryEmbedding, 'type:', typeof queryEmbedding, 'isArray:', Array.isArray(queryEmbedding));
        return this.vectorStore.search(queryEmbedding, topK);
    }
}