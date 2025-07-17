// 可自定义的Canvas雪点效果
(function() {
    // ===== 可自定义参数 =====
    const CONFIG = {
        // 雪点数量 (匹配图片中的密度)
        particleCount: 120,
        
        // 雪点大小范围 (匹配图片中的尺寸)
        minSize: 0.8,
        maxSize: 3.5,
        
        // 雪点速度范围
        minSpeed: 0.2,
        maxSpeed: 1.2,
        
        // 雪点颜色 (暗淡的白色调)
        colors: ['#E8E8E8', '#F0F0F0', '#E5E5E5', '#EBEBEB'],
        
        // 风力效果 (水平漂移)
        windStrength: 0.15,
        
        // 是否在移动设备上显示
        showOnMobile: false,
        
        // 透明度范围 (降低透明度使其更暗淡)
        minOpacity: 0.4,
        maxOpacity: 0.8,
        
        // FPS控制 (降低可提升性能)
        targetFPS: 60,
        
        // 雪点形状 (早期动画风格)
        particleShape: 'anime_style',
        
        // 只在首页显示
        onlyHomePage: true
    };
    
    // 检查设备类型
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile && !CONFIG.showOnMobile) {
        return;
    }
    
    // 检查是否只在首页显示
    function isHomePage() {
        // 检查URL路径，只有真正的首页才返回true
        const path = window.location.pathname;
        return path === '/' || path === '/index.html';
    }
    
    if (CONFIG.onlyHomePage && !isHomePage()) {
        console.log('❄️ 雪点效果仅在首页显示');
        return;
    }
    
    let canvas, ctx;
    let particles = [];
    let animationId;
    let lastTime = 0;
    const frameInterval = 1000 / CONFIG.targetFPS;
    
    // 雪点类
    class SnowParticle {
        constructor() {
            this.reset();
            this.y = Math.random() * canvas.height; // 初始随机分布
        }
        
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = -20;
            this.size = Math.random() * (CONFIG.maxSize - CONFIG.minSize) + CONFIG.minSize;
            this.speed = Math.random() * (CONFIG.maxSpeed - CONFIG.minSpeed) + CONFIG.minSpeed;
            this.opacity = Math.random() * (CONFIG.maxOpacity - CONFIG.minOpacity) + CONFIG.minOpacity;
            this.color = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
            this.wind = (Math.random() - 0.5) * CONFIG.windStrength;
        }
        
        update() {
            this.y += this.speed;
            this.x += this.wind;
            
            // 重置超出边界的雪点
            if (this.y > canvas.height) {
                this.reset();
            }
            if (this.x > canvas.width) {
                this.x = 0;
            } else if (this.x < 0) {
                this.x = canvas.width;
            }
        }
        
        draw() {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            
            // 根据大小决定雪花类型
            if (this.size <= 1.5) {
                // 小雪花：简单的点状
                this.drawSmallSnowflake();
            } else {
                // 大雪花：带模糊效果的圆形
                this.drawLargeSnowflake();
            }
            
            ctx.restore();
        }
        
        drawSmallSnowflake() {
            // 小雪花：清晰的小点
            ctx.fillStyle = this.color;
            ctx.translate(this.x, this.y);
            
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        drawLargeSnowflake() {
            // 大雪花：模糊边缘效果
            ctx.translate(this.x, this.y);
            
            // 创建径向渐变来模拟模糊效果 (使用更暗淡的颜色)
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size * 1.2);
            gradient.addColorStop(0, this.color);
            gradient.addColorStop(0.6, `rgba(232, 232, 232, ${this.opacity * 0.4})`);
            gradient.addColorStop(1, 'rgba(232, 232, 232, 0)');
            
            ctx.fillStyle = gradient;
            
            // 绘制主体
            ctx.beginPath();
            ctx.arc(0, 0, this.size * 1.2, 0, Math.PI * 2);
            ctx.fill();
            
            // 添加内部的明亮核心 (降低亮度)
            ctx.globalAlpha = this.opacity * 0.7;
            ctx.fillStyle = '#F0F0F0';
            ctx.beginPath();
            ctx.arc(0, 0, this.size * 0.6, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // 初始化Canvas
    function initCanvas() {
        canvas = document.getElementById('snow-canvas');
        if (!canvas) {
            console.warn('Snow canvas not found');
            return false;
        }
        
        ctx = canvas.getContext('2d');
        resizeCanvas();
        
        // 监听窗口大小变化
        window.addEventListener('resize', resizeCanvas);
        
        return true;
    }
    
    // 调整Canvas大小
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // 重新分布雪点
        particles.forEach(particle => {
            if (particle.x > canvas.width) {
                particle.x = Math.random() * canvas.width;
            }
        });
    }
    
    // 创建雪点
    function createParticles() {
        particles = [];
        for (let i = 0; i < CONFIG.particleCount; i++) {
            particles.push(new SnowParticle());
        }
    }
    
    // 动画循环
    function animate(currentTime) {
        if (currentTime - lastTime >= frameInterval) {
            // 清空画布
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // 更新和绘制所有雪点
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });
            
            lastTime = currentTime;
        }
        
        animationId = requestAnimationFrame(animate);
    }
    
    // 开始雪点动画
    function startSnowEffect() {
        if (!initCanvas()) return;
        
        createParticles();
        animate(0);
        
        console.log('❄️ 雪点效果已启动（仅首页）');
    }
    
    // 停止雪点动画
    function stopSnowEffect() {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        if (ctx && canvas) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        console.log('⭕ 雪点效果已停止');
    }
    
    // 页面加载完成后启动
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startSnowEffect);
    } else {
        startSnowEffect();
    }
    
    // 页面可见性变化时控制动画
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            stopSnowEffect();
        } else {
            startSnowEffect();
        }
    });
    
    // 暴露全局控制函数 (可在控制台调用)
    window.SnowControl = {
        start: startSnowEffect,
        stop: stopSnowEffect,
        updateConfig: function(newConfig) {
            Object.assign(CONFIG, newConfig);
            stopSnowEffect();
            startSnowEffect();
        },
        getConfig: function() {
            return { ...CONFIG };
        }
    };
    
})();
