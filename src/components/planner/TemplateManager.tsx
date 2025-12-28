import { useState } from "react";
import {
  ContentTemplate,
  ContentType,
  PipelineStage,
  ChecklistItem,
  CONTENT_TYPE_LABELS,
  DEFAULT_PIPELINE_STAGES,
  DEFAULT_VIDEO_CHECKLIST,
  Category,
} from "@/types/planner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChecklistEditor } from "./ChecklistEditor";
import { PipelineStepper } from "./PipelineStepper";
import {
  FileText,
  Plus,
  Trash2,
  Copy,
  Pencil,
  LayoutTemplate,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TemplateManagerProps {
  templates: ContentTemplate[];
  categories: Category[];
  onAddTemplate: (template: ContentTemplate) => void;
  onUpdateTemplate: (template: ContentTemplate) => void;
  onDeleteTemplate: (id: string) => void;
}

const createDefaultTemplate = (): Omit<ContentTemplate, "id"> => ({
  name: "",
  contentType: "video",
  defaultPipeline: [...DEFAULT_PIPELINE_STAGES],
  defaultChecklist: DEFAULT_VIDEO_CHECKLIST.map((item) => ({
    label: item.label,
    order: item.order,
  })),
});

export const TemplateManager = ({
  templates,
  categories,
  onAddTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
}: TemplateManagerProps) => {
  const [open, setOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ContentTemplate | null>(null);
  const [formData, setFormData] = useState<Omit<ContentTemplate, "id">>(createDefaultTemplate());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

  const handleStartAdd = () => {
    setEditingTemplate(null);
    setFormData(createDefaultTemplate());
    setOpen(true);
  };

  const handleStartEdit = (template: ContentTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      contentType: template.contentType,
      defaultCategoryId: template.defaultCategoryId,
      titlePrefix: template.titlePrefix,
      titleSuffix: template.titleSuffix,
      namingRule: template.namingRule,
      defaultPipeline: template.defaultPipeline,
      defaultChecklist: template.defaultChecklist,
      durationEstimate: template.durationEstimate,
    });
    setOpen(true);
  };

  const handleDuplicate = (template: ContentTemplate) => {
    const duplicated: ContentTemplate = {
      ...template,
      id: `template-${Date.now()}`,
      name: `${template.name} (copia)`,
    };
    onAddTemplate(duplicated);
  };

  const handleSave = () => {
    if (!formData.name.trim()) return;

    if (editingTemplate) {
      onUpdateTemplate({
        ...formData,
        id: editingTemplate.id,
      });
    } else {
      onAddTemplate({
        ...formData,
        id: `template-${Date.now()}`,
      });
    }
    setOpen(false);
  };

  const handleDeleteClick = (id: string) => {
    setTemplateToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (templateToDelete) {
      onDeleteTemplate(templateToDelete);
    }
    setDeleteDialogOpen(false);
    setTemplateToDelete(null);
  };

  const handleChecklistChange = (items: ChecklistItem[]) => {
    setFormData({
      ...formData,
      defaultChecklist: items.map(({ label, order, dueDate }) => ({
        label,
        order,
        dueDate,
      })),
    });
  };

  return (
    <>
      <Button variant="outline" onClick={handleStartAdd} className="gap-2">
        <LayoutTemplate className="h-4 w-4" />
        Template
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Modifica Template" : "Nuovo Template"}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="general" className="w-full">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="general">Generale</TabsTrigger>
              <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
              <TabsTrigger value="checklist">Checklist</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome Template</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="es. Video YouTube Standard"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo Contenuto</Label>
                  <Select
                    value={formData.contentType}
                    onValueChange={(v) =>
                      setFormData({ ...formData, contentType: v as ContentType })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CONTENT_TYPE_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categoria Default</Label>
                  <Select
                    value={formData.defaultCategoryId || "none"}
                    onValueChange={(v) =>
                      setFormData({
                        ...formData,
                        defaultCategoryId: v === "none" ? undefined : v,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Nessuna" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nessuna</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: `hsl(${cat.color})` }}
                            />
                            {cat.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Durata Stimata (min)</Label>
                  <Input
                    type="number"
                    value={formData.durationEstimate || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        durationEstimate: e.target.value
                          ? parseInt(e.target.value)
                          : undefined,
                      })
                    }
                    placeholder="es. 15"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prefisso Titolo</Label>
                  <Input
                    value={formData.titlePrefix || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, titlePrefix: e.target.value })
                    }
                    placeholder="es. [MINECRAFT]"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Suffisso Titolo</Label>
                  <Input
                    value={formData.titleSuffix || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, titleSuffix: e.target.value })
                    }
                    placeholder="es. - Ep. {n}"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Regola Naming (per serie/shorts)</Label>
                <Input
                  value={formData.namingRule || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, namingRule: e.target.value })
                  }
                  placeholder="es. -Short {i}: {parent_title}"
                />
                <p className="text-xs text-muted-foreground">
                  Placeholder: {"{i}"} = numero, {"{parent_title}"} = titolo
                  padre, {"{date}"} = data, {"{series_n}"} = numero serie
                </p>
              </div>
            </TabsContent>

            <TabsContent value="pipeline" className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">
                Definisci gli stati della pipeline per questo template.
              </p>
              <PipelineStepper
                stages={formData.defaultPipeline}
                currentStageId={formData.defaultPipeline[0]?.id}
              />
              <p className="text-xs text-muted-foreground">
                La pipeline di default viene utilizzata per tutti i contenuti
                creati con questo template.
              </p>
            </TabsContent>

            <TabsContent value="checklist" className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">
                Definisci la checklist predefinita per questo template.
              </p>
              <ChecklistEditor
                items={formData.defaultChecklist.map((item, idx) => ({
                  id: `temp-${idx}`,
                  label: item.label,
                  isDone: false,
                  order: item.order,
                }))}
                onChange={handleChecklistChange}
              />
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annulla
            </Button>
            <Button onClick={handleSave}>
              {editingTemplate ? "Salva Modifiche" : "Crea Template"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Template List Dialog */}
      {templates.length > 0 && (
        <Dialog>
          <Button variant="ghost" size="sm" className="gap-2" asChild>
            <span onClick={() => {}}>
              <FileText className="h-4 w-4" />
              {templates.length} template
            </span>
          </Button>
        </Dialog>
      )}

      {/* Inline template list in main dialog */}
      {open && templates.length > 0 && (
        <div className="border-t pt-4 mt-4">
          <h4 className="font-semibold text-sm mb-3">Template Esistenti</h4>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {templates.map((template) => (
              <div
                key={template.id}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium">{template.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {CONTENT_TYPE_LABELS[template.contentType]} •{" "}
                    {template.defaultChecklist.length} checklist items
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleStartEdit(template)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDuplicate(template)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteClick(template.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Elimina Template</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare questo template? I contenuti già
              creati non saranno influenzati.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
