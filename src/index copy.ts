import { waitForDebugger } from "inspector";
import ChatOpenAI from "./ChatOpenAI";  
import MCPClient from "./MCPClient";
import Agent from "./Agent";

const currentDir = process.cwd()

const fetchMCP = new MCPClient('fetch', 'uvx', ['mcp-server-fetch'])
const fileMCP = new MCPClient('file', 'npx', ["-y",
        "@modelcontextprotocol/server-filesystem",
        currentDir])   

async function main(){
    // const agent = new Agent('deepseek/deepseek-chat-v3.1:free',[fetchMCP, fileMCP])
    const agent = new Agent('x-ai/grok-4-fast:free',[fetchMCP, fileMCP])
    await agent.init()
    //爬取豆瓣
    // const response = await agent.invoke(`爬取 https://www.douban.com/group/topic/321659454/?_spm_id=Mzc1MjEwMDc&_i=8630482Ovqh6Or 的内容，并且总结后保存到${currentDir}的abstract.md文件中`)
    //爬取jsonplaceholder
    const response = await agent.invoke(`爬取 https://jsonplaceholder.typicode.com/users 的内容
        //在${currentDir}/konwledge中，每个人创建一个md文件，保存基本信息`)
    console.log(response)
}

main()
