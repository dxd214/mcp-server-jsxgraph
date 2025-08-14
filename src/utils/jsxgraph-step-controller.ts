/**
 * JSXGraph Step Controller - Public Step Control Service
 * Provides unified step-by-step display and animation control capabilities for all JSXGraph charts
 */

import { generateAnimationEngineCode } from "./jsxgraph-animation-engine";

export interface StepControllerConfig {
  enableSteps?: boolean;
  autoPlay?: boolean;
  playSpeed?: number;
  showControls?: boolean;
  animationDuration?: number;
  animationEasing?: "linear" | "ease-in" | "ease-out" | "ease-in-out";
}

export interface ElementTransition {
  element: any;
  from?: any;
  to?: any;
  duration?: number;
  easing?: string;
}

/**
 * Generate JavaScript code for step controller
 */
export function generateStepControllerCode(
  config: StepControllerConfig = {},
): string {
  const {
    enableSteps = true,
    autoPlay = false,
    playSpeed = 3000,
    showControls = true,
    animationDuration = 800,
    animationEasing = "ease-in-out",
  } = config;

  if (!enableSteps) {
    return "";
  }

  // First generate animation engine code
  const animationEngineCode = generateAnimationEngineCode();

  return `
${animationEngineCode}

// JSXGraph Step Controller - Public Step Control Service
const StepController = (function() {
  let currentStep = -1;
  let totalSteps = 0;
  let stepHandlers = [];
  let autoPlayInterval = null;
  let isAnimating = false;
  let elementCache = new Map();
  let board = null;
  
  // Animation configuration
  const animationConfig = {
    duration: ${animationDuration},
    easing: '${animationEasing}',
    fps: 60
  };
  
  // Easing functions
  const easingFunctions = {
    'linear': (t) => t,
    'ease-in': (t) => t * t,
    'ease-out': (t) => t * (2 - t),
    'ease-in-out': (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
  };
  
  // Animation engine
  function animate(element, properties, options = {}) {
    if (!element || isAnimating) return Promise.resolve();
    
    return new Promise((resolve) => {
      const startTime = Date.now();
      const duration = options.duration || animationConfig.duration;
      const easing = easingFunctions[options.easing || animationConfig.easing];
      const startValues = {};
      const endValues = {};
      
      // Get start and target values
      for (let prop in properties) {
        if (element.getAttribute) {
          startValues[prop] = element.getAttribute(prop);
        } else if (element[prop] !== undefined) {
          startValues[prop] = element[prop];
        }
        endValues[prop] = properties[prop];
      }
      
      // Animation loop
      function animationFrame() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easing(progress);
        
        // Update properties
        for (let prop in properties) {
          if (startValues[prop] !== undefined && endValues[prop] !== undefined) {
            const currentValue = startValues[prop] + (endValues[prop] - startValues[prop]) * easedProgress;
            
            if (element.setAttribute) {
              element.setAttribute({ [prop]: currentValue });
            } else if (element[prop] !== undefined) {
              element[prop] = currentValue;
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
  
  // Fade in effect
  function fadeIn(elements, duration = 300) {
    elements.forEach(el => {
      if (el && el.setAttribute) {
        // Set directly to visible
        el.setAttribute({ 
          visible: true,
          fillOpacity: 1,
          strokeOpacity: 1,
          opacity: 1
        });
      }
    });
    
    if (board) board.update();
    return Promise.resolve();
  }
  
  // Fade out effect
  function fadeOut(elements, duration = 200) {
    elements.forEach(el => {
      if (el && el.setAttribute) {
        // Hide directly
        el.setAttribute({ visible: false });
      }
    });
    
    if (board) board.update();
    return Promise.resolve();
  }
  
  // Move animation
  function moveTo(element, newCoords, duration = 800) {
    if (!element || !element.coords) return Promise.resolve();
    
    const currentCoords = [element.coords.usrCoords[1], element.coords.usrCoords[2]];
    
    return animate(element, { coords: newCoords }, { duration });
  }
  
  // Scale animation
  function scaleTo(element, newSize, duration = 500) {
    if (!element) return Promise.resolve();
    
    return animate(element, { size: newSize }, { duration });
  }
  
  // Color transition
  function colorTransition(element, newColor, duration = 500) {
    if (!element) return Promise.resolve();
    
    // Simplified color transition (should interpolate RGB values in practice)
    return new Promise((resolve) => {
      setTimeout(() => {
        element.setAttribute({ strokeColor: newColor, fillColor: newColor });
        if (board) board.update();
        resolve();
      }, duration / 2);
    });
  }
  
  // Register step
  function registerStep(stepFunction) {
    stepHandlers.push(stepFunction);
    totalSteps = stepHandlers.length;
  }
  
  // Show specified step
  async function showStep(stepIndex) {
    if (stepIndex < 0 || stepIndex >= totalSteps || isAnimating) return;
    
    isAnimating = true;
    
    // Update UI
    updateStepInfo(stepIndex);
    
    // Get current all elements
    const currentElements = Array.from(elementCache.values());
    
    // Clear previous elements
    if (currentStep >= 0 && currentElements.length > 0) {
      currentElements.forEach(el => {
        if (el && el.setAttribute) {
          el.setAttribute({ visible: false });
        }
        if (el && board && board.removeObject) {
          try {
            board.removeObject(el);
          } catch (e) {
            // Ignore deletion errors
          }
        }
      });
      elementCache.clear();
    }
    
    // Execute new step
    if (stepHandlers[stepIndex]) {
      try {
        const newElements = await stepHandlers[stepIndex](board);
        
        // Cache new elements
        if (Array.isArray(newElements)) {
          newElements.forEach((el, i) => {
            if (el) {
              elementCache.set(\`step\${stepIndex}_\${i}\`, el);
              // Ensure element is visible
              if (el.setAttribute) {
                el.setAttribute({ 
                  visible: true,
                  fillOpacity: 1,
                  strokeOpacity: 1,
                  opacity: 1
                });
              }
            }
          });
        }
      } catch (error) {
        console.error('Step execution error:', error);
      }
    }
    
    if (board) board.update();
    currentStep = stepIndex;
    updateControlButtons();
    
    // Delay reset animation state
    setTimeout(() => {
      isAnimating = false;
      updateControlButtons();
    }, 100);
  }
  
  // Update step information
  function updateStepInfo(stepIndex) {
    const stepTitle = document.getElementById('step-title');
    const stepDescription = document.getElementById('step-description');
    const stepCounter = document.getElementById('step-counter');
    
    if (window.stepMetadata && window.stepMetadata[stepIndex]) {
      const meta = window.stepMetadata[stepIndex];
      if (stepTitle) stepTitle.textContent = meta.title || '';
      if (stepDescription) stepDescription.textContent = meta.description || '';
    }
    
    if (stepCounter) {
      stepCounter.textContent = \`Step: \${stepIndex + 1} / \${totalSteps}\`;
    }
  }
  
  // Update control button states
  function updateControlButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const resetBtn = document.getElementById('resetBtn');
    const playBtn = document.getElementById('playBtn');
    
    if (prevBtn) {
      prevBtn.disabled = currentStep <= 0 || isAnimating;
    }
    if (nextBtn) {
      nextBtn.disabled = currentStep >= totalSteps - 1 || isAnimating;
    }
    if (resetBtn) {
      resetBtn.disabled = isAnimating;
    }
    if (playBtn) {
      playBtn.disabled = isAnimating;
    }
  }
  
  // Control functions
  function nextStep() {
    if (currentStep < totalSteps - 1 && !isAnimating) {
      showStep(currentStep + 1);
    }
  }
  
  function previousStep() {
    if (currentStep > 0 && !isAnimating) {
      showStep(currentStep - 1);
    }
  }
  
  function resetSteps() {
    stopAutoPlay();
    
    // Jump directly to first step
    if (totalSteps > 0) {
      showStep(0);
    } else {
      // If no steps, clear all
      const allElements = Array.from(elementCache.values());
      if (board) {
        allElements.forEach(el => {
          if (el && board.removeObject) {
            board.removeObject(el);
          }
        });
      }
      elementCache.clear();
      currentStep = -1;
      updateControlButtons();
    }
  }
  
  function startAutoPlay() {
    if (autoPlayInterval) return;
    
    const playBtn = document.getElementById('playBtn');
    if (playBtn) {
      playBtn.textContent = '⏸️ Pause';
      playBtn.className = 'control-btn playing';
    }
    
    // If at last step, start from first step
    if (currentStep >= totalSteps - 1) {
      showStep(0);
    } 
    // If not started yet, start from first step
    else if (currentStep < 0) {
      showStep(0);
    }
    // Otherwise continue from current step
    
    // Set timer for auto-play
    autoPlayInterval = setInterval(() => {
      if (currentStep < totalSteps - 1 && !isAnimating) {
        nextStep();
      } else if (currentStep >= totalSteps - 1) {
        // Reached last step, stop auto-play
        stopAutoPlay();
      }
    }, ${playSpeed});
  }
  
  function stopAutoPlay() {
    if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
      autoPlayInterval = null;
      
      const playBtn = document.getElementById('playBtn');
      if (playBtn) {
        playBtn.textContent = '▶️ Auto Play';
        playBtn.className = 'control-btn';
      }
    }
  }
  
  function toggleAutoPlay() {
    if (autoPlayInterval) {
      stopAutoPlay();
    } else {
      startAutoPlay();
    }
  }
  
  // Initialize
  function init(jxgBoard) {
    board = jxgBoard;
    
    // Bind global functions
    window.nextStep = nextStep;
    window.previousStep = previousStep;
    window.resetSteps = resetSteps;
    window.toggleAutoPlay = toggleAutoPlay;
    
    // Show first step immediately (no delay)
    if (totalSteps > 0) {
      // Show first step directly
      showStep(0);
    } else {
      updateControlButtons();
    }
    
    // Auto-play
    if (${autoPlay}) {
      setTimeout(() => startAutoPlay(), 2000);
    }
  }
  
  // Public API
  return {
    init,
    registerStep,
    showStep,
    nextStep,
    previousStep,
    resetSteps,
    toggleAutoPlay,
    animate,
    fadeIn,
    fadeOut,
    moveTo,
    scaleTo,
    colorTransition,
    get currentStep() { return currentStep; },
    get totalSteps() { return totalSteps; },
    get isAnimating() { return isAnimating; }
  };
})();
`;
}

/**
 * Generate HTML code for step control buttons
 */
export function generateStepControlsHTML(
  config: StepControllerConfig = {},
): string {
  if (!config.showControls) {
    return "";
  }

  return `
<div class="step-controls">
  <button class="control-btn" id="prevBtn" onclick="previousStep()" disabled>⬅️ Previous</button>
  <button class="control-btn reset" id="resetBtn" onclick="resetSteps()">🔄 Reset</button>
  <button class="control-btn" id="nextBtn" onclick="nextStep()">Next ➡️</button>
  <button class="control-btn" id="playBtn" onclick="toggleAutoPlay()">▶️ Auto Play</button>
</div>`;
}

/**
 * Generate HTML code for step information display area
 */
export function generateStepInfoHTML(): string {
  return `
<div id="step-info">
  <div id="step-title">Ready to start</div>
  <div id="step-description">Click "Next" to begin</div>
  <div id="step-counter">Step: 0 / 0</div>
</div>`;
}
