/**
 * JSXGraph 动画引擎
 * 为步骤切换提供丰富的动画效果
 */

export interface AnimationConfig {
  type: "move" | "rotate" | "scale" | "fade" | "morph" | "draw";
  duration?: number;
  easing?: "linear" | "ease-in" | "ease-out" | "ease-in-out" | "bounce";
  delay?: number;
}

export interface ElementAnimation {
  element: any;
  from?: any;
  to?: any;
  animation?: AnimationConfig;
}

/**
 * 生成动画引擎代码
 */
export function generateAnimationEngineCode(): string {
  return `
// JSXGraph 动画引擎
const AnimationEngine = (function() {
  
  // 缓动函数
  const easingFunctions = {
    'linear': (t) => t,
    'ease-in': (t) => t * t,
    'ease-out': (t) => t * (2 - t),
    'ease-in-out': (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    'bounce': (t) => {
      const n1 = 7.5625;
      const d1 = 2.75;
      if (t < 1 / d1) {
        return n1 * t * t;
      } else if (t < 2 / d1) {
        return n1 * (t -= 1.5 / d1) * t + 0.75;
      } else if (t < 2.5 / d1) {
        return n1 * (t -= 2.25 / d1) * t + 0.9375;
      } else {
        return n1 * (t -= 2.625 / d1) * t + 0.984375;
      }
    }
  };
  
  // 点的平移动画
  function animatePointMove(point, targetX, targetY, duration = 1000, easing = 'ease-in-out') {
    if (!point || !point.coords) return Promise.resolve();
    
    const startX = point.X();
    const startY = point.Y();
    const startTime = Date.now();
    const easingFunc = easingFunctions[easing] || easingFunctions['ease-in-out'];
    
    return new Promise((resolve) => {
      function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easingFunc(progress);
        
        const newX = startX + (targetX - startX) * easedProgress;
        const newY = startY + (targetY - startY) * easedProgress;
        
        point.setPosition(JXG.COORDS_BY_USER, [newX, newY]);
        point.board.update();
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      }
      
      requestAnimationFrame(animate);
    });
  }
  
  // 线的平移动画
  function animateLineMove(line, deltaX, deltaY, duration = 1000) {
    if (!line) return Promise.resolve();
    
    const points = [];
    if (line.point1) points.push(line.point1);
    if (line.point2) points.push(line.point2);
    
    const promises = points.map(point => {
      const targetX = point.X() + deltaX;
      const targetY = point.Y() + deltaY;
      return animatePointMove(point, targetX, targetY, duration);
    });
    
    return Promise.all(promises);
  }
  
  // 曲线的绘制动画（逐步显示）
  function animateCurveDraw(curve, duration = 1500, easing = 'ease-out') {
    if (!curve) return Promise.resolve();
    
    const startTime = Date.now();
    const easingFunc = easingFunctions[easing] || easingFunctions['ease-out'];
    
    // 保存原始的定义域
    const originalDomain = curve.visProp.domain || [-10, 10];
    const [domainStart, domainEnd] = originalDomain;
    
    return new Promise((resolve) => {
      function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easingFunc(progress);
        
        // 逐步扩展定义域
        const currentEnd = domainStart + (domainEnd - domainStart) * easedProgress;
        
        // 更新曲线的显示范围
        if (curve.updateCurve) {
          curve.updateCurve();
        }
        
        // 通过改变透明度模拟绘制效果
        curve.setAttribute({ strokeOpacity: easedProgress });
        
        if (curve.board) curve.board.update();
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      }
      
      // 初始化为透明
      curve.setAttribute({ strokeOpacity: 0 });
      requestAnimationFrame(animate);
    });
  }
  
  // 旋转动画
  function animateRotation(element, angle, centerX, centerY, duration = 1000) {
    if (!element) return Promise.resolve();
    
    const startTime = Date.now();
    const startAngle = 0;
    const deltaAngle = angle - startAngle;
    
    return new Promise((resolve) => {
      function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easingFunctions['ease-in-out'](progress);
        
        const currentAngle = startAngle + deltaAngle * easedProgress;
        const rad = currentAngle * Math.PI / 180;
        
        // 应用旋转变换
        const transform = element.board.create('transform', [
          currentAngle * Math.PI / 180,
          centerX, centerY
        ], { type: 'rotate' });
        
        if (element.applyTransform) {
          element.applyTransform(transform);
        }
        
        element.board.update();
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      }
      
      requestAnimationFrame(animate);
    });
  }
  
  // 缩放动画
  function animateScale(element, scale, duration = 800) {
    if (!element) return Promise.resolve();
    
    const startTime = Date.now();
    const startScale = 1;
    const deltaScale = scale - startScale;
    
    return new Promise((resolve) => {
      function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easingFunctions['ease-in-out'](progress);
        
        const currentScale = startScale + deltaScale * easedProgress;
        
        // 对于点，改变大小
        if (element.type === JXG.OBJECT_TYPE_POINT) {
          element.setAttribute({ size: element.visProp.size * currentScale });
        }
        // 对于线，改变宽度
        else if (element.type === JXG.OBJECT_TYPE_LINE) {
          element.setAttribute({ strokeWidth: element.visProp.strokeWidth * currentScale });
        }
        
        if (element.board) element.board.update();
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      }
      
      requestAnimationFrame(animate);
    });
  }
  
  // 渐变动画（淡入淡出）
  function animateFade(element, targetOpacity, duration = 500) {
    if (!element) return Promise.resolve();
    
    const startTime = Date.now();
    const startOpacity = element.visProp.strokeOpacity || element.visProp.fillOpacity || 1;
    const deltaOpacity = targetOpacity - startOpacity;
    
    return new Promise((resolve) => {
      function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easingFunctions['ease-in-out'](progress);
        
        const currentOpacity = startOpacity + deltaOpacity * easedProgress;
        
        element.setAttribute({
          strokeOpacity: currentOpacity,
          fillOpacity: currentOpacity,
          opacity: currentOpacity
        });
        
        if (element.board) element.board.update();
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          if (targetOpacity === 0) {
            element.setAttribute({ visible: false });
          }
          resolve();
        }
      }
      
      requestAnimationFrame(animate);
    });
  }
  
  // 形态变换动画（例如：从圆变成椭圆）
  function animateMorph(element, targetProperties, duration = 1000) {
    if (!element) return Promise.resolve();
    
    const startTime = Date.now();
    const startProps = {};
    const deltaProps = {};
    
    // 获取起始属性
    for (let prop in targetProperties) {
      if (element.visProp[prop] !== undefined) {
        startProps[prop] = element.visProp[prop];
        deltaProps[prop] = targetProperties[prop] - startProps[prop];
      }
    }
    
    return new Promise((resolve) => {
      function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easingFunctions['ease-in-out'](progress);
        
        const currentProps = {};
        for (let prop in startProps) {
          currentProps[prop] = startProps[prop] + deltaProps[prop] * easedProgress;
        }
        
        element.setAttribute(currentProps);
        if (element.board) element.board.update();
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      }
      
      requestAnimationFrame(animate);
    });
  }
  
  // 路径动画（沿着路径移动）
  function animateAlongPath(element, pathFunction, duration = 2000) {
    if (!element || !pathFunction) return Promise.resolve();
    
    const startTime = Date.now();
    
    return new Promise((resolve) => {
      function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easingFunctions['ease-in-out'](progress);
        
        // 获取路径上的点
        const point = pathFunction(easedProgress);
        if (point && point.x !== undefined && point.y !== undefined) {
          element.setPosition(JXG.COORDS_BY_USER, [point.x, point.y]);
        }
        
        if (element.board) element.board.update();
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      }
      
      requestAnimationFrame(animate);
    });
  }
  
  // 组合动画（同时执行多个动画）
  function animateGroup(animations) {
    const promises = animations.map(anim => {
      switch(anim.type) {
        case 'move':
          return animatePointMove(anim.element, anim.to.x, anim.to.y, anim.duration, anim.easing);
        case 'rotate':
          return animateRotation(anim.element, anim.to.angle, anim.center.x, anim.center.y, anim.duration);
        case 'scale':
          return animateScale(anim.element, anim.to.scale, anim.duration);
        case 'fade':
          return animateFade(anim.element, anim.to.opacity, anim.duration);
        case 'morph':
          return animateMorph(anim.element, anim.to.properties, anim.duration);
        case 'draw':
          return animateCurveDraw(anim.element, anim.duration, anim.easing);
        default:
          return Promise.resolve();
      }
    });
    
    return Promise.all(promises);
  }
  
  // 序列动画（按顺序执行）
  async function animateSequence(animations) {
    for (let anim of animations) {
      await animateGroup([anim]);
    }
  }
  
  // 公共API
  return {
    animatePointMove,
    animateLineMove,
    animateCurveDraw,
    animateRotation,
    animateScale,
    animateFade,
    animateMorph,
    animateAlongPath,
    animateGroup,
    animateSequence,
    easingFunctions
  };
})();
`;
}
