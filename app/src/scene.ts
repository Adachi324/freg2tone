import * as THREE from "three";
import { faceTexture, paintTexture } from "./art";

import { label, noteIds } from "./lesson";
import type { MaterialId, LabelMode } from "./lesson";
export type SceneView = {
  approach: number;
  bridge: number;
  travel: number;
  selected: MaterialId | null;
  slots: (MaterialId | null)[];
  activeSlot: number;
  labelMode: LabelMode;
  locks: number;
  order: readonly MaterialId[];
  pulse: MaterialId | null;
  time: number;
};

/** One fixed set of authored objects. The caller owns time, input, and every game rule. */
export function createScene(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor("#d0e0df");
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-13, 13, 6.2, -6.2, 0.1, 100);
  const world = new THREE.Group();
  scene.add(world);
  scene.add(new THREE.HemisphereLight("#ffffff", "#638373", 2.0));
  const sunlight = new THREE.DirectionalLight("#ffffff", 1.6);
  sunlight.position.set(-8, 16, 10);
  scene.add(sunlight);
  const ink = new THREE.MeshBasicMaterial({
    color: "#302f27",
    side: THREE.BackSide,
  });
  const crease = new THREE.LineBasicMaterial({
    color: "#403629",
    transparent: true,
    opacity: 0.92,
  });
  const materials: THREE.Material[] = [ink, crease];
  const textures: THREE.Texture[] = [];
  const palette = {
    grass: "#91ac86",
    stone: "#c9c5ad",
    wood: "#ba8256",
    darkwood: "#795039",
    gold: "#d6ab55",
    cream: "#eddbac",
    green: "#648c77",
    blue: "#67949b",
    leaf: "#738759",
  };
  function paint(
    color: string,
    kind: "paper" | "wood" | "grass" | "water" = "paper",
  ) {
    const map = paintTexture(color, kind);
    textures.push(map);
    const material = new THREE.MeshToonMaterial({ map, color: "#ffffff" });
    materials.push(material);
    return material;
  }
  const grass = paint(palette.grass, "grass"),
    stone = paint(palette.stone),
    wood = paint(palette.wood, "wood");
  const darkwood = paint(palette.darkwood, "wood"),
    gold = paint(palette.gold),
    cream = paint(palette.cream);
  const leaves = [
    paint("#608568", "grass"),
    paint("#91a975", "grass"),
    paint("#48736a", "grass"),
  ];
  const water = paint("#599cae", "water");
  water.map!.repeat.set(2, 5);
  function mesh(
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    parent: THREE.Object3D = world,
    outline = true,
  ) {
    const obj = new THREE.Mesh(geometry, material);
    parent.add(obj);
    if (outline) {
      const edge = new THREE.Mesh(geometry, ink);
      geometry.computeBoundingSphere();
      edge.scale.setScalar(geometry.boundingSphere!.radius > 3 ? 1.006 : 1.045);
      obj.add(edge);
      if (
        geometry instanceof THREE.BoxGeometry ||
        geometry instanceof THREE.ExtrudeGeometry
      ) {
        obj.add(
          new THREE.LineSegments(new THREE.EdgesGeometry(geometry, 35), crease),
        );
      }
    }
    return obj;
  }
  function box(
    w: number,
    h: number,
    d: number,
    material: THREE.Material,
    x: number,
    y: number,
    z: number,
    parent: THREE.Object3D = world,
  ) {
    const obj = mesh(new THREE.BoxGeometry(w, h, d), material, parent);
    obj.position.set(x, y, z);
    return obj;
  }
  function ball(
    r: number,
    material: THREE.Material,
    x: number,
    y: number,
    z: number,
    parent: THREE.Object3D = world,
  ) {
    const geometry = new THREE.SphereGeometry(r, 12, 8);
    if (leaves.includes(material as THREE.MeshToonMaterial)) {
      const points = geometry.attributes.position!;
      for (let i = 0; i < points.count; i++) {
        const px = points.getX(i),
          py = points.getY(i),
          pz = points.getZ(i);
        const wobble = 1 + 0.08 * Math.sin(px * 9 + py * 6) * Math.cos(pz * 7);
        points.setXYZ(i, px * wobble, py * wobble, pz * wobble);
      }
      geometry.computeVertexNormals();
    }
    const obj = mesh(geometry, material, parent);
    obj.position.set(x, y, z);
    return obj;
  }
  function rod(
    a: THREE.Vector3,
    b: THREE.Vector3,
    radius: number,
    material: THREE.Material,
    parent: THREE.Object3D = world,
  ) {
    const delta = b.clone().sub(a);
    const obj = mesh(
      new THREE.CylinderGeometry(radius, radius * 1.08, delta.length(), 7),
      material,
      parent,
    );
    obj.position.copy(a).add(b).multiplyScalar(0.5);
    obj.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      delta.normalize(),
    );
    return obj;
  }
  // 固定立体花园：教学和挑战共享真实地形与机关。
  [
    box(18.1, 0.8, 15, grass, -3.65, -0.48, -1.5),
    box(5.4, 0.8, 15, grass, 11.4, -0.48, -1.5),
    box(3.6, 0.12, 15, water, 7.2, -0.42, -1.5),
  ];
  const path = paint("#d8cbb0");
  box(17.6, 0.035, 2.6, path, -3.65, -0.045, 1);
  box(4.8, 0.035, 2.6, path, 11.4, -0.045, 1);
  // Warm irregular stepping stones and bank rocks ground the machinery.
  for (let i = 0; i < 13; i++) {
    const p = mesh(
      new THREE.CylinderGeometry(0.35 + (i % 3) * 0.08, 0.42, 0.09, 7),
      stone,
    );
    p.scale.z = 0.65;
    p.position.set(-9 + i * 1.08, 0.01, 1.2 + Math.sin(i * 3) * 0.58);
    p.rotation.y = i * 0.8;
  }
  for (const bank of [5.35, 9.0])
    for (let i = 0; i < 11; i++) {
      const rock = mesh(
        new THREE.DodecahedronGeometry(0.38 + (i % 3) * 0.08),
        stone,
      );
      rock.position.set(bank + Math.sin(i * 7) * 0.13, -0.06, -6 + i * 1.18);
      rock.scale.set(1, 0.55, 1.3);
      rock.rotation.y = i;
    }
  // Soft distant hills are small independent forms, never a full-screen background image.
  for (let i = 0; i < 8; i++) {
    const hill = ball(2.4 + (i % 3) * 0.4, leaves[2]!, -13 + i * 4, 0.4, -10.8);
    hill.scale.set(1.3, 0.65, 0.6);
  }
  function tree(x: number, z: number, size: number) {
    const treeGroup = new THREE.Group();
    world.add(treeGroup);
    treeGroup.position.set(x, 0, z);
    treeGroup.scale.setScalar(size);
    rod(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.12, 3.8, 0),
      0.2,
      darkwood,
      treeGroup,
    );
    for (let i = 0; i < 5; i++) {
      const angle = i * 2.4;
      const px = Math.cos(angle) * 0.85,
        pz = Math.sin(angle) * 0.6,
        py = 3.3 + i * 0.2;
      rod(
        new THREE.Vector3(0, 2.1, 0),
        new THREE.Vector3(px, py, pz),
        0.1,
        darkwood,
        treeGroup,
      );
      const canopy = ball(1.05, leaves[i % 3]!, px, py, pz, treeGroup);
      canopy.scale.set(1.2, 0.8, 1);
    }
  }
  tree(-10, -4, 1.4);
  tree(-4.7, -6.4, 1.05);
  tree(2.4, -6.0, 1.15);
  tree(11.7, -5.7, 1.3);
  function shrub(x: number, z: number, size: number, flower = false) {
    for (let j = 0; j < 3; j++) {
      const leaf = ball(
        size,
        leaves[j]!,
        x + (j - 1) * size * 0.55,
        size * 0.45,
        z + Math.sin(j * 3) * 0.12,
      );
      leaf.scale.set(0.8, 1.25, 0.65);
    }
    if (flower) {
      rod(
        new THREE.Vector3(x, 0.1, z + 0.2),
        new THREE.Vector3(x, size * 1.9, z + 0.2),
        0.025,
        leaves[2]!,
      );
      for (let i = 0; i < 5; i++)
        ball(
          0.09,
          cream,
          x + Math.cos(i * 1.256) * 0.12,
          size * 1.9 + Math.sin(i * 1.256) * 0.12,
          z + 0.2,
        );
      ball(0.07, gold, x, size * 1.9, z + 0.28);
    }
  }
  for (let i = 0; i < 13; i++)
    shrub(
      -11.7 + i * 1.9,
      -4.1 + Math.sin(i) * 0.6,
      0.25 + (i % 3) * 0.09,
      i % 2 === 0,
    );
  for (const [x, z] of [
    [-11, 4.7],
    [-7.5, 5.1],
    [-4, 5.4],
    [1.0, 6.3],
    [9.5, 5.2],
    [12, 4],
  ]) {
    shrub(x!, z!, 0.42, true);
  }

  // Exit arch: authored masonry with a curved lintel.
  for (const x of [10.4, 12.1])
    for (let i = 0; i < 4; i++) {
      const block = box(0.48, 0.55, 0.65, stone, x, 0.28 + i * 0.57, -1.3);
      block.rotation.y = 0.04 * Math.sin(i);
    }
  const arch = mesh(new THREE.TorusGeometry(0.85, 0.25, 5, 12, Math.PI), stone);
  arch.position.set(11.25, 2, -1.3);
  box(0.7, 0.18, 0.85, stone, 10.4, 0.1, -1.3);
  box(0.7, 0.18, 0.85, stone, 12.1, 0.1, -1.3);

  const machine = new THREE.Group();
  world.add(machine);
  machine.position.set(3.2, 0, 0.4);
  box(1.9, 1.8, 1.3, wood, 0, 0.94, 0, machine);
  box(1.66, 0.13, 1.4, darkwood, 0, 1.9, 0, machine);
  for (const x of [-0.86, 0.86])
    for (const y of [0.16, 1.73]) {
      box(0.28, 0.3, 1.38, gold, x, y, 0.02, machine);
      ball(0.055, darkwood, x, y, 0.75, machine);
    }
  const slot = mesh(
    new THREE.CylinderGeometry(0.56, 0.56, 0.11, 40),
    gold,
    machine,
  );
  slot.rotation.x = Math.PI / 2;
  slot.position.set(0, 1.01, 0.73);
  const recess = mesh(
    new THREE.CylinderGeometry(0.43, 0.43, 0.13, 40),
    darkwood,
    machine,
  );
  recess.rotation.x = Math.PI / 2;
  recess.position.set(0, 1.01, 0.8);
  const slotPoint = new THREE.Object3D();
  slotPoint.position.set(0, 1.01, 0.93);
  machine.add(slotPoint);
  rod(
    new THREE.Vector3(4.16, 0.75, 0.6),
    new THREE.Vector3(5.7, 0.75, 0.6),
    0.1,
    gold,
  );
  box(0.34, 1.1, 0.45, darkwood, 5.5, 0.48, 0.55);
  const gear = mesh(new THREE.CylinderGeometry(0.29, 0.29, 0.22, 12), gold);
  gear.rotation.x = Math.PI / 2;
  gear.position.set(5.5, 0.75, 0.84);
  const bridge = new THREE.Group();
  world.add(bridge);
  bridge.position.set(5.55, 0.13, 0.65);
  for (let i = 0; i < 8; i++)
    box(0.42, 0.15, 1.75, wood, 0.22 + i * 0.43, 0, 0, bridge);
  for (const z of [-0.68, 0.68]) {
    box(3.5, 0.11, 0.14, darkwood, 1.72, 0.13, z, bridge);
    for (const x of [0.2, 1.7, 3.2]) ball(0.055, gold, x, 0.23, z, bridge);
  }

  const tray = new THREE.Group();
  world.add(tray);
  tray.position.set(0.25, 0, 2.65);
  box(4.4, 0.22, 0.68, darkwood, 0, 0.15, 0, tray);
  box(4.55, 0.13, 0.18, wood, 0, 0.32, 0.38, tray);
  const tokens = {} as Record<MaterialId, THREE.Group>;
  const labelMaterials = {} as Record<MaterialId, THREE.MeshBasicMaterial>;
  const labels = new Map<string, THREE.Texture>();
  for (const id of noteIds)
    for (const mode of ["letter", "solfege", "both"] as const) {
      const texture = faceTexture(label(id, mode));
      textures.push(texture);
      labels.set(`${id}:${mode}`, texture);
    }
  for (const id of ["C", "D", "E"] as const) {
    const token = new THREE.Group();
    world.add(token);
    tokens[id] = token;
    const disc = mesh(
      new THREE.CylinderGeometry(0.45, 0.45, 0.15, 40),
      cream,
      token,
    );
    disc.rotation.x = Math.PI / 2;
    const texture = labels.get(`${id}:letter`)!;
    const labelMaterial = new THREE.MeshBasicMaterial({ map: texture });
    materials.push(labelMaterial);
    labelMaterials[id] = labelMaterial;
    const label = mesh(
      new THREE.CircleGeometry(0.355, 40),
      labelMaterial,
      token,
      false,
    );
    label.position.z = 0.087;
    const rim = mesh(
      new THREE.TorusGeometry(0.405, 0.025, 5, 40),
      darkwood,
      token,
      false,
    );
    rim.position.z = 0.087;
  }

  const slotGroups: THREE.Group[] = [];
  const placedDiscs: THREE.Mesh[] = [];
  const placedMaterials: THREE.MeshBasicMaterial[] = [];
  for (let i = 0; i < 3; i++) {
    const group = new THREE.Group();
    world.add(group);
    slotGroups.push(group);
    const ring = mesh(
      new THREE.CylinderGeometry(0.52, 0.52, 0.15, 40),
      gold,
      group,
    );
    ring.rotation.x = Math.PI / 2;
    const inner = mesh(
      new THREE.CircleGeometry(0.42, 40),
      darkwood,
      group,
      false,
    );
    inner.position.z = 0.09;
    const material = new THREE.MeshBasicMaterial({
      map: labels.get("C:letter")!,
    });
    materials.push(material);
    placedMaterials.push(material);
    const disc = mesh(
      new THREE.CircleGeometry(0.36, 40),
      material,
      group,
      false,
    );
    disc.position.z = 0.11;
    placedDiscs.push(disc);
  }
  const sequenceTray = box(4.8, 0.2, 0.9, darkwood, 3.5, 0.2, 4.8);
  slot.visible = false;
  recess.visible = false;

  // A metronome friend, built from an extruded trapezoid with expressive editable face art.
  const character = new THREE.Group();
  world.add(character);
  const shape = new THREE.Shape();
  shape.moveTo(-0.45, 0);
  shape.lineTo(0.45, 0);
  shape.lineTo(0.23, 1.55);
  shape.lineTo(-0.23, 1.55);
  shape.closePath();
  const body = mesh(
    new THREE.ExtrudeGeometry(shape, {
      depth: 0.43,
      bevelEnabled: true,
      bevelSegments: 1,
      steps: 1,
      bevelSize: 0.06,
      bevelThickness: 0.04,
    }),
    wood,
    character,
  );
  body.position.set(0, 0.4, -0.2);
  const faceMap = faceTexture("character");
  textures.push(faceMap);
  const faceMat = new THREE.MeshBasicMaterial({ map: faceMap });
  materials.push(faceMat);
  const face = mesh(
    new THREE.PlaneGeometry(0.59, 0.61),
    faceMat,
    character,
    false,
  );
  face.position.set(0, 0.83, 0.29);
  box(0.19, 0.66, 0.07, cream, 0, 1.47, 0.29, character);
  for (let i = 0; i < 7; i++)
    box(0.12, 0.015, 0.015, darkwood, 0, 1.21 + i * 0.077, 0.334, character);
  const pendulum = rod(
    new THREE.Vector3(0, 1.12, 0.38),
    new THREE.Vector3(0.23, 1.76, 0.38),
    0.025,
    gold,
    character,
  );
  ball(0.1, gold, 0.23, 1.76, 0.38, character);
  ball(0.12, gold, 0, 2.02, 0, character);
  const feet: THREE.Mesh[] = [];
  for (const side of [-1, 1]) {
    rod(
      new THREE.Vector3(side * 0.24, 0.51, 0),
      new THREE.Vector3(side * 0.28, 0.19, 0.04),
      0.055,
      darkwood,
      character,
    );
    const foot = ball(0.2, cream, side * 0.3, 0.16, 0.14, character);
    foot.scale.set(1, 0.55, 1.45);
    feet.push(foot);
    rod(
      new THREE.Vector3(side * 0.37, 0.96, 0),
      new THREE.Vector3(side * 0.59, 0.72, 0.1),
      0.045,
      darkwood,
      character,
    );
    const glove = ball(0.14, cream, side * 0.61, 0.7, 0.12, character);
    glove.scale.set(1, 0.85, 0.65);
  }
  const shadowMat = new THREE.MeshBasicMaterial({
    color: "#52492d",
    opacity: 0.19,
    transparent: true,
    depthWrite: false,
  });
  materials.push(shadowMat);
  const shadow = mesh(
    new THREE.CircleGeometry(0.64, 28),
    shadowMat,
    world,
    false,
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.025;
  shadow.scale.y = 0.7;
  camera.position.set(7, 12, 24);
  camera.lookAt(0, 1, 0);
  camera.updateMatrixWorld();
  let width = 1,
    height = 1;
  const current: SceneView = {
    approach: 0,
    bridge: 0,
    travel: 0,
    selected: null,
    slots: [null],
    activeSlot: -1,
    labelMode: "letter",
    locks: 0,
    order: ["C", "D", "E"],
    pulse: null,
    time: 0,
  };
  function update(view: SceneView) {
    Object.assign(current, view);
    bridge.rotation.z = ((1 - view.bridge) * Math.PI) / 2;
    gear.rotation.y = view.bridge * Math.PI * 1.3 + (view.locks * Math.PI) / 3;
    const sequence = view.slots.length === 3;
    const slotSpacing = Math.max(
      1.55,
      (48 * (camera.right - camera.left)) / (width * (24 / Math.hypot(7, 24))),
    );
    sequenceTray.visible = sequence;
    sequenceTray.scale.x = (slotSpacing * 2 + 1.3) / 4.8;
    slotGroups.forEach((group, i) => {
      group.visible = i < view.slots.length;
      group.position.set(
        sequence ? 3.5 + (i - 1) * slotSpacing : 3.2,
        sequence ? 0.85 : 1.01,
        sequence ? 4.8 : 1.35,
      );
      group.scale.setScalar(view.activeSlot === i ? 1.08 : 1);
      const id = view.slots[i];
      placedDiscs[i]!.visible = !!id;
      if (id) placedMaterials[i]!.map = labels.get(`${id}:${view.labelMode}`)!;
    });
    // Work in screen pixels: narrow landscape screens retain disjoint 44px hit targets.
    const cosYaw = 24 / Math.hypot(7, 24);
    const spacing = Math.max(
      1.5,
      (48 * (camera.right - camera.left)) / (width * cosYaw),
    );
    const materialZ = 2.65;
    const slotZ = 0.4 + 0.93 * machine.scale.z;
    const rightmostX =
      Math.min(1.75, 3.2 - spacing + ((materialZ - slotZ) * 7) / 24) -
      (sequence ? spacing * 1.4 : 0);
    const trayX = rightmostX - spacing;
    tray.position.x = trayX;
    tray.scale.x = (2 * spacing + 1.4) / 4.4;
    for (const id of ["C", "D", "E"] as const) {
      const token = tokens[id];
      const index = view.order.indexOf(id);
      token.position.set(trayX + (index - 1) * spacing, 0.79, materialZ);
      token.scale.setScalar(view.pulse === id ? 1.12 : 1);
      if (view.selected === id) token.position.y += 0.28;
      token.rotation.y = 0;
      labelMaterials[id].map = labels.get(`${id}:${view.labelMode}`)!;
    }
    const startX = -3.6 + view.approach * 1.0;
    // The authored path passes in front of the machine before lining up with the bridge.
    const route = [
      [startX, 1.25],
      [4.55, 2.3],
      [5.55, 0.65],
      [9.1, 0.65],
      [11.2, -1.25],
    ];
    const stops = [0, 0.49, 0.63, 0.84, 1];
    const travel = THREE.MathUtils.clamp(view.travel, 0, 1);
    const segment = Math.min(
      3,
      Math.max(0, stops.findIndex((stop) => stop > travel) - 1),
    );
    const index = travel === 1 ? 3 : segment;
    const part = (travel - stops[index]!) / (stops[index + 1]! - stops[index]!);
    character.position.set(
      THREE.MathUtils.lerp(route[index]![0]!, route[index + 1]![0]!, part),
      0,
      THREE.MathUtils.lerp(route[index]![1]!, route[index + 1]![1]!, part),
    );
    const walking =
      (view.travel > 0 && view.travel < 1) ||
      (view.approach > 0 && view.approach < 1);
    character.position.y = walking
      ? Math.abs(Math.sin(view.time * 11)) * 0.045
      : 0;
    feet.forEach((foot, i) => {
      foot.position.z =
        0.14 + (walking ? Math.sin(view.time * 11 + i * Math.PI) * 0.09 : 0);
    });
    pendulum.rotation.z = Math.sin(view.time * 1.5) * 0.018;
    shadow.position.x = character.position.x;
    shadow.position.z = character.position.z;
    world.updateMatrixWorld(true);
  }
  function resize(w: number, h: number) {
    width = Math.max(w, 1);
    height = Math.max(h, 1);
    const halfW = Math.max(13, (6.15 * width) / height),
      halfH = (halfW * height) / width;
    camera.left = -halfW;
    camera.right = halfW;
    camera.top = halfH;
    camera.bottom = -halfH;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    update(current);
  }
  function anchors() {
    const project = (obj: THREE.Object3D) => {
      const point = obj.getWorldPosition(new THREE.Vector3()).project(camera);
      return { x: (point.x + 1) / 2, y: (1 - point.y) / 2 };
    };
    return {
      C: project(tokens.C),
      D: project(tokens.D),
      E: project(tokens.E),
      slot: project(slotPoint),
      slots: slotGroups.map(project),
    };
  }
  update(current);
  return {
    render(view: SceneView) {
      update(view);
      renderer.render(scene, camera);
    },
    resize,
    anchors,
    dispose() {
      const geometries = new Set<THREE.BufferGeometry>();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.LineSegments)
          geometries.add(obj.geometry);
      });
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
      renderer.dispose();
    },
  };
}
