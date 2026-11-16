"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import {
  FaCube,
  FaArrowsRotate,
  FaPlus,
  FaMinus,
  FaExpand,
  FaCompress,
  FaMoon,
  FaSun,
  FaPlay,
  FaPause,
} from "react-icons/fa6";

export interface Product3DViewerProps {
  title: string;
  imageSrc: string;
  category?: string;
  manufacturer?: string;
}

type FinishOption = {
  id: string;
  name: string;
  hex: number;
  swatch: string;
  metalness: number;
  roughness: number;
};

const FINISHES: FinishOption[] = [
  {
    id: "titanium",
    name: "Titanium",
    hex: 0x475569,
    swatch: "#475569",
    metalness: 0.82,
    roughness: 0.26,
  },
  {
    id: "silver",
    name: "Silver",
    hex: 0xcbd5e1,
    swatch: "#cbd5e1",
    metalness: 0.88,
    roughness: 0.2,
  },
  {
    id: "obsidian",
    name: "Obsidian",
    hex: 0x1e293b,
    swatch: "#1e293b",
    metalness: 0.75,
    roughness: 0.3,
  },
  {
    id: "cobalt",
    name: "Cobalt",
    hex: 0x1d4ed8,
    swatch: "#2563eb",
    metalness: 0.78,
    roughness: 0.25,
  },
];

const CAMERA_PRESETS = [
  { id: "angle", label: "3/4 View", theta: 0.55, phi: 1.22 },
  { id: "front", label: "Front", theta: 0, phi: 1.45 },
  { id: "back", label: "Back", theta: Math.PI, phi: 1.42 },
  { id: "top", label: "Top", theta: 0.35, phi: 0.55 },
];

function createRoundedRectShape(w: number, h: number, r: number): THREE.Shape {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

function createExtrudedRoundedBox(
  w: number,
  h: number,
  depth: number,
  radius: number,
  bevel = 0.025
): THREE.ExtrudeGeometry {
  const shape = createRoundedRectShape(w, h, radius);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(0.02, depth - bevel * 2),
    bevelEnabled: true,
    bevelSegments: 5,
    steps: 1,
    bevelSize: bevel,
    bevelThickness: bevel,
    curveSegments: 16,
  });
  geo.center();
  return geo;
}

function detectModelKind(category = "", title = ""): string {
  const c = category.toLowerCase();
  const t = title.toLowerCase();
  if (t.includes("drone")) return "drone";
  if (c.includes("smart-phone") || c.includes("phone") || t.includes("smartphone")) {
    if (t.includes("gimbal")) return "showcase";
    return "phone";
  }
  if (c.includes("laptop") || c.includes("notebook") || t.includes("laptop") || t.includes("macbook") || t.includes("probook")) {
    return "laptop";
  }
  if (c.includes("watch") || t.includes("watch")) return "watch";
  if (c.includes("headphone") || t.includes("headphone")) return "headphones";
  if (c.includes("earbud") || t.includes("earbud") || t.includes("buds")) return "earbuds";
  if (c.includes("camera") || t.includes("camera") || t.includes("slr") || t.includes("eos")) return "camera";
  if (c.includes("keyboard") || t.includes("keyboard")) return "keyboard";
  if (c.includes("tablet") || t.includes("tablet") || t.includes("ipad")) return "tablet";
  if (c.includes("mouse") || t.includes("mouse")) return "mouse";
  if (c.includes("speaker") || t.includes("speaker")) return "speaker";
  return "showcase";
}

