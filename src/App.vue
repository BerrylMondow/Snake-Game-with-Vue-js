<template>
  <!-- Pesan untuk Mobile -->
  <div v-if="isMobile" class="mobile-warning">
    <p>Gunakan Laptop/PC untuk memainkan game ini</p>
  </div>

  <!-- Game hanya tampil di desktop -->
  <div v-else class="container">
    <h1 class="title">Ternak Ular the Game</h1>

    <!-- Tampilan sebelum game dimulai -->
    <div v-if="!gameStarted" class="game-box">
      <button class="start-button" @click="startGame">MULAI!</button>
    </div>

    <!-- Gameplay -->
    <div v-else class="gameplay">
      <div class="game-box">
        <!-- WIN Overlay -->
        <div v-if="isWin" class="win-overlay">
          <p>SELAMAT, MISI BERHASIL!</p>
          <button class="restart-button" @click="restartGame">Main Lagi</button>
        </div>

        <!-- Snake -->
        <div
          v-for="(part, index) in snake"
          :key="index"
          class="snake-part"
          :style="{ top: part.y + 'px', left: part.x + 'px' }"
        ></div>

        <!-- Foods -->
        <div class="food" :style="{ top: food.y + 'px', left: food.x + 'px' }" />
        <div v-if="specialFood" class="special-food" :style="{ top: specialFood.y + 'px', left: specialFood.x + 'px' }" />
        <div v-if="superFood" class="super-food" :style="{ top: superFood.y + 'px', left: superFood.x + 'px' }" />
        <div v-if="poisonFood" class="poison-food" :style="{ top: poisonFood.y + 'px', left: poisonFood.x + 'px' }" />
        <div v-if="instantWinFood" class="instant-win-food" :style="{ top: instantWinFood.y + 'px', left: instantWinFood.x + 'px' }" />

        <!-- Paused Overlay -->
        <div v-if="isPaused" class="paused-overlay">
          <p>Paused</p>
          <p>
            Click
            <svg class="play-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14">
              <path fill="blue" d="M8 5v14l11-7z" />
            </svg>
            to Continue!
          </p>
        </div>

        <!-- Game Over -->
        <div v-if="isGameOver" class="game-over-overlay">
          <p>YOU DIED!</p>
          <button class="restart-button" @click="restartGame">Restart</button>
        </div>
      </div>

      <div class="info">
        <p class="score">
          Skor: <span>{{ score }}</span>
        </p>
        <button class="pause-button" @click="togglePause">
          {{ isPaused ? "▶" : "⏸" }}
        </button>
      </div>
    </div>
  </div>
</template>


