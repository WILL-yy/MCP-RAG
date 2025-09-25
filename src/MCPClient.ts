import { Client } from "@modelcontextprotocol/sdk/client";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { Tool } from "@modelcontextprotocol/sdk/types.js";

export default class MCPClient {
    private mcp: Client;
    private transport: StdioClientTransport | null = null;
    private tools: Tool[] = [];
    private command: string
    private args: string[]

    constructor(name: string, command:string, args:string[], version?: string) {
        this.mcp = new Client({ name, version: version || "1.0.0" , });
        this.command = command
        this.args = args
    }
    
    // public async callTool(toolName: string, params: any) {
    //     if (!this.mcp) {
    //         throw new Error("MCP客户端未初始化");
    //     }
        
    //     try {
    //         console.log(`调用工具: ${toolName}，参数:`, params);
    //         const result = await this.mcp.callTool(toolName, params);
    //         console.log(`工具调用结果:`, result);
    //         return result;
    //     } catch (error) {
    //         console.error(`调用工具 ${toolName} 失败:`, error);
    //         throw error;
    //     }
    // }

    public async close(){
        await this.mcp.close()
    }

    public async init(){
        await this.connectToServer()
    }

    public getTools(){
        return this.tools
    }

    public async callTool(name: string, params: Record<string, any> ){
        return await this.mcp.callTool({ name, arguments: params})
    }
  
  
    private async connectToServer() {
        try {
            this.transport = new StdioClientTransport({
                command: this.command,
                args: this.args,
            });
            await this.mcp.connect(this.transport);

            const toolsResult = await this.mcp.listTools();
            this.tools = toolsResult.tools.map((tool) => {
                return {
                    name: tool.name,
                    description: tool.description,
                    inputSchema: tool.inputSchema,
                };
            });
            console.log(
                "Connected to server with tools:",
                this.tools.map(({ name }) => name)
            );
        } catch (e) {
            console.log("Failed to connect to MCP server: ", e);
            throw e;
        }
    }
}