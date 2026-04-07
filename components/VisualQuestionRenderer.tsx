
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { VisualShape } from '../types';
import { DraggableShape } from './DraggableShape';

interface VisualQuestionRendererProps {
  shapes: VisualShape[];
  submissionStatus: 'none' | 'correct' | 'incorrect';
}

export const VisualQuestionRenderer: React.FC<VisualQuestionRendererProps> = React.memo(({ shapes, submissionStatus }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [interactiveShapes, setInteractiveShapes] = useState<VisualShape[]>(shapes);

  useEffect(() => {
    setInteractiveShapes(shapes);
  }, [shapes]);

  const checkOverlap = useCallback((currentShapes: VisualShape[]): Record<string, boolean> => {
    const overlappingStatus: Record<string, boolean> = {};
    const effectiveRadius = 35; 

    if (!containerRef.current) return {};

    const containerRect = containerRef.current.getBoundingClientRect();

    currentShapes.forEach((s1, i) => {
      currentShapes.forEach((s2, j) => {
        if (i >= j) return; 

        const s1_x_px = (s1.x / 100) * containerRect.width;
        const s1_y_px = (s1.y / 100) * containerRect.height;
        const s2_x_px = (s2.x / 100) * containerRect.width;
        const s2_y_px = (s2.y / 100) * containerRect.height;

        const distance = Math.sqrt(
          Math.pow(s1_x_px - s2_x_px, 2) + Math.pow(s1_y_px - s2_y_px, 2)
        );

        if (distance < effectiveRadius) {
          overlappingStatus[s1.id] = true;
          overlappingStatus[s2.id] = true;
        }
      });
    });
    return overlappingStatus;
  }, []);

  const [overlappingShapes, setOverlappingShapes] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setOverlappingShapes(checkOverlap(interactiveShapes));
  }, [interactiveShapes, checkOverlap]);


  const handleShapeMove = useCallback((id: string, newX: number, newY: number) => {
    setInteractiveShapes(prevShapes => {
      const updatedShapes = prevShapes.map(shape =>
        shape.id === id ? { ...shape, x: newX, y: newY } : shape
      );
      return updatedShapes;
    });
  }, []);

  const containerClasses = `relative w-full h-full min-h-[180px] bg-theme-panel/30 rounded-2xl shadow-inner border border-theme-border overflow-hidden flex items-center justify-center
    ${submissionStatus === 'incorrect' ? 'animate-shake-minor' : ''}
  `;

  return (
    <div ref={containerRef} className={containerClasses}>
      {interactiveShapes.map((shape, index) => {
        const baseShapeSize = 40; 
        const actualShapeSize = (shape.size / 10) * baseShapeSize;
        
        return (
          <DraggableShape
            key={shape.id}
            shape={shape}
            index={index}
            shapeSizePx={actualShapeSize}
            submissionStatus={submissionStatus}
            containerRef={containerRef}
            onShapeMove={handleShapeMove}
            isOverlapping={overlappingShapes[shape.id] || false}
          />
        );
      })}
    </div>
  );
});