<script>
export default {
  data() {
    return {
      gameStarted: false,
      isPaused: false,
      isGameOver: false,
      isWin: false,
      score: 0,
      snake: [{ x: 75, y: 75 }],
      direction: "right",
      food: { x: 100, y: 100 },
      specialFood: null,
      superFood: null,
      instantWinFood: null,
      poisonFood: null,
      eatSound: null,
      deathSound: null,
      winSound: null,
      intervalId: null,
      isMobile: false,
      gridSize: 15,
    };
  },
  methods: {
    snapToGrid(value) {
      return Math.floor(value / this.gridSize) * this.gridSize;
    },
    getRandomFoodPosition() {
      return {
        x: this.snapToGrid(Math.random() * 600),
        y: this.snapToGrid(Math.random() * 600),
      };
    },
    playEatSound() {
      if (this.eatSound) {
        this.eatSound.currentTime = 0;
        this.eatSound.play();
      }
    },
    checkWinCondition() {
      const maxBlocks = (600 / this.gridSize) ** 2; // 40x40 = 1600
      if (this.snake.length >= maxBlocks) {
        this.winGame();
      }
    },
    winGame() {
      clearInterval(this.intervalId);
      this.isWin = true;
      window.removeEventListener("keydown", this.handleKey);
      if (this.winSound) {
        this.winSound.currentTime = 0;
        this.winSound.play();
      }
    },
    respawnAllFoods() {
      this.food = this.getRandomFoodPosition();
      this.spawnSpecialFood();
      this.spawnSuperFood();
      this.spawnPoisonFood();
      this.spawnInstantWinFood();
    },
    startGame() {
      this.gameStarted = true;
      this.isGameOver = false;
      this.isWin = false;
      this.snake = [{ x: this.snapToGrid(75), y: this.snapToGrid(75) }];
      this.direction = "right";
      this.score = 0;
      this.respawnAllFoods();
      this.intervalId = setInterval(this.moveSnake, 150);
      window.addEventListener("keydown", this.handleKey);
    },
    restartGame() {
      this.snake = [{ x: this.snapToGrid(75), y: this.snapToGrid(75) }];
      this.direction = "right";
      this.score = 0;
      this.isPaused = false;
      this.isGameOver = false;
      this.isWin = false;
      clearInterval(this.intervalId);
      this.respawnAllFoods();
      this.intervalId = setInterval(this.moveSnake, 150);
      window.addEventListener("keydown", this.handleKey);
    },
    togglePause() {
      this.isPaused = !this.isPaused;
      if (this.isPaused) {
        clearInterval(this.intervalId);
      } else {
        this.intervalId = setInterval(this.moveSnake, 150);
      }
    },
    handleKey(e) {
      const keyMap = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
      };
      const opposite = {
        up: "down",
        down: "up",
        left: "right",
        right: "left",
      };
      const newDir = keyMap[e.key];
      if (newDir && newDir !== opposite[this.direction]) {
        this.direction = newDir;
      }
    },
    moveSnake() {
      if (this.isPaused || this.isGameOver || this.isWin) return;

      const head = { ...this.snake[0] };
      switch (this.direction) {
        case "up":
          head.y -= this.gridSize;
          break;
        case "down":
          head.y += this.gridSize;
          break;
        case "left":
          head.x -= this.gridSize;
          break;
        case "right":
          head.x += this.gridSize;
          break;
      }

      // Tabrakan dinding
      if (head.x < 0 || head.x >= 600 || head.y < 0 || head.y >= 600) {
        this.endGame();
        return;
      }

      // Tabrakan badan sendiri
      for (let i = 1; i < this.snake.length; i++) {
        if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
          this.endGame();
          return;
        }
      }

      this.snake.unshift(head);
      const tail = this.snake[this.snake.length - 1];

      // Makan racun
      if (
        this.poisonFood &&
        Math.abs(head.x - this.poisonFood.x) < this.gridSize &&
        Math.abs(head.y - this.poisonFood.y) < this.gridSize
      ) {
        this.endGame();
        return;
      }

      // Makan super food
      if (
        this.superFood &&
        Math.abs(head.x - this.superFood.x) < this.gridSize &&
        Math.abs(head.y - this.superFood.y) < this.gridSize
      ) {
        this.score += 10;
        for (let i = 0; i < 9; i++) this.snake.push({ ...tail });
        this.respawnAllFoods();
        this.playEatSound();
        this.checkWinCondition();
        return;
      }

      // Makan special food
      if (
        this.specialFood &&
        Math.abs(head.x - this.specialFood.x) < this.gridSize &&
        Math.abs(head.y - this.specialFood.y) < this.gridSize
      ) {
        this.score += 3;
        for (let i = 0; i < 2; i++) this.snake.push({ ...tail });
        this.respawnAllFoods();
        this.playEatSound();
        this.checkWinCondition();
        return;
      }

      if (
        this.instantWinFood &&
        Math.abs(head.x - this.instantWinFood.x) < this.gridSize &&
        Math.abs(head.y - this.instantWinFood.y) < this.gridSize
      ) {
        this.playEatSound();
        this.winGame();
        return;
      }

      // Makan food biasa
      if (
        Math.abs(head.x - this.food.x) < this.gridSize &&
        Math.abs(head.y - this.food.y) < this.gridSize
      ) {
        this.score++;
        this.snake.push({ ...tail });
        this.respawnAllFoods();
        this.playEatSound();
        this.checkWinCondition();
        return;
      }

      this.snake.pop();
    },
    endGame() {
      clearInterval(this.intervalId);
      this.isGameOver = true;
      window.removeEventListener("keydown", this.handleKey);
      if (this.deathSound) {
        this.deathSound.currentTime = 0;
        this.deathSound.play();
      }
    },
    spawnSpecialFood() {
      this.specialFood =
        Math.random() < 0.4 ? this.getRandomFoodPosition() : null;
    },
    spawnSuperFood() {
      this.superFood =
        Math.random() < 0.15 ? this.getRandomFoodPosition() : null;
    },
    spawnPoisonFood() {
      this.poisonFood =
        Math.random() < 0.6 ? this.getRandomFoodPosition() : null;
    },
    spawnInstantWinFood() {
      this.instantWinFood =
        Math.random() < 0.01 ? this.getRandomFoodPosition() : null;
    },
  },
  mounted() {
    this.deathSound = new Audio("/sounds/death.mp3");
    this.eatSound = new Audio("/sounds/eat.mp3");
    this.winSound = new Audio("/sounds/win.mp3");

     if (window.innerWidth < 768) {
      this.isMobile = true;
    }
  },
  beforeUnmount() {
    clearInterval(this.intervalId);
    window.removeEventListener("keydown", this.handleKey);
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap");

.gameover-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 600px;
  height: 600px;
  object-fit: cover;
  z-index: 100;
}

