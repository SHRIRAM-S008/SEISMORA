"use client";

import { Layers } from "lucide-react";

interface LayerControlsProps {
  layerMode: boolean;
  setLayerMode: (v: boolean) => void;
}

export function LayerControls({ layerMode, setLayerMode }: LayerControlsProps) {
  return (
    <div className="flex gap-4 mb-6">
      <button
        onClick={() => setLayerMode(!layerMode)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          layerMode 
            ? "bg-primary text-primary-foreground hover:bg-primary/90" 
            : "bg-background border border-border hover:bg-accent"
        }`}
      >
        <Layers className="h-4 w-4" />
        {layerMode ? "Exit Layer View" : "Layer View"}
      </button>
      
      {layerMode && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground ml-auto">
          <span>Viewing sliced layers in sequence</span>
        </div>
      )}
    </div>
  );
}
