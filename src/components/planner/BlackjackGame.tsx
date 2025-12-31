import { useState, useMemo, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Spade, RotateCcw, Plus, Minus, DollarSign, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

interface BlackjackProps {
  trigger?: React.ReactNode;
}

type Card = {
  suit: "♠" | "♥" | "♦" | "♣";
  value: string;
  numValue: number;
};

const SUITS: Card["suit"][] = ["♠", "♥", "♦", "♣"];
const VALUES = [
  { value: "A", numValue: 11 },
  { value: "2", numValue: 2 },
  { value: "3", numValue: 3 },
  { value: "4", numValue: 4 },
  { value: "5", numValue: 5 },
  { value: "6", numValue: 6 },
  { value: "7", numValue: 7 },
  { value: "8", numValue: 8 },
  { value: "9", numValue: 9 },
  { value: "10", numValue: 10 },
  { value: "J", numValue: 10 },
  { value: "Q", numValue: 10 },
  { value: "K", numValue: 10 },
];

// Sound effects using Web Audio API
const useSound = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  const playTone = (frequency: number, duration: number, type: OscillatorType = "sine") => {
    if (!soundEnabled) return;
    
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = type;
      
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
      console.log("Audio not supported");
    }
  };

  const playCardDeal = () => playTone(800, 0.1, "square");
  const playChip = () => playTone(1200, 0.05, "sine");
  const playWin = () => {
    playTone(523, 0.15, "sine");
    setTimeout(() => playTone(659, 0.15, "sine"), 100);
    setTimeout(() => playTone(784, 0.2, "sine"), 200);
  };
  const playLose = () => {
    playTone(300, 0.3, "sawtooth");
  };
  const playBlackjack = () => {
    playTone(523, 0.1, "sine");
    setTimeout(() => playTone(659, 0.1, "sine"), 80);
    setTimeout(() => playTone(784, 0.1, "sine"), 160);
    setTimeout(() => playTone(1047, 0.3, "sine"), 240);
  };

  return { playCardDeal, playChip, playWin, playLose, playBlackjack, soundEnabled, setSoundEnabled };
};

const createDeck = (): Card[] => {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const { value, numValue } of VALUES) {
      deck.push({ suit, value, numValue });
    }
  }
  return deck;
};

const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const calculateHand = (cards: Card[]): number => {
  let sum = 0;
  let aces = 0;
  
  for (const card of cards) {
    if (card.value === "A") {
      aces++;
      sum += 11;
    } else {
      sum += card.numValue;
    }
  }
  
  while (sum > 21 && aces > 0) {
    sum -= 10;
    aces--;
  }
  
  return sum;
};

const CardDisplay = ({ card, hidden = false, isNew = false, delay = 0 }: { card: Card; hidden?: boolean; isNew?: boolean; delay?: number }) => {
  const isRed = card.suit === "♥" || card.suit === "♦";
  const [isVisible, setIsVisible] = useState(!isNew);

  useEffect(() => {
    if (isNew) {
      const timer = setTimeout(() => setIsVisible(true), delay);
      return () => clearTimeout(timer);
    }
  }, [isNew, delay]);
  
  if (hidden) {
    return (
      <div className={cn(
        "w-14 h-20 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold shadow-lg border-2 border-primary/50",
        "transition-all duration-300",
        isNew && !isVisible && "opacity-0 scale-50 -translate-y-8",
        isNew && isVisible && "opacity-100 scale-100 translate-y-0"
      )}>
        <div className="text-2xl">🂠</div>
      </div>
    );
  }
  
  return (
    <div className={cn(
      "w-14 h-20 rounded-lg bg-card border-2 flex flex-col items-center justify-center shadow-lg relative overflow-hidden",
      "transition-all duration-300 hover:scale-105 hover:-translate-y-1",
      isRed ? "text-red-500 border-red-500/30" : "text-foreground border-border",
      isNew && !isVisible && "opacity-0 scale-50 -translate-y-8 rotate-12",
      isNew && isVisible && "opacity-100 scale-100 translate-y-0 rotate-0"
    )}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      <span className="text-lg font-bold">{card.value}</span>
      <span className="text-2xl leading-none">{card.suit}</span>
    </div>
  );
};

const ChipButton = ({ amount, onClick, disabled }: { amount: number; onClick: () => void; disabled?: boolean }) => (
  <Button
    variant="outline"
    size="sm"
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "text-xs rounded-full w-12 h-12 p-0 font-bold transition-all duration-200",
      "hover:scale-110 hover:shadow-lg active:scale-95",
      "bg-gradient-to-br from-amber-500 to-amber-700 text-white border-amber-400",
      "hover:from-amber-400 hover:to-amber-600"
    )}
  >
    {amount}€
  </Button>
);