.win-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.95);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 50;
  color: green;
  font-size: 20px;
  font-family: "Press Start 2P", cursive;
  user-select: none;
  text-align: center;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: white;
  font-family: "Press Start 2P", cursive;
  padding-top: 20px;
}

.title {
  font-size: 16px;
  margin-bottom: 10px;
}

.game-box {
  background-color: #2c2727;
  width: 600px;
  height: 600px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.start-button {
  font-family: "Press Start 2P", cursive;
  background-color: #6c91f5;
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
}

.gameplay {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.food {
  width: 15px;
  height: 15px;
  background-color: lime;
  position: absolute;
}

.snake-part {
  width: 15px;
  height: 15px;
  background-color: cyan;
  position: absolute;
}

.info {
  display: flex;
  flex-direction: column;
  justify-content: start;
  height: 400px;
  padding-top: 20px;
}

.score {
  font-size: 12px;
  color: black;
  margin-bottom: 10px;
}

.score span {
  color: blue;
}

.pause-button {
  font-size: 24px;
  background-color: blue;
  color: white;
  border: none;
  border-radius: 50%;
  padding: 10px 14px;
  cursor: pointer;
  width: 50px;
  height: 50px;
}

.paused-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.85);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
  text-align: center;
  color: black;
  font-size: 12px;
}

.paused-overlay p:first-child {
  font-size: 14px;
  margin-bottom: 10px;
}

.game-over-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.85); /* Hitam gelap transparan */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 30;
  color: white;
  font-size: 20px;
  font-family: "Press Start 2P", cursive;
  user-select: none;
  text-align: center;
}

.restart-button {
  margin-top: 20px;
  padding: 10px 20px;
  font-family: "Press Start 2P", cursive;
  font-size: 12px;
  background-color: rgb(41, 247, 0);
  color: rgb(0, 0, 0);
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.special-food {
  width: 15px;
  height: 15px;
  background-color: #ff00aa;
  position: absolute;
}

.instant-win-food {
  width: 15px;
  height: 15px;
  background-color: #0066ff;
  border: 2px solid white;
  border-radius: 50%;
  position: absolute;
  box-shadow: 0 0 5px 2px rgba(0, 102, 255, 0.8);
}

.super-food {
  width: 15px;
  height: 15px;
  background-color: #ffbb00;
  position: absolute;
}

.poison-food {
  width: 15px;
  height: 15px;
  background-color: red;
  position: absolute;
  background: none;
}

.poison-food::before,
.poison-food::after {
  content: "";
  position: absolute;
  width: 15px;
  height: 3px;
  background-color: red;
  top: 6px;
  left: 0;
}

.poison-food::before {
  transform: rotate(45deg);
}

.poison-food::after {
  transform: rotate(-45deg);
}

.mobile-warning {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #111;
  color: #fff;
  font-family: "Press Start 2P", cursive;
  text-align: center;
  padding: 20px;
  font-size: 14px;
}


</style>
