import { PipelineStage, DEFAULT_PIPELINE_STAGES } from "@/types/planner";
import { cn } from "@/lib/utils";
import { Check, ChevronRight } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PipelineStepperProps {
  stages?: PipelineStage[];
  currentStageId?: string;
  onStageClick?: (stageId: string) => void;
  compact?: boolean;
}

export const PipelineStepper = ({
  stages = DEFAULT_PIPELINE_STAGES,
  currentStageId,
  onStageClick,
  compact = false,
}: PipelineStepperProps) => {
  const sortedStages = [...stages].sort((a, b) => a.order - b.order);
  const currentIndex = sortedStages.findIndex((s) => s.id === currentStageId);

  if (compact) {
    // Compact mode: just show current stage with badge
    const currentStage = sortedStages.find((s) => s.id === currentStageId);
    const progress = currentIndex >= 0 ? Math.round(((currentIndex + 1) / sortedStages.length) * 100) : 0;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity"
              style={{
                backgroundColor: currentStage?.color
                  ? `hsl(${currentStage.color} / 0.2)`
                  : "hsl(var(--muted))",
                color: currentStage?.color
                  ? `hsl(${currentStage.color.split(" ")[0]} ${currentStage.color.split(" ")[1]} 70%)`
                  : "hsl(var(--muted-foreground))",
              }}
              onClick={() => onStageClick?.(currentStageId || sortedStages[0]?.id || "")}
            >
              <span>{currentStage?.name || "Non impostato"}</span>
              <span className="opacity-60">{progress}%</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Stato pipeline: {currentStage?.name || "Non impostato"}</p>
            <p className="text-xs text-muted-foreground">
              {currentIndex + 1}/{sortedStages.length} step completati
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="flex items-center gap-1 overflow-x-auto py-2">
      {sortedStages.map((stage, index) => {
        const isCompleted = currentIndex > index;
        const isCurrent = stage.id === currentStageId;
        const isPending = currentIndex < index;

        return (
          <div key={stage.id} className="flex items-center">
            <button
              onClick={() => onStageClick?.(stage.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                "hover:scale-105 hover:shadow-md",
                isCompleted && "bg-green-500/20 text-green-400",
                isCurrent && "ring-2 ring-primary shadow-lg",
                isPending && "opacity-50"
              )}
              style={{
                backgroundColor: isCurrent
                  ? `hsl(${stage.color || "210 100% 50%"} / 0.3)`
                  : isCompleted
                  ? undefined
                  : `hsl(${stage.color || "210 100% 50%"} / 0.1)`,
                color:
                  isCurrent || isCompleted
                    ? `hsl(${(stage.color || "210 100% 50%").split(" ")[0]} ${
                        (stage.color || "210 100% 50%").split(" ")[1]
                      } 70%)`
                    : undefined,
              }}
            >
              {isCompleted ? (
                <Check className="h-3 w-3" />
              ) : (
                <span className="w-4 h-4 rounded-full border-2 flex items-center justify-center text-[10px]">
                  {index + 1}
                </span>
              )}
              <span>{stage.name}</span>
            </button>
            {index < sortedStages.length - 1 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground/50 mx-0.5" />
            )}
          </div>
        );
      })}
    </div>
  );
};
