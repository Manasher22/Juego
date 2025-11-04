// Game State
let gameState = {
  totalBoxes: 20,
  totalBombs: 8,
  boxes: [],
  boxStates: [], // 'unopened', 'opened-bomb', 'opened-confetti'
  currentIndex: 0,
  playerBombs: 0,
  machineBombs: 0,
  isPlayerTurn: true,
  isActive: false,
  isAiThinking: false,
  lastAction: "",
}

// AI Decision Logic
function makeAiDecision(gameState) {
  const remainingBoxes = gameState.totalBoxes - gameState.currentIndex
  const remainingBombs = gameState.totalBombs - gameState.playerBombs - gameState.machineBombs

  if (remainingBoxes <= 0 || remainingBombs <= 0) {
    return "open_self"
  }

  // Calculate probability of getting a bomb
  const bombProbability = remainingBombs / remainingBoxes

  // AI strategy: If bomb probability > 60%, force player to open
  // Otherwise, open itself
  return bombProbability > 0.6 ? "force_player" : "open_self"
}

function updateProbabilityMessage() {
  const remainingBoxes = gameState.totalBoxes - gameState.currentIndex
  const remainingBombs = gameState.totalBombs - gameState.playerBombs - gameState.machineBombs

  if (remainingBoxes <= 0 || remainingBombs <= 0) {
    document.getElementById("probability-message").textContent = "🎉 ¡No quedan más cajas o bombas!"
    return
  }

  const bombProbability = (remainingBombs / remainingBoxes) * 100
  const confettiProbability = 100 - bombProbability

  let luckMessage = ""
  if (bombProbability >= 70) {
    luckMessage = "😰 ¡Muy peligroso! Alta probabilidad de bomba"
  } else if (bombProbability >= 50) {
    luckMessage = "😬 Riesgoso - 50/50 de encontrar bomba"
  } else if (bombProbability >= 30) {
    luckMessage = "🤔 Probabilidad moderada de bomba"
  } else if (bombProbability >= 15) {
    luckMessage = "😊 Buenas probabilidades - más confeti que bombas"
  } else {
    luckMessage = "🍀 ¡Excelente suerte! Muy pocas bombas restantes"
  }

  document.getElementById("probability-message").innerHTML =
    `📊 Probabilidades: 💣 ${bombProbability.toFixed(1)}% Bomba | 🎉 ${confettiProbability.toFixed(1)}% Confeti<br>${luckMessage}`
}

// Initialize boxes with random bomb distribution
function initializeGame(totalBoxes, totalBombs) {
  const boxes = Array(totalBoxes).fill("CONFETI")

  // Place bombs randomly
  const bombPositions = []
  while (bombPositions.length < totalBombs) {
    const pos = Math.floor(Math.random() * totalBoxes)
    if (!bombPositions.includes(pos)) {
      bombPositions.push(pos)
      boxes[pos] = "BOMBA"
    }
  }

  return boxes
}

function renderBoxesGrid() {
  const boxesGrid = document.getElementById("boxes-grid")
  boxesGrid.innerHTML = ""

  for (let i = 0; i < gameState.totalBoxes; i++) {
    const boxDiv = document.createElement("div")
    boxDiv.className = "box"
    boxDiv.dataset.index = i

    const boxNumber = document.createElement("span")
    boxNumber.className = "box-number"
    boxNumber.textContent = i + 1
    boxDiv.appendChild(boxNumber)

    if (i < gameState.currentIndex) {
      // Box has been opened
      boxDiv.classList.add(gameState.boxStates[i])
      if (gameState.boxStates[i] === "opened-bomb") {
        boxDiv.textContent = "💣"
      } else {
        boxDiv.textContent = "🎉"
      }
      boxDiv.appendChild(boxNumber)
    } else if (i === gameState.currentIndex) {
      // Next box to open
      boxDiv.classList.add("next")
      boxDiv.textContent = "?"
      boxDiv.appendChild(boxNumber)
    } else {
      // Unopened box
      boxDiv.classList.add("unopened")
      boxDiv.textContent = "?"
      boxDiv.appendChild(boxNumber)
    }

    boxesGrid.appendChild(boxDiv)
  }
}

// DOM Elements
const setupScreen = document.getElementById("setup-screen")
const gameScreen = document.getElementById("game-screen")
const gameOverScreen = document.getElementById("game-over-screen")
const gameForm = document.getElementById("game-form")
const playerActions = document.getElementById("player-actions")
const aiThinking = document.getElementById("ai-thinking")
const gameStatus = document.getElementById("game-status")

