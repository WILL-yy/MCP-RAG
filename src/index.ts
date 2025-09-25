import { waitForDebugger } from "inspector";
import ChatOpenAI from "./ChatOpenAI";  
import MCPClient from "./MCPClient";
import Agent from "./Agent";
import EmbeddingRetrieval from "./EmbeddingRetrieval";
import path from "path";
import fs from "fs";
import { logTitle } from "./util";
import { log } from "console";

const currentDir = process.cwd()

const fetchMCP = new MCPClient('fetch', 'uvx', ['mcp-server-fetch'])
const fileMCP = new MCPClient('file', 'npx', ["-y",
        "@modelcontextprotocol/server-filesystem",
        currentDir])   

async function main(){
    const prompt = `根据Bret的信息，创作一个关于他的故事，并且把他的故事保存到${currentDir}/bret_story.md文件中`
    const context = await retrieveContext(prompt)
    // const agent = new Agent('deepseek/deepseek-chat-v3.1:free',[fetchMCP, fileMCP])
    const agent = new Agent('x-ai/grok-4-fast:free',[fetchMCP, fileMCP],'', context)
    await agent.init()
    const response = await agent.invoke(prompt)
    console.log(response)
    await agent.close()
}

async function retrieveContext(prompt: string){
    //RAG
    const embeddingModel = new EmbeddingRetrieval('sentence-transformers/all-MiniLM-L6-v2')
    const konwledgeDir = path.join(currentDir, 'konwledge')
    const files = fs.readdirSync(konwledgeDir)
    for(const file of files){
        const content = fs.readFileSync(path.join(konwledgeDir, file), 'utf-8')
        await embeddingModel.embedDocument(content)
    }
    const context = await embeddingModel.retrieve(prompt)
    logTitle('Context Retrieved')
    console.log(context)
    return context.map(c => c.document).join('\n')
}

main()
