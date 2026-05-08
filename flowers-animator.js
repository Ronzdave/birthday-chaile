/**
 * Realistic Canvas-based Flower Bouquet Animator
 * Creates a stunning pink & magenta carnation and daisy bouquet
 * with wrapping paper and ribbon - inspired by luxury floral arrangements
 */

class RealisticFlower {
  constructor(x, y, flowerType = 'carnation', hue = 0, intensity = 1, scale = 1) {
    this.x = x;
    this.y = y;
    this.flowerType = flowerType; // carnation, daisy
    this.hue = hue;
    this.intensity = intensity; // for color saturation variation
    this.scale = scale; // responsive scaling factor
    this.bobPhase = 0;
    this.swayPhase = 0;
    this.petalPhase = 0;
    this.leafWave = 0;
    this.rotationZ = 0;
    this.individualOffset = Math.random() * Math.PI * 2; // unique animation offset
    
    // Color schemes for different flower types
    this.setupColors();
  }

  setupColors() {
    if (this.flowerType === 'carnation') {
      // Beautiful magenta and pink carnations
      const saturation = 88;
      const lightness = this.intensity > 0.5 ? 48 : 52; // darker for bold flowers
      this.primaryColor = `hsl(${this.hue}, ${saturation}%, ${lightness}%)`;
      this.darkColor = `hsl(${this.hue}, ${saturation}%, ${lightness - 18}%)`;
      this.lightColor = `hsl(${this.hue}, ${saturation - 10}%, ${lightness + 18}%)`;
      this.centerColor = `hsl(${this.hue}, 70%, 35%)`;
    } else if (this.flowerType === 'daisy') {
      // Light pink daisies
      this.primaryColor = `hsl(${this.hue}, 92%, 72%)`;
      this.darkColor = `hsl(${this.hue}, 85%, 62%)`;
      this.lightColor = `hsl(${this.hue}, 95%, 80%)`;
      this.centerColor = '#FFD700';
    } else if (this.flowerType === 'rose') {
      // Realistic blue roses with depth
      const saturation = 85;
      const lightness = this.intensity > 0.5 ? 45 : 50;
      this.primaryColor = `hsl(${this.hue}, ${saturation}%, ${lightness}%)`;
      this.darkColor = `hsl(${this.hue}, ${saturation}%, ${lightness - 20}%)`;
      this.lightColor = `hsl(${this.hue}, ${saturation - 15}%, ${lightness + 15}%)`;
      this.centerColor = `hsl(${this.hue}, 70%, 28%)`;
    }
  }

  update(time) {
    // Gentle bobbing motion with individual variation
    this.bobPhase = Math.sin(time * 0.0008 + this.individualOffset) * 0.5 + 0.5;
    
    // Swaying motion with variation
    this.swayPhase = Math.sin(time * 0.0005 + this.individualOffset) * 0.3;
    
    // Petal flutter animation
    this.petalPhase = time * 0.004;
    
    // Leaf wave
    this.leafWave = Math.sin(time * 0.001 + this.individualOffset) * 0.15;
    
    // Rotation with individual offset
    this.rotationZ = Math.sin(time * 0.0004 + this.individualOffset) * 0.08;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y + Math.sin(this.bobPhase) * 10);
    ctx.rotate(this.swayPhase + this.rotationZ);
    ctx.scale(this.scale, this.scale);
    
    // Draw flower based on type
    if (this.flowerType === 'carnation') {
      this.drawCarnation(ctx);
    } else if (this.flowerType === 'daisy') {
      this.drawDaisy(ctx);
    } else if (this.flowerType === 'rose') {
      this.drawRose(ctx);
    }
    
