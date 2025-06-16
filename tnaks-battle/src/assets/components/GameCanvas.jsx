import React, {useEffect, useRef} from "react";

const CanvasGame = () => {
    const canvasRef = useRef(null);
    const enemies = [];
    
    useEffect(()=>{
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        
        // size
        canvas.width = 512;
        canvas.height = 512;
        
        const player = {
            x: 50,
            y: 50,
            size: 32,
            color: "green",
            speed: 2,
            direction: "up"
        };
        
        const keys = {};
        const bullets = [];
        const bulletSpeed = 5;
        const bulletSize = 5;
        
        const handelKeyDown = (e) => {
            keys[e.key] = true;

            if(e.key === "w") player.direction = "up";
            if(e.key === "s") player.direction = "down";
            if(e.key === "a") player.direction = "left";
            if(e.key === "d") player.direction = "right";

            if (e.key === " ") {
                let dx = 0;
                let dy = 0;
                if(player.direction === "up") dy = -bulletSpeed;
                if(player.direction === "down") dy = bulletSpeed;
                if(player.direction === "left") dx = -bulletSpeed;
                if(player.direction === "right") dx = bulletSpeed;

                bullets.push({
                    x: player.x + player.size / 2 - bulletSize / 2,
                    y: player.y + player.size / 2 -bulletSize / 2,
                    size: bulletSize,
                    color: "red",
                    dx,
                    dy
                });
            };

        };
        const handeleKeyUp = (e) => (keys[e.key] = false);
        
        window.addEventListener("keydown", handelKeyDown);
        window.addEventListener("keyup", handeleKeyUp);
        
        const update = () => {
            if (keys["w"] && player.y > 0) player.y -= player.speed;
            if (keys["s"] && player.y + player.size < canvas.height) player.y += player.speed;
            if (keys["a"] && player.x > 0) player.x -= player.speed;
            if (keys["d"] && player.x + player.size < canvas.width) player.x += player.speed;

            for (let i = bullets.length -1; i >= 0; i--) {
                bullets[i].y += bullets[i].dy;
                bullets[i].x += bullets[i].dx;
                
                if (
                    bullets[i].x < 0 || bullets[i].x > canvas.width || 
                    bullets[i].y < 0 || bullets[i].y > canvas.height
                ) {
                    bullets.splice(i, 1);
                };
            };
        };
        
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // plaers
            ctx.fillStyle = player.color;
            ctx.fillRect(player.x, player.y, player.size, player.size);
            // bullets
            for (const bullet of bullets) {
                ctx.fillStyle = bullet.color;
                ctx.fillRect(bullet.x, bullet.y, bullet.size, bullet.size); 
            }
        };

        setInterval(() => {
            enemies.push({
                x: Math.random() * (canvas.width - 30),
                y: -30,
                size: 30,
                color: "purple",
                speed: 1 + Math.random() * 1.5
            });
        }, 2000);
        
        const loop = () => {
            update();
            draw();
            requestAnimationFrame(loop);
        };
        
        loop();
        
        return () => {
            window.removeEventListener("keydown", handelKeyDown);
            window.removeEventListener("keyup", handeleKeyUp);
        };
    }, []);
    return <canvas ref={canvasRef} style={{border: "1px solid black"}} />

}

export default CanvasGame;