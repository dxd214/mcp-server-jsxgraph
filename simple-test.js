#!/usr/bin/env node

console.log('🔧 Testing tool imports...');

try {
    const Charts = require('./build/jsxgraph/index.js');
    
    console.log('📋 Available chart tools:');
    const chartKeys = Object.keys(Charts);
    chartKeys.forEach((key, index) => {
        console.log(`  ${index + 1}. ${key}`);
    });
    
    console.log();
    console.log('🔍 Checking number-line tool:');
    const numberLineTool = Charts['number-line'];
    
    if (numberLineTool) {
        console.log('✅ number-line tool found!');
        console.log(`   Tool name: "${numberLineTool.tool.name}"`);
        console.log(`   Tool description length: ${numberLineTool.tool.description.length} chars`);
        console.log(`   Has execute function: ${typeof numberLineTool.execute === 'function'}`);
        console.log(`   Has inputSchema: ${!!numberLineTool.tool.inputSchema}`);
    } else {
        console.log('❌ number-line tool NOT found!');
    }
    
    // Test the execute function directly
    if (numberLineTool) {
        console.log('\n🧪 Testing direct function call...');
        try {
            const result = numberLineTool.execute({
                range: [-5, 5],
                points: [
                    { value: 2, type: 'closed', color: '#ff0000' },
                    { value: -1, type: 'open', color: '#0000ff' }
                ]
            });
            console.log('✅ Direct function call successful!');
            console.log(`   Result type: ${typeof result}`);
            console.log(`   Result length: ${result?.length || 0} chars`);
            console.log(`   Contains HTML: ${result?.includes('<html>') ? 'Yes' : 'No'}`);
        } catch (executeError) {
            console.log('❌ Direct function call failed:', executeError.message);
        }
    }
    
} catch (error) {
    console.error('❌ Import error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
}

console.log('\n✅ Test completed!');