export const BlackjackGame = ({ trigger }: BlackjackProps) => {
  const [open, setOpen] = useState(false);
  const [balance, setBalance] = useState(() => {
    const saved = localStorage.getItem("blackjack-balance");
    return saved ? parseInt(saved, 10) : 1000;
  });
  const [bet, setBet] = useState(10);
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [gameState, setGameState] = useState<"betting" | "playing" | "dealerTurn" | "ended">("betting");
  const [message, setMessage] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [newCardIndex, setNewCardIndex] = useState(-1);
  const [isDealing, setIsDealing] = useState(false);

  const { playCardDeal, playChip, playWin, playLose, playBlackjack, soundEnabled, setSoundEnabled } = useSound();

  const playerScore = calculateHand(playerHand);
  const dealerScore = calculateHand(dealerHand);

  const saveBalance = (newBalance: number) => {
    setBalance(newBalance);
    localStorage.setItem("blackjack-balance", newBalance.toString());
  };

  const startGame = async () => {
    if (bet > balance) {
      setMessage("Saldo insufficiente!");
      return;
    }
    
    setIsDealing(true);
    const newDeck = shuffleDeck(createDeck());
    
    // Deal cards with animation
    setPlayerHand([]);
    setDealerHand([]);
    setNewCardIndex(0);
    
    // Player first card
    playCardDeal();
    setPlayerHand([newDeck.pop()!]);
    await new Promise(r => setTimeout(r, 300));
    
    // Dealer first card
    playCardDeal();
    setDealerHand([newDeck.pop()!]);
    await new Promise(r => setTimeout(r, 300));
    
    // Player second card
    playCardDeal();
    const pHand = [newDeck[newDeck.length], newDeck.pop()!];
    setPlayerHand(prev => [...prev, newDeck.pop()!]);
    await new Promise(r => setTimeout(r, 300));
    
    // Dealer second card
    playCardDeal();
    setDealerHand(prev => [...prev, newDeck.pop()!]);
    
    setDeck(newDeck);
    setGameState("playing");
    setMessage("");
    setIsDealing(false);
    setNewCardIndex(-1);
    
    // Check for blackjack
    const finalPlayerHand = [...playerHand];
    if (calculateHand(finalPlayerHand) === 21) {
      playBlackjack();
    }
  };

  const hit = async () => {
    const newDeck = [...deck];
    const newCard = newDeck.pop()!;
    
    playCardDeal();
    setNewCardIndex(playerHand.length);
    const newHand = [...playerHand, newCard];
    setDeck(newDeck);
    setPlayerHand(newHand);
    
    await new Promise(r => setTimeout(r, 200));
    setNewCardIndex(-1);
    
    const score = calculateHand(newHand);
    if (score > 21) {
      playLose();
      saveBalance(balance - bet);
      setGameState("ended");
      setMessage("Sballato! Hai perso 💔");
    } else if (score === 21) {
      stand(newHand, newDeck);
    }
  };

  const stand = async (currentHand?: Card[], currentDeck?: Card[]) => {
    const handToUse = currentHand || playerHand;
    const deckToUse = currentDeck || deck;
    setGameState("dealerTurn");
    
    let newDealerHand = [...dealerHand];
    let newDeck = [...deckToUse];
    
    // Dealer draws with animation
    while (calculateHand(newDealerHand) < 17) {
      await new Promise(r => setTimeout(r, 500));
      playCardDeal();
      newDealerHand = [...newDealerHand, newDeck.pop()!];
      setDealerHand(newDealerHand);
    }
    
    setDeck(newDeck);
    
    await new Promise(r => setTimeout(r, 300));
    endGame(handToUse, newDealerHand, newDeck);
  };

  const endGame = (pHand: Card[], dHand: Card[], _deck: Card[], isBlackjack = false) => {
    const pScore = calculateHand(pHand);
    const dScore = calculateHand(dHand);
    
    setGameState("ended");
    
    if (pScore > 21) {
      saveBalance(balance - bet);
      setMessage("Sballato! Hai perso 💔");
    } else if (dScore > 21) {
      const winAmount = isBlackjack ? Math.floor(bet * 1.5) : bet;
      saveBalance(balance + winAmount);
      playWin();
      setMessage(`Dealer sballato! Hai vinto ${winAmount}€ 🎉`);
    } else if (pScore > dScore) {
      const winAmount = isBlackjack ? Math.floor(bet * 1.5) : bet;
      saveBalance(balance + winAmount);
      playWin();
      setMessage(`Hai vinto ${winAmount}€ 🎉`);
    } else if (dScore > pScore) {
      saveBalance(balance - bet);
      playLose();
      setMessage("Dealer vince 💔");
    } else {
      setMessage("Pareggio! Puntata restituita");
    }
  };

  const resetGame = () => {
    setPlayerHand([]);
    setDealerHand([]);
    setDeck([]);
    setGameState("betting");
    setMessage("");
  };

  const handleDeposit = () => {
    const amount = parseInt(depositAmount, 10);
    if (amount > 0) {
      playChip();
      saveBalance(balance + amount);
      setDepositAmount("");
    }
  };

  const adjustBet = (delta: number) => {
    playChip();
    setBet(Math.max(10, Math.min(balance, bet + delta)));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-7 hover:bg-primary/10">
            <Spade className="h-3.5 w-3.5" />
            Blackjack
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px] bg-gradient-to-b from-green-950 to-green-900 border-green-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <div className="p-1.5 rounded-lg bg-primary/20">
              <Spade className="h-5 w-5 text-primary" />
            </div>
            Blackjack
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 ml-2"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4 text-white/70" /> : <VolumeX className="h-4 w-4 text-white/40" />}
            </Button>
            <Badge variant="secondary" className="ml-auto text-lg bg-amber-600/20 text-amber-400 border-amber-500/30">
              💰 {balance}€
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Deposit */}
          <div className="flex items-center gap-2 p-2 rounded-lg bg-black/20 border border-white/10">
            <DollarSign className="h-4 w-4 text-amber-400" />
            <Input
              type="number"
              placeholder="Deposita..."
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="h-7 w-24 text-xs bg-black/30 border-white/20 text-white"
            />
            <Button size="sm" className="h-7 text-xs bg-amber-600 hover:bg-amber-500" onClick={handleDeposit}>
              Deposita
            </Button>
          </div>

          {gameState === "betting" ? (
            <div className="space-y-6 py-4">
              {/* Bet display */}
              <div className="flex items-center justify-center gap-6">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => adjustBet(-10)}
                  className="h-12 w-12 rounded-full bg-red-600/20 border-red-500/50 text-red-400 hover:bg-red-600/40"
                >
                  <Minus className="h-5 w-5" />
                </Button>
                <div className="text-center">
                  <div className="text-5xl font-bold text-white animate-pulse">{bet}€</div>
                  <div className="text-xs text-white/60 mt-1">Puntata</div>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => adjustBet(10)}
                  className="h-12 w-12 rounded-full bg-green-600/20 border-green-500/50 text-green-400 hover:bg-green-600/40"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
              
              {/* Chip buttons */}
              <div className="flex justify-center gap-3">
                {[10, 25, 50, 100].map((amount) => (
                  <ChipButton
                    key={amount}
                    amount={amount}
                    onClick={() => { playChip(); setBet(Math.min(balance, amount)); }}
                    disabled={amount > balance}
                  />
                ))}
              </div>
              
              <Button 
                className="w-full h-12 text-lg font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 transition-all duration-300 hover:scale-[1.02]" 
                onClick={startGame}
                disabled={bet > balance || isDealing}
              >
                {isDealing ? "Distribuzione..." : "Distribuisci"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Dealer */}
              <div className="text-center p-4 rounded-xl bg-black/20 border border-white/10">
                <div className="text-xs text-white/60 mb-3 uppercase tracking-wider">
                  Dealer {gameState !== "playing" && (
                    <Badge variant="outline" className="ml-2 text-white border-white/30">{dealerScore}</Badge>
                  )}
                </div>
                <div className="flex justify-center gap-2 min-h-[80px]">
                  {dealerHand.map((card, i) => (
                    <CardDisplay 
                      key={i} 
                      card={card} 
                      hidden={i === 1 && gameState === "playing"}
                      isNew={i === dealerHand.length - 1 && gameState === "dealerTurn"}
                      delay={i * 100}
                    />
                  ))}
                </div>
              </div>
              
              {/* Player */}
              <div className="text-center p-4 rounded-xl bg-black/20 border border-white/10">
                <div className="text-xs text-white/60 mb-3 uppercase tracking-wider">
                  Tu <Badge variant="outline" className={cn(
                    "ml-2 border-white/30",
                    playerScore === 21 && "bg-amber-500/20 text-amber-400 border-amber-500/50",
                    playerScore > 21 && "bg-red-500/20 text-red-400 border-red-500/50"
                  )}>{playerScore}</Badge>
                </div>
                <div className="flex justify-center gap-2 flex-wrap min-h-[80px]">
                  {playerHand.map((card, i) => (
                    <CardDisplay 
                      key={i} 
                      card={card}
                      isNew={i === newCardIndex}
                      delay={i * 100}
                    />
                  ))}
                </div>
              </div>
              
              {/* Message */}
              {message && (
                <div className={cn(
                  "text-center p-4 rounded-xl font-bold text-lg animate-in zoom-in-50 duration-300",
                  message.includes("vinto") && "bg-green-500/20 text-green-400 border border-green-500/30",
                  message.includes("perso") || message.includes("Dealer vince") ? "bg-red-500/20 text-red-400 border border-red-500/30" : "",
                  message.includes("Pareggio") && "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                )}>
                  {message}
                </div>
              )}
              
              {/* Actions */}
              <div className="flex justify-center gap-3">
                {gameState === "playing" ? (
                  <>
                    <Button 
                      onClick={hit} 
                      className="flex-1 h-12 text-lg font-bold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500"
                    >
                      Carta
                    </Button>
                    <Button 
                      onClick={() => stand()} 
                      className="flex-1 h-12 text-lg font-bold bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600"
                    >
                      Stai
                    </Button>
                  </>
                ) : gameState === "ended" ? (
                  <Button 
                    onClick={resetGame} 
                    className="flex-1 h-12 text-lg font-bold gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  >
                    <RotateCcw className="h-5 w-5" />
                    Nuova Mano
                  </Button>
                ) : (
                  <div className="text-white/60 text-sm">Turno del dealer...</div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
