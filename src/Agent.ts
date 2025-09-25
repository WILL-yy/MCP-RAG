import { log } from "console";
import ChatOpenAI from "./ChatOpenAI";
import MCPClient from "./MCPClient";
import { logTitle } from "./util";

export default class Agent{
    private mcpClients: MCPClient[];
    private llm: ChatOpenAI | null = null
    private model: string
    private systemPrompt: string
    private context: string

    constructor(model: string, mcpClients: MCPClient[], systemPrompt: string = '', context: string = ''){
        this.mcpClients = mcpClients
        this.model = model
        this.context = context
        this.systemPrompt = systemPrompt
    }
    public async init(){
        logTitle('Init LLM and Tools')
        for(const mcpClients of this.mcpClients){
            await mcpClients.init()
        }
        const tools = this.mcpClients.flatMap(mcpClient => mcpClient.getTools())
        this.llm = new ChatOpenAI(this.model, this.systemPrompt, tools, this.context)
    }

    public async close(){
        logTitle('Close MCP Clients')
        for await (const client of this.mcpClients){
            await client.close
        }
    }

    async invoke(prompt: string){
        if (!this.llm) throw new Error('LLM not Initialized')
        let response = await this.llm.chat(prompt)
        while(true){
            //处理工具调用
            if ( response.toolCalls.length > 0){
                for( const toolCall of response.toolCalls){
                    const mcp = this.mcpClients.find(mcpClient => mcpClient.getTools().find(t => t.name === toolCall.function.name))
                    if(mcp){
                        logTitle('Tool Use ' + toolCall.function.name)
                        console.log(`Calling tool : ${toolCall.function.name} `)
                        console.log(toolCall.function.arguments)
                        const result = await mcp.callTool(toolCall.function.name, JSON.parse(toolCall.function.arguments))
                        console.log(`Result: ${result}`)
                        this.llm.appendToolResult(toolCall.id, JSON.stringify(result))
                    }else{
                        this.llm.appendToolResult(toolCall.id, 'Tool not found')
                    }
                }
                response = await this.llm.chat()
                continue
            }
            await this.close()
            return response.content
            logTitle('程序已退出')
            
        }
    }
}