import { useState } from "react";
import { ChecklistItem } from "@/types/planner";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChecklistEditorProps {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
  readOnly?: boolean;
}

export const ChecklistEditor = ({
  items,
  onChange,
  readOnly = false,
}: ChecklistEditorProps) => {
  const [newItemLabel, setNewItemLabel] = useState("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const sortedItems = [...items].sort((a, b) => a.order - b.order);
  const completedCount = items.filter((i) => i.isDone).length;
  const progress = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  const handleToggle = (id: string) => {
    onChange(
      items.map((item) =>
        item.id === id ? { ...item, isDone: !item.isDone } : item
      )
    );
  };

  const handleAdd = () => {
    if (!newItemLabel.trim()) return;
    const newItem: ChecklistItem = {
      id: `checklist-${Date.now()}`,
      label: newItemLabel.trim(),
      isDone: false,
      order: items.length,
    };
    onChange([...items, newItem]);
    setNewItemLabel("");
  };

  const handleDelete = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const handleLabelChange = (id: string, newLabel: string) => {
    onChange(
      items.map((item) =>
        item.id === id ? { ...item, label: newLabel } : item
      )
    );
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const newItems = [...sortedItems];
    const [removed] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, removed);

    // Update order values
    const reordered = newItems.map((item, idx) => ({ ...item, order: idx }));
    onChange(reordered);
    setDraggedIndex(targetIndex);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Progresso</span>
          <span>
            {completedCount}/{items.length} ({progress}%)
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Checklist items */}
      <div className="space-y-1 max-h-[300px] overflow-y-auto">
        {sortedItems.map((item, index) => (
          <div
            key={item.id}
            draggable={!readOnly}
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={cn(
              "flex items-center gap-2 p-2 rounded-lg border border-border/50 transition-all",
              "hover:border-border hover:bg-muted/30",
              item.isDone && "opacity-60",
              draggedIndex === index && "ring-2 ring-primary opacity-50"
            )}
          >
            {!readOnly && (
              <GripVertical className="h-4 w-4 text-muted-foreground/50 cursor-grab flex-shrink-0" />
            )}
            <Checkbox
              checked={item.isDone}
              onCheckedChange={() => handleToggle(item.id)}
              disabled={readOnly}
            />
            {readOnly ? (
              <span
                className={cn(
                  "flex-1 text-sm",
                  item.isDone && "line-through text-muted-foreground"
                )}
              >
                {item.label}
              </span>
            ) : (
              <Input
                value={item.label}
                onChange={(e) => handleLabelChange(item.id, e.target.value)}
                className={cn(
                  "flex-1 h-8 text-sm border-0 bg-transparent focus-visible:ring-0 px-0",
                  item.isDone && "line-through text-muted-foreground"
                )}
              />
            )}
            {!readOnly && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={() => handleDelete(item.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Add new item */}
      {!readOnly && (
        <div className="flex gap-2">
          <Input
            placeholder="Aggiungi item..."
            value={newItemLabel}
            onChange={(e) => setNewItemLabel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="flex-1"
          />
          <Button size="sm" onClick={handleAdd}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
