import { useState } from "react";
import { PipelineStage } from "@/types/planner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface PipelineEditorProps {
  stages: PipelineStage[];
  onChange: (stages: PipelineStage[]) => void;
}

const DEFAULT_SIMPLE_STAGES: PipelineStage[] = [
  { id: "todo", name: "Da fare", order: 0, color: "220 15% 50%" },
  { id: "in_progress", name: "In Corso", order: 1, color: "45 95% 50%" },
  { id: "completed", name: "Completato", order: 2, color: "142 76% 45%" },
];

export const PipelineEditor = ({ stages, onChange }: PipelineEditorProps) => {
  const [newStageName, setNewStageName] = useState("");

  const handleAddStage = () => {
    if (!newStageName.trim()) return;
    const newStage: PipelineStage = {
      id: `stage-${Date.now()}`,
      name: newStageName.trim(),
      order: stages.length,
      color: "210 100% 50%",
    };
    onChange([...stages, newStage]);
    setNewStageName("");
  };

  const handleRemoveStage = (id: string) => {
    const filtered = stages.filter((s) => s.id !== id);
    // Reorder
    const reordered = filtered.map((s, idx) => ({ ...s, order: idx }));
    onChange(reordered);
  };

  const handleUpdateName = (id: string, name: string) => {
    onChange(stages.map((s) => (s.id === id ? { ...s, name } : s)));
  };

  const handleResetToDefault = () => {
    onChange([...DEFAULT_SIMPLE_STAGES]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Definisci gli stati della pipeline
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleResetToDefault}
          className="text-xs"
        >
          Reset Default
        </Button>
      </div>

      <div className="space-y-2">
        {stages.map((stage, idx) => (
          <div
            key={stage.id}
            className="flex items-center gap-2 p-2 rounded-md border bg-muted/30"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: `hsl(${stage.color || "210 100% 50%"})` }}
            />
            <Input
              value={stage.name}
              onChange={(e) => handleUpdateName(stage.id, e.target.value)}
              className="h-8 text-sm flex-1"
            />
            <span className="text-xs text-muted-foreground w-6 text-center">
              {idx + 1}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => handleRemoveStage(stage.id)}
              disabled={stages.length <= 1}
            >
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          value={newStageName}
          onChange={(e) => setNewStageName(e.target.value)}
          placeholder="Nuovo stato..."
          className="h-8 text-sm"
          onKeyDown={(e) => e.key === "Enter" && handleAddStage()}
        />
        <Button size="sm" onClick={handleAddStage} className="gap-1 h-8">
          <Plus className="h-3.5 w-3.5" />
          Aggiungi
        </Button>
      </div>
    </div>
  );
};

export { DEFAULT_SIMPLE_STAGES };