function buildProductModel(
  kind: string,
  mats: {
    body: THREE.MeshStandardMaterial;
    dark: THREE.MeshStandardMaterial;
    accent: THREE.MeshStandardMaterial;
    glass: THREE.MeshPhysicalMaterial;
    screen: THREE.MeshStandardMaterial;
    chrome: THREE.MeshStandardMaterial;
  }
): { group: THREE.Group; spinParts: THREE.Object3D[] } {
  const group = new THREE.Group();
  const spinParts: THREE.Object3D[] = [];

  if (kind === "phone") {
    // Sleek flagship smartphone
    const chassis = new THREE.Mesh(
      createExtrudedRoundedBox(1.38, 2.82, 0.16, 0.2, 0.025),
      mats.body
    );
    group.add(chassis);

    // Front bezel + glowing display
    const bezel = new THREE.Mesh(
      new THREE.PlaneGeometry(1.28, 2.7),
      mats.dark
    );
    bezel.position.z = 0.083;
    group.add(bezel);

    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(1.22, 2.58),
      mats.screen
    );
    screen.position.z = 0.085;
    group.add(screen);

    // Dynamic punch-hole camera
    const punch = new THREE.Mesh(
      new THREE.CircleGeometry(0.035, 20),
      mats.dark
    );
    punch.position.set(0, 1.18, 0.087);
    group.add(punch);

    // Rear camera island + 3 sapphire lenses
    const island = new THREE.Mesh(
      createExtrudedRoundedBox(0.56, 0.86, 0.06, 0.1, 0.012),
      mats.body
    );
    island.position.set(0.32, 0.86, -0.095);
    group.add(island);

    [-0.25, 0, 0.25].forEach((ly) => {
      const ring = new THREE.Mesh(
        new THREE.CylinderGeometry(0.115, 0.115, 0.045, 28),
        mats.chrome
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.set(0.4, 0.86 + ly, -0.125);
      group.add(ring);

      const lens = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.09, 0.05, 28),
        mats.glass
      );
      lens.rotation.x = Math.PI / 2;
      lens.position.set(0.4, 0.86 + ly, -0.127);
      group.add(lens);
    });

    // LED flash
    const flash = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.035, 0.04, 20),
      new THREE.MeshStandardMaterial({
        color: 0xfef3c7,
        emissive: 0xfde68a,
        emissiveIntensity: 0.4,
      })
    );
    flash.rotation.x = Math.PI / 2;
    flash.position.set(0.17, 1.04, -0.12);
    group.add(flash);

    // Side power & volume buttons
    const pwrBtn = new THREE.Mesh(
      new THREE.BoxGeometry(0.03, 0.28, 0.05),
      mats.chrome
    );
    pwrBtn.position.set(0.7, 0.35, 0);
    group.add(pwrBtn);

    const volBtn = new THREE.Mesh(
      new THREE.BoxGeometry(0.03, 0.48, 0.05),
      mats.chrome
    );
    volBtn.position.set(-0.7, 0.55, 0);
    group.add(volBtn);
  } else if (kind === "laptop") {
    // Unibody aluminum laptop
    const base = new THREE.Mesh(
      createExtrudedRoundedBox(2.9, 1.95, 0.1, 0.12, 0.018),
      mats.body
    );
    base.rotation.x = Math.PI / 2;
    base.position.set(0, -0.55, 0.2);
    group.add(base);

    // Keyboard well & keycap rows
    const kbWell = new THREE.Mesh(
      new THREE.BoxGeometry(2.35, 0.02, 0.92),
      mats.dark
    );
    kbWell.position.set(0, -0.495, -0.05);
    group.add(kbWell);

    for (let r = 0; r < 5; r++) {
      const cols = r === 4 ? 5 : 11;
      for (let c = 0; c < cols; c++) {
        const kw = r === 4 && c === 2 ? 0.85 : 0.175;
        const key = new THREE.Mesh(
          new THREE.BoxGeometry(kw, 0.025, 0.135),
          mats.dark
        );
        const xPos =
          r === 4
            ? [-0.95, -0.65, 0, 0.65, 0.95][c]
            : -1.02 + c * 0.204;
        key.position.set(xPos, -0.48, -0.41 + r * 0.175);
        group.add(key);
      }
    }

    // Glass trackpad
    const trackpad = new THREE.Mesh(
      new THREE.PlaneGeometry(1.05, 0.62),
      mats.chrome
    );
    trackpad.rotation.x = -Math.PI / 2;
    trackpad.position.set(0, -0.497, 0.76);
    group.add(trackpad);

    // Hinged screen lid
    const lidPivot = new THREE.Group();
    lidPivot.position.set(0, -0.5, -0.72);
    lidPivot.rotation.x = -0.22;

    const lid = new THREE.Mesh(
      createExtrudedRoundedBox(2.9, 1.88, 0.07, 0.11, 0.014),
      mats.body
    );
    lid.position.set(0, 0.94, 0);
    lidPivot.add(lid);

    const bezel = new THREE.Mesh(
      new THREE.PlaneGeometry(2.76, 1.74),
      mats.dark
    );
    bezel.position.set(0, 0.94, 0.037);
    lidPivot.add(bezel);

    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(2.62, 1.58),
      mats.screen
    );
    screen.position.set(0, 0.95, 0.039);
    lidPivot.add(screen);

    group.add(lidPivot);
  } else if (kind === "watch") {
    // Titanium smartwatch
    const caseMesh = new THREE.Mesh(
      createExtrudedRoundedBox(1.42, 1.66, 0.38, 0.34, 0.05),
      mats.body
    );
    group.add(caseMesh);

    const bezelRing = new THREE.Mesh(
      createExtrudedRoundedBox(1.26, 1.5, 0.06, 0.28, 0.015),
      mats.chrome
    );
    bezelRing.position.z = 0.19;
    group.add(bezelRing);

    const dial = new THREE.Mesh(
      new THREE.PlaneGeometry(1.08, 1.28),
      mats.screen
    );
    dial.position.z = 0.225;
    group.add(dial);

    // Digital crown + accent ring
    const crown = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.14, 0.14, 24),
      mats.chrome
    );
    crown.rotation.z = Math.PI / 2;
    crown.position.set(0.76, 0.28, 0.02);
    group.add(crown);

    const actionBtn = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.32, 0.14),
      mats.accent
    );
    actionBtn.position.set(-0.73, 0, 0);
    group.add(actionBtn);

    // Rear biometric optical sensor
    const sensor = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.46, 0.06, 32),
      mats.glass
    );
    sensor.rotation.x = Math.PI / 2;
    sensor.position.z = -0.2;
    group.add(sensor);

    // Sculpted top & bottom curved straps
    [1, -1].forEach((dir) => {
      const bandCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, dir * 0.8, 0),
        new THREE.Vector3(0, dir * 1.32, -0.28),
        new THREE.Vector3(0, dir * 1.48, -0.95),
        new THREE.Vector3(0, dir * 1.0, -1.48),
      ]);
      const bandGeo = new THREE.TubeGeometry(bandCurve, 28, 0.16, 12, false);
      bandGeo.scale(2.6, 1, 0.55);
      const band = new THREE.Mesh(bandGeo, mats.dark);
      group.add(band);
    });
    group.position.z = 0.32;
  } else if (kind === "headphones") {
    // Studio ANC over-ear headphones
    const arcCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.08, -0.1, 0),
      new THREE.Vector3(-1.05, 0.85, 0),
      new THREE.Vector3(0, 1.35, 0),
      new THREE.Vector3(1.05, 0.85, 0),
      new THREE.Vector3(1.08, -0.1, 0),
    ]);
    const headband = new THREE.Mesh(
      new THREE.TubeGeometry(arcCurve, 44, 0.1, 16, false),
      mats.body
    );
    group.add(headband);

    // Cushion pad at top
    const topArc = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.68, 1.12, 0),
      new THREE.Vector3(0, 1.33, 0),
      new THREE.Vector3(0.68, 1.12, 0),
    ]);
    const topPad = new THREE.Mesh(
      new THREE.TubeGeometry(topArc, 24, 0.125, 14, false),
      mats.dark
    );
    group.add(topPad);

    // Left & right earcups + cushions
    [-1, 1].forEach((side) => {
      const cupGroup = new THREE.Group();
      cupGroup.position.set(side * 1.0, -0.45, 0);
      cupGroup.rotation.z = side * 0.16;

      // Earcup outer shell
      const shell = new THREE.Mesh(
        new THREE.CylinderGeometry(0.52, 0.46, 0.34, 32),
        mats.body
      );
      shell.rotation.z = Math.PI / 2;
      shell.scale.set(1.22, 1, 0.95);
      cupGroup.add(shell);

      // Accent ring
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.49, 0.025, 14, 36),
        mats.accent
      );
      ring.rotation.y = Math.PI / 2;
      ring.scale.set(0.95, 1.22, 1);
      ring.position.x = side * 0.12;
      cupGroup.add(ring);

      // Plush ear cushion
      const cushion = new THREE.Mesh(
        new THREE.TorusGeometry(0.42, 0.14, 18, 36),
        mats.dark
      );
      cushion.rotation.y = Math.PI / 2;
      cushion.scale.set(0.92, 1.2, 1);
      cushion.position.x = -side * 0.18;
      cupGroup.add(cushion);

      // Yoke slider
      const yoke = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.48, 16),
        mats.chrome
      );
      yoke.position.set(side * 0.06, 0.42, 0);
      cupGroup.add(yoke);

      group.add(cupGroup);
    });
  } else if (kind === "earbuds") {
    // Sculpted wireless earbuds charging case + twin ANC buds
    const caseBase = new THREE.Mesh(
      createExtrudedRoundedBox(1.85, 1.15, 0.85, 0.38, 0.08),
      mats.body
    );
    caseBase.position.y = -0.35;
    group.add(caseBase);

    // Status LED dot
    const led = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 16, 16),
      new THREE.MeshStandardMaterial({
        color: 0x34d399,
        emissive: 0x10b981,
        emissiveIntensity: 1.2,
      })
    );
    led.position.set(0, -0.25, 0.44);
    group.add(led);

    // Open hinged lid
    const lid = new THREE.Mesh(
      createExtrudedRoundedBox(1.82, 0.58, 0.82, 0.24, 0.06),
      mats.body
    );
    lid.position.set(0, 0.52, -0.35);
    lid.rotation.x = -0.65;
    group.add(lid);

    // Twin earbuds nestled above
    [-0.46, 0.46].forEach((bx, i) => {
      const bud = new THREE.Group();
      bud.position.set(bx, 0.36, 0.05);
      bud.rotation.z = i === 0 ? 0.2 : -0.2;

      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.28, 28, 24),
        mats.chrome
      );
      head.scale.set(1.1, 0.95, 0.95);
      bud.add(head);

      const tip = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 20, 20),
        mats.dark
      );
      tip.position.set(i === 0 ? 0.22 : -0.22, 0.05, 0.05);
      bud.add(tip);

      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.075, 0.06, 0.52, 20),
        mats.chrome
      );
      stem.position.set(i === 0 ? -0.1 : 0.1, -0.32, 0);
      bud.add(stem);

      group.add(bud);
    });
  } else if (kind === "camera") {
    // Mirrorless pro camera with glass lens
    const body = new THREE.Mesh(
      createExtrudedRoundedBox(2.2, 1.42, 0.78, 0.14, 0.03),
      mats.body
    );
    group.add(body);

    // Ergonomic right-hand grip
    const grip = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.3, 1.36, 24),
      mats.dark
    );
    grip.position.set(-0.88, -0.02, 0.32);
    group.add(grip);

    // EVF viewfinder hump
    const evf = new THREE.Mesh(
      createExtrudedRoundedBox(0.76, 0.42, 0.68, 0.09, 0.02),
      mats.body
    );
    evf.position.set(0.05, 0.84, -0.02);
    group.add(evf);

    // Mode dial & shutter button
    const dial = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 0.14, 28),
      mats.chrome
    );
    dial.position.set(-0.62, 0.78, 0.02);
    group.add(dial);

    const shutter = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.09, 0.1, 20),
      mats.accent
    );
    shutter.position.set(-0.9, 0.72, 0.34);
    group.add(shutter);

    // Multi-element telephoto barrel
    const mount = new THREE.Mesh(
      new THREE.CylinderGeometry(0.58, 0.6, 0.12, 36),
      mats.chrome
    );
    mount.rotation.x = Math.PI / 2;
    mount.position.set(0.12, -0.04, 0.44);
    group.add(mount);

    const barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.52, 0.56, 0.78, 36),
      mats.dark
    );
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0.12, -0.04, 0.85);
    group.add(barrel);

    const accentRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.525, 0.022, 16, 40),
      mats.accent
    );
    accentRing.position.set(0.12, -0.04, 1.12);
    group.add(accentRing);

    const frontGlass = new THREE.Mesh(
      new THREE.SphereGeometry(0.44, 32, 24),
      mats.glass
    );
    frontGlass.scale.set(1, 1, 0.35);
    frontGlass.position.set(0.12, -0.04, 1.18);
    group.add(frontGlass);

    // Rear LCD screen displaying product preview
    const lcd = new THREE.Mesh(
      new THREE.PlaneGeometry(1.38, 0.96),
      mats.screen
    );
    lcd.rotation.y = Math.PI;
    lcd.position.set(0.18, -0.06, -0.4);
    group.add(lcd);
  } else if (kind === "tablet") {
    // Ultra-slim pro tablet
    const slate = new THREE.Mesh(
      createExtrudedRoundedBox(2.55, 1.85, 0.11, 0.16, 0.02),
      mats.body
    );
    group.add(slate);

    const bezel = new THREE.Mesh(
      new THREE.PlaneGeometry(2.42, 1.72),
      mats.dark
    );
    bezel.position.z = 0.058;
    group.add(bezel);

    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(2.28, 1.58),
      mats.screen
    );
    screen.position.z = 0.06;
    group.add(screen);

    const cam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.05, 24),
      mats.glass
    );
    cam.rotation.x = Math.PI / 2;
    cam.position.set(0.98, 0.65, -0.07);
    group.add(cam);
  } else if (kind === "keyboard") {
    // Low-profile CNC mechanical keyboard
    const deck = new THREE.Mesh(
      createExtrudedRoundedBox(3.15, 1.18, 0.16, 0.1, 0.025),
      mats.body
    );
    deck.rotation.x = Math.PI / 2 - 0.18;
    group.add(deck);

    // Accent RGB light strip
    const glowBar = new THREE.Mesh(
      new THREE.BoxGeometry(2.9, 0.03, 0.04),
      mats.accent
    );
    glowBar.position.set(0, 0.16, -0.56);
    group.add(glowBar);

    const keysGroup = new THREE.Group();
    keysGroup.rotation.x = -0.18;
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 13; c++) {
        if (r === 4 && c > 3 && c < 9) {
          if (c !== 6) continue;
        }
        const isSpace = r === 4 && c === 6;
        const isAccent = (r === 0 && c === 0) || (r === 2 && c === 12);
        const cap = new THREE.Mesh(
          new THREE.BoxGeometry(isSpace ? 1.02 : 0.19, 0.08, 0.17),
          isAccent ? mats.accent : mats.dark
        );
        cap.position.set(-1.32 + c * 0.22, 0.11, -0.4 + r * 0.2);
        keysGroup.add(cap);
      }
    }
    group.add(keysGroup);
  } else if (kind === "mouse") {
    // Sculpted ergonomic wireless mouse
    const shell = new THREE.Mesh(
      new THREE.SphereGeometry(0.9, 36, 28),
      mats.body
    );
    shell.scale.set(0.78, 0.5, 1.25);
    group.add(shell);

    const basePlate = new THREE.Mesh(
      new THREE.CylinderGeometry(0.68, 0.65, 0.08, 32),
      mats.dark
    );
    basePlate.scale.set(1, 1, 1.58);
    basePlate.position.y = -0.28;
    group.add(basePlate);

    // Knurled metallic scroll wheel
    const wheel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.15, 0.1, 24),
      mats.chrome
    );
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(0, 0.34, -0.48);
    group.add(wheel);

    // Accent DPI LED
    const dpi = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.03, 0.16),
      mats.accent
    );
    dpi.position.set(0, 0.44, -0.18);
    group.add(dpi);
  } else if (kind === "speaker") {
    // 360-degree studio wireless speaker
    const cylinder = new THREE.Mesh(
      new THREE.CylinderGeometry(0.82, 0.88, 2.15, 40),
      mats.dark
    );
    group.add(cylinder);

    const topCap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.83, 0.83, 0.12, 40),
      mats.body
    );
    topCap.position.y = 1.08;
    group.add(topCap);

    const bottomCap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.89, 0.85, 0.16, 40),
      mats.body
    );
    bottomCap.position.y = -1.08;
    group.add(bottomCap);

    // Illuminated acoustic ring
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.62, 0.03, 16, 44),
      mats.accent
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 1.15;
    group.add(ring);
  } else if (kind === "drone") {
    // Quadcopter 4K camera drone with live spinning rotors!
    const fuselage = new THREE.Mesh(
      createExtrudedRoundedBox(0.82, 1.38, 0.36, 0.2, 0.05),
      mats.body
    );
    fuselage.rotation.x = Math.PI / 2;
    group.add(fuselage);

    // 3-axis front gimbal camera
    const gimbal = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 24, 24),
      mats.dark
    );
    gimbal.position.set(0, -0.22, 0.62);
    group.add(gimbal);

    const camLens = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.11, 0.12, 24),
      mats.glass
    );
    camLens.rotation.x = Math.PI / 2;
    camLens.position.set(0, -0.22, 0.78);
    group.add(camLens);

    // 4 arms + motors + spinning propellers
    [
      [-1, 1],
      [1, 1],
      [-1, -1],
      [1, -1],
    ].forEach(([sx, sz]) => {
      const armCurve = new THREE.LineCurve3(
        new THREE.Vector3(sx * 0.32, 0, sz * 0.35),
        new THREE.Vector3(sx * 1.15, 0.08, sz * 0.95)
      );
      const arm = new THREE.Mesh(
        new THREE.TubeGeometry(armCurve, 8, 0.055, 12, false),
        mats.body
      );
      group.add(arm);

      const motor = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 0.18, 20),
        mats.chrome
      );
      motor.position.set(sx * 1.15, 0.14, sz * 0.95);
      group.add(motor);

      const rotor = new THREE.Group();
      rotor.position.set(sx * 1.15, 0.25, sz * 0.95);
      const blade = new THREE.Mesh(
        new THREE.BoxGeometry(0.92, 0.015, 0.085),
        mats.dark
      );
      rotor.add(blade);
      group.add(rotor);
      spinParts.push(rotor);
    });
  } else {
    // Sleek 3D Studio Showcase Frame mapping actual product photo front & back
    const frame = new THREE.Mesh(
      createExtrudedRoundedBox(2.25, 2.25, 0.22, 0.22, 0.035),
      mats.body
    );
    frame.position.y = 0.1;
    group.add(frame);

    const accentTrim = new THREE.Mesh(
      createExtrudedRoundedBox(2.08, 2.08, 0.24, 0.18, 0.01),
      mats.chrome
    );
    accentTrim.position.y = 0.1;
    group.add(accentTrim);

    const frontFace = new THREE.Mesh(
      new THREE.PlaneGeometry(1.94, 1.94),
      mats.screen
    );
    frontFace.position.set(0, 0.1, 0.126);
    group.add(frontFace);

    const backFace = new THREE.Mesh(
      new THREE.PlaneGeometry(1.94, 1.94),
      mats.screen
    );
    backFace.rotation.y = Math.PI;
    backFace.position.set(0, 0.1, -0.126);
    group.add(backFace);

    // Floating studio pedestal ring
    const plinth = new THREE.Mesh(
      new THREE.CylinderGeometry(1.05, 1.18, 0.1, 48),
      mats.dark
    );
    plinth.position.y = -1.25;
    group.add(plinth);
  }

  return { group, spinParts };
}

