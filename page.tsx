"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

type BoxContent = "BOMBA" | "CONFETI"
type BoxState = "closed" | "opening" | "opened"

interface Box {
  content: BoxContent
  state: BoxState
  openedBy: "player" | "machine" | null
}

interface GameState {
  totalBoxes: number
  totalBombs: number
  boxes: Box[]
  currentIndex: number
  playerBombs: number
  machineBombs: number
  isPlayerTurn: boolean
  isActive: boolean
  isAiThinking: boolean
  lastAction: string
  gamePhase: "setup" | "playing" | "gameover"
}

export default function ProbabilityGame() {
  const [gameState, setGameState] = useState<GameState>({
    totalBoxes: 20,
    totalBombs: 8,
    boxes: [],
    currentIndex: 0,
    playerBombs: 0,
    machineBombs: 0,
    isPlayerTurn: true,
    isActive: false,
    isAiThinking: false,
    lastAction: "",
    gamePhase: "setup",
  })

  const [totalBoxes, setTotalBoxes] = useState(20)
  const [totalBombs, setTotalBombs] = useState(8)

  // Initialize boxes with random bomb distribution
  const initializeGame = (totalBoxes: number, totalBombs: number): Box[] => {
    const boxes: Box[] = Array(totalBoxes)
      .fill(null)
      .map(() => ({
        content: "CONFETI" as BoxContent,
        state: "closed" as BoxState,
        openedBy: null,
      }))

    const bombPositions: number[] = []
    while (bombPositions.length < totalBombs) {
      const pos = Math.floor(Math.random() * totalBoxes)
      if (!bombPositions.includes(pos)) {
        bombPositions.push(pos)
        boxes[pos].content = "BOMBA"
      }
    }

    return boxes
  }

  // AI Decision Logic
  const makeAiDecision = (state: GameState): "open_self" | "force_player" => {
    const remainingBoxes = state.totalBoxes - state.currentIndex
    const remainingBombs = state.totalBombs - state.playerBombs - state.machineBombs

    if (remainingBoxes <= 0 || remainingBombs <= 0) {
      return "open_self"
    }

    const bombProbability = remainingBombs / remainingBoxes
    return bombProbability > 0.6 ? "force_player" : "open_self"
  }

  // Calculate probability message
  const getProbabilityMessage = (state: GameState): string => {
    const remainingBoxes = state.totalBoxes - state.currentIndex
    const remainingBombs = state.totalBombs - state.playerBombs - state.machineBombs

    if (remainingBoxes <= 0) return ""

    const bombProbability = (remainingBombs / remainingBoxes) * 100
    const confetiProbability = 100 - bombProbability

    let luckMessage = ""
    if (bombProbability < 20) luckMessage = "¡Excelente suerte!"
    else if (bombProbability < 40) luckMessage = "Buena probabilidad"
    else if (bombProbability < 60) luckMessage = "Probabilidad equilibrada"
    else if (bombProbability < 80) luckMessage = "Riesgo alto"
    else luckMessage = "¡Muy peligroso!"

    return `🎲 Probabilidad: ${bombProbability.toFixed(1)}% 💣 | ${confetiProbability.toFixed(1)}% 🎉 - ${luckMessage}`
  }

  // Start Game
  const startGame = () => {
    if (totalBombs >= totalBoxes) {
      alert("El número de bombas debe ser menor que el total de cajas")
      return
    }

    setGameState({
      totalBoxes,
      totalBombs,
      boxes: initializeGame(totalBoxes, totalBombs),
      currentIndex: 0,
      playerBombs: 0,
      machineBombs: 0,
      isPlayerTurn: true,
      isActive: true,
      isAiThinking: false,
      lastAction: "¡Juego iniciado! Es tu turno. Elige tu acción.",
      gamePhase: "playing",
    })
  }

  // Open box with animation
  const openBox = (index: number, openedBy: "player" | "machine") => {
    setGameState((prev) => {
      const newBoxes = [...prev.boxes]
      newBoxes[index] = { ...newBoxes[index], state: "opening", openedBy }
      return { ...prev, boxes: newBoxes }
    })

    // After animation, mark as opened
    setTimeout(() => {
      setGameState((prev) => {
        const newBoxes = [...prev.boxes]
        newBoxes[index] = { ...newBoxes[index], state: "opened" }
        return { ...prev, boxes: newBoxes }
      })
    }, 600)
  }

  // Handle Player Actions
  const handlePlayerAction = (action: "open_self" | "force_machine") => {
    if (!gameState.isActive || !gameState.isPlayerTurn || gameState.isAiThinking) {
      return
    }

    if (gameState.currentIndex >= gameState.totalBoxes) {
      endGame()
      return
    }

    const content = gameState.boxes[gameState.currentIndex].content
    const currentIndex = gameState.currentIndex

    if (action === "open_self") {
      openBox(currentIndex, "player")

      setTimeout(() => {
        setGameState((prev) => {
          const newState = { ...prev, currentIndex: prev.currentIndex + 1 }

          if (content === "BOMBA") {
            newState.playerBombs++
            newState.isPlayerTurn = false
            newState.lastAction = "💣 JUGADOR encontró una BOMBA! Pierde el turno."
          } else {
            newState.isPlayerTurn = true
            newState.lastAction = "🎉 JUGADOR encontró CONFETI! Mantiene el turno."
          }

          return newState
        })
      }, 800)
    } else if (action === "force_machine") {
      openBox(currentIndex, "machine")

      setTimeout(() => {
        setGameState((prev) => {
          const newState = { ...prev, currentIndex: prev.currentIndex + 1 }

          if (content === "BOMBA") {
            newState.machineBombs++
            newState.isPlayerTurn = true
            newState.lastAction = "💣 MÁQUINA encontró una BOMBA! Jugador mantiene el turno."
          } else {
            newState.isPlayerTurn = false
            newState.lastAction = "🎉 MÁQUINA encontró CONFETI! Jugador pierde el turno."
          }

          return newState
        })
      }, 800)
    }
  }

  // Handle AI Turn
  useEffect(() => {
    if (
      !gameState.isPlayerTurn &&
      gameState.isActive &&
      !gameState.isAiThinking &&
      gameState.currentIndex < gameState.totalBoxes
    ) {
      setGameState((prev) => ({ ...prev, isAiThinking: true }))

      const thinkingTime = Math.random() * 1500 + 500

      setTimeout(() => {
        const aiDecision = makeAiDecision(gameState)
        const content = gameState.boxes[gameState.currentIndex].content
        const currentIndex = gameState.currentIndex

        if (aiDecision === "open_self") {
          openBox(currentIndex, "machine")

          setTimeout(() => {
            setGameState((prev) => {
              const newState = {
                ...prev,
                currentIndex: prev.currentIndex + 1,
                isAiThinking: false,
              }

              if (content === "BOMBA") {
                newState.machineBombs++
                newState.isPlayerTurn = true
                newState.lastAction = "🤖 MÁQUINA decidió abrir y encontró una BOMBA! Jugador recupera el turno."
              } else {
                newState.isPlayerTurn = false
                newState.lastAction = "🤖 MÁQUINA decidió abrir y encontró CONFETI! Mantiene el turno."
              }

              return newState
            })
          }, 800)
        } else {
          openBox(currentIndex, "player")

          setTimeout(() => {
            setGameState((prev) => {
              const newState = {
                ...prev,
                currentIndex: prev.currentIndex + 1,
                isAiThinking: false,
              }

              if (content === "BOMBA") {
                newState.playerBombs++
                newState.isPlayerTurn = false
                newState.lastAction =
                  "🤖 MÁQUINA te forzó a abrir - encontraste una BOMBA! La máquina mantiene el turno."
              } else {
                newState.isPlayerTurn = true
                newState.lastAction = "🤖 MÁQUINA te forzó a abrir - encontraste CONFETI! Recuperas el turno."
              }

              return newState
            })
          }, 800)
        }
      }, thinkingTime)
    }
  }, [gameState])

  // Check for game end
  useEffect(() => {
    if (gameState.currentIndex >= gameState.totalBoxes && gameState.isActive) {
      setTimeout(() => endGame(), 1000)
    }
  }, [gameState.currentIndex, gameState.totalBoxes, gameState.isActive])

  // End Game
  const endGame = () => {
    setGameState((prev) => ({ ...prev, isActive: false, gamePhase: "gameover" }))
  }

  const getWinnerMessage = () => {
    if (gameState.playerBombs < gameState.machineBombs) {
      return "🏆 ¡JUGADOR GANA!"
    } else if (gameState.playerBombs > gameState.machineBombs) {
      return "🏆 ¡MÁQUINA GANA!"
    } else {
      return "🤝 ¡EMPATE!"
    }
  }

  // Setup Screen
  if (gameState.gamePhase === "setup") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 bg-white/10 backdrop-blur-lg border-white/20">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-white mb-2">🎮 Juego de Probabilidad</h1>
            <p className="text-white/80">Compite contra la IA evitando las bombas</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-white mb-2">📦 Total de Cajas:</label>
              <input
                type="number"
                min="10"
                max="50"
                value={totalBoxes}
                onChange={(e) => setTotalBoxes(Number.parseInt(e.target.value))}
                className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>

            <div>
              <label className="block text-white mb-2">💣 Total de Bombas:</label>
              <input
                type="number"
                min="3"
                max="20"
                value={totalBombs}
                onChange={(e) => setTotalBombs(Number.parseInt(e.target.value))}
                className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>

            <Button onClick={startGame} className="w-full text-lg py-6">
              🚀 Comenzar Juego
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // Game Over Screen
  if (gameState.gamePhase === "gameover") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 bg-white/10 backdrop-blur-lg border-white/20 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-white mb-2">¡JUEGO TERMINADO!</h2>
          <div className="text-2xl font-bold text-yellow-300 mb-6">{getWinnerMessage()}</div>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center bg-white/10 p-4 rounded-lg">
              <span className="text-white">👤 Jugador:</span>
              <span className="text-2xl font-bold text-white">{gameState.playerBombs} 💣</span>
            </div>
            <div className="flex justify-between items-center bg-white/10 p-4 rounded-lg">
              <span className="text-white">🤖 IA:</span>
              <span className="text-2xl font-bold text-white">{gameState.machineBombs} 💣</span>
            </div>
          </div>

          <p className="text-white/70 text-sm mb-6">(Menos bombas gana)</p>

          <Button
            onClick={() => setGameState((prev) => ({ ...prev, gamePhase: "setup" }))}
            className="w-full text-lg py-6"
          >
            🎮 Jugar Otra Vez
          </Button>
        </Card>
      </div>
    )
  }

  // Playing Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">🎮 Juego de Probabilidad</h1>
        </div>

        {/* Scoreboard */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4 bg-blue-500/20 backdrop-blur-lg border-blue-300/30 text-center">
            <div className="text-white/80 text-sm mb-1">👤 Jugador</div>
            <div className="text-3xl font-bold text-white">{gameState.playerBombs}</div>
            <div className="text-white/60 text-xs">bombas</div>
          </Card>

          <Card className="p-4 bg-white/10 backdrop-blur-lg border-white/20 text-center">
            <div className="text-white/80 text-sm mb-1">Progreso</div>
            <div className="text-2xl font-bold text-white">
              {gameState.currentIndex} / {gameState.totalBoxes}
            </div>
            <div className="text-white/60 text-xs">cajas abiertas</div>
          </Card>

          <Card className="p-4 bg-red-500/20 backdrop-blur-lg border-red-300/30 text-center">
            <div className="text-white/80 text-sm mb-1">🤖 IA</div>
            <div className="text-3xl font-bold text-white">{gameState.machineBombs}</div>
            <div className="text-white/60 text-xs">bombas</div>
          </Card>
        </div>

        {/* Probability Message */}
        <Card className="p-4 mb-6 bg-yellow-500/20 backdrop-blur-lg border-yellow-300/30">
          <p className="text-center text-white font-semibold">{getProbabilityMessage(gameState)}</p>
        </Card>

        {/* Game Status */}
        <Card className="p-4 mb-6 bg-white/10 backdrop-blur-lg border-white/20">
          <p className="text-center text-white">{gameState.lastAction}</p>
        </Card>

        {/* AI Thinking */}
        {gameState.isAiThinking && (
          <Card className="p-4 mb-6 bg-purple-500/20 backdrop-blur-lg border-purple-300/30">
            <div className="flex items-center justify-center gap-3">
              <div className="animate-spin text-2xl">🤖</div>
              <span className="text-white font-semibold">IA Pensando...</span>
            </div>
          </Card>
        )}

        {/* Boxes Grid */}
        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3 mb-6">
          {gameState.boxes.map((box, index) => (
            <div key={index} className="relative aspect-square" style={{ perspective: "1000px" }}>
              <div
                className={`
                  w-full h-full relative transition-all duration-600
                  ${box.state === "opening" || box.state === "opened" ? "animate-flip" : ""}
                `}
                style={{
                  transformStyle: "preserve-3d",
                  transform: box.state === "opened" ? "rotateY(180deg)" : "rotateY(0deg)",
                }}
              >
                {/* Front of box (closed) */}
                <div
                  className={`
                    absolute inset-0 rounded-lg flex items-center justify-center text-2xl font-bold
                    ${box.state === "closed" && index === gameState.currentIndex ? "animate-pulse ring-4 ring-yellow-400" : ""}
                    ${box.state === "closed" ? "bg-gradient-to-br from-amber-600 to-amber-800 shadow-lg" : ""}
                  `}
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(0deg)",
                  }}
                >
                  {box.state === "closed" && <span className="text-white drop-shadow-lg">?</span>}
                </div>

                {/* Back of box (opened) */}
                <div
                  className={`
                    absolute inset-0 rounded-lg flex items-center justify-center text-3xl
                    ${
                      box.content === "BOMBA"
                        ? "bg-gradient-to-br from-red-600 to-red-800"
                        : "bg-gradient-to-br from-green-600 to-green-800"
                    }
                    ${box.openedBy === "player" ? "ring-2 ring-blue-400" : "ring-2 ring-purple-400"}
                    shadow-lg
                  `}
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  {(box.state === "opening" || box.state === "opened") && (
                    <span className={`${box.state === "opening" ? "animate-bounce" : ""}`}>
                      {box.content === "BOMBA" ? "💣" : "🎉"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Player Actions */}
        {gameState.isPlayerTurn && gameState.isActive && !gameState.isAiThinking && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Button
              onClick={() => handlePlayerAction("open_self")}
              className="py-8 text-lg bg-blue-600 hover:bg-blue-700"
            >
              <div className="flex flex-col items-center gap-2">
                <span className="text-3xl">📦</span>
                <span>Abrir Yo</span>
              </div>
            </Button>

            <Button
              onClick={() => handlePlayerAction("force_machine")}
              className="py-8 text-lg bg-purple-600 hover:bg-purple-700"
            >
              <div className="flex flex-col items-center gap-2">
                <span className="text-3xl">🤖</span>
                <span>Máquina Abre</span>
              </div>
            </Button>
          </div>
        )}

        {/* New Game Button */}
        <div className="text-center">
          <Button
            onClick={() => setGameState((prev) => ({ ...prev, gamePhase: "setup" }))}
            variant="outline"
            className="bg-white/10 text-white border-white/30 hover:bg-white/20"
          >
            🔄 Nuevo Juego
          </Button>
        </div>
      </div>
    </div>
  )
}
