// Teletext/Ceefax renderer with bitmap font and Mode 7 palette
// 40×24 character grid, classic UK Teletext style

export const TELETEXT_COLORS = {
  BLACK: '#000000',
  RED: '#ff0000',
  GREEN: '#00ff00',
  YELLOW: '#ffff00',
  BLUE: '#0000ff',
  MAGENTA: '#ff00ff',
  CYAN: '#00ffff',
  WHITE: '#ffffff',
};

export const CHAR_WIDTH = 16;  // Pixels per character
export const CHAR_HEIGHT = 20; // Pixels per character
export const GRID_COLS = 40;
export const GRID_ROWS = 24;
export const CANVAS_WIDTH = GRID_COLS * CHAR_WIDTH;
export const CANVAS_HEIGHT = GRID_ROWS * CHAR_HEIGHT;

// Simple bitmap font renderer (Mode 7 style)
export function drawChar(ctx, char, x, y, fgColor, bgColor) {
  const charX = x * CHAR_WIDTH;
  const charY = y * CHAR_HEIGHT;

  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(charX, charY, CHAR_WIDTH, CHAR_HEIGHT);

  // Character (using system font styled to look bitmap)
  ctx.fillStyle = fgColor;
  ctx.font = 'bold 16px monospace';
  ctx.textBaseline = 'top';
  ctx.fillText(char, charX + 2, charY + 2);
}

// Draw block graphics (mosaic mode)
export function drawBlock(ctx, x, y, color, pattern) {
  const charX = x * CHAR_WIDTH;
  const charY = y * CHAR_HEIGHT;

  ctx.fillStyle = color;

  // Pattern is a 2x3 grid (6 blocks)
  const blockWidth = CHAR_WIDTH / 2;
  const blockHeight = CHAR_HEIGHT / 3;

  for (let by = 0; by < 3; by++) {
    for (let bx = 0; bx < 2; bx++) {
      const bit = pattern & (1 << (by * 2 + bx));
      if (bit) {
        ctx.fillRect(
          charX + bx * blockWidth,
          charY + by * blockHeight,
          blockWidth,
          blockHeight
        );
      }
    }
  }
}

// Render a full Teletext page
export function renderTeletextPage(ctx, pageData) {
  // Clear to black
  ctx.fillStyle = TELETEXT_COLORS.BLACK;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Render each cell
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      const cell = pageData.grid?.[row]?.[col];
      if (!cell) continue;

      const char = cell.char || ' ';
      const fg = cell.fg || TELETEXT_COLORS.WHITE;
      const bg = cell.bg || TELETEXT_COLORS.BLACK;

      if (cell.block) {
        // Mosaic graphics mode
        drawBlock(ctx, col, row, fg, cell.pattern || 0);
      } else {
        // Text mode
        drawChar(ctx, char, col, row, fg, bg);
      }
    }
  }
}

// Helper to create page data structure
export function createTeletextPage(title, content) {
  const grid = [];

  // Initialize empty grid
  for (let row = 0; row < GRID_ROWS; row++) {
    grid[row] = [];
    for (let col = 0; col < GRID_COLS; col++) {
      grid[row][col] = { char: ' ', fg: TELETEXT_COLORS.WHITE, bg: TELETEXT_COLORS.BLACK };
    }
  }

  // Header row (row 0)
  const header = `P${content.pageNumber || '100'} ${title}`.padEnd(GRID_COLS);
  for (let col = 0; col < GRID_COLS; col++) {
    grid[0][col] = {
      char: header[col],
      fg: TELETEXT_COLORS.WHITE,
      bg: TELETEXT_COLORS.BLUE,
    };
  }

  // Separator (row 1)
  for (let col = 0; col < GRID_COLS; col++) {
    grid[1][col] = {
      char: '═',
      fg: TELETEXT_COLORS.CYAN,
      bg: TELETEXT_COLORS.BLACK,
    };
  }

  // Content lines
  if (content.lines) {
    content.lines.forEach((line, idx) => {
      const row = idx + 2;
      if (row >= GRID_ROWS) return;

      const text = line.text || '';
      const fg = TELETEXT_COLORS[line.color?.toUpperCase()] || TELETEXT_COLORS.WHITE;
      const bg = TELETEXT_COLORS[line.bg?.toUpperCase()] || TELETEXT_COLORS.BLACK;

      for (let col = 0; col < Math.min(text.length, GRID_COLS); col++) {
        grid[row][col] = {
          char: text[col],
          fg: fg,
          bg: bg,
        };
      }
    });
  }

  return { grid, pageNumber: content.pageNumber || '100' };
}

// Generate mock migration progress (0-100%)
function getMockProgress(projectName) {
  // Use project name hash for consistent progress
  let hash = 0;
  for (let i = 0; i < projectName.length; i++) {
    hash = ((hash << 5) - hash) + projectName.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash % 100);
}

// Generate mock migration status
function getMigrationStatus(progress) {
  if (progress < 30) return 'INITIALIZING';
  if (progress < 60) return 'MIGRATING';
  if (progress < 90) return 'FINALIZING';
  return 'COMPLETE';
}

