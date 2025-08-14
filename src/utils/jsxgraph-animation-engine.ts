/**
 * JSXGraph Animation Engine
 * Provides rich animation effects for step transitions
 */

export interface AnimationConfig {
  duration?: number;
  easing?: "linear" | "ease-in" | "ease-out" | "ease-in-out";
  fps?: number;
}

export interface AnimationTarget {
  element: any;
  properties: Record<string, any>;
  options?: AnimationConfig;
}

/**
 * Generate animation engine code
 */
export function generateAnimationEngineCode(config: AnimationConfig = {}): string {
  const {
    duration = 800,
    easing = "ease-in-out",
    fps = 60,
  } = config;

  return `
// JSXGraph Animation Engine
const AnimationEngine = (function() {
  let isAnimating = false;
  let animationQueue = [];
  
  // Easing functions
  const easingFunctions = {
    'linear': (t) => t,
    'ease-in': (t) => t * t,
    'ease-out': (t) => t * (2 - t),
    'ease-in-out': (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
  };
  
  // Main animation function
  function animate(target, properties, options = {}) {
    if (!target || isAnimating) return Promise.resolve();
    
    return new Promise((resolve) => {
      const startTime = Date.now();
      const animDuration = options.duration || ${duration};
      const easingFunc = easingFunctions[options.easing || '${easing}'];
      const startValues = {};
      const endValues = {};
      
      // Get start and target values
      for (let prop in properties) {
        if (target.getAttribute) {
          startValues[prop] = target.getAttribute(prop);
        } else if (target[prop] !== undefined) {
          startValues[prop] = target[prop];
        }
        endValues[prop] = properties[prop];
      }
      
      // Animation loop
      function animationFrame() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / animDuration, 1);
        const easedProgress = easingFunc(progress);
        
        // Update properties
        for (let prop in properties) {
          if (startValues[prop] !== undefined && endValues[prop] !== undefined) {
            const currentValue = startValues[prop] + (endValues[prop] - startValues[prop]) * easedProgress;
            
            if (target.setAttribute) {
              target.setAttribute({ [prop]: currentValue });
            } else if (target[prop] !== undefined) {
              target[prop] = currentValue;
            }
          }
        }
        
        if (progress < 1) {
          requestAnimationFrame(animationFrame);
        } else {
          resolve();
        }
      }
      
      requestAnimationFrame(animationFrame);
    });
  }
  
  // Point translation animation
  function movePoint(point, newCoords, options = {}) {
    if (!point || !point.coords) return Promise.resolve();
    
    const currentCoords = [point.coords.usrCoords[1], point.coords.usrCoords[2]];
    
    return animate(point, { coords: newCoords }, options);
  }
  
  // Line translation animation
  function moveLine(line, newCoords, options = {}) {
    if (!line || !line.point1 || !line.point2) return Promise.resolve();
    
    const promises = [];
    if (newCoords.point1) {
      promises.push(movePoint(line.point1, newCoords.point1, options));
    }
    if (newCoords.point2) {
      promises.push(movePoint(line.point2, newCoords.point2, options));
    }
    
    return Promise.all(promises);
  }
  
  // Curve drawing animation (step-by-step display)
  function animateCurve(curve, options = {}) {
    if (!curve || !curve.getAttribute) return Promise.resolve();
    
    // Save original domain
    const originalDomain = curve.getAttribute('domain') || [-10, 10];
    const targetDomain = options.domain || originalDomain;
    
    // Set initial domain to start point
    curve.setAttribute({ domain: [targetDomain[0], targetDomain[0]] });
    
    // Gradually expand domain
    const steps = 20;
    const stepDuration = (options.duration || ${duration}) / steps;
    
    return new Promise((resolve) => {
      let currentStep = 0;
      
      function expandDomain() {
        currentStep++;
        const progress = currentStep / steps;
        const currentDomain = targetDomain[0] + (targetDomain[1] - targetDomain[0]) * progress;
        
        // Update curve display range
        curve.setAttribute({ domain: [targetDomain[0], currentDomain] });
        
        // Simulate drawing effect by changing opacity
        if (progress < 0.5) {
          curve.setAttribute({ strokeOpacity: progress * 2 });
        }
        
        if (currentStep < steps) {
          setTimeout(expandDomain, stepDuration);
        } else {
          // Initialize as transparent
          curve.setAttribute({ 
            domain: targetDomain,
            strokeOpacity: 1 
          });
          resolve();
        }
      }
      
      expandDomain();
    });
  }
  
  // Public API
  return {
    animate,
    movePoint,
    moveLine,
    animateCurve,
    get isAnimating() { return isAnimating; }
  };
})();
`;
}
