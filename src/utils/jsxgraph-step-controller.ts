/**
 * JSXGraph Step Controller - 公共步骤控制服务
 * 为所有JSXGraph图表提供统一的分步骤展示和动画控制能力
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
 * 生成步骤控制器的JavaScript代码
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

  // 先生成动画引擎代码
  const animationEngineCode = generateAnimationEngineCode();

  return `
${animationEngineCode}

// JSXGraph Step Controller - 公共步骤控制服务
const StepController = (function() {
  let currentStep = -1;
  let totalSteps = 0;
  let stepHandlers = [];
  let autoPlayInterval = null;
  let isAnimating = false;
  let elementCache = new Map();
  let board = null;
  
  // 动画配置
  const animationConfig = {
    duration: ${animationDuration},
    easing: '${animationEasing}',
    fps: 60
  };
  
  // 缓动函数
  const easingFunctions = {
    'linear': (t) => t,
    'ease-in': (t) => t * t,
    'ease-out': (t) => t * (2 - t),
    'ease-in-out': (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
  };
  
  // 动画引擎
  function animate(element, properties, options = {}) {
    if (!element || isAnimating) return Promise.resolve();
    
    return new Promise((resolve) => {
      const startTime = Date.now();
      const duration = options.duration || animationConfig.duration;
      const easing = easingFunctions[options.easing || animationConfig.easing];
      const startValues = {};
      const endValues = {};
      
      // 获取起始值和目标值
      for (let prop in properties) {
        if (element.getAttribute) {
          startValues[prop] = element.getAttribute(prop);
        } else if (element[prop] !== undefined) {
          startValues[prop] = element[prop];
        }
        endValues[prop] = properties[prop];
      }
      
      // 动画循环
      function animationFrame() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easing(progress);
        
        // 更新属性
        for (let prop in properties) {
          const start = startValues[prop];
          const end = endValues[prop];
          
          if (typeof start === 'number' && typeof end === 'number') {
            const value = start + (end - start) * easedProgress;
            
            if (element.setAttribute) {
              element.setAttribute(prop, value);
            } else {
              element[prop] = value;
            }
          } else if (Array.isArray(start) && Array.isArray(end)) {
            const value = start.map((v, i) => v + (end[i] - v) * easedProgress);
            
            if (prop === 'coords') {
              element.setPosition(JXG.COORDS_BY_USER, value);
            } else if (element.setAttribute) {
              element.setAttribute(prop, value);
            }
          }
        }
        
        if (board) board.update();
        
        if (progress < 1) {
          requestAnimationFrame(animationFrame);
        } else {
          resolve();
        }
      }
      
      requestAnimationFrame(animationFrame);
    });
  }
  
  // 淡入效果
  function fadeIn(elements, duration = 300) {
    elements.forEach(el => {
      if (el && el.setAttribute) {
        // 直接设置为可见
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
  
  // 淡出效果
  function fadeOut(elements, duration = 200) {
    elements.forEach(el => {
      if (el && el.setAttribute) {
        // 直接隐藏
        el.setAttribute({ visible: false });
      }
    });
    
    if (board) board.update();
    return Promise.resolve();
  }
  
  // 平移动画
  function moveTo(element, newCoords, duration = 800) {
    if (!element || !element.coords) return Promise.resolve();
    
    const currentCoords = [element.coords.usrCoords[1], element.coords.usrCoords[2]];
    
    return animate(element, { coords: newCoords }, { duration });
  }
  
  // 缩放动画
  function scaleTo(element, newSize, duration = 500) {
    if (!element) return Promise.resolve();
    
    return animate(element, { size: newSize }, { duration });
  }
  
  // 颜色过渡
  function colorTransition(element, newColor, duration = 500) {
    if (!element) return Promise.resolve();
    
    // 简化的颜色过渡（实际应该插值RGB值）
    return new Promise((resolve) => {
      setTimeout(() => {
        element.setAttribute({ strokeColor: newColor, fillColor: newColor });
        if (board) board.update();
        resolve();
      }, duration / 2);
    });
  }
  
  // 注册步骤
  function registerStep(stepFunction) {
    stepHandlers.push(stepFunction);
    totalSteps = stepHandlers.length;
  }
  
  // 显示指定步骤
  async function showStep(stepIndex) {
    if (stepIndex < 0 || stepIndex >= totalSteps || isAnimating) return;
    
    isAnimating = true;
    
    // 更新UI
    updateStepInfo(stepIndex);
    
    // 获取当前所有元素
    const currentElements = Array.from(elementCache.values());
    
    // 清除时前元素
    if (currentStep >= 0 && currentElements.length > 0) {
      currentElements.forEach(el => {
        if (el && el.setAttribute) {
          el.setAttribute({ visible: false });
        }
        if (el && board && board.removeObject) {
          try {
            board.removeObject(el);
          } catch (e) {
            // 忽略删除错误
          }
        }
      });
      elementCache.clear();
    }
    
    // 执行新步骤
    if (stepHandlers[stepIndex]) {
      try {
        const newElements = await stepHandlers[stepIndex](board);
        
        // 缓存新元素
        if (Array.isArray(newElements)) {
          newElements.forEach((el, i) => {
            if (el) {
              elementCache.set(\`step\${stepIndex}_\${i}\`, el);
              // 确保元素可见
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
        console.error('步骤执行错误:', error);
      }
    }
    
    if (board) board.update();
    currentStep = stepIndex;
    updateControlButtons();
    
    // 延迟重置动画状态
    setTimeout(() => {
      isAnimating = false;
      updateControlButtons();
    }, 100);
  }
  
  // 更新步骤信息
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
      stepCounter.textContent = \`步骤: \${stepIndex + 1} / \${totalSteps}\`;
    }
  }
  
  // 更新控制按钮状态
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
  
  // 控制函数
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
    
    // 直接跳转到第一步
    if (totalSteps > 0) {
      showStep(0);
    } else {
      // 如果没有步骤，清空所有
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
      playBtn.textContent = '⏸️ 暂停';
      playBtn.className = 'control-btn playing';
    }
    
    // 如果在最后一步，从第一步开始
    if (currentStep >= totalSteps - 1) {
      showStep(0);
    } 
    // 如果还没开始，从第一步开始
    else if (currentStep < 0) {
      showStep(0);
    }
    // 否则从当前步骤继续
    
    // 设置定时器自动播放
    autoPlayInterval = setInterval(() => {
      if (currentStep < totalSteps - 1 && !isAnimating) {
        nextStep();
      } else if (currentStep >= totalSteps - 1) {
        // 到达最后一步，停止自动播放
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
        playBtn.textContent = '▶️ 自动播放';
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
  
  // 初始化
  function init(jxgBoard) {
    board = jxgBoard;
    
    // 绑定全局函数
    window.nextStep = nextStep;
    window.previousStep = previousStep;
    window.resetSteps = resetSteps;
    window.toggleAutoPlay = toggleAutoPlay;
    
    // 立即显示第一步（不用延迟）
    if (totalSteps > 0) {
      // 直接显示第一步
      showStep(0);
    } else {
      updateControlButtons();
    }
    
    // 自动播放
    if (${autoPlay}) {
      setTimeout(() => startAutoPlay(), 2000);
    }
  }
  
  // 公共API
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
 * 生成步骤控制按钮的HTML代码
 */
export function generateStepControlsHTML(
  config: StepControllerConfig = {},
): string {
  if (!config.showControls) {
    return "";
  }

  return `
<div class="step-controls">
  <button class="control-btn" id="prevBtn" onclick="previousStep()" disabled>⬅️ 上一步</button>
  <button class="control-btn reset" id="resetBtn" onclick="resetSteps()">🔄 重置</button>
  <button class="control-btn" id="nextBtn" onclick="nextStep()">下一步 ➡️</button>
  <button class="control-btn" id="playBtn" onclick="toggleAutoPlay()">▶️ 自动播放</button>
</div>`;
}

/**
 * 生成步骤信息显示区的HTML代码
 */
export function generateStepInfoHTML(): string {
  return `
<div id="step-info">
  <div id="step-title">准备开始</div>
  <div id="step-description">点击"下一步"开始</div>
  <div id="step-counter">步骤: 0 / 0</div>
</div>`;
}
