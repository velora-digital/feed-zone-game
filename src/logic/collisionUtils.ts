import * as THREE from 'three';

export function boundingBoxesIntersect(objectA, objectB) {
  const boxA = new THREE.Box3();
  boxA.setFromObject(objectA);
  const boxB = new THREE.Box3();
  boxB.setFromObject(objectB);
  return boxA.intersectsBox(boxB);
}

export function isRowNear(rowA, rowB) {
  return rowA === rowB || rowA === rowB + 1 || rowA === rowB - 1;
}

export function isNearMiss(objectA: THREE.Object3D, objectB: THREE.Object3D, threshold: number): boolean {
  const boxA = new THREE.Box3().setFromObject(objectA);
  const boxB = new THREE.Box3().setFromObject(objectB);

  // If already intersecting, it's a collision not a near miss
  if (boxA.intersectsBox(boxB)) return false;

  // Expand box A by threshold and check if the expanded box intersects
  const expanded = boxA.clone().expandByScalar(threshold);
  return expanded.intersectsBox(boxB);
}
