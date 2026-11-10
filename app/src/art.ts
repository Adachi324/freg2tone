import * as THREE from "three";

/** Original editable paint textures, drawn here; no downloaded or generated image assets. */
export function paintTexture(
  base: string,
  kind: "paper" | "wood" | "grass" | "water" = "paper",
) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 256, 256);
  let seed = 2718;
  const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  for (let i = 0; i < 2900; i++) {
    ctx.fillStyle = i % 2 ? "rgba(255,245,210,.065)" : "rgba(63,48,32,.045)";
    const x = random() * 256,
      y = random() * 256;
    ctx.fillRect(x, y, 1 + random() * 4, 1 + random() * 2);
  }
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 45; i++) {
    const x = random() * 256,
      y = random() * 256;
    ctx.beginPath();
    ctx.strokeStyle =
      kind === "water" ? "rgba(248,233,191,.32)" : "rgba(60,52,37,.17)";
    if (kind === "wood") {
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(80, y - 5, 140, y + 7, 256, y);
    } else if (kind === "grass") {
      ctx.moveTo(x, y);
      ctx.lineTo(x - 3, y - 6);
      ctx.moveTo(x, y);
      ctx.lineTo(x + 3, y - 4);
    } else if (kind === "water") {
      ctx.moveTo(x, y);
      ctx.bezierCurveTo(x + 6, y - 2, x + 13, y + 3, x + 22, y);
    } else continue;
    ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export function faceTexture(kind: string) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#f3dfb1";
  ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = "#392d24";
  ctx.fillStyle = "#392d24";
  ctx.lineWidth = 6;
  if (kind === "character") {
    for (const x of [88, 171]) {
      ctx.beginPath();
      ctx.ellipse(x, 112, 17, 33, -0.06, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff6dc";
      ctx.beginPath();
      ctx.ellipse(x - 4, 101, 5, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#392d24";
    }
    ctx.beginPath();
    ctx.moveTo(104, 165);
    ctx.quadraticCurveTo(130, 194, 158, 162);
    ctx.stroke();
    ctx.fillStyle = "#c58561";
    for (const x of [61, 193]) {
      ctx.beginPath();
      ctx.ellipse(x, 155, 15, 8, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const lines = kind.split(" / ");
    ctx.font = `bold ${lines.length > 1 ? 96 : kind.length > 1 ? 106 : 154}px Georgia, serif`;
    if (lines.length > 1) {
      ctx.fillText(lines[0]!, 128, 90);
      ctx.font = "bold 68px Georgia, serif";
      ctx.fillText(lines[1]!, 128, 178);
    } else ctx.fillText(kind, 128, 139);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(128, 128, 114, 0, Math.PI * 2);
    ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
