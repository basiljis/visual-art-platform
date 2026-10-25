import { type ReactNode, useId } from "react";
import { DndContext, PointerSensor, KeyboardSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, useSortable, sortableKeyboardCoordinates, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SortableGallery({ ids, disabled, onMove, children }: { ids: string[]; disabled?: boolean; onMove: (active: string, over: string) => void; children: ReactNode }) {
  const id = useId();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  return <DndContext id={id} sensors={sensors} collisionDetection={closestCenter} onDragEnd={({ active, over }) => {
    if (!disabled && over && active.id !== over.id) onMove(String(active.id), String(over.id));
  }}><SortableContext items={ids} strategy={rectSortingStrategy}>{children}</SortableContext></DndContext>;
}

export function SortableGalleryItem({ id, name, disabled, children, className = "" }: { id: string; name: string; disabled?: boolean; children: ReactNode; className?: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled: disabled ?? false });
  return <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={`relative min-w-0 ${isDragging ? "z-20 opacity-60" : ""} ${className}`}>
    {!disabled && <Button type="button" variant="ghost" size="icon" {...attributes} {...listeners} aria-label={`Изменить порядок: ${name}`} title={`Переместить: ${name}`} className="absolute left-1 top-1 z-10 size-8 touch-none cursor-grab rounded-none bg-background/90 text-muted-foreground hover:text-red-accent active:cursor-grabbing"><GripVertical className="size-4" /></Button>}
    {children}
  </div>;
}