import { useState, useMemo } from "react";
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
import { Spade, RotateCcw, Plus, Minus, DollarSign } from "lucide-react";
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

const CardDisplay = ({ card, hidden = false }: { card: Card; hidden?: boolean }) => {
  const isRed = card.suit === "♥" || card.suit === "♦";
  
  if (hidden) {
    return (
      <div className="w-14 h-20 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold shadow-md">
        ?
      </div>
    );
  }
  
  return (
    <div className={cn(
      "w-14 h-20 rounded-lg bg-card border-2 border-border flex flex-col items-center justify-center shadow-md",
      isRed ? "text-red-500" : "text-foreground"
    )}>
      <span className="text-lg font-bold">{card.value}</span>
      <span className="text-xl">{card.suit}</span>
    </div>
  );
};

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

  const playerScore = calculateHand(playerHand);
  const dealerScore = calculateHand(dealerHand);

  const saveBalance = (newBalance: number) => {
    setBalance(newBalance);
    localStorage.setItem("blackjack-balance", newBalance.toString());
  };

  const startGame = () => {
    if (bet > balance) {
      setMessage("Saldo insufficiente!");
      return;
    }
    
    const newDeck = shuffleDeck(createDeck());
    const pHand = [newDeck.pop()!, newDeck.pop()!];
    const dHand = [newDeck.pop()!, newDeck.pop()!];
    
    setDeck(newDeck);
    setPlayerHand(pHand);
    setDealerHand(dHand);
    setGameState("playing");
    setMessage("");
    
    if (calculateHand(pHand) === 21) {
      endGame(pHand, dHand, newDeck, true);
    }
  };

  const hit = () => {
    const newDeck = [...deck];
    const newHand = [...playerHand, newDeck.pop()!];
    setDeck(newDeck);
    setPlayerHand(newHand);
    
    const score = calculateHand(newHand);
    if (score > 21) {
      saveBalance(balance - bet);
      setGameState("ended");
      setMessage("Sballato! Hai perso 💔");
    } else if (score === 21) {
      stand(newHand, newDeck);
    }
  };

  const stand = (currentHand?: Card[], currentDeck?: Card[]) => {
    const handToUse = currentHand || playerHand;
    const deckToUse = currentDeck || deck;
    setGameState("dealerTurn");
    
    let newDealerHand = [...dealerHand];
    let newDeck = [...deckToUse];
    
    while (calculateHand(newDealerHand) < 17) {
      newDealerHand.push(newDeck.pop()!);
    }
    
    setDealerHand(newDealerHand);
    setDeck(newDeck);
    
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
      setMessage(`Dealer sballato! Hai vinto ${winAmount}€ 🎉`);
    } else if (pScore > dScore) {
      const winAmount = isBlackjack ? Math.floor(bet * 1.5) : bet;
      saveBalance(balance + winAmount);
      setMessage(`Hai vinto ${winAmount}€ 🎉`);
    } else if (dScore > pScore) {
      saveBalance(balance - bet);
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
      saveBalance(balance + amount);
      setDepositAmount("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-7">
            <Spade className="h-3.5 w-3.5" />
            Blackjack
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Spade className="h-5 w-5" />
            Blackjack
            <Badge variant="secondary" className="ml-auto text-lg">
              💰 {balance}€
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Deposit */}
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <Input
              type="number"
              placeholder="Deposita..."
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="h-7 w-24 text-xs"
            />
            <Button size="sm" className="h-7 text-xs" onClick={handleDeposit}>
              Deposita
            </Button>
          </div>

          {gameState === "betting" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setBet(Math.max(10, bet - 10))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="text-center">
                  <div className="text-3xl font-bold">{bet}€</div>
                  <div className="text-xs text-muted-foreground">Puntata</div>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setBet(Math.min(balance, bet + 10))}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex justify-center gap-2">
                {[10, 25, 50, 100].map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => setBet(Math.min(balance, amount))}
                    className="text-xs"
                  >
                    {amount}€
                  </Button>
                ))}
              </div>
              
              <Button 
                className="w-full" 
                onClick={startGame}
                disabled={bet > balance}
              >
                Distribuisci
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Dealer */}
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-2">
                  Dealer {gameState !== "playing" && `(${dealerScore})`}
                </div>
                <div className="flex justify-center gap-2">
                  {dealerHand.map((card, i) => (
                    <CardDisplay 
                      key={i} 
                      card={card} 
                      hidden={i === 1 && gameState === "playing"} 
                    />
                  ))}
                </div>
              </div>
              
              {/* Player */}
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-2">
                  Tu ({playerScore})
                </div>
                <div className="flex justify-center gap-2 flex-wrap">
                  {playerHand.map((card, i) => (
                    <CardDisplay key={i} card={card} />
                  ))}
                </div>
              </div>
              
              {/* Message */}
              {message && (
                <div className="text-center p-3 rounded-lg bg-muted font-medium">
                  {message}
                </div>
              )}
              
              {/* Actions */}
              <div className="flex justify-center gap-2">
                {gameState === "playing" ? (
                  <>
                    <Button onClick={hit} variant="default">
                      Carta
                    </Button>
                    <Button onClick={() => stand()} variant="secondary">
                      Stai
                    </Button>
                  </>
                ) : (
                  <Button onClick={resetGame} className="gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Nuova Mano
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
