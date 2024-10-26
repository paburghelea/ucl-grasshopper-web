/**
 * @author Paul
 */

let camera, controls, controls2, scene, scene2, renderer, renderer2;

init();
animate();

const data = {
  gridSize: null,


  sizes: [],
  thicknesses: [],
  offsets: [],
  heights: []
}


//Material used in the scene
const highlightMaterial = new THREE.MeshStandardMaterial({ color: '#FF2400', metalness: 0.5 })
const defaultMaterial = new THREE.MeshStandardMaterial({ color: '#e67e22', metalness: 0.5 })
const wireframeMaterial = new THREE.MeshNormalMaterial({ color: 'white', wireframe: false })

function unique(value, index, array) {
  return array.indexOf(value) === index;
}

function init() {

  scene = new THREE.Scene();
  container = document.getElementById('container');

  // create the rendered and set it to the height/width of the container
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true; // if you don't want shadows, set to false
  container.appendChild(renderer.domElement);
  renderer.setClearColor(0x000000, 0)
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.5, 800000);
  camera.position.set(-120000, 120000, -70000); // starting position of the camera

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true
  controls.dampingFactor = 0.1
  controls.screenSpacePanning = true;
  controls.maxPolarAngle = Math.PI / 2;
  controls.maxDistance = 45000;
  controls.minDistance = 15000;
  controls.enablePan = false;


  // Scene 2
  scene2 = new THREE.Scene();
  container2 = document.getElementById('container-secondary');

  renderer2 = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer2.setSize(container2.clientWidth, container2.clientHeight)
  renderer2.shadowMap.enabled = true
  renderer2.setClearColor(0x000000, 0)
  container2.appendChild(renderer2.domElement)

  camera2 = new THREE.PerspectiveCamera(10, container2.clientWidth / container2.clientHeight, 0.5, 800000);
  camera2.position.set(8000, 8000, 3000); // starting position of the camera

  controls2 = new THREE.OrbitControls(camera2, renderer2.domElement);

  controls2.minPolarAngle = Math.PI / 4;    // Minimum vertical rotation
  controls2.maxPolarAngle = Math.PI / 4;    // Maximum vertical rotation




  //#region  Loader
  /**
   * Load the scene mode in the current scene
   */
  let loader = new THREE.ObjectLoader();

  loader.load(
    "./assets/facade.json",
    function (obj) {
      // remove the loading text
      document.getElementById('progress').remove();
      scene = obj;

      const focus = scene.children.filter((item) => item.name === 'panel')[5].clone()

      focus.material = wireframeMaterial
      scene2.add(focus)


      const panels = scene.children.filter((item)=> item.name == 'panel');
      const targets = scene.children.filter((item)=> item.name == 'target');


      data.heights = panels.map((item)=> item.userData.height).filter(unique).sort((a, b) => a - b)
      data.offsets = panels.map((item)=> item.userData.offset).filter(unique).sort((a, b) => a - b)
      data.sizes = panels.map((item)=> item.userData.size).filter(unique).sort((a, b) => a - b)
      data.thicknesses = panels.map((item)=> item.userData.thickness).filter(unique).sort((a, b) => a - b)


      console.log(data)
      console.log(panels)







    },
    function (obj) {
      progressLog(obj)
    },
    function (err) {
      console.error('Cannot load scene!');
    }
  )
  //#endregion




  let prevSelection = null;

  document.addEventListener('mousedown', onDocumentMouseDown);



  function onDocumentMouseDown(event) {
    event.preventDefault();

    if (event.button != 2)
      return

    let mouse3D = new THREE.Vector3((event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1,
      0.5);




    let raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse3D, camera);
    let intersects = raycaster.intersectObjects(scene.children.filter((object) => object.name === 'target'));


    if (intersects.length > 0) {

      if (prevSelection != null)
        prevSelection.material = defaultMaterial



      const object = intersects[0].object
      object.material = highlightMaterial


      const index = getGrid().indexOf(object)
      changeCell(index)

      // object.material.color.setHex('#EE4B2B')
      // object.material.opacity.setOpacity(1)

      console.log(intersects[0].object.userData)
      console.log(intersects[0].object)

      prevSelection = object
      // intersects[0].object.material.color.setHex(Math.random() * 0xffffff);
    }


  }


  function getGrid() {
    const grid = scene.children.filter((item) => item.name === 'target')
    return grid
  }

  camera.eulerOrder = "XZY";

  function changeCell(cell) {

    const grid = getGrid()
    const panel = scene.children.filter((item) => item.name === 'panel')[0].clone()

    const target = grid[cell]


    console.log(target.userData.rotation)
    panel.position.copy(target.position);
    // panel.rotation.set(new THREE.Vector3(0,0,0))
    // panel.rotation.copy( target.rotation );
    // panel.rotation.x = rotation.x

    panel.rotation.x = 1.571
    panel.rotation.z = 1.571
    //Quick fix on the rotation on Y
    // if (rotation.y < 0) {

    //   // panel.rotation.y = 3.14159
    //   const scale = new THREE.Vector3(1, 1, 1);
    //   scale.x *= -1;
    //   panel.scale.multiply(scale)
    // }






    scene.add(panel)

    scene.remove(grid[cell])
  }

  window.addEventListener('resize', onWindowResize, false);
}

function progressLog(message) {
  let progress, textNode, text;

  if (document.getElementById('progress')) {
    document.getElementById('progress').remove();
  }

  if (message.lengthComputable) {
    text = 'loading: ' + Math.round((message.loaded / message.total * 100)) + '%'
  } else {
    text = 'loading: ' + Math.round(message.loaded / 1000) + 'kb'
  }

  console.log(text);

  progress = document.createElement('DIV');
  progress.id = 'progress';
  textNode = document.createTextNode(text);
  progress.appendChild(textNode)
  container.appendChild(progress)
}

function onWindowResize() {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(container.clientWidth, container.clientHeight);
}

function animate() {

  requestAnimationFrame(animate);



  let angle = 0;
  const step = 0.006;
  const maxTranslation = 0.6;
  let currTranslation = 0;
  let direction = true;
  const variation = 0.1


  angle += step;

  if (angle >= 360) {
    angle = 0;
  }

  scene2.rotateY(0.003)










  controls.update();
  controls2.update();
  render();
}

function render() {

  renderer.render(scene, camera);
  renderer2.render(scene2, camera2);
}


function genSliders() {

  
  


}