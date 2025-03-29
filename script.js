import * as THREE from "three";

const drawnImages = [];
let planeLeft, planeRight, planeFront;

function createCanvas(callback) {
  const canvas = document.createElement("canvas");

  const imageSize = 2048;
  const gap = 512;

  const canvasWidth = imageSize * 4 + gap * 4;
  const canvasHeight = imageSize * 3 + gap * 2;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const images = [
    "https://picsum.photos/seed/1/512",
    "https://picsum.photos/seed/2/512",
    "https://picsum.photos/seed/3/512",
    "https://picsum.photos/seed/4/512",
  ];

  let loadedCount = 0;

  images.forEach((src, idx) => {
    const img = new Image();
    img.src = src;
    img.crossOrigin = "anonymous";
    img.onload = () => {
      drawnImages[idx] = img;
      loadedCount++;
      if (loadedCount === images.length) {
        const texture = drawTexture(canvas, imageSize, gap);
        callback(texture);
      }
    };
  });
}

function drawTexture(canvas, imageSize, gap) {
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#cccccc";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 4; i++) {
    ctx.drawImage(
      drawnImages[i],
      (imageSize + gap) * i,
      gap + imageSize,
      imageSize,
      imageSize
    );
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);

  return texture;
}

const scene = new THREE.Scene();

const size = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const camera = new THREE.PerspectiveCamera(
  45,
  size.width / size.height,
  0.1,
  100
);
camera.position.z = 3;

let forward = true;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(size.width, size.height);
renderer.setPixelRatio(window.devicePixelRatio || 1);
document.body.appendChild(renderer.domElement);

createCanvas((texture) => {
  planeLeft = new THREE.Mesh(
    new THREE.PlaneGeometry(4, 2),
    new THREE.MeshStandardMaterial({ map: texture })
  );

  planeLeft.rotation.y = Math.PI / 2;
  planeLeft.position.x = -1.5;

  scene.add(planeLeft);

  const texture3 = texture.clone();

  planeRight = new THREE.Mesh(
    new THREE.PlaneGeometry(4, 2),
    new THREE.MeshStandardMaterial({ map: texture3 })
  );

  planeRight.rotation.y = -Math.PI / 2;
  planeRight.position.x = 1.4;
  planeRight.material.map.offset.x += 0.48;

  scene.add(planeRight);
  const texture2 = texture.clone();

  planeFront = new THREE.Mesh(
    new THREE.PlaneGeometry(4, 2),
    new THREE.MeshStandardMaterial({ map: texture2 })
  );
  planeFront.material.map.offset.x -= 0.25;

  planeFront.position.z -= 1.5;

  scene.add(planeFront);
});

const planeTop = new THREE.Mesh(
  new THREE.PlaneGeometry(3, 4),
  new THREE.MeshStandardMaterial()
);
planeTop.rotation.x += Math.PI / 2;
planeTop.position.y += 1;
scene.add(planeTop);

const planeBottom = new THREE.Mesh(
  new THREE.PlaneGeometry(3, 4),
  new THREE.MeshStandardMaterial()
);
planeBottom.rotation.x -= Math.PI / 2;
planeBottom.position.y -= 1;
scene.add(planeBottom);

const point = new THREE.PointLight("white", 2);
scene.add(point);

let time = 0;
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);

  if (planeLeft && planeLeft.material.map) {
    planeLeft.material.map.offset.x -= 0.05;
    planeRight.material.map.offset.x -= 0.05;
    planeFront.material.map.offset.x -= 0.05;
  }

  time += 0.006;
  camera.rotation.z = Math.sin(time) * 0.032;
  if (camera.position.z >= 3) {
    forward = true;
  } else if (camera.position.z <= 1) {
    forward = false;
  }
  camera.position.z = 3 + Math.sin(time * 0.2) * 0.6 * (forward ? 1 : -1);
}

animate();
