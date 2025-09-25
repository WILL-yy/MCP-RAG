// test.ts
import 'dotenv/config';

const HF_API_KEY = process.env.HF_API_KEY;

async function callEmbedding(source: string, targets: string[]) {
  const response = await fetch(
    'https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/sentence-similarity',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {
          source_sentence: source,
          sentences: targets,
        },
      }),
    }
  );

  const result = await response.json();
  console.log(JSON.stringify(result, null, 2));
}


async function main() {
  await callEmbedding(
    "你好",
    [
      "That is a happy dog",
      "Hey,how is it going?",
      "再见",
    ]
  );
}

main();