// Score elements
const playerBombsDisplay = document.getElementById("player-bombs")
const machineBombsDisplay = document.getElementById("machine-bombs")
const currentIndexDisplay = document.getElementById("current-index")
const totalDisplay = document.getElementById("total-display")

// Action buttons
const openSelfBtn = document.getElementById("open-self")
const forceMachineBtn = document.getElementById("force-machine")
const newGameBtn = document.getElementById("new-game")
const playAgainBtn = document.getElementById("play-again")

// Game over elements
const winnerAnnouncement = document.getElementById("winner-announcement")
const finalPlayerBombs = document.getElementById("final-player-bombs")
const finalMachineBombs = document.getElementById("final-machine-bombs")

// Event Listeners
gameForm.addEventListener("submit", startGame)
openSelfBtn.addEventListener("click", () => handlePlayerAction("open_self"))
forceMachineBtn.addEventListener("click", () => handlePlayerAction("force_machine"))
newGameBtn.addEventListener("click", showSetupScreen)
playAgainBtn.addEventListener("click", showSetupScreen)

// Start Game
function startGame(e) {
  e.preventDefault()

  const totalBoxes = Number.parseInt(document.getElementById("total-boxes").value)
  const totalBombs = Number.parseInt(document.getElementById("total-bombs").value)

  if (totalBombs >= totalBoxes) {
    alert("El número de bombas debe ser menor que el total de cajas")
    return
  }

  // Initialize game state
  gameState = {
    totalBoxes,
    totalBombs,
    boxes: initializeGame(totalBoxes, totalBombs),
    boxStates: Array(totalBoxes).fill("unopened"),
    currentIndex: 0,
    playerBombs: 0,
    machineBombs: 0,
    isPlayerTurn: true,
    isActive: true,
    isAiThinking: false,
    lastAction: "¡Juego iniciado! Es tu turno. Elige tu acción.",
  }

  showGameScreen()
  updateDisplay()
}

// Show/Hide screens
function showSetupScreen() {
  setupScreen.classList.remove("hidden")
  gameScreen.classList.add("hidden")
  gameOverScreen.classList.add("hidden")
}

function showGameScreen() {
  setupScreen.classList.add("hidden")
  gameScreen.classList.remove("hidden")
  gameOverScreen.classList.add("hidden")
}

function showGameOverScreen() {
  gameOverScreen.classList.remove("hidden")
}

// Handle Player Actions
function handlePlayerAction(action) {
  if (!gameState.isActive || !gameState.isPlayerTurn || gameState.isAiThinking) {
    return
  }

  if (gameState.currentIndex >= gameState.totalBoxes) {
    endGame()
    return
  }

  const content = gameState.boxes[gameState.currentIndex]
  const boxIndex = gameState.currentIndex

  if (action === "open_self") {
    // Player opens the box
    gameState.currentIndex++

    if (content === "BOMBA") {
      gameState.playerBombs++
      gameState.isPlayerTurn = false
      gameState.lastAction = "💣 JUGADOR encontró una BOMBA! Pierde el turno."
      gameState.boxStates[boxIndex] = "opened-bomb"
    } else {
      gameState.isPlayerTurn = true
      gameState.lastAction = "🎉 JUGADOR encontró CONFETI! Mantiene el turno."
      gameState.boxStates[boxIndex] = "opened-confetti"
    }
  } else if (action === "force_machine") {
    // Machine opens the box
    gameState.currentIndex++

    if (content === "BOMBA") {
      gameState.machineBombs++
      gameState.isPlayerTurn = true
      gameState.lastAction = "💣 MÁQUINA encontró una BOMBA! Jugador mantiene el turno."
      gameState.boxStates[boxIndex] = "opened-bomb"
    } else {
      gameState.isPlayerTurn = false
      gameState.lastAction = "🎉 MÁQUINA encontró CONFETI! Jugador pierde el turno."
      gameState.boxStates[boxIndex] = "opened-confetti"
    }
  }

  // Check if game is finished
  if (gameState.currentIndex >= gameState.totalBoxes) {
    endGame()
    return
  }

  updateDisplay()

  // If it's AI's turn, trigger AI action
  if (!gameState.isPlayerTurn && gameState.isActive) {
    setTimeout(handleAITurn, 1000)
  }
}

