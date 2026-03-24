class Player {
    constructor(x, y, icon = "👻", speed = 8) {
        this.x = x;
        this.y = y;
        this.size = 50; 
        this.speed = speed;
        this.icon = icon;
        this.health = 100;
        
        // Scale dash speed based on character's base speed
        this.dashSpeed = this.speed * 3;
        this.isDashing = false;
        this.dashDuration = 0;
        this.dashCooldown = 0;
        
        this.invincible = false;
        this.invincibleTimer = 0;
        
        // --- DASH PARTICLES ---
        this.dashParticles = [];
    }

    update() {
        if (this.invincibleTimer > 0) {
            this.invincibleTimer--;
            if (this.invincibleTimer <= 0) this.invincible = false;
        }
        
        // Update dash particles (fade out and shrink over time)
        this.dashParticles.forEach(p => {
            p.alpha -= 0.05;
            p.size -= 0.2;
        });
        this.dashParticles = this.dashParticles.filter(p => p.alpha > 0 && p.size > 0);
    }

    move(keys, width, height) {
        if (this.dashCooldown > 0) {
            this.dashCooldown--;
        }

        if ((keys['ShiftLeft'] || keys['ShiftRight']) && this.dashCooldown <= 0 && !this.isDashing) {
            this.isDashing = true;
            this.dashDuration = 10;
            this.dashCooldown = 60;
        }

        let currentSpeed = this.speed;
        
        if (this.isDashing) {
            currentSpeed = this.dashSpeed;
            this.dashDuration--;
            
            // Spawn neon blue trail particles while dashing
            this.dashParticles.push({
                x: this.x + this.size / 2 + (Math.random() - 0.5) * 20,
                y: this.y + this.size / 2 + (Math.random() - 0.5) * 20,
                alpha: 1,
                size: Math.random() * 8 + 4
            });
            
            if (this.dashDuration <= 0) {
                this.isDashing = false;
            }
        }

        if ((keys['ArrowUp'] || keys['KeyW'] || keys['KeyZ']) && this.y > 0) this.y -= currentSpeed;
        if ((keys['ArrowDown'] || keys['KeyS']) && this.y < height - this.size) this.y += currentSpeed;
        if ((keys['ArrowLeft'] || keys['KeyA'] || keys['KeyQ']) && this.x > 0) this.x -= currentSpeed;
        if ((keys['ArrowRight'] || keys['KeyD']) && this.x < width - this.size) this.x += currentSpeed;
    }

    heal(amount) {
        this.health = Math.min(100, this.health + amount);
    }

    makeInvincible(durationFrames) {
        this.invincible = true;
        this.invincibleTimer = durationFrames;
    }

    takeDamage(amount) {
        if (!this.invincible) {
            this.health -= amount;
        }
    }

    isDead() {
        return this.health <= 0;
    }

    draw(ctx) {
        ctx.save();
        
        // --- DRAW DASH PARTICLES (BLUE TRAIL) ---
        ctx.fillStyle = "#00ccff"; // Neon blue
        ctx.shadowBlur = 0; // Pas de shadowBlur sur les petites particules de dash
        ctx.shadowColor = "#00ccff";
        this.dashParticles.forEach(p => {
            ctx.globalAlpha = p.alpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.globalAlpha = 1;
        ctx.font = `bold ${this.size}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.strokeStyle = "black";
        ctx.lineWidth = 4;
        ctx.strokeText(this.icon, this.x + this.size / 2, this.y + this.size / 2);

        if (this.invincible) {
            ctx.shadowBlur = 10; // Valeur limitée à 10 max
            ctx.shadowColor = "#ffff00";
            ctx.fillStyle = "rgba(255, 255, 0, 0.4)";
            ctx.beginPath();
            ctx.arc(this.x + this.size / 2, this.y + this.size / 2, this.size / 1.3, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.shadowBlur = 10; // Valeur limitée à 10 max
            ctx.shadowColor = "white";
        }
        
        ctx.fillText(this.icon, this.x + this.size / 2, this.y + this.size / 2);
        ctx.restore();
    }
}