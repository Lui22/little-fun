import {
	AmbientLight,
	Color,
	DirectionalLight,
	ExtrudeGeometry,
	InstancedMesh,
	MeshLambertMaterial,
	Object3D,
	PerspectiveCamera, Raycaster,
	Scene,
	Shape, Vector2,
	WebGLRenderer
} from 'three';

import Stats from 'three/addons/libs/stats.module.js';
import {GUI} from 'three/addons/libs/lil-gui.module.min.js';
import {goToZero, invertOffset, normalize, toRadians} from './helpers';

let camera: PerspectiveCamera, scene: Scene, renderer: WebGLRenderer, stats: { dom: any; update: () => void; };

let mesh: InstancedMesh<ExtrudeGeometry, MeshLambertMaterial>;
const amount = 10;
const count = 2 * amount ** 3;
const dummy = new Object3D();

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

	const shape = new Shape();
	shape.moveTo(0, 0);
	shape.lineTo(10, 10);
	shape.lineTo(0, 10);

	const geometry = new ExtrudeGeometry(shape, {
		depth: 10,
	});
	geometry.rotateZ(toRadians(90));

	mesh = new InstancedMesh(geometry, new MeshLambertMaterial({color: Math.random() * 0xffffff}), count);
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
					if (updateArray[i]) {
						distanceOffset = normalize(updateArray[i]);
					}

					dummy.position.set(
						-40 + x * 10 * distanceOffset,
						-50 + y * 10 * distanceOffset,
						-40 + z * 10 * distanceOffset
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
			// console.log('intersect.distance', intersect.distance);
			updateArray[intersect.instanceId] = invertOffset(intersect.distance);
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

