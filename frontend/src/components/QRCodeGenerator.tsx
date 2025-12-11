import { useEffect, useRef } from "react";

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  className?: string;
}

const QRCodeGenerator = ({ value, size = 200, className = "" }: QRCodeGeneratorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Simple QR code representation using canvas
    // In a real app, you'd use a library like qrcode
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Set canvas size
    canvas.width = size;
    canvas.height = size;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // Draw a simple grid pattern to represent QR code
    const gridSize = 20;
    const cellSize = size / gridSize;

    // Generate a simple pattern based on the value
    const pattern = generatePattern(value, gridSize);

    ctx.fillStyle = '#000000';
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (pattern[i][j]) {
          ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
        }
      }
    }

    // Add corner squares (typical QR code markers)
    drawCornerSquare(ctx, 0, 0, cellSize * 7);
    drawCornerSquare(ctx, size - cellSize * 7, 0, cellSize * 7);
    drawCornerSquare(ctx, 0, size - cellSize * 7, cellSize * 7);

  }, [value, size]);

  const generatePattern = (text: string, gridSize: number): boolean[][] => {
    const pattern: boolean[][] = Array(gridSize).fill(null).map(() => Array(gridSize).fill(false));
    
    // Simple hash-based pattern generation
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash + text.charCodeAt(i)) & 0xffffffff;
    }

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        // Skip corner areas
        if ((i < 9 && j < 9) || (i < 9 && j > gridSize - 10) || (i > gridSize - 10 && j < 9)) {
          continue;
        }
        pattern[i][j] = ((hash + i * gridSize + j) % 3) === 0;
      }
    }

    return pattern;
  };

  const drawCornerSquare = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    const squareSize = size;
    
    // Outer square
    ctx.fillStyle = '#000000';
    ctx.fillRect(x, y, squareSize, squareSize);
    
    // Inner white square
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + squareSize * 0.14, y + squareSize * 0.14, squareSize * 0.72, squareSize * 0.72);
    
    // Center black square
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + squareSize * 0.28, y + squareSize * 0.28, squareSize * 0.44, squareSize * 0.44);
  };

  return (
    <div className={`flex justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        className="border border-border rounded-lg shadow-soft"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
    </div>
  );
};

export default QRCodeGenerator;