interface JigsawPiece {
  canvas: HTMLCanvasElement;
  originalX: number;
  originalY: number;
  currentX: number;
  currentY: number;
  width: number;
  height: number;
  solved: boolean;
  rotation: number;
}

interface JigsawOptions {
  image: HTMLImageElement | string;
  container: HTMLElement;
  rows?: number;
  cols?: number;
  totalDuration?: number;
  maxRotation?: number;
  maxWidth?: number;
  maxHeight?: number;
}

class JigsawPuzzle {
  private options: Required<JigsawOptions>;
  private container: HTMLElement;
  private image: HTMLImageElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private pieces: JigsawPiece[] = [];
  private animationFrameId: number | null = null;
  private animationStartTime: number = 0;
  private timerElement: HTMLDivElement;
  private solvingOrder: number[] = [];
  private currentSolvingIndex: number = 0;
  private pieceMoveDuration: number = 0;
  private scaleFactor: number = 1;

  constructor(options: JigsawOptions) {
    this.options = {
      rows: 8,
      cols: 8,
      totalDuration: 20000,
      maxRotation: 45,
      maxWidth: window.innerWidth * 0.9,
      maxHeight: window.innerHeight * 0.8,
      ...options
    };

    this.container = options.container;
    this.timerElement = document.createElement('div');
    this.init();
  }

  private async init(): Promise<void> {
    if (typeof this.options.image === 'string') {
      await this.loadImage(this.options.image);
    } else {
      this.image = this.options.image;
    }

    this.calculateScaleFactor();
    this.setupCanvas();
    this.createPuzzlePieces();
    this.shufflePieces();
    this.setupTimer();
    this.setupSolvingOrder();
    this.startAnimation();
  }

  private calculateScaleFactor(): void {
    const { maxWidth, maxHeight } = this.options;
    const widthRatio = maxWidth / this.image.width;
    const heightRatio = maxHeight / this.image.height;
    this.scaleFactor = Math.min(widthRatio, heightRatio, 1); // Don't scale up if image is smaller than max dimensions
  }

  private setupSolvingOrder(): void {
    this.solvingOrder = Array.from({ length: this.pieces.length }, (_, i) => i);

    for (let i = this.solvingOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.solvingOrder[i], this.solvingOrder[j]] = [this.solvingOrder[j], this.solvingOrder[i]];
    }

    this.pieceMoveDuration = this.options.totalDuration / this.pieces.length;
  }

  private setupTimer(): void {
    this.timerElement.style.position = 'absolute';
    this.timerElement.style.bottom = '20px';
    this.timerElement.style.left = '50%';
    this.timerElement.style.transform = 'translateX(-50%)';
    this.timerElement.style.color = 'white';
    this.timerElement.style.fontSize = '24px';
    this.timerElement.style.fontFamily = 'Arial, sans-serif';
    this.timerElement.style.textShadow = '1px 1px 2px black';
    this.container.appendChild(this.timerElement);
  }

  private updateTimer(elapsed: number): void {
    const remaining = Math.max(0, this.options.totalDuration - elapsed);
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    this.timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  private async loadImage(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.image = new Image();
      this.image.crossOrigin = 'Anonymous';
      this.image.onload = () => resolve();
      this.image.onerror = reject;
      this.image.src = url;
    });
  }

  private setupCanvas(): void {
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.image.width * this.scaleFactor;
    this.canvas.height = this.image.height * this.scaleFactor;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    this.ctx = ctx;

    this.container.innerHTML = '';
    this.container.appendChild(this.canvas);
    this.container.style.position = 'relative';
    this.container.style.width = `${this.canvas.width}px`;
    this.container.style.height = `${this.canvas.height}px`;
  }

  private createPuzzlePieces(): void {
    const { rows, cols } = this.options;
    const originalPieceWidth = this.image.width / cols;
    const originalPieceHeight = this.image.height / rows;
    const scaledPieceWidth = originalPieceWidth * this.scaleFactor;
    const scaledPieceHeight = originalPieceHeight * this.scaleFactor;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const pieceCanvas = document.createElement('canvas');
        pieceCanvas.width = scaledPieceWidth;
        pieceCanvas.height = scaledPieceHeight;
        const pieceCtx = pieceCanvas.getContext('2d');
        if (!pieceCtx) continue;

        // Draw the piece from the original image to the scaled canvas
        pieceCtx.drawImage(
          this.image,
          col * originalPieceWidth,
          row * originalPieceHeight,
          originalPieceWidth,
          originalPieceHeight,
          0,
          0,
          scaledPieceWidth,
          scaledPieceHeight
        );

        this.pieces.push({
          canvas: pieceCanvas,
          originalX: col * scaledPieceWidth,
          originalY: row * scaledPieceHeight,
          currentX: col * scaledPieceWidth,
          currentY: row * scaledPieceHeight,
          width: scaledPieceWidth,
          height: scaledPieceHeight,
          solved: false,
          rotation: 0
        });
      }
    }
  }

  private shufflePieces(): void {
    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;

    this.pieces.forEach(piece => {
      piece.currentX = Math.random() * (canvasWidth * 1.5) - (canvasWidth * 0.25);
      piece.currentY = Math.random() * (canvasHeight * 1.5) - (canvasHeight * 0.25);
      piece.rotation = (Math.random() * 2 - 1) * this.options.maxRotation;
    });
  }

  private drawRotatedImage(ctx: CanvasRenderingContext2D, image: HTMLCanvasElement, x: number, y: number, angle: number): void {
    ctx.save();
    ctx.translate(x + image.width / 2, y + image.height / 2);
    ctx.rotate(angle * Math.PI / 180);
    ctx.drawImage(image, -image.width / 2, -image.height / 2);
    ctx.restore();
  }

  private startAnimation(): void {
    this.animationStartTime = performance.now();
    this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
  }

  private animate(currentTime: number): void {
    const elapsed = currentTime - this.animationStartTime;
    const totalDuration = this.options.totalDuration;

    this.updateTimer(elapsed);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.pieces.forEach((piece) => {
      if (piece.solved) {
        this.ctx.drawImage(piece.canvas, piece.originalX, piece.originalY);
      } else {
        this.drawRotatedImage(this.ctx, piece.canvas, piece.currentX, piece.currentY, piece.rotation);
      }
    });

    if (this.currentSolvingIndex < this.solvingOrder.length) {
      const currentPieceIndex = this.solvingOrder[this.currentSolvingIndex];
      const piece = this.pieces[currentPieceIndex];
      const pieceElapsed = elapsed - (this.currentSolvingIndex * this.pieceMoveDuration);
      const progress = Math.min(pieceElapsed / this.pieceMoveDuration, 1);
      const easedProgress = this.easeInOutCubic(progress);

      const x = piece.currentX + (piece.originalX - piece.currentX) * easedProgress;
      const y = piece.currentY + (piece.originalY - piece.currentY) * easedProgress;
      const rotation = piece.rotation + (0 - piece.rotation) * easedProgress;

      this.drawRotatedImage(this.ctx, piece.canvas, x, y, rotation);

      if (progress >= 1) {
        piece.solved = true;
        piece.rotation = 0;
        this.currentSolvingIndex++;
      }
    }

    if (elapsed < totalDuration) {
      this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
    } else {
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }
      this.updateTimer(totalDuration);
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.pieces.forEach(piece => {
        this.ctx.drawImage(piece.canvas, piece.originalX, piece.originalY);
      });
    }
  }

  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  public destroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.container.innerHTML = '';
  }
}

export default JigsawPuzzle;