// Sample page templates
export const SAMPLE_PAGES = {
  dashboard: (bottles, selectedIndex = -1) => {
    const lines = [
      { text: '  MIGRATION PROGRESS', color: 'YELLOW' },
      { text: '' },
    ];

    if (bottles.length === 0) {
      lines.push({ text: '  No projects in queue', color: 'CYAN' });
    } else {
      bottles.slice(0, 5).forEach((bottle, idx) => {
        const progress = getMockProgress(bottle.projectName);
        const status = getMigrationStatus(progress);
        const isSelected = idx === selectedIndex;

        // Project name line
        const projectLine = `${idx + 1}. ${bottle.projectName.substring(0, 32)}`;
        lines.push({
          text: isSelected ? `>${projectLine}` : ` ${projectLine}`,
          color: isSelected ? 'BLACK' : 'WHITE',
          bg: isSelected ? 'GREEN' : 'BLACK',
        });

        // Progress bar
        const barWidth = 28;
        const filled = Math.floor((progress / 100) * barWidth);
        const bar = '█'.repeat(filled) + '░'.repeat(barWidth - filled);
        lines.push({
          text: `  [${bar}] ${progress}%`,
          color: progress >= 90 ? 'GREEN' : progress >= 60 ? 'YELLOW' : 'CYAN',
        });

        // Status line
        lines.push({
          text: `  Status: ${status}`,
          color: progress >= 90 ? 'GREEN' : 'WHITE',
        });

        lines.push({ text: '' });
      });

      // Instructions at bottom
      lines.push({ text: '════════════════════════════════════════', color: 'CYAN' });
      if (selectedIndex >= 0) {
        lines.push({ text: ' [ENTER] Details | [↑↓] Navigate', color: 'YELLOW' });
      } else {
        lines.push({ text: ' [↑↓] Select | [ENTER] View Details', color: 'CYAN' });
      }
    }

    return createTeletextPage('MIGRATION QUEUE', {
      pageNumber: '100',
      lines,
    });
  },

  projectDetails: (bottle) => {
    const progress = getMockProgress(bottle.projectName);
    const status = getMigrationStatus(progress);

    const lines = [
      { text: `  ${bottle.projectName}`, color: 'YELLOW' },
      { text: '' },
      { text: '  MIGRATION DETAILS', color: 'CYAN' },
      { text: '' },
      { text: `  Progress: ${progress}%`, color: 'WHITE' },
      { text: `  Status: ${status}`, color: progress >= 90 ? 'GREEN' : 'YELLOW' },
      { text: '' },
      { text: '  COMPONENTS:', color: 'CYAN' },
      { text: '  ✓ Docker Images', color: 'GREEN' },
      { text: progress >= 40 ? '  ✓ Kubernetes Configs' : '  ⧗ Kubernetes Configs', color: progress >= 40 ? 'GREEN' : 'YELLOW' },
      { text: progress >= 60 ? '  ✓ Database Migration' : '  ⧗ Database Migration', color: progress >= 60 ? 'GREEN' : 'YELLOW' },
      { text: progress >= 80 ? '  ✓ Load Balancer Setup' : '  ⧗ Load Balancer Setup', color: progress >= 80 ? 'GREEN' : 'YELLOW' },
      { text: '' },
      { text: '  RESOURCES:', color: 'CYAN' },
      { text: '  CPU: 2 cores', color: 'WHITE' },
      { text: '  Memory: 4GB', color: 'WHITE' },
      { text: '  Storage: 20GB', color: 'WHITE' },
      { text: '' },
      { text: '════════════════════════════════════════', color: 'CYAN' },
      { text: ' [ESC] Back to List', color: 'YELLOW' },
    ];

    return createTeletextPage('PROJECT DETAILS', {
      pageNumber: '100',
      lines,
    });
  },

  projects: (bottles) => createTeletextPage('PROJECT QUEUE', {
    pageNumber: '101',
    lines: [
      { text: '  INCOMING PROJECTS', color: 'YELLOW' },
      { text: '' },
      ...bottles.slice(0, 15).map((bottle, idx) => ({
        text: `  ${idx + 1}. ${bottle.projectName}`,
        color: idx % 2 === 0 ? 'WHITE' : 'CYAN',
      })),
    ],
  }),

  network: (stats) => createTeletextPage('NETWORK STATUS', {
    pageNumber: '102',
    lines: [
      { text: '  NETWORK DIAGNOSTICS', color: 'YELLOW' },
      { text: '' },
      { text: '  Kubernetes Cluster', color: 'CYAN' },
      { text: '    Status: ONLINE', color: 'GREEN' },
      { text: '    Nodes: 3/3', color: 'WHITE' },
      { text: '' },
      { text: '  Docker Registry', color: 'CYAN' },
      { text: '    Status: ONLINE', color: 'GREEN' },
      { text: '    Images: 42', color: 'WHITE' },
      { text: '' },
      { text: '  Load Balancer', color: 'CYAN' },
      { text: '    Status: ONLINE', color: 'GREEN' },
      { text: '    Traffic: NORMAL', color: 'WHITE' },
    ],
  }),
};
