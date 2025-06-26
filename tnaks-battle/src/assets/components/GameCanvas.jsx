import React, { useEffect, useRef, useState } from "react";

import tankImgSrc from "../images/KV-2_preview.png";

const CanvasGame = () => {
    const canvasRef = useRef(null);
    const [gameState, setGameState] = useState("playing");
    const [restartTrigger, setRestartTrigger] = useState(0);

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
            controls: {
                up: "ArrowUp",
                down: "ArrowDown",
                left: "ArrowLeft",
                right: "ArrowRight",
                shoot: "Enter"
            }
        };

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

                if (
                    bullet.x < 0 || bullet.x > canvas.width ||
                    bullet.y < 0 || bullet.y > canvas.height
                ) {
                    bullets.splice(i, 1);
                }
            }

            if (player1.score >= 3) {
                gameOver = true;
                winner = "Player 1";
                setGameState("gameover");
            } else if (player2.score >= 10) {
                gameOver = true;
                winner = "Player 2";
                setGameState("gameover");
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

            ctx.fillStyle = "black";
            ctx.font = "16px Arial";
            ctx.fillText(`Player 1: ${player1.score}`, 10, 20);
            ctx.fillText(`Player 2: ${player2.score}`, 10, 40);

            if (gameOver) drawWinner();
        };


        const tankImg = new Image();
        tankImg.src = tankImgSrc;

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
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, [restartTrigger]);

    return (
        <div style={{ textAlign: "center" }}>
            <canvas ref={canvasRef} style={{ border: "1px solid black" }} />
            {gameState === "gameover" && (
                <button className="res-btn"
                    onClick={() => {
                        setRestartTrigger(prev => prev + 1);
                        setGameState("playing");
                    }}
                    style={{
                        marginTop: "10px",
                        padding: "8px 16px",
                        fontSize: "16px",
                        cursor: "pointer"
                    }}
                >
                    restart
                </button>
            )}
        </div>
    );
};

export default CanvasGame;
