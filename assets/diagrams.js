(function() {
'use strict';

// ═══════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════
var BUBBLE = {
    realW: 360, realH: 400,
    padTop: 22, padLeft: 28, padRight: 30, padBottom: 28,
    scale: 1.5,
    cornerZone: 40,
    tailStartY: 368, tailTipX: 360, tailTipY: 384,
    tailEndY: 400, tailBodyX: 336,
    cornerRadius: 20,
    innerPadding: 20,
    safeAreaX: 40, safeAreaY: 84,
    safeAreaW: 280, safeAreaH: 232,
    innerPadW: 296, innerPadH: 356
};

var FRAME = {
    realSize: 360,
    padTop: 30, padLeft: 30, padRight: 95, padBottom: 30,
    scale: 1.33,
    cx: 180, cy: 180,
    outerOverflow: 36,
    frameBoundaryR: 144,
    innerOverlapW: 12,
    protectedR: 132,
    frameRingOuterR: 155
};

// ═══════════════════════════════════════════════
// OVERLAP DETECTION
// ═══════════════════════════════════════════════
var drawnTexts = [];

function resetOverlaps() { drawnTexts.length = 0; }

function checkOverlap(x, y, w, h, maxIterations) {
    maxIterations = maxIterations || 50;
    var iterations = 0;
    while (iterations < maxIterations) {
        var collision = false;
        for (var i = 0; i < drawnTexts.length; i++) {
            var t = drawnTexts[i];
            if (x < t.x + t.w + 3 && x + w + 3 > t.x &&
                y < t.y + t.h + 3 && y + h + 3 > t.y) {
                collision = true;
                break;
            }
        }
        if (!collision) {
            drawnTexts.push({ x: x, y: y, w: w, h: h });
            return { adjusted: false, y: y };
        }
        y += 12;
        iterations++;
    }
    drawnTexts.push({ x: x, y: y, w: w, h: h });
    return { adjusted: true, y: y };
}

function drawLabel(ctx, text, x, y, color, size, align, baseline, canvasW, canvasH) {
    size = size || 8;
    align = align || 'center';
    baseline = baseline || 'middle';
    ctx.font = size + 'px system-ui, -apple-system, sans-serif';
    ctx.textAlign = align;
    ctx.textBaseline = baseline;
    var tw = ctx.measureText(text).width;
    var th = size;

    if (canvasW && canvasH) {
        var halfW = tw / 2;
        if (x - halfW < 1) { x = halfW + 1; }
        if (x + halfW > canvasW - 1) { x = canvasW - halfW - 1; }
    }

    var bx, by;
    if (align === 'center') { bx = x - tw / 2; }
    else if (align === 'right' || align === 'end') { bx = x - tw; }
    else { bx = x; }
    if (baseline === 'middle') { by = y - th / 2; }
    else if (baseline === 'bottom' || baseline === 'alphabetic') { by = y - th; }
    else { by = y; }

    var result = checkOverlap(bx, by, tw, th);
    by = result.y;

    var adjY;
    if (baseline === 'middle') { adjY = by + th / 2; }
    else if (baseline === 'bottom' || baseline === 'alphabetic') { adjY = by + th; }
    else { adjY = by; }

    if (canvasW && canvasH) {
        if (adjY < 0) adjY = th / 2;
        if (adjY > canvasH) adjY = canvasH - th / 2;
    }

    ctx.fillStyle = color;
    ctx.fillText(text, x, adjY);
}

// ═══════════════════════════════════════════════
// PATTERN FACTORY
// ═══════════════════════════════════════════════
function makePattern(w, h, fn) {
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    fn(c.getContext('2d'));
    return c;
}

// ═══════════════════════════════════════════════
// DIMENSION BRACKET HELPER
// ═══════════════════════════════════════════════
function dimBracket(ctx, x1, y1, x2, y2, label, color, rot) {
    color = color || '#86868b';
    ctx.strokeStyle = color;
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    var dx = x2 - x1, dy = y2 - y1;
    var len = Math.sqrt(dx * dx + dy * dy);
    var nx = -dy / len * 2.5, ny = dx / len * 2.5;

    ctx.beginPath();
    ctx.moveTo(x1 - nx, y1 - ny);
    ctx.lineTo(x1 + nx, y1 + ny);
    ctx.moveTo(x2 - nx, y2 - ny);
    ctx.lineTo(x2 + nx, y2 + ny);
    ctx.stroke();

    var mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    var lx = mx + nx * 2.2, ly = my + ny * 2.2;

    ctx.font = '6.5px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (rot || Math.abs(dx) < Math.abs(dy)) {
        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(label, 0, 0);
        ctx.restore();
    } else {
        ctx.fillText(label, lx, ly);
    }
}

// ═══════════════════════════════════════════════
// DRAW CHAT BUBBLE DIAGRAM
// ═══════════════════════════════════════════════
function drawBubble() {
    resetOverlaps();
    var canvas = document.getElementById('bubble-canvas');
    if (!canvas) return;
    var c = BUBBLE;
    var dpr = window.devicePixelRatio || 1;
    var s = c.scale;
    var totalW = c.realW + c.padLeft + c.padRight;
    var totalH = c.realH + c.padTop + c.padBottom;
    var cssW = Math.round(totalW * s);
    var cssH = Math.round(totalH * s);
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    canvas.style.removeProperty('width');
    canvas.style.removeProperty('height');
    var ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.setTransform(s, 0, 0, s, 0, 0);
    ctx.translate(c.padLeft, c.padTop);

    // 1 ─ Background (full padded canvas)
    ctx.fillStyle = '#0D0D0D';
    ctx.fillRect(-c.padLeft, -c.padTop, totalW, totalH);

    // Pattern: pink dots (corners)
    var dotPat = ctx.createPattern(makePattern(9, 9, function(p) {
        p.fillStyle = '#110410'; p.fillRect(0, 0, 9, 9);
        p.fillStyle = '#721A3E'; p.beginPath(); p.arc(4.5, 4.5, 2, 0, Math.PI * 2); p.fill();
    }), 'repeat');

    // Pattern: horizontal blue lines (H-stretch)
    var hPat = ctx.createPattern(makePattern(5, 5, function(p) {
        p.fillStyle = '#060F1E'; p.fillRect(0, 0, 5, 5);
        p.strokeStyle = '#0C2854'; p.lineWidth = 2.5;
        p.beginPath(); p.moveTo(0, 2.5); p.lineTo(5, 2.5); p.stroke();
    }), 'repeat');

    // Pattern: vertical amber lines (V-stretch)
    var vPat = ctx.createPattern(makePattern(5, 5, function(p) {
        p.fillStyle = '#130800'; p.fillRect(0, 0, 5, 5);
        p.strokeStyle = '#642E00'; p.lineWidth = 2.5;
        p.beginPath(); p.moveTo(2.5, 0); p.lineTo(2.5, 5); p.stroke();
    }), 'repeat');

    // Pattern: orange diagonal (tail)
    var tailPat = ctx.createPattern(makePattern(6, 6, function(p) {
        p.fillStyle = '#1E0A00'; p.fillRect(0, 0, 6, 6);
        p.strokeStyle = '#823E00'; p.lineWidth = 2;
        p.beginPath(); p.moveTo(0, 6); p.lineTo(6, 0); p.stroke();
    }), 'repeat');

    // 2 ─ Center zone
    var cz = c.cornerZone;
    ctx.fillStyle = '#1A2026';
    ctx.fillRect(cz, cz, c.realW - 2 * cz, c.realH - 2 * cz);

    // 3 ─ H-Stretch bands (top & bottom)
    ctx.fillStyle = hPat;
    ctx.fillRect(cz, 0, c.realW - 2 * cz, cz);
    ctx.fillRect(cz, c.realH - cz, c.realW - 2 * cz, cz);

    // 4 ─ V-Stretch bands (left & right)
    ctx.fillStyle = vPat;
    ctx.fillRect(0, cz, cz, c.realH - 2 * cz);
    ctx.fillRect(c.realW - cz, cz, cz, c.realH - 2 * cz);

    // 5 ─ Corner zones
    ctx.fillStyle = dotPat;
    ctx.fillRect(0, 0, cz, cz);
    ctx.fillRect(c.realW - cz, 0, cz, cz);
    ctx.fillRect(0, c.realH - cz, cz, cz);
    ctx.fillRect(c.realW - cz, c.realH - cz, cz, cz);

    // 6 ─ Tail
    ctx.fillStyle = tailPat;
    ctx.beginPath();
    ctx.moveTo(c.tailBodyX, c.tailStartY);
    ctx.lineTo(c.tailTipX, c.tailTipY);
    ctx.lineTo(c.tailBodyX, c.tailEndY);
    ctx.closePath();
    ctx.fill();

    // 7 ─ Canvas border
    ctx.strokeStyle = '#2A2A2A';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, c.realW, c.realH);

    // 8 ─ Contour path
    var tbx = c.tailBodyX, cr = c.cornerRadius;
    ctx.beginPath();
    ctx.moveTo(cr, 0);
    ctx.lineTo(tbx - cr, 0);
    ctx.arcTo(tbx, 0, tbx, cr, cr);
    ctx.lineTo(tbx, c.tailStartY);
    ctx.lineTo(c.tailTipX, c.tailTipY);
    ctx.lineTo(tbx, c.tailEndY);
    ctx.lineTo(cr, c.realH);
    ctx.arcTo(0, c.realH, 0, c.realH - cr, cr);
    ctx.lineTo(0, cr);
    ctx.arcTo(0, 0, cr, 0, cr);
    ctx.closePath();
    ctx.strokeStyle = '#5A5A5A';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 9 ─ Inner padding
    ctx.strokeStyle = '#3A1F66';
    ctx.setLineDash([5, 4]);
    ctx.strokeRect(c.innerPadding, c.innerPadding, c.innerPadW, c.innerPadH);
    ctx.setLineDash([]);

    // 10 ─ Safe text area
    ctx.fillStyle = 'rgba(15,70,35,0.30)';
    ctx.strokeStyle = '#1A6030';
    ctx.setLineDash([6, 4]);
    ctx.fillRect(c.safeAreaX, c.safeAreaY, c.safeAreaW, c.safeAreaH);
    ctx.strokeRect(c.safeAreaX, c.safeAreaY, c.safeAreaW, c.safeAreaH);
    ctx.setLineDash([]);

    // 11 ─ Dimension lines — top and left outside the drawing
    var dOut = 10; // offset into padding area
    var dimColor = '#86868b';

    // -- Top dimension: 40 | H-STRETCH 280px | 40 (below the drawing, above in padding)
    var topY = -dOut;
    ctx.strokeStyle = dimColor; ctx.lineWidth = 0.7;
    // Dashed leaders from bubble edge up to measurement line
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(0, topY);
    ctx.moveTo(cz, 0); ctx.lineTo(cz, topY);
    ctx.moveTo(c.realW - cz, 0); ctx.lineTo(c.realW - cz, topY);
    ctx.moveTo(c.realW, 0); ctx.lineTo(c.realW, topY);
    ctx.stroke();
    ctx.setLineDash([]);
    // Measurement line segments with caps
    ctx.beginPath();
    ctx.moveTo(0, topY); ctx.lineTo(cz, topY);
    ctx.moveTo(cz, topY); ctx.lineTo(c.realW - cz, topY);
    ctx.moveTo(c.realW - cz, topY); ctx.lineTo(c.realW, topY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, topY - 3); ctx.lineTo(0, topY + 3);
    ctx.moveTo(cz, topY - 3); ctx.lineTo(cz, topY + 3);
    ctx.moveTo(c.realW - cz, topY - 3); ctx.lineTo(c.realW - cz, topY + 3);
    ctx.moveTo(c.realW, topY - 3); ctx.lineTo(c.realW, topY + 3);
    ctx.stroke();
    ctx.font = '6.5px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = dimColor; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText('40', cz / 2, topY + 3);
    ctx.fillText('40', c.realW - cz / 2, topY + 3);
    ctx.fillText('H-STRETCH  280px', c.realW / 2, topY + 3);

    // -- Left dimension: 40 | V-STRETCH 320px | 40 (left of the drawing)
    var leftX = -dOut;
    ctx.strokeStyle = dimColor; ctx.lineWidth = 0.7;
    // Dashed leaders from bubble edge left to measurement line
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(leftX, 0);
    ctx.moveTo(0, cz); ctx.lineTo(leftX, cz);
    ctx.moveTo(0, c.realH - cz); ctx.lineTo(leftX, c.realH - cz);
    ctx.moveTo(0, c.realH); ctx.lineTo(leftX, c.realH);
    ctx.stroke();
    ctx.setLineDash([]);
    // Measurement line segments with caps
    ctx.beginPath();
    ctx.moveTo(leftX, 0); ctx.lineTo(leftX, cz);
    ctx.moveTo(leftX, cz); ctx.lineTo(leftX, c.realH - cz);
    ctx.moveTo(leftX, c.realH - cz); ctx.lineTo(leftX, c.realH);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(leftX - 3, 0); ctx.lineTo(leftX + 3, 0);
    ctx.moveTo(leftX - 3, cz); ctx.lineTo(leftX + 3, cz);
    ctx.moveTo(leftX - 3, c.realH - cz); ctx.lineTo(leftX + 3, c.realH - cz);
    ctx.moveTo(leftX - 3, c.realH); ctx.lineTo(leftX + 3, c.realH);
    ctx.stroke();
    ctx.font = '6.5px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = dimColor;
    ctx.save();
    ctx.translate(leftX - 4, cz / 2); ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('40', 0, 0);
    ctx.restore();
    ctx.save();
    ctx.translate(leftX - 4, (cz + c.realH - cz) / 2); ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('V-STRETCH  320px', 0, 0);
    ctx.restore();
    ctx.save();
    ctx.translate(leftX - 4, c.realH - cz / 2); ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('40', 0, 0);
    ctx.restore();

    // Tail dimensions — outside the drawing, with dashed leaders
    var tailCY = (c.tailStartY + c.tailEndY) / 2;
    var tailMidX = (c.tailBodyX + c.tailTipX) / 2;

    // Horizontal 24px (below the tail)
    var hDimY = c.realH + 17;
    ctx.strokeStyle = '#86868b'; ctx.lineWidth = 0.7;
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.moveTo(c.tailBodyX, c.realH); ctx.lineTo(c.tailBodyX, hDimY);
    ctx.moveTo(c.tailTipX, c.realH); ctx.lineTo(c.tailTipX, hDimY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(c.tailBodyX, hDimY); ctx.lineTo(c.tailTipX, hDimY);
    ctx.moveTo(c.tailBodyX, hDimY - 3); ctx.lineTo(c.tailBodyX, hDimY + 3);
    ctx.moveTo(c.tailTipX, hDimY - 3); ctx.lineTo(c.tailTipX, hDimY + 3);
    ctx.stroke();
    ctx.font = '5.5px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#86868b'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText('24px', tailMidX, hDimY + 3);

    // Vertical 16px (right of the tail)
    var vDimX = c.realW + 14;
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.moveTo(c.realW, c.tailStartY); ctx.lineTo(vDimX, c.tailStartY);
    ctx.moveTo(c.realW, c.tailEndY); ctx.lineTo(vDimX, c.tailEndY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(vDimX, c.tailStartY); ctx.lineTo(vDimX, c.tailEndY);
    ctx.moveTo(vDimX - 3, c.tailStartY); ctx.lineTo(vDimX + 3, c.tailStartY);
    ctx.moveTo(vDimX - 3, c.tailEndY); ctx.lineTo(vDimX + 3, c.tailEndY);
    ctx.stroke();
    ctx.save();
    ctx.translate(vDimX + 4, tailCY);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#86868b'; ctx.font = '5.5px system-ui, -apple-system, sans-serif';
    ctx.fillText('16px', 0, 0);
    ctx.restore();

    // 12 ─ Zone labels with overlap detection and bounds checking
    drawLabel(ctx, 'NON-DEFORMABLE', cz / 2, cz / 2, '#CC4488', 8, 'center', 'middle', totalW, totalH);
    drawLabel(ctx, 'NON-DEFORMABLE', c.realW - cz / 2, cz / 2, '#CC4488', 8, 'center', 'middle', totalW, totalH);
    drawLabel(ctx, 'NON-DEFORMABLE', cz / 2, c.realH - cz / 2, '#CC4488', 8, 'center', 'middle', totalW, totalH);

    var hMid = cz / 2;
    drawLabel(ctx, 'H-STRETCH', (cz + c.realW - cz) / 2, hMid, '#4A80DF', 8, 'center', 'middle', totalW, totalH);
    drawLabel(ctx, 'H-STRETCH', (cz + c.realW - cz) / 2, c.realH - hMid, '#4A80DF', 8, 'center', 'middle', totalW, totalH);

    var vMid = (cz + c.realH - cz) / 2;
    ctx.save();
    ctx.translate(cz / 2, vMid);
    ctx.rotate(-Math.PI / 2);
    ctx.font = '8px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#BB6800';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('V-STRETCH', 0, 0);
    ctx.restore();
    ctx.save();
    ctx.translate(c.realW - cz / 2, vMid);
    ctx.rotate(Math.PI / 2);
    ctx.font = '8px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#BB6800';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('V-STRETCH', 0, 0);
    ctx.restore();

    drawLabel(ctx, 'CENTER', c.realW / 2, (cz + c.realH - cz) / 2, '#808080', 9, 'center', 'middle', totalW, totalH);

    var safeCX = c.safeAreaX + c.safeAreaW / 2;
    var safeCY = c.safeAreaY + c.safeAreaH / 2;
    drawLabel(ctx, 'SAFE TEXT AREA / 280\u00d7232px', safeCX, c.safeAreaY + 14, '#38A058', 8, 'center', 'middle', totalW, totalH);

    drawLabel(ctx, 'TAIL', c.tailBodyX + (c.tailTipX - c.tailBodyX) / 2, tailCY, '#DD7830', 8, 'center', 'middle', totalW, totalH);

    drawLabel(ctx, 'r=20px', cr + 6, cr + 6, '#CC4488', 7, 'left', 'top', totalW, totalH);
}

// ═══════════════════════════════════════════════
// DRAW AVATAR FRAME DIAGRAM
// ═══════════════════════════════════════════════
function drawFrame() {
    resetOverlaps();
    var canvas = document.getElementById('frame-canvas');
    if (!canvas) return;
    var f = FRAME;
    var dpr = window.devicePixelRatio || 1;
    var s = f.scale;
    var totalW = f.realSize + f.padLeft + f.padRight;
    var totalH = f.realSize + f.padTop + f.padBottom;
    canvas.width = Math.round(totalW * s) * dpr;
    canvas.height = Math.round(totalH * s) * dpr;
    canvas.style.removeProperty('width');
    canvas.style.removeProperty('height');
    var ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.setTransform(s, 0, 0, s, 0, 0);
    ctx.translate(f.padLeft, f.padTop);
    var cx = f.cx, cy = f.cy;

    // 1 ─ Background (full padded canvas)
    ctx.fillStyle = '#0D0D0D';
    ctx.fillRect(-f.padLeft, -f.padTop, totalW, totalH);

    // Pattern: blue diagonal (outer overflow)
    var blueDiag = ctx.createPattern(makePattern(8, 8, function(p) {
        p.fillStyle = '#091525'; p.fillRect(0, 0, 8, 8);
        p.strokeStyle = '#0E2B54'; p.lineWidth = 3;
        p.beginPath(); p.moveTo(0, 8); p.lineTo(8, 0); p.stroke();
    }), 'repeat');

    // Pattern: yellow diagonal (inner overlap)
    var yellowDiag = ctx.createPattern(makePattern(8, 8, function(p) {
        p.fillStyle = '#1E1400'; p.fillRect(0, 0, 8, 8);
        p.strokeStyle = '#7A5500'; p.lineWidth = 2;
        p.beginPath(); p.moveTo(0, 8); p.lineTo(8, 0); p.stroke();
    }), 'repeat');

    // 2 ─ Outer Overflow Zone (full circle r=180)
    ctx.fillStyle = blueDiag;
    ctx.beginPath();
    ctx.arc(cx, cy, f.realSize / 2, 0, Math.PI * 2);
    ctx.fill();

    // 3 ─ Frame Ring (r=155 covers outer)
    ctx.fillStyle = '#1E1E24';
    ctx.beginPath();
    ctx.arc(cx, cy, f.frameRingOuterR, 0, Math.PI * 2);
    ctx.fill();

    // 4 ─ Inner Overlap Zone (r=143 yellow)
    var innerOvR = f.frameBoundaryR - f.innerOverlapW;
    ctx.fillStyle = yellowDiag;
    ctx.beginPath();
    ctx.arc(cx, cy, innerOvR, 0, Math.PI * 2);
    ctx.fill();

    // 5 ─ Protected Zone (r=132 tinted red)
    ctx.fillStyle = '#0D0D0D';
    ctx.beginPath();
    ctx.arc(cx, cy, f.protectedR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(180,25,25,0.70)';
    ctx.beginPath();
    ctx.arc(cx, cy, f.protectedR, 0, Math.PI * 2);
    ctx.fill();

    // 6 ─ Frame Boundary (r=144 dashed)
    ctx.strokeStyle = 'rgba(255,255,255,0.65)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.arc(cx, cy, f.frameBoundaryR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // 7 ─ Canvas border
    ctx.strokeStyle = '#2A2A2A';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, f.realSize, f.realSize);

    // 8 ─ Dimension lines inside protected zone, labels in right padding
    var dimLX = f.realSize + 16;
    var dimColor = '#86868b';
    ctx.strokeStyle = dimColor; ctx.lineWidth = 0.7;

    // (a) Inner Overlap 12px: r=132 → r=144
    var daY = cy + 40;
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.moveTo(cx + f.protectedR, cy); ctx.lineTo(cx + f.protectedR, daY);
    ctx.moveTo(cx + f.frameBoundaryR, cy); ctx.lineTo(cx + f.frameBoundaryR, daY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(cx + f.protectedR, daY); ctx.lineTo(cx + f.frameBoundaryR, daY);
    ctx.moveTo(cx + f.protectedR, daY - 3); ctx.lineTo(cx + f.protectedR, daY + 3);
    ctx.moveTo(cx + f.frameBoundaryR, daY - 3); ctx.lineTo(cx + f.frameBoundaryR, daY + 3);
    ctx.stroke();
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.moveTo((cx + f.protectedR + cx + f.frameBoundaryR) / 2, daY); ctx.lineTo(dimLX, daY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = '6.5px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = dimColor; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText('12px INNER OVERLAP', dimLX + 4, daY);

    // (b) Outer Overflow 36px: r=144 → r=180
    var dbY = cy + 70;
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.moveTo(cx + f.frameBoundaryR, cy); ctx.lineTo(cx + f.frameBoundaryR, dbY);
    ctx.moveTo(cx + f.realSize / 2, cy); ctx.lineTo(cx + f.realSize / 2, dbY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(cx + f.frameBoundaryR, dbY); ctx.lineTo(cx + f.realSize / 2, dbY);
    ctx.moveTo(cx + f.frameBoundaryR, dbY - 3); ctx.lineTo(cx + f.frameBoundaryR, dbY + 3);
    ctx.moveTo(cx + f.realSize / 2, dbY - 3); ctx.lineTo(cx + f.realSize / 2, dbY + 3);
    ctx.stroke();
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.moveTo((cx + f.frameBoundaryR + cx + f.realSize / 2) / 2, dbY); ctx.lineTo(dimLX, dbY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = '6.5px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = dimColor; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText('36px OUTER OVERFLOW', dimLX + 4, dbY);

    // (c) Protected Zone diameter
    var dcY = cy + 100;
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.moveTo(cx + f.protectedR, cy); ctx.lineTo(cx + f.protectedR, dcY);
    ctx.stroke();
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.moveTo(cx + f.protectedR, dcY); ctx.lineTo(dimLX, dcY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = '6.5px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = dimColor; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText('\u00f8264px PROTECTED', dimLX + 4, dcY);

    // 9 ─ Zone labels with bounds checking
    drawLabel(ctx, 'OUTER OVERFLOW / 36px', cx, cy - (f.frameRingOuterR + f.realSize / 2) / 2, '#4A80DF', 8, 'center', 'middle', totalW, totalH);

    var frMidR = (f.frameBoundaryR + f.frameRingOuterR) / 2;
    drawLabel(ctx, 'FRAME RING', cx - frMidR, cy, '#C0C0C0', 8, 'center', 'middle', totalW, totalH);

    var ioMidR = (f.protectedR + f.frameBoundaryR) / 2;
    drawLabel(ctx, 'INNER OVERLAP / 12px', cx, cy + ioMidR, '#C9A000', 7, 'center', 'middle', totalW, totalH);

    drawLabel(ctx, '\u00f8264px  PROTECTED ZONE', cx, cy - 8, 'rgba(255,255,255,0.88)', 8, 'center', 'middle', totalW, totalH);

    drawLabel(ctx, '\u00f8288px Frame boundary', cx - f.frameBoundaryR * 0.55, cy - f.frameBoundaryR * 0.55, 'rgba(255,255,255,0.7)', 7, 'center', 'middle', totalW, totalH);
}

// ═══════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', function() {
    drawBubble();
    drawFrame();
});

})();
