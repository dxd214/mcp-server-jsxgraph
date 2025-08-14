import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import {
  BoundingBoxSchema,
  JSXGraphAxisSchema,
  JSXGraphBackgroundColorSchema,
  JSXGraphGridSchema,
  JSXGraphHeightSchema,
  JSXGraphThemeSchema,
  JSXGraphTitleSchema,
  JSXGraphWidthSchema,
  KeepAspectRatioSchema,
  PanSchema,
  ShowCopyrightSchema,
  ShowNavigationSchema,
  ZoomSchema,
} from "./jsxgraph-base";

// Vector field function schema
const VectorFieldFunctionSchema = z.object({
  dx: z
    .string()
    .describe(
      "Expression for the x-component of the vector field as function of (x, y), e.g., '-y', 'x + y', 'Math.sin(x)'",
    ),
  dy: z
    .string()
    .describe(
      "Expression for the y-component of the vector field as function of (x, y), e.g., 'x', 'x - y', 'Math.cos(y)'",
    ),
});

// Streamline schema
const StreamlineSchema = z.object({
  startX: z.number().describe("Starting x coordinate for the streamline"),
  startY: z.number().describe("Starting y coordinate for the streamline"),
  color: z
    .string()
    .optional()
    .default("#ff6600")
    .describe("Color of the streamline"),
  strokeWidth: z.number().optional().default(2).describe("Width of the streamline"),
  steps: z.number().optional().default(100).describe("Number of integration steps"),
});

// Singular point schema
const SingularPointSchema = z.object({
  x: z.number().describe("X coordinate of the singular point"),
  y: z.number().describe("Y coordinate of the singular point"),
  type: z
    .enum(["source", "sink", "saddle", "center"])
    .describe("Type of singular point"),
  color: z
    .string()
    .optional()
    .default("#ff0000")
    .describe("Color of the singular point"),
  size: z.number().optional().default(5).describe("Size of the point marker"),
});

// Vector field input schema
const schema = {
  fieldFunction: VectorFieldFunctionSchema.describe(
    "Vector field function F(x,y) = (dx, dy)",
  ),
  density: z
    .number()
    .optional()
    .default(10)
    .describe("Number of vectors to show in each direction (density of the field)"),
  scale: z
    .number()
    .optional()
    .default(0.8)
    .describe("Scale factor for vector lengths (0.1 to 2.0)"),
  arrowStyle: z
    .object({
      color: z
        .string()
        .optional()
        .default("#0066cc")
        .describe("Color of the vectors"),
      strokeWidth: z
        .number()
        .optional()
        .default(1.5)
        .describe("Width of the vector arrows"),
      headSize: z
        .number()
        .optional()
        .default(5)
        .describe("Size of the arrowheads"),
    })
    .optional()
    .describe("Styling options for the vector arrows"),
  streamlines: z
    .array(StreamlineSchema)
    .optional()
    .describe(
      "Optional streamlines (integral curves) to show the flow of the field",
    ),
  singularPoints: z
    .array(SingularPointSchema)
    .optional()
    .describe("Optional singular/critical points to highlight"),
  colorByMagnitude: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether to color vectors based on their magnitude"),
  showMagnitudeLegend: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether to show a legend for magnitude colors"),
  style: z
    .object({
      theme: JSXGraphThemeSchema,
      backgroundColor: JSXGraphBackgroundColorSchema,
      grid: JSXGraphGridSchema,
      axis: JSXGraphAxisSchema,
    })
    .optional()
    .describe("Custom style configuration for the chart."),
  width: JSXGraphWidthSchema,
  height: JSXGraphHeightSchema,
  title: JSXGraphTitleSchema,
  axisXTitle: z.string().optional().default("x").describe("Label for X axis"),
  axisYTitle: z.string().optional().default("y").describe("Label for Y axis"),
  boundingBox: BoundingBoxSchema,
  keepAspectRatio: KeepAspectRatioSchema,
  showCopyright: ShowCopyrightSchema,
  showNavigation: ShowNavigationSchema,
  zoom: ZoomSchema,
  pan: PanSchema,
};

// Vector field tool descriptor
const tool = {
  name: "generate_vector_field",
  description:
    "Generate vector field visualizations using JSXGraph. Display 2D vector fields with arrows showing direction and magnitude at each point. Supports streamlines, singular points, and color-coded magnitudes. Ideal for visualizing gradient fields, flow fields, electromagnetic fields, etc.",
  inputSchema: zodToJsonSchema(z.object(schema)),
};