export default function Product3DViewer({
  title,
  imageSrc,
  category = "",
}: Product3DViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bodyMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const shadowMatRef = useRef<THREE.MeshBasicMaterial | null>(null);

  // Orbit state refs for silky-smooth 60fps loop without React re-renders
  const orbitRef = useRef({
    targetTheta: 0.55,
    targetPhi: 1.22,
    theta: 0.55,
    phi: 1.22,
    targetRadius: 4.5,
    radius: 4.5,
    isDragging: false,
    lastX: 0,
    lastY: 0,
    autoSpin: true,
  });

  const [autoSpin, setAutoSpin] = useState(true);
  const [darkStage, setDarkStage] = useState(false);
  const [finishId, setFinishId] = useState("titanium");
  const [activePreset, setActivePreset] = useState("angle");
  const [fullscreen, setFullscreen] = useState(false);
  const [webglFallback, setWebglFallback] = useState(false);
  const [fallbackAngle, setFallbackAngle] = useState({ rx: -8, ry: 22, scale: 1 });

  useEffect(() => {
    orbitRef.current.autoSpin = autoSpin;
  }, [autoSpin]);

  // Apply live hardware finish color updates
  useEffect(() => {
    const f = FINISHES.find((x) => x.id === finishId) || FINISHES[0];
    if (bodyMatRef.current) {
      bodyMatRef.current.color.setHex(f.hex);
      bodyMatRef.current.metalness = f.metalness;
      bodyMatRef.current.roughness = f.roughness;
      bodyMatRef.current.needsUpdate = true;
    }
  }, [finishId]);

  // Apply live studio backdrop updates
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.background = new THREE.Color(
        darkStage ? 0x0f172a : 0xf8fafc
      );
    }
    if (shadowMatRef.current) {
      shadowMatRef.current.opacity = darkStage ? 0.42 : 0.16;
    }
  }, [darkStage]);

  // Close fullscreen on Escape key
  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      });
    } catch {
      setWebglFallback(true);
      return;
    }

    const width = el.clientWidth || 480;
    const height = el.clientHeight || 480;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    el.innerHTML = "";
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(darkStage ? 0x0f172a : 0xf8fafc);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);

    // Studio 3-point lighting + subtle blue rim light
    const ambient = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambient);

    const hemi = new THREE.HemisphereLight(0xe0f2fe, 0x334155, 0.9);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.9);
    keyLight.position.set(4.5, 6, 5.5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xbfdbfe, 0.95);
    fillLight.position.set(-5, 2.5, 3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x60a5fa, 1.1);
    rimLight.position.set(0, 4, -6);
    scene.add(rimLight);

    // Materials
    const initialFinish = FINISHES.find((x) => x.id === finishId) || FINISHES[0];
    const bodyMat = new THREE.MeshStandardMaterial({
      color: initialFinish.hex,
      metalness: initialFinish.metalness,
      roughness: initialFinish.roughness,
    });
    bodyMatRef.current = bodyMat;

    const darkMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      metalness: 0.25,
      roughness: 0.65,
    });

    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.92,
      roughness: 0.14,
    });

    const accentMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.35,
      metalness: 0.5,
      roughness: 0.25,
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f172a,
      metalness: 0.15,
      roughness: 0.05,
      reflectivity: 1,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
    });

    // Crisp fallback white display textured with the actual product photo
    const screenMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.18,
      metalness: 0.05,
      emissive: 0xffffff,
      emissiveIntensity: 0.08,
    });

    let loadedTexture: THREE.Texture | null = null;
    const loader = new THREE.TextureLoader();
    loader.load(
      imageSrc,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
        // Fit texture cleanly onto a clean white studio canvas so aspect ratio never stretches
        const img = tex.image as HTMLImageElement | undefined;
        if (img && img.width && img.height) {
          const canvas = document.createElement("canvas");
          canvas.width = 512;
          canvas.height = 512;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            const grad = ctx.createRadialGradient(256, 230, 40, 256, 256, 320);
            grad.addColorStop(0, "#ffffff");
            grad.addColorStop(1, "#eef2ff");
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 512, 512);
            const pad = 52;
            const maxDim = 512 - pad * 2;
            const scale = Math.min(maxDim / img.width, maxDim / img.height);
            const dw = img.width * scale;
            const dh = img.height * scale;
            ctx.drawImage(img, (512 - dw) / 2, (512 - dh) / 2, dw, dh);
            const canvasTex = new THREE.CanvasTexture(canvas);
            canvasTex.colorSpace = THREE.SRGBColorSpace;
            loadedTexture = canvasTex;
            screenMat.map = canvasTex;
            screenMat.emissiveMap = canvasTex;
            screenMat.emissiveIntensity = 0.14;
            screenMat.needsUpdate = true;
            tex.dispose();
            return;
          }
        }
        loadedTexture = tex;
        screenMat.map = tex;
        screenMat.needsUpdate = true;
      },
      undefined,
      () => {}
    );

    const kind = detectModelKind(category, title);
    const { group: productGroup, spinParts } = buildProductModel(kind, {
      body: bodyMat,
      dark: darkMat,
      accent: accentMat,
      glass: glassMat,
      screen: screenMat,
      chrome: chromeMat,
    });
    scene.add(productGroup);

    // Soft radial contact shadow beneath model
    const shadowCanvas = document.createElement("canvas");
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const sctx = shadowCanvas.getContext("2d");
    if (sctx) {
      const g = sctx.createRadialGradient(128, 128, 12, 128, 128, 120);
      g.addColorStop(0, "rgba(15, 23, 42, 0.85)");
      g.addColorStop(0.55, "rgba(15, 23, 42, 0.25)");
      g.addColorStop(1, "rgba(15, 23, 42, 0)");
      sctx.fillStyle = g;
      sctx.fillRect(0, 0, 256, 256);
    }
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: darkStage ? 0.42 : 0.16,
      depthWrite: false,
    });
    shadowMatRef.current = shadowMat;
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(3.8, 3.8),
      shadowMat
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -1.65;
    scene.add(shadowPlane);

    // Pointer & wheel interaction handlers
    const dom = renderer.domElement;
    dom.style.touchAction = "none";
    dom.style.cursor = "grab";

    const onPointerDown = (e: PointerEvent) => {
      orbitRef.current.isDragging = true;
      orbitRef.current.lastX = e.clientX;
      orbitRef.current.lastY = e.clientY;
      dom.style.cursor = "grabbing";
      try {
        dom.setPointerCapture(e.pointerId);
      } catch {}
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!orbitRef.current.isDragging) return;
      const dx = e.clientX - orbitRef.current.lastX;
      const dy = e.clientY - orbitRef.current.lastY;
      orbitRef.current.lastX = e.clientX;
      orbitRef.current.lastY = e.clientY;
      orbitRef.current.targetTheta -= dx * 0.01;
      orbitRef.current.targetPhi = Math.max(
        0.28,
        Math.min(Math.PI - 0.35, orbitRef.current.targetPhi - dy * 0.008)
      );
    };

    const onPointerUp = (e: PointerEvent) => {
      orbitRef.current.isDragging = false;
      dom.style.cursor = "grab";
      try {
        dom.releasePointerCapture(e.pointerId);
      } catch {}
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      orbitRef.current.targetRadius = Math.max(
        2.6,
        Math.min(7.2, orbitRef.current.targetRadius + e.deltaY * 0.003)
      );
    };

    dom.addEventListener("pointerdown", onPointerDown);
    dom.addEventListener("pointermove", onPointerMove);
    dom.addEventListener("pointerup", onPointerUp);
    dom.addEventListener("pointercancel", onPointerUp);
    dom.addEventListener("wheel", onWheel, { passive: false });

    // Responsive resize observer
    const ro = new ResizeObserver(() => {
      if (!el) return;
      const nw = el.clientWidth || 480;
      const nh = el.clientHeight || 480;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    });
    ro.observe(el);

    // Animation loop with gentle hover levitation + smooth damping
    let rafId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const o = orbitRef.current;

      if (o.autoSpin && !o.isDragging) {
        o.targetTheta += 0.0055;
      }

      o.theta += (o.targetTheta - o.theta) * 0.1;
      o.phi += (o.targetPhi - o.phi) * 0.1;
      o.radius += (o.targetRadius - o.radius) * 0.12;

      camera.position.x = o.radius * Math.sin(o.phi) * Math.sin(o.theta);
      camera.position.y = o.radius * Math.cos(o.phi);
      camera.position.z = o.radius * Math.sin(o.phi) * Math.cos(o.theta);
      camera.lookAt(0, 0, 0);

      productGroup.position.y = Math.sin(t * 1.6) * 0.055;
      for (const part of spinParts) {
        part.rotation.y = t * 14;
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      dom.removeEventListener("pointerdown", onPointerDown);
      dom.removeEventListener("pointermove", onPointerMove);
      dom.removeEventListener("pointerup", onPointerUp);
      dom.removeEventListener("pointercancel", onPointerUp);
      dom.removeEventListener("wheel", onWheel);
      loadedTexture?.dispose();
      shadowTex.dispose();
      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).geometry) {
          (obj as THREE.Mesh).geometry.dispose();
        }
        const m = (obj as THREE.Mesh).material;
        if (Array.isArray(m)) m.forEach((mat) => mat.dispose());
        else if (m) m.dispose();
      });
      renderer.dispose();
    };
    // Rebuild cleanly when product or fullscreen container changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageSrc, category, title, fullscreen]);

  const applyPreset = useCallback((presetId: string) => {
    const p = CAMERA_PRESETS.find((x) => x.id === presetId);
    if (!p) return;
    setActivePreset(p.id);
    setAutoSpin(false);
    orbitRef.current.autoSpin = false;
    orbitRef.current.targetTheta = p.theta;
    orbitRef.current.targetPhi = p.phi;
    setFallbackAngle((prev) => ({
      ...prev,
      ry: (p.theta * 180) / Math.PI,
      rx: p.id === "top" ? -32 : -6,
    }));
  }, []);

  const handleZoom = (delta: number) => {
    orbitRef.current.targetRadius = Math.max(
      2.6,
      Math.min(7.2, orbitRef.current.targetRadius + delta)
    );
    setFallbackAngle((prev) => ({
      ...prev,
      scale: Math.max(0.7, Math.min(1.45, prev.scale - delta * 0.15)),
    }));
  };

  const handleReset = () => {
    orbitRef.current.targetTheta = 0.55;
    orbitRef.current.targetPhi = 1.22;
    orbitRef.current.targetRadius = 4.5;
    setActivePreset("angle");
    setAutoSpin(true);
    setFallbackAngle({ rx: -8, ry: 22, scale: 1 });
  };

  const stageShell = (
    <div
      className={`relative select-none overflow-hidden border transition-colors ${
        fullscreen
          ? "fixed inset-3 sm:inset-6 z-50 rounded-3xl shadow-2xl flex flex-col"
          : "aspect-square rounded-3xl shadow-sm"
      } ${
        darkStage
          ? "bg-slate-900 border-slate-700 text-white"
          : "bg-slate-50 border-slate-200/80 text-slate-900"
      }`}
    >
      {/* Top Overlay Bar */}
      <div className="absolute top-3.5 left-3.5 right-3.5 z-10 flex items-center justify-between gap-2 pointer-events-none">
        <div
          className={`pointer-events-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold backdrop-blur-md border ${
            darkStage
              ? "bg-slate-800/80 border-slate-700 text-blue-300"
              : "bg-white/90 border-slate-200 text-blue-700 shadow-sm"
          }`}
        >
          <FaCube className="w-3 h-3" />
          <span>Interactive 3D · Drag to Rotate</span>
        </div>

        <div className="pointer-events-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setAutoSpin((v) => !v)}
            title={autoSpin ? "Pause rotation" : "Auto-rotate"}
            aria-label={autoSpin ? "Pause 3D rotation" : "Auto-rotate 3D model"}
            className={`w-8 h-8 rounded-full flex items-center justify-center border backdrop-blur-md transition-colors ${
              darkStage
                ? "bg-slate-800/80 border-slate-700 hover:bg-slate-700 text-slate-200"
                : "bg-white/90 border-slate-200 hover:bg-slate-100 text-slate-700 shadow-sm"
            }`}
          >
            {autoSpin ? (
              <FaPause className="w-3 h-3" />
            ) : (
              <FaPlay className="w-3 h-3" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setDarkStage((v) => !v)}
            title="Toggle studio lighting"
            aria-label="Toggle studio lighting"
            className={`w-8 h-8 rounded-full flex items-center justify-center border backdrop-blur-md transition-colors ${
              darkStage
                ? "bg-slate-800/80 border-slate-700 hover:bg-slate-700 text-amber-300"
                : "bg-white/90 border-slate-200 hover:bg-slate-100 text-slate-700 shadow-sm"
            }`}
          >
            {darkStage ? (
              <FaSun className="w-3.5 h-3.5" />
            ) : (
              <FaMoon className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setFullscreen((v) => !v)}
            title={fullscreen ? "Exit fullscreen" : "Expand 3D studio"}
            aria-label={fullscreen ? "Exit fullscreen" : "Expand 3D studio"}
            className={`w-8 h-8 rounded-full flex items-center justify-center border backdrop-blur-md transition-colors ${
              darkStage
                ? "bg-slate-800/80 border-slate-700 hover:bg-slate-700 text-slate-200"
                : "bg-white/90 border-slate-200 hover:bg-slate-100 text-slate-700 shadow-sm"
            }`}
          >
            {fullscreen ? (
              <FaCompress className="w-3.5 h-3.5" />
            ) : (
              <FaExpand className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* WebGL Canvas (or Graceful CSS-3D Fallback) */}
      {!webglFallback ? (
        <div
          ref={containerRef}
          className="w-full h-full flex-1"
          role="img"
          aria-label={`Interactive 3D view of ${title}`}
        />
      ) : (
        <div
          className="w-full h-full flex-1 flex items-center justify-center p-12 cursor-grab active:cursor-grabbing"
          style={{ perspective: "900px" }}
          onMouseMove={(e) => {
            if (e.buttons !== 1) return;
            setFallbackAngle((prev) => ({
              ...prev,
              ry: prev.ry + e.movementX * 0.7,
              rx: Math.max(-45, Math.min(45, prev.rx - e.movementY * 0.5)),
            }));
          }}
        >
          <div
            className="w-64 h-64 rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 flex items-center justify-center transition-transform duration-150"
            style={{
              transform: `scale(${fallbackAngle.scale}) rotateX(${fallbackAngle.rx}deg) rotateY(${fallbackAngle.ry}deg)`,
              transformStyle: "preserve-3d",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSrc}
              alt={title}
              className="w-full h-full object-contain pointer-events-none"
            />
          </div>
        </div>
      )}

      {/* Right Zoom & Reset Floating Pill */}
      <div
        className={`absolute right-3.5 top-1/2 -translate-y-1/2 z-10 flex flex-col rounded-full border backdrop-blur-md overflow-hidden ${
          darkStage
            ? "bg-slate-800/80 border-slate-700 text-slate-200"
            : "bg-white/90 border-slate-200 text-slate-700 shadow-sm"
        }`}
      >
        <button
          type="button"
          onClick={() => handleZoom(-0.55)}
          aria-label="Zoom in"
          className="p-2 hover:bg-blue-600 hover:text-white transition-colors"
        >
          <FaPlus className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={() => handleZoom(0.55)}
          aria-label="Zoom out"
          className="p-2 border-y border-slate-200/40 hover:bg-blue-600 hover:text-white transition-colors"
        >
          <FaMinus className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={handleReset}
          aria-label="Reset 3D view"
          title="Reset angle"
          className="p-2 hover:bg-blue-600 hover:text-white transition-colors"
        >
          <FaArrowsRotate className="w-3 h-3" />
        </button>
      </div>

      {/* Bottom Camera Angles + Hardware Finish Dock */}
      <div className="absolute bottom-3.5 left-3.5 right-3.5 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Finish Swatches */}
        <div
          className={`pointer-events-auto inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 border backdrop-blur-md ${
            darkStage
              ? "bg-slate-800/85 border-slate-700"
              : "bg-white/90 border-slate-200 shadow-sm"
          }`}
        >
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-1 hidden sm:inline ${
              darkStage ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Finish
          </span>
          {FINISHES.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFinishId(f.id)}
              title={f.name}
              aria-label={`${f.name} finish`}
              className={`w-5 h-5 rounded-full border-2 transition-transform ${
                finishId === f.id
                  ? "scale-110 border-blue-500 ring-2 ring-blue-500/30"
                  : "border-white/70 opacity-80 hover:opacity-100"
              }`}
              style={{ backgroundColor: f.swatch }}
            />
          ))}
        </div>

        {/* Camera Angle Presets */}
        <div
          className={`pointer-events-auto inline-flex items-center gap-1 rounded-full p-1 border backdrop-blur-md ${
            darkStage
              ? "bg-slate-800/85 border-slate-700"
              : "bg-white/90 border-slate-200 shadow-sm"
          }`}
        >
          {CAMERA_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p.id)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                activePreset === p.id
                  ? "bg-blue-600 text-white"
                  : darkStage
                  ? "text-slate-300 hover:text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  if (fullscreen) {
    return (
      <>
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm"
          onClick={() => setFullscreen(false)}
        />
        {stageShell}
      </>
    );
  }

  return stageShell;
}
