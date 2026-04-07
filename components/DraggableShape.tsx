

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { VisualShape, VisualShapeType } from '../types';
import { Icons } from './Icons';

interface DraggableShapeProps {
  shape: VisualShape;
  index: number;
  shapeSizePx: number; // Actual pixel size, passed from parent
  submissionStatus: 'none' | 'correct' | 'incorrect';
  containerRef: React.RefObject<HTMLDivElement>; // Reference to the parent container for bounds
  onShapeMove: (id: string, newX: number, newY: number) => void; // Callback to report new position
  isOverlapping: boolean; // New prop for overlap status
}

export const DraggableShape: React.FC<DraggableShapeProps> = ({
  shape,
  index,
  shapeSizePx,
  submissionStatus,
  containerRef,
  onShapeMove,
  isOverlapping,
}) => {
  const shapeRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [currentX, setCurrentX] = useState(shape.x); // x in percentage
  const [currentY, setCurrentY] = useState(shape.y); // y in percentage
  const [offsetX, setOffsetX] = useState(0); // Offset from pointer to shape's center (in pixels)
  const [offsetY, setOffsetY] = useState(0); // Offset from pointer to shape's center (in pixels)
  const animationFrameRef = useRef<number | null>(null);


  // Re-initialize position if shape props change (e.g., new question)
  useEffect(() => {
    setCurrentX(shape.x);
    setCurrentY(shape.y);
  }, [shape.x, shape.y]);

  const startDrag = useCallback((clientX: number, clientY: number) => {
    if (!shapeRef.current || !containerRef.current) return;

    setIsDragging(true);

    const containerRect = containerRef.current.getBoundingClientRect();
    const shapeRect = shapeRef.current.getBoundingClientRect();

    // Calculate offset from pointer to the center of the shape
    const shapeCenterX = shapeRect.left + shapeRect.width / 2;
    const shapeCenterY = shapeRect.top + shapeRect.height / 2;
    
    setOffsetX(clientX - shapeCenterX);
    setOffsetY(clientY - shapeCenterY);

    document.documentElement.style.cursor = 'grabbing';
  }, [containerRef]);

  const doDrag = useCallback((clientX: number, clientY: number) => {
    if (!isDragging || !containerRef.current || !shapeRef.current) return;

    if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
        const containerRect = containerRef.current!.getBoundingClientRect();
        const shapeWidth = shapeSizePx;
        const shapeHeight = shapeSizePx;

        // Calculate new position for the center of the shape relative to container's top-left
        let newCenterX = clientX - containerRect.left - offsetX;
        let newCenterY = clientY - containerRect.top - offsetY;

        // Clamp values within container bounds to keep the *center* of the shape inside
        newCenterX = Math.max(shapeWidth / 2, Math.min(containerRect.width - shapeWidth / 2, newCenterX));
        newCenterY = Math.max(shapeHeight / 2, Math.min(containerRect.height - shapeHeight / 2, newCenterY));
        
        // Convert back to percentage for consistent internal state
        const finalX = (newCenterX / containerRect.width) * 100;
        const finalY = (newCenterY / containerRect.height) * 100;

        setCurrentX(finalX);
        setCurrentY(finalY);
        onShapeMove(shape.id, finalX, finalY); // Report new position to parent
    });
  }, [isDragging, containerRef, offsetX, offsetY, shapeSizePx, onShapeMove, shape.id]);

  const endDrag = useCallback(() => {
    setIsDragging(false);
    document.documentElement.style.cursor = '';
    if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  // Mouse event handlers
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); // Prevent text selection etc.
    startDrag(e.clientX, e.clientY);
  }, [startDrag]);

  // Touch event handlers
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling
    if (e.touches.length === 1) {
      startDrag(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, [startDrag]);

  // Global event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      const handleMouseMove = (e: MouseEvent) => doDrag(e.clientX, e.clientY);
      const handleTouchMove = (e: TouchEvent) => {
        if (e.touches.length === 1) doDrag(e.touches[0].clientX, e.touches[0].clientY);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', endDrag);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', endDrag);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', endDrag);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', endDrag);
      };
    }
  }, [isDragging, doDrag, endDrag]);

  // Determine animation class
  let animationClass = '';
  if (submissionStatus === 'correct') {
    animationClass = 'animate-squish-bounce'; // Playful bounce on correct answer
  } else if (isDragging) {
    animationClass = 'scale-110'; // Slightly larger when dragging
  } else {
    // Default idle animations for visual interest
    if (shape.type === VisualShapeType.DOT) {
      animationClass = 'animate-float';
    } else if (shape.type === VisualShapeType.TRIANGLE) {
      animationClass = 'animate-float-delayed animate-rotate-slow';
    } else if (shape.type === VisualShapeType.STAR) {
      animationClass = 'animate-float-delayed animate-neon-glow-ring'; // Stars also twinkle
    }
  }

  // Determine the SVG icon component
  const IconComponent =
    shape.type === VisualShapeType.DOT
      ? Icons.Circle
      : shape.type === VisualShapeType.TRIANGLE
      ? Icons.Triangle
      : Icons.Star;

  return (
    <div
      ref={shapeRef}
      className={`absolute flex items-center justify-center text-white drop-shadow-md transition-all duration-300 shadow-lg cursor-grab active:cursor-grabbing rounded-full
        ${shape.color} ${animationClass} ${isOverlapping ? 'ring-2 ring-red-400' : ''}`}
      style={{
        left: `${currentX}%`,
        top: `${currentY}%`,
        transform: `translate(-50%, -50%) rotate(${shape.rotation || 0}deg)`,
        animationDelay: `${index * 0.05}s`,
        width: `${shapeSizePx}px`,
        height: `${shapeSizePx}px`,
      }}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      aria-grabbed={isDragging}
      tabIndex={0}
      role="button"
      aria-label={`${shape.type} number ${index + 1}${isOverlapping ? ', overlapping' : ''}`}
    >
      <IconComponent className="w-full h-full fill-current" />
    </div>
  );
};