// Generate JSXGraph code for vector fields
function generateVectorFieldCode(config: any, boundingBox: number[]): string {
  const {
    fieldFunction,
    density = 10,
    scale = 0.8,
    arrowStyle = { color: "#0066cc", strokeWidth: 1.5, headSize: 5 },
    streamlines = [],
    singularPoints = [],
    colorByMagnitude = false,
    showMagnitudeLegend = false,
    title = "",
    axisXTitle = "x",
    axisYTitle = "y",
    showCopyright = false,
    showNavigation = true,
    zoom = { enabled: true, wheel: true },
    pan = { enabled: true }
  } = config;

  let jsCode = `var board = JXG.JSXGraph.initBoard('jxgbox_vector_field_${Date.now()}', {"boundingbox":${JSON.stringify(boundingBox)},"axis":true,"grid":true,"keepaspectratio":false,"showCopyright":${showCopyright},"showNavigation":${showNavigation},"zoom":{"enabled":${zoom.enabled},"wheel":${zoom.wheel}},"pan":{"enabled":${pan.enabled}}});\n`;
  
  // Add title if provided
  if (title) {
    jsCode += `board.create('text', [${boundingBox[0] + 1}, ${boundingBox[1] - 0.5}, '${title}'], {fontSize: 18, fontWeight: 'bold'});\n`;
  }
  
  // Add axis labels
  if (axisXTitle !== "x") {
    jsCode += `board.create('text', [${(boundingBox[0] + boundingBox[2]) / 2}, ${boundingBox[3] - 0.5}, '${axisXTitle}'], {fontSize: 14, anchorX: 'middle'});\n`;
  }
  if (axisYTitle !== "y") {
    jsCode += `board.create('text', [${boundingBox[0] - 0.5}, ${(boundingBox[1] + boundingBox[3]) / 2}, '${axisYTitle}'], {fontSize: 14, anchorY: 'middle', rotation: 90});\n`;
  }

  const { dx, dy } = fieldFunction;
  const { color = "#0066cc", strokeWidth = 1.5, headSize = 5 } = arrowStyle;
  
  // Create vector field grid
  jsCode += `// Vector field grid\n`;
  jsCode += `var vectors = [];\n`;
  jsCode += `var xStep = (${boundingBox[2]} - ${boundingBox[0]}) / ${density};\n`;
  jsCode += `var yStep = (${boundingBox[1]} - ${boundingBox[3]}) / ${density};\n`;
  jsCode += `\n`;
  
  // Generate vectors at grid points
  jsCode += `for (var i = 0; i <= ${density}; i++) {\n`;
  jsCode += `  for (var j = 0; j <= ${density}; j++) {\n`;
  jsCode += `    var x = ${boundingBox[0]} + i * xStep;\n`;
  jsCode += `    var y = ${boundingBox[3]} + j * yStep;\n`;
  jsCode += `    \n`;
  jsCode += `    // Calculate vector components\n`;
  jsCode += `    var dx = ${dx};\n`;
  jsCode += `    var dy = ${dy};\n`;
  jsCode += `    \n`;
  jsCode += `    // Calculate magnitude for coloring\n`;
  jsCode += `    var magnitude = Math.sqrt(dx * dx + dy * dy);\n`;
  jsCode += `    \n`;
  jsCode += `    // Skip zero vectors\n`;
  jsCode += `    if (magnitude > 0.01) {\n`;
  jsCode += `      // Scale vector length\n`;
  jsCode += `      var scaleFactor = ${scale} / Math.max(${boundingBox[2]} - ${boundingBox[0]}, ${boundingBox[1]} - ${boundingBox[3]}) * 10;\n`;
  jsCode += `      var scaledDx = dx * scaleFactor;\n`;
  jsCode += `      var scaledDy = dy * scaleFactor;\n`;
  jsCode += `      \n`;
  jsCode += `      // Determine color based on magnitude if requested\n`;
  jsCode += `      var vectorColor = '${color}';\n`;
  if (colorByMagnitude) {
    jsCode += `      if (magnitude > 2) vectorColor = '#ff0000';\n`;
    jsCode += `      else if (magnitude > 1) vectorColor = '#ff6600';\n`;
    jsCode += `      else if (magnitude > 0.5) vectorColor = '#ffff00';\n`;
    jsCode += `      else vectorColor = '#00ff00';\n`;
  }
  jsCode += `      \n`;
  jsCode += `      // Create arrow\n`;
  jsCode += `      var arrow = board.create('arrow', [[x, y], [x + scaledDx, y + scaledDy]], {\n`;
  jsCode += `        strokeColor: vectorColor,\n`;
  jsCode += `        strokeWidth: ${strokeWidth},\n`;
  jsCode += `        size: ${headSize}\n`;
  jsCode += `      });\n`;
  jsCode += `      vectors.push(arrow);\n`;
  jsCode += `    }\n`;
  jsCode += `  }\n`;
  jsCode += `}\n`;
  jsCode += `\n`;
  
  // Add streamlines
  if (streamlines.length > 0) {
    jsCode += `// Streamlines\n`;
    streamlines.forEach((streamline: any, index: number) => {
      const { startX, startY, color = "#ff6600", strokeWidth = 2, steps = 100 } = streamline;
      jsCode += `var streamline${index} = [];\n`;
      jsCode += `var x = ${startX}, y = ${startY};\n`;
      jsCode += `var dt = 0.1;\n`;
      jsCode += `\n`;
      jsCode += `for (var step = 0; step < ${steps}; step++) {\n`;
      jsCode += `  var dx = ${dx};\n`;
      jsCode += `  var dy = ${dy};\n`;
      jsCode += `  \n`;
      jsCode += `  // Normalize and scale\n`;
      jsCode += `  var magnitude = Math.sqrt(dx * dx + dy * dy);\n`;
      jsCode += `  if (magnitude > 0.01) {\n`;
      jsCode += `    dx = dx / magnitude * dt;\n`;
      jsCode += `    dy = dy / magnitude * dt;\n`;
      jsCode += `  }\n`;
      jsCode += `  \n`;
      jsCode += `  var newX = x + dx;\n`;
      jsCode += `  var newY = y + dy;\n`;
      jsCode += `  \n`;
      jsCode += `  // Check bounds\n`;
      jsCode += `  if (newX >= ${boundingBox[0]} && newX <= ${boundingBox[2]} && newY >= ${boundingBox[3]} && newY <= ${boundingBox[1]}) {\n`;
      jsCode += `    var point = board.create('point', [newX, newY], {size: 1, color: '${color}', fixed: true});\n`;
      jsCode += `    streamline${index}.push(point);\n`;
      jsCode += `    x = newX;\n`;
      jsCode += `    y = newY;\n`;
      jsCode += `  } else {\n`;
      jsCode += `    break;\n`;
      jsCode += `  }\n`;
      jsCode += `}\n`;
      jsCode += `\n`;
    });
  }
  
  // Add singular points
  if (singularPoints.length > 0) {
    jsCode += `// Singular points\n`;
    singularPoints.forEach((point: any, index: number) => {
      const { x, y, type, color = "#ff0000", size = 5 } = point;
      let marker = "circle";
      let name = type;
      
      // Customize marker based on type
      switch (type) {
        case "source":
          marker = "circle";
          name = "Source";
          break;
        case "sink":
          marker = "circle";
          name = "Sink";
          break;
        case "saddle":
          marker = "diamond";
          name = "Saddle";
          break;
        case "center":
          marker = "square";
          name = "Center";
          break;
      }
      
      jsCode += `var singular${index} = board.create('${marker}', [${x}, ${y}], {\n`;
      jsCode += `  name: '${name}',\n`;
      jsCode += `  size: ${size},\n`;
      jsCode += `  color: '${color}',\n`;
      jsCode += `  fixed: true\n`;
      jsCode += `});\n`;
    });
  }
  
  // Add magnitude legend if requested
  if (showMagnitudeLegend && colorByMagnitude) {
    jsCode += `// Magnitude legend\n`;
    jsCode += `var legend = board.create('text', [${boundingBox[0] + 1}, ${boundingBox[3] + 1}, 'Magnitude Legend:'], {fontSize: 12, color: '#333'});\n`;
    jsCode += `var legend1 = board.create('text', [${boundingBox[0] + 1}, ${boundingBox[3] + 0.7}, '● High (>2)'], {fontSize: 10, color: '#ff0000'});\n`;
    jsCode += `var legend2 = board.create('text', [${boundingBox[0] + 1}, ${boundingBox[3] + 0.5}, '● Medium (1-2)'], {fontSize: 10, color: '#ff6600'});\n`;
    jsCode += `var legend3 = board.create('text', [${boundingBox[0] + 1}, ${boundingBox[3] + 0.3}, '● Low (0.5-1)'], {fontSize: 10, color: '#ffff00'});\n`;
    jsCode += `var legend4 = board.create('text', [${boundingBox[0] + 1}, ${boundingBox[3] + 0.1}, '● Very Low (<0.5)'], {fontSize: 10, color: '#00ff00'});\n`;
  }
  
  // Add field information
  jsCode += `// Field information\n`;
  jsCode += `var fieldInfo = board.create('text', [${boundingBox[0] + 1}, ${boundingBox[1] - 1}, 'Vector Field: F(x,y) = (${dx}, ${dy})'], {fontSize: 10, color: '#666'});\n`;
  jsCode += `var densityInfo = board.create('text', [${boundingBox[0] + 1}, ${boundingBox[1] - 1.3}, 'Density: ${density}×${density} grid'], {fontSize: 10, color: '#666'});\n`;
  
  // Add interactive controls
  jsCode += `// Interactive controls\n`;
  jsCode += `var scaleSlider = board.create('slider', [[${boundingBox[0] + 1}, ${boundingBox[1] - 2}], [${boundingBox[0] + 3}, ${boundingBox[1] - 2}], [0.1, ${scale}, 2.0], {name: 'Scale', precision: 1, color: '#ff6600'});\n`;
  jsCode += `\n`;
  jsCode += `// Update vector scale when slider changes\n`;
  jsCode += `scaleSlider.on('drag', function() {\n`;
  jsCode += `  var newScale = this.Value();\n`;
  jsCode += `  vectors.forEach(function(vector) {\n`;
  jsCode += `    // Update vector length based on new scale\n`;
  jsCode += `    // This is a simplified update - in practice you might want to recreate vectors\n`;
  jsCode += `  });\n`;
  jsCode += `});\n`;
  
  return jsCode;
}

export const vectorField = {
  schema,
  tool,
  generateCode: generateVectorFieldCode
};