    ctx.restore();
  }

  drawCarnation(ctx) {
    // Optimized carnation - fewer petals but still beautiful
    ctx.save();
    
    // Simplified layers for better performance
    const layers = [
      { radius: 30, petals: 12, opacity: 0.7, petalSize: 13 },
      { radius: 19, petals: 14, opacity: 0.85, petalSize: 10 },
      { radius: 9, petals: 10, opacity: 1, petalSize: 7 },
    ];
    
    for (const layer of layers) {
      for (let i = 0; i < layer.petals; i++) {
        const angle = (i / layer.petals) * Math.PI * 2 + this.petalPhase * 0.2;
        const wobble = Math.sin(this.petalPhase + i * 0.3) * 1.5;
        const x = Math.cos(angle) * (layer.radius + wobble);
        const y = Math.sin(angle) * (layer.radius + wobble) * 0.7;
        
        ctx.globalAlpha = layer.opacity;
        ctx.fillStyle = i % 2 === 0 ? this.lightColor : this.primaryColor;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        
        // Simplified petal shape
        ctx.beginPath();
        ctx.ellipse(0, 0, layer.petalSize * 0.6, layer.petalSize, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      }
    }
    
    // Carnation center
    ctx.globalAlpha = 1;
    ctx.fillStyle = this.centerColor;
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }

  drawDaisy(ctx) {
    ctx.save();
    
    // Optimized daisy petals
    const petalCount = 10;
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2;
      const wobble = Math.sin(this.petalPhase + i * 0.25) * 1;
      const x = Math.cos(angle) * (20 + wobble);
      const y = Math.sin(angle) * (20 + wobble);
      
      ctx.fillStyle = this.primaryColor;
      ctx.globalAlpha = 0.85;
      
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      
      // Simple petal
      ctx.beginPath();
      ctx.ellipse(0, 0, 8, 13, 0, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    }
    
    // Daisy center
    ctx.globalAlpha = 1;
    ctx.fillStyle = this.centerColor;
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.fill();
    
    // Simple center texture
    ctx.fillStyle = '#FFC107';
    ctx.globalAlpha = 0.6;
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const dist = 4;
      const px = Math.cos(angle) * dist;
      const py = Math.sin(angle) * dist;
      ctx.beginPath();
      ctx.arc(px, py, 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }

  drawRose(ctx) {
    // Realistic rose with layered spiral petals
    ctx.save();
    
    const layers = [
      { spiral: 28, petals: 18, opacity: 0.6, petalSize: 11 },
      { spiral: 18, petals: 15, opacity: 0.8, petalSize: 9 },
      { spiral: 10, petals: 12, opacity: 0.95, petalSize: 6 },
    ];
    
    for (const layer of layers) {
      for (let i = 0; i < layer.petals; i++) {
        const spiralAngle = (i / layer.petals) * Math.PI * 2.5 + this.petalPhase * 0.15;
        const wobble = Math.sin(this.petalPhase + i * 0.35) * 1.2;
        const x = Math.cos(spiralAngle) * (layer.spiral + wobble);
        const y = Math.sin(spiralAngle) * (layer.spiral + wobble) * 0.65;
        
        ctx.globalAlpha = layer.opacity;
        ctx.fillStyle = i % 3 === 0 ? this.lightColor : (i % 2 === 0 ? this.primaryColor : this.darkColor);
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(spiralAngle + 0.3);
        
        // Realistic petal shape with curves
        ctx.beginPath();
        ctx.ellipse(0, 0, layer.petalSize * 0.5, layer.petalSize * 1.2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Petal vein for realism
        ctx.strokeStyle = this.darkColor;
        ctx.globalAlpha = layer.opacity * 0.4;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(-layer.petalSize * 0.3, -layer.petalSize * 0.5);
        ctx.quadraticCurveTo(0, 0, layer.petalSize * 0.3, layer.petalSize * 0.5);
        ctx.stroke();
        
        ctx.restore();
      }
    }
    
    // Rose center
    ctx.globalAlpha = 1;
    ctx.fillStyle = this.centerColor;
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Center detail
    ctx.fillStyle = this.darkColor;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }

}

// Manager for flower bouquet animations
class FlowerBouquetAnimator {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      console.error('Canvas not found:', canvasId);
      return;
    }
    
    this.ctx = this.canvas.getContext('2d');
    this.flowers = [];
    this.ribbonPhase = 0;
    this.startTime = Date.now();
    this.animationId = null;
    this.isAnimating = true;
    
    this.setupCanvas();
    this.createBouquet();
    this.animate();
  }

  createBouquet() {
    // Center flowers exactly in the middle of the canvas
    const bouquetCenterX = this.canvas.width / 2;
    const bouquetCenterY = this.canvas.height / 2;
    
    // Calculate responsive scale factor based on canvas width
    const scaleBase = Math.min(this.canvas.width / 700, 1);
    const flowerScale = Math.max(scaleBase, 0.7); // Don't go below 0.7 on very small screens
    
    // Diverse bouquet with many colors - flowers bloom upward and overflow
    const flowerSpecs = [
      // Hot Magenta carnations
      { type: 'carnation', hue: 330, count: 10, intensity: 0.85 },
      // Coral pink carnations
      { type: 'carnation', hue: 15, count: 8, intensity: 0.75 },
      // Deep pink carnations
      { type: 'carnation', hue: 340, count: 9, intensity: 0.65 },
      // Light pink carnations
      { type: 'carnation', hue: 350, count: 7, intensity: 0.45 },
      // Peach carnations
      { type: 'carnation', hue: 25, count: 7, intensity: 0.55 },
      // Blush carnations
      { type: 'carnation', hue: 0, count: 6, intensity: 0.35 },
      // Bright pink daisies
      { type: 'daisy', hue: 330, count: 6 },
      // Coral daisies
      { type: 'daisy', hue: 20, count: 6 },
      // Light pink daisies
      { type: 'daisy', hue: 0, count: 5 },
      // BLUE ROSES - Chaile's favorite!
      { type: 'rose', hue: 220, count: 9, intensity: 0.9 },
      // Sky blue roses
      { type: 'rose', hue: 210, count: 7, intensity: 0.75 },
      // Deep blue roses
      { type: 'rose', hue: 200, count: 7, intensity: 0.85 },
      // Light blue roses
      { type: 'rose', hue: 230, count: 7, intensity: 0.65 },
      // Purple roses
      { type: 'rose', hue: 270, count: 7, intensity: 0.8 },
      // Mauve roses
      { type: 'rose', hue: 260, count: 6, intensity: 0.7 },
    ];
    
    for (const spec of flowerSpecs) {
      for (let i = 0; i < spec.count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 100 + 5;
        // Allow flowers to bloom upward above the wrapper with greater range
        const heightVariation = (Math.random() - 0.25) * 110;
        
        const x = bouquetCenterX + Math.cos(angle) * distance;
        const y = bouquetCenterY + heightVariation + Math.sin(angle) * distance * 0.3;
        
        const flower = new RealisticFlower(x, y, spec.type, spec.hue, spec.intensity, flowerScale);
        this.flowers.push(flower);
      }
    }
  }

  setupCanvas() {
    // Use constrained width from parent container, not full window width
    const parent = this.canvas.parentElement;
    this.canvas.width = parent ? parent.clientWidth : 700;
    this.canvas.height = 500;
    
    window.addEventListener('resize', () => this.handleResize());
  }

  handleResize() {
    // Get parent container dimensions for proper responsive sizing
    const parent = this.canvas.parentElement;
    const newWidth = parent ? parent.clientWidth : 700;
    
    // Only resize if width actually changed
    if (newWidth !== this.canvas.width) {
      this.canvas.width = newWidth;
      this.canvas.height = 500;
      // Redistribute bouquet for new screen size
      this.flowers = [];
      this.createBouquet();
    }
  }

  drawBouquetWrapping(ctx) {
    // Draw pink wrapping paper - realistic wrapped bouquet style, fully wrapped
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    
    ctx.save();
    
    // Outer pink wrapping - larger curved shape extending to bottom
    ctx.beginPath();
    ctx.moveTo(centerX - 95, centerY + 20);
    ctx.quadraticCurveTo(centerX - 140, centerY + 45, centerX - 130, centerY + 145);
    ctx.quadraticCurveTo(centerX - 90, centerY + 175, centerX - 70, centerY + 240);
    ctx.lineTo(centerX + 70, centerY + 240);
    ctx.quadraticCurveTo(centerX + 90, centerY + 175, centerX + 130, centerY + 145);
    ctx.quadraticCurveTo(centerX + 140, centerY + 45, centerX + 95, centerY + 20);
    ctx.closePath();
    
    // Gradient for outer wrap - light pink
    const outerGradient = ctx.createLinearGradient(centerX - 140, centerY + 80, centerX + 140, centerY + 80);
    outerGradient.addColorStop(0, 'rgba(255, 192, 203, 0.8)');
    outerGradient.addColorStop(0.5, 'rgba(255, 182, 193, 0.9)');
    outerGradient.addColorStop(1, 'rgba(255, 192, 203, 0.8)');
    
    ctx.fillStyle = outerGradient;
    ctx.fill();
    
    // Inner wrapper bowl - darker pink for depth
    ctx.beginPath();
    ctx.moveTo(centerX - 90, centerY + 25);
    ctx.quadraticCurveTo(centerX - 120, centerY + 50, centerX - 100, centerY + 135);
    ctx.quadraticCurveTo(centerX - 70, centerY + 165, centerX - 60, centerY + 230);
    ctx.lineTo(centerX + 60, centerY + 230);
    ctx.quadraticCurveTo(centerX + 70, centerY + 165, centerX + 100, centerY + 135);
    ctx.quadraticCurveTo(centerX + 120, centerY + 50, centerX + 90, centerY + 25);
    ctx.closePath();
    
    const innerGradient = ctx.createLinearGradient(centerX - 120, centerY + 70, centerX + 120, centerY + 70);
    innerGradient.addColorStop(0, 'rgba(255, 160, 190, 0.6)');
    innerGradient.addColorStop(0.5, 'rgba(255, 140, 170, 0.7)');
    innerGradient.addColorStop(1, 'rgba(255, 160, 190, 0.6)');
    
    ctx.fillStyle = innerGradient;
    ctx.fill();
    
    // Wrapper highlight on left
    ctx.strokeStyle = 'rgba(255, 220, 230, 0.5)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX - 85, centerY + 35);
    ctx.quadraticCurveTo(centerX - 110, centerY + 85, centerX - 95, centerY + 130);
    ctx.quadraticCurveTo(centerX - 70, centerY + 160, centerX - 65, centerY + 225);
    ctx.stroke();
    
    // Wrapper shadow on right
    ctx.strokeStyle = 'rgba(200, 100, 150, 0.2)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX + 85, centerY + 35);
    ctx.quadraticCurveTo(centerX + 110, centerY + 85, centerX + 95, centerY + 130);
    ctx.quadraticCurveTo(centerX + 70, centerY + 160, centerX + 65, centerY + 225);
    ctx.stroke();
    
    ctx.restore();
  }

  drawRibbon(ctx, time) {
    // Draw pink ribbon bow at the bottom of wrapper
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2 + 110;
    const bobAmount = Math.sin(time * 0.0015) * 2;
    
    ctx.save();
    
    ctx.fillStyle = '#FF1493';
    ctx.strokeStyle = '#E30B5C';
    ctx.lineWidth = 2;
    
    // Left ribbon loop
    ctx.save();
    ctx.translate(centerX - 40, centerY + bobAmount);
    ctx.rotate(-0.35 + Math.sin(time * 0.001) * 0.1);
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    
    // Right ribbon loop
    ctx.save();
    ctx.translate(centerX + 40, centerY + bobAmount);
    ctx.rotate(0.35 + Math.sin(time * 0.001 + Math.PI) * 0.1);
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    
    // Center knot
    ctx.fillStyle = '#FF1493';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + bobAmount, 16, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#E30B5C';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Ribbon tails
    ctx.strokeStyle = '#FF1493';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    
    // Left tail
    ctx.beginPath();
    ctx.moveTo(centerX - 25, centerY + 30 + bobAmount);
    ctx.quadraticCurveTo(centerX - 50, centerY + 50 + bobAmount, centerX - 45, centerY + 70 + bobAmount);
    ctx.stroke();
    
    // Right tail
    ctx.beginPath();
    ctx.moveTo(centerX + 25, centerY + 30 + bobAmount);
    ctx.quadraticCurveTo(centerX + 50, centerY + 50 + bobAmount, centerX + 45, centerY + 70 + bobAmount);
    ctx.stroke();
    
    ctx.restore();
  }

  drawHandle(ctx, time) {
    // Draw bouquet handle/stem - subtle
    const centerX = this.canvas.width / 2;
    const wrapBottomY = this.canvas.height / 2 + 115;
    const handleBottomY = this.canvas.height - 30;
    
    ctx.save();
    
    // Thin brown stem wrapped
    const stemGradient = ctx.createLinearGradient(centerX - 4, wrapBottomY, centerX + 4, wrapBottomY);
    stemGradient.addColorStop(0, '#A0826D');
    stemGradient.addColorStop(0.5, '#B89968');
    stemGradient.addColorStop(1, '#A0826D');
    
    ctx.fillStyle = stemGradient;
    ctx.beginPath();
    ctx.moveTo(centerX - 4, wrapBottomY);
    ctx.lineTo(centerX + 4, wrapBottomY);
    ctx.lineTo(centerX + 2, handleBottomY);
    ctx.lineTo(centerX - 2, handleBottomY);
    ctx.closePath();
    ctx.fill();
    
    // Stem highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX + 4, wrapBottomY);
    ctx.lineTo(centerX + 2, handleBottomY);
    ctx.stroke();
    
    ctx.restore();
  }

  animate = () => {
    const elapsed = Date.now() - this.startTime;
    
    // Clear canvas efficiently
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw bouquet wrapping
    this.drawBouquetWrapping(this.ctx);
    
    // Update and draw all flowers
    for (const flower of this.flowers) {
      flower.update(elapsed);
      flower.draw(this.ctx);
    }
    
    // Draw ribbon bow
    this.drawRibbon(this.ctx, elapsed);
    
    this.animationId = requestAnimationFrame(this.animate);
  };

  stop() {
    this.isAnimating = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}
