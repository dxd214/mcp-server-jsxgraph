import { promises as fs } from "fs";
import path from "path";
import puppeteer from "puppeteer";

export interface JSXGraphConfig {
  type: "function" | "parametric" | "geometry" | "vector-field";
  width: number;
  height: number;
  boundingBox: number[];
  config: any;
}

/**
 * Render JSXGraph chart using Puppeteer
 */
export async function renderJSXGraph(config: JSXGraphConfig): Promise<string> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: config.width, height: config.height });

    // Create HTML content with JSXGraph
    const htmlContent = generateHTMLContent(config);

    // Set the HTML content
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    // Wait for JSXGraph to render
    await page.waitForSelector("#jxgbox", { visible: true });
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Give time for animations to complete

    // Take screenshot
    const screenshot = await page.screenshot({
      type: "png",
      encoding: "base64",
      clip: {
        x: 0,
        y: 0,
        width: config.width,
        height: config.height,
      },
    });

    // Return base64 data URL
    return `data:image/png;base64,${screenshot}`;
  } finally {
    await browser.close();
  }
}

function generateHTMLContent(config: JSXGraphConfig): string {
  const jsxGraphCDN = "https://cdn.jsdelivr.net/npm/jsxgraph@1.10.1/distrib";

  let jsCode = "";

  switch (config.type) {
    case "function":
      jsCode = generateFunctionGraphCode(config.config, config.boundingBox);
      break;
    case "parametric":
      jsCode = generateParametricCurveCode(config.config, config.boundingBox);
      break;
    case "geometry":
      jsCode = generateGeometryDiagramCode(config.config, config.boundingBox);
      break;
    case "vector-field":
      jsCode = generateVectorFieldCode(config.config, config.boundingBox);
      break;
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>JSXGraph Chart</title>
  <link rel="stylesheet" type="text/css" href="${jsxGraphCDN}/jsxgraph.css" />
  <script type="text/javascript" src="${jsxGraphCDN}/jsxgraphcore.js"></script>
  <style>
    body { margin: 0; padding: 0; }
    #jxgbox { width: ${config.width}px; height: ${config.height}px; }
    ${config.config.style?.backgroundColor ? `#jxgbox { background-color: ${config.config.style.backgroundColor}; }` : ""}
  </style>
</head>
<body>
  <div id="jxgbox"></div>
  <script>
    ${jsCode}
  </script>
</body>
</html>`;
}

function generateFunctionGraphCode(config: any, boundingBox: number[]): string {
  const boardConfig = {
    boundingbox: boundingBox,
    axis: config.style?.axis !== false,
    grid: config.style?.grid !== false,
    keepaspectratio: config.keepAspectRatio || false,
    showCopyright: config.showCopyright || false,
    showNavigation: config.showNavigation !== false,
    zoom: config.zoom || { enabled: true, wheel: true },
    pan: config.pan || { enabled: true },
  };

  let code = `
    var board = JXG.JSXGraph.initBoard('jxgbox', ${JSON.stringify(boardConfig)});
    
    // Add title if provided
    ${config.title ? `board.create('text', [${boundingBox[0] + 1}, ${boundingBox[1] - 0.5}, '${config.title}'], {fontSize: 18, fontWeight: 'bold'});` : ""}
    
    // Add axis labels
    ${config.axisXTitle ? `board.create('text', [${boundingBox[2] - 1}, 0.5, '${config.axisXTitle}'], {fontSize: 14});` : ""}
    ${config.axisYTitle ? `board.create('text', [0.5, ${boundingBox[1] - 1}, '${config.axisYTitle}'], {fontSize: 14});` : ""}
  `;

  // Add functions
  if (config.functions) {
    config.functions.forEach((func: any, index: number) => {
      const domain = func.domain || [boundingBox[0], boundingBox[2]];
      code += `
        var f${index} = board.create('functiongraph', [
          function(x) { return ${func.expression}; },
          ${domain[0]}, ${domain[1]}
        ], {
          strokeColor: '${func.color || "#0066cc"}',
          strokeWidth: ${func.strokeWidth || 2},
          dash: ${func.dash || 0},
          name: '${func.name || ""}'
        });
      `;

      // Add derivative if requested for first function
      if (index === 0 && config.showDerivative) {
        code += `
          board.create('functiongraph', [
            JXG.Math.Numerics.D(f0.Y),
            ${domain[0]}, ${domain[1]}
          ], {
            strokeColor: '#ff6600',
            strokeWidth: 2,
            dash: 2,
            name: "f'(x)"
          });
        `;
      }

      // Add integral area if requested for first function
      if (index === 0 && config.showIntegral && config.integralBounds) {
        const [a, b] = config.integralBounds;
        code += `
          board.create('integral', [[${a}, ${b}], f0], {
            fillColor: '#0066cc',
            fillOpacity: 0.3,
            curveLeft: { visible: false },
            curveRight: { visible: false }
          });
        `;
      }

      // Add tangent line if requested for first function
      if (index === 0 && config.tangentAt !== undefined) {
        code += `
          var tPoint = board.create('glider', [${config.tangentAt}, 0, f0], {
            name: 'P',
            size: 4,
            color: '#ff0000'
          });
          board.create('tangent', [tPoint], {
            strokeColor: '#ff9900',
            strokeWidth: 2,
            dash: 1
          });
        `;
      }
    });
  }

  // Add points
  if (config.points) {
    config.points.forEach((point: any, index: number) => {
      code += `
        board.create('point', [${point.x}, ${point.y}], {
          name: '${point.name || ""}',
          size: ${point.size || 3},
          color: '${point.color || "#ff0000"}',
          fixed: true
        });
      `;
    });
  }

  return code;
}

function generateParametricCurveCode(
  config: any,
  boundingBox: number[],
): string {
  const boardConfig = {
    boundingbox: boundingBox,
    axis: config.style?.axis !== false,
    grid: config.style?.grid !== false,
    keepaspectratio: config.keepAspectRatio || false,
    showCopyright: config.showCopyright || false,
    showNavigation: config.showNavigation !== false,
    zoom: config.zoom || { enabled: true, wheel: true },
    pan: config.pan || { enabled: true },
  };

  let code = `
    var board = JXG.JSXGraph.initBoard('jxgbox', ${JSON.stringify(boardConfig)});
    
    // Add title if provided
    ${config.title ? `board.create('text', [${boundingBox[0] + 1}, ${boundingBox[1] - 0.5}, '${config.title}'], {fontSize: 18, fontWeight: 'bold'});` : ""}
    
    // Add axis labels
    ${config.axisXTitle ? `board.create('text', [${boundingBox[2] - 1}, 0.5, '${config.axisXTitle}'], {fontSize: 14});` : ""}
    ${config.axisYTitle ? `board.create('text', [0.5, ${boundingBox[1] - 1}, '${config.axisYTitle}'], {fontSize: 14});` : ""}
  `;

  // Add parametric curves
  if (config.curves) {
    config.curves.forEach((curve: any, index: number) => {
      code += `
        var curve${index} = board.create('curve', [
          function(t) { return ${curve.xExpression}; },
          function(t) { return ${curve.yExpression}; },
          ${curve.tMin || 0}, ${curve.tMax || 2 * Math.PI}
        ], {
          strokeColor: '${curve.color || "#0066cc"}',
          strokeWidth: ${curve.strokeWidth || 2},
          dash: ${curve.dash || 0}
        });
      `;

      // Add trace point if requested for first curve
      if (index === 0 && config.showTrace) {
        code += `
          var t = board.create('slider', [[${boundingBox[0] + 1}, ${boundingBox[3] + 1}], [${boundingBox[0] + 4}, ${boundingBox[3] + 1}], [${curve.tMin || 0}, ${curve.tMin || 0}, ${curve.tMax || 2 * Math.PI}]], {
            name: 't',
            snapWidth: 0.01
          });
          
          var tracePoint = board.create('point', [
            function() { var tVal = t.Value(); return ${curve.xExpression.replace(/t/g, "tVal")}; },
            function() { var tVal = t.Value(); return ${curve.yExpression.replace(/t/g, "tVal")}; }
          ], {
            size: 4,
            color: '#ff0000',
            name: 'Trace'
          });
        `;
      }
    });
  }

  // Add points
  if (config.points) {
    config.points.forEach((point: any, index: number) => {
      code += `
        board.create('point', [${point.x}, ${point.y}], {
          name: '${point.name || ""}',
          size: ${point.size || 3},
          color: '${point.color || "#ff0000"}',
          fixed: true
        });
      `;
    });
  }

  return code;
}

function generateGeometryDiagramCode(
  config: any,
  boundingBox: number[],
): string {
  const boardConfig = {
    boundingbox: boundingBox,
    axis: config.style?.axis !== false,
    grid: config.style?.grid !== false,
    keepaspectratio: config.keepAspectRatio !== false,
    showCopyright: config.showCopyright || false,
    showNavigation: config.showNavigation !== false,
    zoom: config.zoom || { enabled: true, wheel: true },
    pan: config.pan || { enabled: true },
  };

  let code = `
    var board = JXG.JSXGraph.initBoard('jxgbox', ${JSON.stringify(boardConfig)});
    var points = {};
    var lines = {};
    var circles = {};
    
    // Add title if provided
    ${config.title ? `board.create('text', [${boundingBox[0] + 1}, ${boundingBox[1] - 0.5}, '${config.title}'], {fontSize: 18, fontWeight: 'bold'});` : ""}
  `;

  // Create points
  if (config.points) {
    config.points.forEach((point: any) => {
      code += `
        points['${point.name || `p_${point.x}_${point.y}`}'] = board.create('point', [${point.x}, ${point.y}], {
          name: '${point.name || ""}',
          size: ${point.size || 4},
          color: '${point.color || "#0066cc"}',
          fixed: ${point.fixed || false},
          visible: ${point.visible !== false}
        });
      `;
    });
  }

  // Create lines
  if (config.lines) {
    config.lines.forEach((line: any, index: number) => {
      const lineType = line.type || "segment";
      const createMethod =
        lineType === "line" ? "line" : lineType === "ray" ? "arrow" : "segment";
      code += `
        if (points['${line.point1}'] && points['${line.point2}']) {
          lines['${line.name || `${line.point1}-${line.point2}`}'] = board.create('${createMethod}', [
            points['${line.point1}'], points['${line.point2}']
          ], {
            strokeColor: '${line.color || "#333333"}',
            strokeWidth: ${line.strokeWidth || 2},
            dash: ${line.dash || 0},
            name: '${line.name || ""}',
            straightFirst: ${lineType === "line"},
            straightLast: ${lineType === "line" || lineType === "ray"}
          });
        }
      `;
    });
  }

  // Create circles
  if (config.circles) {
    config.circles.forEach((circle: any, index: number) => {
      if (circle.radius !== undefined) {
        code += `
          if (points['${circle.center}']) {
            circles['circle${index}'] = board.create('circle', [
              points['${circle.center}'], ${circle.radius}
            ], {
              strokeColor: '${circle.color || "#0066cc"}',
              fillColor: '${circle.fillColor || "transparent"}',
              fillOpacity: ${circle.fillOpacity || 0},
              strokeWidth: ${circle.strokeWidth || 2}
            });
          }
        `;
      } else if (circle.throughPoint) {
        code += `
          if (points['${circle.center}'] && points['${circle.throughPoint}']) {
            circles['circle${index}'] = board.create('circle', [
              points['${circle.center}'], points['${circle.throughPoint}']
            ], {
              strokeColor: '${circle.color || "#0066cc"}',
              fillColor: '${circle.fillColor || "transparent"}',
              fillOpacity: ${circle.fillOpacity || 0},
              strokeWidth: ${circle.strokeWidth || 2}
            });
          }
        `;
      }
    });
  }

  // Create polygons
  if (config.polygons) {
    config.polygons.forEach((polygon: any, index: number) => {
      const verticesStr = polygon.vertices
        .map((v: string) => `points['${v}']`)
        .join(", ");
      code += `
        var vertices${index} = [${verticesStr}].filter(p => p);
        if (vertices${index}.length >= 3) {
          board.create('polygon', vertices${index}, {
            borders: {
              strokeColor: '${polygon.color || "#0066cc"}',
              strokeWidth: ${polygon.strokeWidth || 2}
            },
            fillColor: '${polygon.fillColor || "#0066cc"}',
            fillOpacity: ${polygon.fillOpacity || 0.3}
          });
        }
      `;
    });
  }

  // Create angles
  if (config.angles) {
    config.angles.forEach((angle: any, index: number) => {
      code += `
        if (points['${angle.point1}'] && points['${angle.vertex}'] && points['${angle.point2}']) {
          board.create('angle', [
            points['${angle.point1}'], points['${angle.vertex}'], points['${angle.point2}']
          ], {
            radius: ${angle.radius || 30} / board.unitX,
            type: '${angle.type || "arc"}',
            color: '${angle.color || "#ff9900"}',
            fillOpacity: ${angle.fillOpacity || 0.3},
            label: {
              visible: ${angle.label !== false}
            }
          });
        }
      `;
    });
  }

  // Add geometric constructions
  if (config.construction) {
    // Perpendiculars
    if (config.construction.perpendicular) {
      config.construction.perpendicular.forEach((perp: any) => {
        code += `
          if (lines['${perp.line}'] && points['${perp.throughPoint}']) {
            board.create('perpendicular', [lines['${perp.line}'], points['${perp.throughPoint}']], {
              strokeColor: '#666666',
              strokeWidth: 1,
              dash: 2
            });
          }
        `;
      });
    }

    // Parallels
    if (config.construction.parallel) {
      config.construction.parallel.forEach((par: any) => {
        code += `
          if (lines['${par.line}'] && points['${par.throughPoint}']) {
            board.create('parallel', [lines['${par.line}'], points['${par.throughPoint}']], {
              strokeColor: '#666666',
              strokeWidth: 1,
              dash: 2
            });
          }
        `;
      });
    }

    // Midpoints
    if (config.construction.midpoint) {
      config.construction.midpoint.forEach((mid: any) => {
        code += `
          if (points['${mid.point1}'] && points['${mid.point2}']) {
            points['${mid.name}'] = board.create('midpoint', [
              points['${mid.point1}'], points['${mid.point2}']
            ], {
              name: '${mid.name}',
              size: 3,
              color: '#009900'
            });
          }
        `;
      });
    }
  }

  return code;
}

function generateVectorFieldCode(config: any, boundingBox: number[]): string {
  const boardConfig = {
    boundingbox: boundingBox,
    axis: config.style?.axis !== false,
    grid: config.style?.grid !== false,
    keepaspectratio: config.keepAspectRatio || false,
    showCopyright: config.showCopyright || false,
    showNavigation: config.showNavigation !== false,
    zoom: config.zoom || { enabled: true, wheel: true },
    pan: config.pan || { enabled: true },
  };

  const density = config.density || 10;
  const scale = config.scale || 0.8;
  const arrowStyle = config.arrowStyle || {};

  let code = `
    var board = JXG.JSXGraph.initBoard('jxgbox', ${JSON.stringify(boardConfig)});
    
    // Add title if provided
    ${config.title ? `board.create('text', [${boundingBox[0] + 1}, ${boundingBox[1] - 0.5}, '${config.title}'], {fontSize: 18, fontWeight: 'bold'});` : ""}
    
    // Add axis labels
    ${config.axisXTitle ? `board.create('text', [${boundingBox[2] - 1}, 0.5, '${config.axisXTitle}'], {fontSize: 14});` : ""}
    ${config.axisYTitle ? `board.create('text', [0.5, ${boundingBox[1] - 1}, '${config.axisYTitle}'], {fontSize: 14});` : ""}
    
    // Vector field function
    var fieldDx = function(x, y) { return ${config.fieldFunction.dx}; };
    var fieldDy = function(x, y) { return ${config.fieldFunction.dy}; };
    
    // Create vector field
    var xStep = (${boundingBox[2]} - ${boundingBox[0]}) / ${density};
    var yStep = (${boundingBox[1]} - ${boundingBox[3]}) / ${density};
    
    for (var x = ${boundingBox[0]} + xStep/2; x < ${boundingBox[2]}; x += xStep) {
      for (var y = ${boundingBox[3]} + yStep/2; y < ${boundingBox[1]}; y += yStep) {
        (function(x0, y0) {
          var dx = fieldDx(x0, y0);
          var dy = fieldDy(x0, y0);
          var magnitude = Math.sqrt(dx*dx + dy*dy);
          
          if (magnitude > 0.001) {
            var scaleFactor = ${scale} * Math.min(xStep, yStep) / 2;
            var endX = x0 + dx * scaleFactor / magnitude;
            var endY = y0 + dy * scaleFactor / magnitude;
            
            ${
              config.colorByMagnitude
                ? `
              var hue = Math.min(magnitude * 30, 240);
              var color = 'hsl(' + (240 - hue) + ', 100%, 50%)';
            `
                : `
              var color = '${arrowStyle.color || "#0066cc"}';
            `
            }
            
            board.create('arrow', [
              [x0, y0], [endX, endY]
            ], {
              strokeColor: color,
              strokeWidth: ${arrowStyle.strokeWidth || 1.5},
              lastArrow: {
                type: 2,
                size: ${arrowStyle.headSize || 5}
              }
            });
          }
        })(x, y);
      }
    }
  `;

  // Add streamlines
  if (config.streamlines) {
    config.streamlines.forEach((streamline: any, index: number) => {
      code += `
        // Streamline ${index}
        var streamPoints${index} = [];
        var x = ${streamline.startX};
        var y = ${streamline.startY};
        var dt = 0.01;
        var steps = ${streamline.steps || 100};
        
        streamPoints${index}.push([x, y]);
        
        for (var i = 0; i < steps; i++) {
          var dx = fieldDx(x, y);
          var dy = fieldDy(x, y);
          var magnitude = Math.sqrt(dx*dx + dy*dy);
          
          if (magnitude < 0.001) break;
          
          x += dx * dt;
          y += dy * dt;
          
          if (x < ${boundingBox[0]} || x > ${boundingBox[2]} || 
              y < ${boundingBox[3]} || y > ${boundingBox[1]}) break;
          
          streamPoints${index}.push([x, y]);
        }
        
        if (streamPoints${index}.length > 1) {
          board.create('curve', [
            streamPoints${index}.map(p => p[0]),
            streamPoints${index}.map(p => p[1])
          ], {
            strokeColor: '${streamline.color || "#ff6600"}',
            strokeWidth: ${streamline.strokeWidth || 2}
          });
        }
      `;
    });
  }

  // Add singular points
  if (config.singularPoints) {
    config.singularPoints.forEach((point: any) => {
      code += `
        board.create('point', [${point.x}, ${point.y}], {
          name: '${point.type || ""}',
          size: ${point.size || 5},
          color: '${point.color || "#ff0000"}',
          fixed: true
        });
      `;
    });
  }

  // Add magnitude legend if requested
  if (config.showMagnitudeLegend && config.colorByMagnitude) {
    code += `
      // Create magnitude legend
      var legendX = ${boundingBox[2]} - 2;
      var legendY = ${boundingBox[1]} - 1;
      var legendHeight = 3;
      
      for (var i = 0; i <= 10; i++) {
        var y = legendY - i * legendHeight / 10;
        var hue = 240 - i * 24;
        var color = 'hsl(' + hue + ', 100%, 50%)';
        
        board.create('line', [
          [legendX, y], [legendX + 0.3, y]
        ], {
          strokeColor: color,
          strokeWidth: 3,
          straightFirst: false,
          straightLast: false
        });
      }
      
      board.create('text', [legendX + 0.5, legendY, 'High'], {fontSize: 10});
      board.create('text', [legendX + 0.5, legendY - legendHeight, 'Low'], {fontSize: 10});
      board.create('text', [legendX + 0.2, legendY + 0.3, 'Magnitude'], {fontSize: 11});
    `;
  }

  return code;
}
