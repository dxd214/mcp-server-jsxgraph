#!/usr/bin/env node

const { createServer } = require('./build/server.js');

async function testTools() {
    try {
        console.log('🔧 Creating MCP server...');
        const server = createServer();
        
        console.log('📋 Testing ListTools request...');
        const response = await server.request({
            method: 'tools/list',
            params: {}
        });
        
        console.log(`✅ Found ${response.tools.length} tools:`);
        response.tools.forEach((tool, index) => {
            console.log(`  ${index + 1}. ${tool.name}`);
        });
        
        const numberLineTool = response.tools.find(t => t.name === 'number-line');
        console.log();
        if (numberLineTool) {
            console.log('✅ number-line tool found!');
            console.log(`   Name: "${numberLineTool.name}"`);
            console.log(`   Description: ${numberLineTool.description.substring(0, 100)}...`);
        } else {
            console.log('❌ number-line tool NOT found!');
            console.log('Available tool names:');
            response.tools.forEach(tool => {
                console.log(`   - "${tool.name}"`);
            });
        }
        
        // Test calling the tool
        if (numberLineTool) {
            console.log('\n🧪 Testing number-line tool call...');
            try {
                const testResult = await server.request({
                    method: 'tools/call',
                    params: {
                        name: 'number-line',
                        arguments: {
                            range: [-5, 5],
                            points: [
                                { value: 2, type: 'closed', color: '#ff0000' },
                                { value: -1, type: 'open', color: '#0000ff' }
                            ]
                        }
                    }
                });
                console.log('✅ Tool call successful!');
                console.log(`   Content type: ${testResult.content[0]?.type}`);
                console.log(`   Content length: ${testResult.content[0]?.text?.length || 0} chars`);
            } catch (callError) {
                console.log('❌ Tool call failed:', callError.message);
            }
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

testTools();
