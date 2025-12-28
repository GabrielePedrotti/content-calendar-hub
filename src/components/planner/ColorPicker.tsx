import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Pipette } from "lucide-react";

interface ColorPickerProps {
  value: string; // HSL format: "142 76% 45%"
  onChange: (value: string) => void;
}

const presetColors = [
  "0 70% 50%",      // Red
  "25 95% 53%",     // Orange
  "45 95% 50%",     // Yellow
  "142 76% 45%",    // Green
  "180 70% 45%",    // Cyan
  "210 100% 50%",   // Blue
  "240 60% 55%",    // Indigo
  "270 60% 55%",    // Purple
  "300 70% 55%",    // Pink
  "330 70% 50%",    // Rose
];

export const ColorPicker = ({ value, onChange }: ColorPickerProps) => {
  const [open, setOpen] = useState(false);
  const [hue, setHue] = useState(210);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(50);

  // Parse initial HSL value
  useEffect(() => {
    const match = value.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
    if (match) {
      setHue(parseInt(match[1]));
      setSaturation(parseInt(match[2]));
      setLightness(parseInt(match[3]));
    }
  }, [value]);

  const updateColor = (h: number, s: number, l: number) => {
    setHue(h);
    setSaturation(s);
    setLightness(l);
    onChange(`${h} ${s}% ${l}%`);
  };

  const handlePresetClick = (preset: string) => {
    const match = preset.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
    if (match) {
      updateColor(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]));
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
        >
          <div
            className="w-6 h-6 rounded border border-border"
            style={{ backgroundColor: `hsl(${value})` }}
          />
          <span className="flex-1 text-left font-mono text-sm">{value}</span>
          <Pipette className="h-4 w-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="start">
        <div className="space-y-4">
          {/* Color Preview */}
          <div
            className="h-16 w-full rounded-lg border"
            style={{ backgroundColor: `hsl(${hue} ${saturation}% ${lightness}%)` }}
          />

          {/* Preset Colors */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Colori predefiniti</Label>
            <div className="grid grid-cols-5 gap-2">
              {presetColors.map((color) => (
                <button
                  key={color}
                  onClick={() => handlePresetClick(color)}
                  className="w-8 h-8 rounded-lg border border-border hover:scale-110 transition-transform"
                  style={{ backgroundColor: `hsl(${color})` }}
                />
              ))}
            </div>
          </div>

          {/* Hue Slider */}
          <div className="space-y-2">
            <Label className="text-xs">Tonalità: {hue}°</Label>
            <div
              className="h-3 rounded-full"
              style={{
                background: `linear-gradient(to right, 
                  hsl(0 ${saturation}% ${lightness}%), 
                  hsl(60 ${saturation}% ${lightness}%), 
                  hsl(120 ${saturation}% ${lightness}%), 
                  hsl(180 ${saturation}% ${lightness}%), 
                  hsl(240 ${saturation}% ${lightness}%), 
                  hsl(300 ${saturation}% ${lightness}%), 
                  hsl(360 ${saturation}% ${lightness}%))`,
              }}
            >
              <Slider
                value={[hue]}
                min={0}
                max={360}
                step={1}
                onValueChange={([v]) => updateColor(v, saturation, lightness)}
                className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
              />
            </div>
          </div>

          {/* Saturation Slider */}
          <div className="space-y-2">
            <Label className="text-xs">Saturazione: {saturation}%</Label>
            <div
              className="h-3 rounded-full"
              style={{
                background: `linear-gradient(to right, 
                  hsl(${hue} 0% ${lightness}%), 
                  hsl(${hue} 100% ${lightness}%))`,
              }}
            >
              <Slider
                value={[saturation]}
                min={0}
                max={100}
                step={1}
                onValueChange={([v]) => updateColor(hue, v, lightness)}
                className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
              />
            </div>
          </div>

          {/* Lightness Slider */}
          <div className="space-y-2">
            <Label className="text-xs">Luminosità: {lightness}%</Label>
            <div
              className="h-3 rounded-full"
              style={{
                background: `linear-gradient(to right, 
                  hsl(${hue} ${saturation}% 0%), 
                  hsl(${hue} ${saturation}% 50%), 
                  hsl(${hue} ${saturation}% 100%))`,
              }}
            >
              <Slider
                value={[lightness]}
                min={10}
                max={90}
                step={1}
                onValueChange={([v]) => updateColor(hue, saturation, v)}
                className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
              />
            </div>
          </div>

          {/* Manual Input */}
          <div className="space-y-2">
            <Label className="text-xs">HSL manuale</Label>
            <Input
              value={`${hue} ${saturation}% ${lightness}%`}
              onChange={(e) => {
                const match = e.target.value.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
                if (match) {
                  updateColor(
                    parseInt(match[1]),
                    parseInt(match[2]),
                    parseInt(match[3])
                  );
                }
              }}
              className="font-mono text-sm"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
