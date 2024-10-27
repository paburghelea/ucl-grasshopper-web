/**
 * @author Paul
 */

let camera, controls, controls2, scene, scene2, renderer, renderer2;



const store = {
  gridSize: null,

  geometry: {
    grid: {},
    panels: {}
  },

  current: {
    size: null,
  },

  sizes: [],
  thicknesses: [],
  offsets: [],
  heights: []
}

let panelFilter = {
  size: null,
  thickness: null,
  offset: null,
  height: null
}

let currentPanel = 0

//Material used in the scene
const highlightMaterial = new THREE.MeshStandardMaterial({ color: '#FF2400', metalness: 0.5 })
const defaultMaterial = new THREE.MeshStandardMaterial({ color: '#e67e22', metalness: 0.5 })
const wireframeMaterial = new THREE.MeshNormalMaterial({ color: 'white', wireframe: false })

init();
animate();






function unique(value, index, array) {
  return array.indexOf(value) === index;
}

/**
 * Get all the grid cells for the current size configuration
 * @returns 
 */
function getCurrentGrid() {
  return scene.children.filter((item) => item.name === 'target' && item.userData.size == store.current.size)
}

function getAllGrids() {
  return scene.children.filter((item) => item.name === 'target')
}

function getPanels() {
  return scene.children.filter((item) => item.name === 'panel' && item.userData.size == store.current.size)
}

function getAllPanels() {
  return scene.children.filter((item) => item.name === 'panel')
}

function init() {

  //Create ThreeJS scenes
  initMainScene()
  intiPanelScene()


  //Initialise the window events for the UI
  initUIEvents()



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


      const panels = scene.children.filter((item) => item.name == 'panel');
      const targets = scene.children.filter((item) => item.name == 'target');



      store.heights = panels.map((item) => item.userData.height).filter(unique).sort((a, b) => a - b)
      store.offsets = panels.map((item) => item.userData.offset).filter(unique).sort((a, b) => a - b)
      store.sizes = panels.map((item) => item.userData.size).filter(unique).sort((a, b) => a - b)
      store.thicknesses = panels.map((item) => item.userData.thickness).filter(unique).sort((a, b) => a - b)


      store.current.size = store.sizes[0]


      // Default panel filter
      panelFilter = {
        size: store.sizes[0],
        thickness: store.thicknesses[0],
        offset: store.offsets[0],
        height: store.heights[0]
      }


      initGrid()

      updateGrid()

      // setGrid([0])

    },
    function (obj) {
      progressLog(obj)
    },
    function (err) {
      console.error('Cannot load scene!');
    }
  )
  //#endregion

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

/**
 * Set the current panel in memory
 * @param {string} id ID of the current panel 
 */
function setCurrentPanel(id) {

  panels = getPanels()

  try {
    currentPanel = id

    const tempPanel = panels[id].clone()
    tempPanel.material = wireframeMaterial

    scene2.remove(scene2.children.filter((item) => item.name == 'panel')[0])

    scene2.add(tempPanel)


  }
  catch (err) {
    console.log(`Panel with ID ${id} doesn't exist!`)
  }

}




function genSliders() {





}


function initMainScene() {
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
}

function intiPanelScene() {
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

}

function initUIEvents() {


  let prevSelection = null;


  /**
   * Track the mouse click function on the placed panels
   * On click we replace the panel with the current selection from the `Select Panel`
   */
  document.addEventListener('mousedown', function (e) {
    if (e.button != 2)
      return

    let mouse3D = new THREE.Vector3((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1, 0.5);


    let raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse3D, camera);
    let intersects = raycaster.intersectObjects(scene.children.filter((object) => object.name === 'target'));


    if (intersects.length > 0) {

      if (prevSelection != null)
        prevSelection.material = defaultMaterial

      const object = intersects[0].object
      object.material = highlightMaterial


      const index = getCurrentGrid().indexOf(object)
      changeCell(index)

      // console.log(intersects[0].object.userData)
      // console.log(intersects[0].object)

      prevSelection = object
    }
  });



  /**
   * Update the camera and render functions after the browser window is resized
   */
  window.addEventListener('resize', function (e) {
    camera.aspect = container.clientWidth / container.clientHeight
    camera.updateProjectionMatrix()

    renderer.setSize(container.clientWidth, container.clientHeight)

  }, false)


  document.getElementById("set-form").addEventListener("submit", function (e) {
    e.preventDefault()

    const values = e.target.elements['set'].value

    try {
      setGrid(JSON.parse(values))
    }
    catch (err) {
      console.log(err)
    }
  })

  document.getElementById("grid-select").addEventListener("change", function (e) {
    store.current.size = e.target.value
    updateGrid()
  })



  document.getElementById("button-option-next").addEventListener("click", function () {
    if (currentPanel < getPanels().length) {
      setCurrentPanel(currentPanel + 1)
    }
    else {
      setCurrentPanel(0)
    }
  })


  document.getElementById("button-option-prev").addEventListener("click", function () {
    if (currentPanel - 1 < 0) {
      setCurrentPanel(getPanels().length - 1)
    }
    else {
      setCurrentPanel(currentPanel - 1)
    }
  })



}


/**
 * 
 * @param {number} cell Cell from the grid to replace
 * @param {number} replace ID of the panel to replace the cell, defaults to the current panel
 */
function changeCell(cell, replace = currentPanel) {

  const grid = getCurrentGrid()
  const panels = getPanels()
  const panel = store.geometry.panels[store.current.size][0][replace].clone()

  const target = grid[cell]

  panel.position.copy(target.position);

  panel.rotation.x = 1.571
  panel.rotation.z = 1.571


  scene.add(panel)

  scene.remove(grid[cell])
}


function initGrid() {

  const allGrids = getAllGrids()
  const allPanels = scene.children.filter((item) => item.name === 'panel')



  store.sizes.forEach((item) => {
    store.geometry.panels[item] = [
      allPanels.filter((cell) => cell.userData.size == item)
    ]
  })

  store.sizes.forEach((item) => {
    store.geometry.grid[item] = [
      allGrids.filter((cell) => cell.userData.size == item)
    ]
  })

  // Remove all grid cells
  allGrids.forEach((cell) => {
    scene.remove(cell)
  });

}


function updateGrid() {

  const allGrids = getAllGrids()
  const allPanels = scene.children.filter((item) => item.name === 'panel')
  // Remove all grid cells
  allGrids.forEach((cell) => {
    scene.remove(cell)
  });

  allPanels.forEach((panel) => {
    scene.remove(panel)
  });

  store.geometry.grid[store.current.size][0].forEach((cell) => {

    cell.scale.x = 0.5

    scene.add(cell)
  })

}


function setGrid(values) {


  if (values.length == 1) {

    const grid = getCurrentGrid()
    console.log(`Setting grid for ${grid.length} cells`)

    for (let i = 0; i < grid.length; i++) {
      changeCell(i, values[0])
    }
  }
  else {
    console.log(`Setting grid for ${values.length} cells`)

    for (let i = 0; i < values.length; i++) {
      changeCell(i, values[i])
    }
  }
}
