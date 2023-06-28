import {
	AmbientLight, BoxGeometry,
	Color,
	DirectionalLight,
	ExtrudeGeometry,
	InstancedMesh, Mesh,
	MeshLambertMaterial,
	Object3D,
	PerspectiveCamera, Raycaster,
	Scene,
	Shape, SphereGeometry, Vector2, Vector3,
	WebGLRenderer
} from 'three';

import Stats from 'three/addons/libs/stats.module.js';
import {GUI} from 'three/addons/libs/lil-gui.module.min.js';
import {goToZero, invertOffset, map, normalize, overlap, toRadians} from './helpers';

let camera: PerspectiveCamera, scene: Scene, renderer: WebGLRenderer, stats: { dom: any; update: () => void; };
let mesh: InstancedMesh<ExtrudeGeometry, MeshLambertMaterial>;
let hoverArea: Mesh;
const amount = 10;
const count = 2 * amount ** 3;
let dummy: Mesh;

const light = new DirectionalLight(0xffffff, .1);
const lightControls = {
	x: 778,
	y: 66,
	z: 16,
	intensity: 0.4
};

const meshControls = {
	rotX: 30,
	rotY: -45,
	rotZ: 0,
	distanceOffset: 1,
};

const updateArray = new Array<number>;

init();
animate();

function init() {
	camera = new PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 1000);
	camera.position.set(0, -50, 400);
	camera.lookAt(0, -40, 0);

	scene = new Scene();
	scene.background = new Color(0xf0f0f0);

	scene.add(new AmbientLight(0xffffff, .3));

	light.position.set(0, 50, 200).normalize();
	scene.add(light);

	const boxGeo = new BoxGeometry(30, 30, 30);
	hoverArea = new Mesh(boxGeo, new MeshLambertMaterial({color: 'yellow'}));
	hoverArea.position.set(1000000, 1000000, 1000000);
	hoverArea.rotation.set(
		toRadians(meshControls.rotX),
		toRadians(meshControls.rotY),
		toRadians(meshControls.rotZ)
	);
	scene.add(hoverArea);

	const shape = new Shape();
	shape.moveTo(0, 0);
	shape.lineTo(10, 10);
	shape.lineTo(0, 10);

	const geometry = new ExtrudeGeometry(shape, {
		depth: 10,
	});
	geometry.rotateZ(toRadians(90));

	dummy = new Mesh(geometry.clone());

	mesh = new InstancedMesh(
		geometry,
		new MeshLambertMaterial({
			color: Math.random() * 0xffffff,
			transparent: true,
			opacity: .8,
		}),
		count);
	scene.add(mesh);

	const gui = new GUI();
	gui.add(meshControls, 'rotX', -180, 180);
	gui.add(meshControls, 'rotY', -180, 180);
	gui.add(meshControls, 'rotZ', -180, 180);

	gui.add(lightControls, 'x', -1000, 1000);
	gui.add(lightControls, 'y', -1000, 1000);
	gui.add(lightControls, 'z', -1000, 1000);
	gui.add(lightControls, 'intensity', 0, 1);

	renderer = new WebGLRenderer({antialias: false});
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	stats = new Stats();
	document.body.appendChild(stats.dom);

	window.addEventListener('resize', onWindowResize);
	window.addEventListener('mouseup', onPointerEvent);
	window.addEventListener('mouseenter', onPointerEvent);
	window.addEventListener('mousedown', onPointerEvent);
	window.addEventListener('mousemove', onPointerEvent);
	window.addEventListener('mouseover', onPointerEvent);
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
	requestAnimationFrame(animate);

	render();

	stats.update();
}
function render() {
	light.position.set(lightControls.x, lightControls.y, lightControls.z);
	light.intensity = lightControls.intensity;

	mesh.rotation.set(
		toRadians(meshControls.rotX),
		toRadians(meshControls.rotY),
		toRadians(meshControls.rotZ)
	);

	if (mesh) {
		let i = 0;

		for (let x = 0; x < 10; x++) {
			for (let y = 0; y < 10; y++) {
				for (let z = 0; z < 10; z++) {
					let distanceOffset = 1;
					// if (updateArray[i]) {
					// 	distanceOffset = normalize(updateArray[i]);
					// }

					dummy.position.set(
						-40 + x * 10,
						-50 + y * 10,
						-40 + z * 10
					);

					dummy.updateMatrix();

					dummy.geometry.computeBoundingBox();
					hoverArea.geometry.computeBoundingBox();

					const hoverBox = hoverArea.geometry.boundingBox;
					if (hoverBox) {
						const isIntersects = dummy.geometry.boundingBox?.intersectsBox(hoverBox);
						distanceOffset = isIntersects ? dummy.position.distanceTo(new Vector3(0,0,0)) : 0;

						updateArray[i] = map(distanceOffset,
							0, 82,
							0, 1
						);

						if (distanceOffset) {
							// console.log(distanceOffset);
							// console.log(dummy.position);
						}
						// console.log(distanceOffset);
					}

					dummy.position.set(
						-40 + x * 10 * updateArray[i],
						-50 + y * 10 * updateArray[i],
						-40 + z * 10 * updateArray[i]
					);

					dummy.updateMatrix();
					mesh.setMatrixAt(i++, dummy.matrix);

					dummy.translateX(-10);
					dummy.translateZ(-10);
					dummy.rotation.y = toRadians(90);
					dummy.updateMatrix();
					mesh.setMatrixAt(i++, dummy.matrix);

					dummy.rotation.y = 0;

					if (updateArray[i] != null) {
						updateArray[i] = goToZero(updateArray[i]);
					}
				}
			}
		}
		mesh.instanceMatrix.needsUpdate = true;
	}
	renderer.render(scene, camera);
}

function onPointerEvent(event: MouseEvent) {
	event.stopPropagation();

	const pointer = new Vector2();
	const rect = renderer.domElement.getBoundingClientRect();

	pointer.x = (event.clientX - rect.left) / rect.width * 2 - 1;
	pointer.y = -(event.clientY - rect.top) / rect.height * 2 + 1;

	const raycaster = new Raycaster();
	raycaster.setFromCamera(pointer, camera);

	const intersects = raycaster.intersectObject(mesh, false);

	if (intersects.length > 0) {
		for (const intersect of intersects) {
			if (!intersect.instanceId) continue;
			hoverArea.position.set(
				intersect.point.x,
				intersect.point.y,
				intersect.point.z,
			);
			// console.log('intersect.distance', intersect.distance);
			updateArray[intersect.instanceId] = invertOffset(intersect.point.distanceTo(new Vector3(0, 0, 0)));
			// mesh.getMatrixAt(intersect.instanceId, dummy.matrix);
			// dummy.updateMatrix();
			// dummy.translateY(1 * intersect.distance);
			// dummy.updateMatrix();
			// mesh.setMatrixAt(intersect.instanceId, dummy.matrix);
		}
		// mesh.instanceMatrix.needsUpdate = true;
		// renderer.render(scene, camera);
	}
}

