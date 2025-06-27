import React, { useEffect, useRef, useState } from "react";

import tankImgSrc from "../images/KV-2_preview.png";

const CanvasGame = () => {
    const canvasRef = useRef(null);
    const [gameState, setGameState] = useState("playing");
    const [restartTrigger, setRestartTrigger] = useState(0);
    const [round, setRound] = useState(1);
    const player1Ref = useRef();
    const player2Ref = useRef();

    useEffect(() => {

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        canvas.width = 512;
        canvas.height = 512;

        const player1 = {
            x: 50,
            y: 50,
            size: 32,
            speed: 2,
            direction: "up",
            score: 0,
            ammo: 5,
            maxAmmo: 5,
            controls: {
                up: "w",
                down: "s",
                left: "a",
                right: "d",
                shoot: " "
            }
        };

        const player2 = {
            x: 400,
            y: 400,
            size: 32,
            speed: 2,
            direction: "up",
            score: 0,
            ammo: 5,
            maxAmmo: 5,
            controls: {
                up: "ArrowUp",
                down: "ArrowDown",
                left: "ArrowLeft",
                right: "ArrowRight",
                shoot: "Enter"
            }
        };

        player1Ref.current = player1;
        player2Ref.current = player2;

        const walls = [
            { x: 350, y: 70, width: 100, height: 20 },
            { x: 140, y: 100, width: 20, height: 120 },
            { x: 330, y: 300, width: 20, height: 120 },
            { x: 80, y: 420, width: 100, height: 20 },
            { x: 215, y: 215, width: 70, height: 70 }
        ];

        const players = [player1, player2];
        const keys = {};
        const bullets = [];
        const bulletSpeed = 5;
        const bulletSize = 5;

        let gameOver = false;
        let winner = "";

        const isCollidingWithWall = (x, y, size) => {
            return walls.some(wall =>
                x < wall.x + wall.width &&
                x + size > wall.x &&
                y < wall.y + wall.height &&
                y + size > wall.y
            );
        };

        const handleKeyDown = (e) => {
            keys[e.key] = true;

            for (const player of players) {
                const { controls } = player;

            if (e.key === controls.up) player.direction = "up";
            if (e.key === controls.down) player.direction = "down";
            if (e.key === controls.left) player.direction = "left";
            if (e.key === controls.right) player.direction = "right";

        if (e.key === controls.shoot && !gameOver) {
            if (player.ammo <= 0) return;
                player.ammo--;

            let dx = 0;
            let dy = 0;
            if (player.direction === "up") dy = -bulletSpeed;
            if (player.direction === "down") dy = bulletSpeed;
            if (player.direction === "left") dx = -bulletSpeed;
            if (player.direction === "right") dx = bulletSpeed;

            bullets.push({
                x: player.x + player.size / 2 - bulletSize / 2,
                y: player.y + player.size / 2 - bulletSize / 2,
                size: bulletSize,
                color: "black",
                dx,
                dy,
                owner: player
            });
        }
    }
};

        const handleKeyUp = (e) => {
            keys[e.key] = false;
        };

        const drawWinner = () => {
            ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            ctx.fillRect(0, canvas.height / 2 - 50, canvas.width, 100);
            ctx.fillStyle = "white";
            ctx.font = "30px Arial";
            ctx.textAlign = "center";
            ctx.fillText(`${winner} WINS!`, canvas.width / 2, canvas.height / 2 + 10);
        };

        const update = () => {
            if (gameOver) return;

            for (const player of players) {
                const { controls } = player;

               let newX = player.x;
                if (keys[controls.left]) newX -= player.speed;
                if (keys[controls.right]) newX += player.speed;

                if (
                    newX >= 0 &&
                    newX + player.size <= canvas.width &&
                    !isCollidingWithWall(newX, player.y, player.size)
                ) {
                    player.x = newX;
                }

                let newY = player.y;
                if (keys[controls.up]) newY -= player.speed;
                if (keys[controls.down]) newY += player.speed;

                if (
                    newY >= 0 &&
                    newY + player.size <= canvas.height &&
                    !isCollidingWithWall(player.x, newY, player.size)
                ) {
                    player.y = newY;
                }
            }

            for (let i = bullets.length - 1; i >= 0; i--) {
                const bullet = bullets[i];
                bullet.x += bullet.dx;
                bullet.y += bullet.dy;

                let hit = false;

                for (const target of players) {
                    if (target === bullet.owner) continue;

                    if (
                        bullet.x < target.x + target.size &&
                        bullet.x + bullet.size > target.x &&
                        bullet.y < target.y + target.size &&
                        bullet.y + bullet.size > target.y
                    ) {
                        bullets.splice(i, 1);
                        bullet.owner.score += 1;

                        target.x = Math.random() * (canvas.width - target.size);
                        target.y = Math.random() * (canvas.height - target.size);
                        hit = true;
                        break;
                    }
                }

                if (hit) continue;

                let collidedWithWall = walls.some(wall =>
                    bullet.x < wall.x + wall.width &&
                    bullet.x + bullet.size > wall.x &&
                    bullet.y < wall.y + wall.height &&
                    bullet.y + bullet.size > wall.y
                );

                if (
                    bullet.x < 0 || bullet.x > canvas.width ||
                    bullet.y < 0 || bullet.y > canvas.height ||
                    collidedWithWall
                ) {
                    bullets.splice(i, 1); 
                }
            }

                if (player1.score >= 3) {
                    gameOver = true;
                    winner = "Player 1";
                    setRound(prev => prev + 1);
                    setGameState("gameover");
                    setRound(prev => prev + 1);

                    fetch("http://localhost:5000/api/score", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ player: "Player 1", score: 5 })
                    });
                } else if (player2.score >= 10) {
                    gameOver = true;
                    winner = "Player 2";
                    setRound(prev => prev + 1);
                    setGameState("gameover");
                    setRound(prev => prev + 1);

                    fetch("http://localhost:5000/api/score", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ player: "Player 1", score: 5 })
                    });
                }
        };

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (const player of players) {
                ctx.save();
                ctx.translate(player.x + player.size / 2, player.y + player.size / 2);

                switch (player.direction) {
                    case "up":
                        ctx.rotate(Math.PI);
                        break;
                        case "right":
                        ctx.rotate(-Math.PI / 2);
                        break;
                        case "down":
                        ctx.rotate(0);
                        break;
                        case "left":
                      ctx.rotate(Math.PI / 2);
                        break;
                }

                ctx.drawImage(tankImg, -player.size / 2, -player.size / 2, player.size, player.size);
                ctx.restore();
            }

            for (const bullet of bullets) {
                ctx.fillStyle = bullet.color;
                ctx.fillRect(bullet.x, bullet.y, bullet.size, bullet.size);
            }

            for (const wall of walls) {
                ctx.fillStyle = "gray";
                ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
            }

                

                

            if (gameOver) drawWinner();
        };


        const tankImg = new Image();
        tankImg.src = tankImgSrc;

        const reloadInterval = setInterval(() => {
            for (const player of players) {
                if (player.ammo < player.maxAmmo) {
                    player.ammo++;
                }
            }
        }, 2000);

        const loop = () => {
            update();
            draw();
            if (!gameOver) {
                requestAnimationFrame(loop);
            }
        };

        tankImg.onload = () => {
            window.addEventListener("keydown", handleKeyDown);
            window.addEventListener("keyup", handleKeyUp);
            loop();
        };

        return () => {
            clearInterval(reloadInterval);
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, [restartTrigger]);

    const p1 = player1Ref.current;
    const p2 = player2Ref.current;


    
    return (
        <div style={{ textAlign: "center" }}>
            <div style={{ marginBottom: "10px", fontSize: "18px", fontFamily: "monospace" }}>
                🧨 Player 1: {p1?.score ?? 0} | Ammo: {p1?.ammo ?? 0}/{p1?.maxAmmo ?? 5} <br />
                🧨 Player 2: {p2?.score ?? 0} | Ammo: {p2?.ammo ?? 0}/{p2?.maxAmmo ?? 5} <br />
                🧨 Раунд: {round}
            </div>

            <canvas ref={canvasRef} style={{ border: "1px solid black" }} />
            {gameState === "gameover" && (
                <button
                    onClick={() => {
                        setRestartTrigger(r => r + 1);
                        setGameState("playing");
                    }}
                    style={{
                        marginTop: "10px",
                        padding: "8px 16px",
                        fontSize: "16px",
                        cursor: "pointer"
                    }}
                >
                    Restart
                </button>
            )}
        </div>
    );
};

export default CanvasGame;