// Handle AI Turn
function handleAITurn() {
  if (gameState.isPlayerTurn || !gameState.isActive || gameState.currentIndex >= gameState.totalBoxes) {
    return
  }

  gameState.isAiThinking = true
  updateDisplay()

  // AI thinking time
  const thinkingTime = Math.random() * 1500 + 500

  setTimeout(() => {
    if (!gameState.isActive || gameState.currentIndex >= gameState.totalBoxes) {
      return
    }

    const aiDecision = makeAiDecision(gameState)
    const content = gameState.boxes[gameState.currentIndex]
    const boxIndex = gameState.currentIndex

    gameState.currentIndex++
    gameState.isAiThinking = false

    if (aiDecision === "open_self") {
      // AI opens the box itself
      if (content === "BOMBA") {
        gameState.machineBombs++
        gameState.isPlayerTurn = true
        gameState.lastAction = "🤖 MÁQUINA decidió abrir y encontró una BOMBA! Jugador recupera el turno."
        gameState.boxStates[boxIndex] = "opened-bomb"
      } else {
        gameState.isPlayerTurn = false
        gameState.lastAction = "🤖 MÁQUINA decidió abrir y encontró CONFETI! Mantiene el turno."
        gameState.boxStates[boxIndex] = "opened-confetti"
      }
    } else {
      // AI forces player to open
      if (content === "BOMBA") {
        gameState.playerBombs++
        gameState.isPlayerTurn = false
        gameState.lastAction = "🤖 MÁQUINA te forzó a abrir - encontraste una BOMBA! La máquina mantiene el turno."
        gameState.boxStates[boxIndex] = "opened-bomb"
      } else {
        gameState.isPlayerTurn = true
        gameState.lastAction = "🤖 MÁQUINA te forzó a abrir - encontraste CONFETI! Recuperas el turno."
        gameState.boxStates[boxIndex] = "opened-confetti"
      }
    }

    // Check if game is finished
    if (gameState.currentIndex >= gameState.totalBoxes) {
      endGame()
      return
    }

    updateDisplay()

    // If AI still has turn and found confetti, continue
    if (!gameState.isPlayerTurn && gameState.isActive) {
      setTimeout(handleAITurn, 1000)
    }
  }, thinkingTime)
}

// Update Display
function updateDisplay() {
  // Update scores
  playerBombsDisplay.textContent = gameState.playerBombs
  machineBombsDisplay.textContent = gameState.machineBombs
  currentIndexDisplay.textContent = gameState.currentIndex + 1
  totalDisplay.textContent = gameState.totalBoxes

  // Update game status
  gameStatus.textContent = gameState.lastAction

  updateProbabilityMessage()

  renderBoxesGrid()

  // Show/hide AI thinking
  if (gameState.isAiThinking) {
    aiThinking.classList.remove("hidden")
    playerActions.style.display = "none"
  } else {
    aiThinking.classList.add("hidden")
    playerActions.style.display = gameState.isPlayerTurn && gameState.isActive ? "grid" : "none"
  }
}

// End Game
function endGame() {
  gameState.isActive = false

  const finalPlayerBombsCount = gameState.playerBombs
  const finalMachineBombsCount = gameState.machineBombs

  let winner, announcement

  if (finalPlayerBombsCount < finalMachineBombsCount) {
    winner = "player"
    announcement = "🏆 ¡JUGADOR GANA!"
  } else if (finalPlayerBombsCount > finalMachineBombsCount) {
    winner = "machine"
    announcement = "🏆 ¡MÁQUINA GANA!"
  } else {
    winner = "tie"
    announcement = "🤝 ¡EMPATE!"
  }

  // Update final display
  winnerAnnouncement.innerHTML = `
        🎉 ¡JUEGO TERMINADO!<br>
        📊 PUNTUACIÓN FINAL<br>
        ${announcement}
        <br><small style="opacity: 0.7;">(Menos bombas gana)</small>
    `

  finalPlayerBombs.textContent = finalPlayerBombsCount
  finalMachineBombs.textContent = finalMachineBombsCount

  gameState.lastAction = `🎉 ¡JUEGO TERMINADO! 
📊 PUNTUACIÓN FINAL:
👤 Jugador: ${finalPlayerBombsCount} bombas
🤖 Máquina: ${finalMachineBombsCount} bombas
${announcement} (Menos bombas)`

  updateDisplay()

  setTimeout(() => {
    showGameOverScreen()
  }, 2000)
}

// Initialize the game on page load
document.addEventListener("DOMContentLoaded", () => {
  showSetupScreen()
})
