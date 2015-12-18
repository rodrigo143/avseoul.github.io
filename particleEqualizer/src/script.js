/*
 *  'particle equalizer' author av(Sehyun Kim)
 *  computer graphics 2015 @itp
 *
 *  av.seoul@gmail.com
 *  http://kimsehyun.kr
 */

/* threejs scene setting */
var width, height, ratio, scene, camera, renderer, container, 
    mouseX, mouseY, clock, mPS_02, mPS_01, PS_01_size, mDS_01_mat, mDS_01_mesh, tick, tick_pre;

/* setting window resize */
var windowResize = function(){
    camera.aspect = width/height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
};

var getMousePos = function(event) {
    mouseX = ( event.clientX - width/2 );
    mouseY = ( event.clientY - height/2 );
};

/* setting init */
var init = function(){
    /* initialize global variable */
    tick = 0;
    tick_pre_01 = 0;
    tick_pre_02 = 0;
    tick_pre_03 = 0;
    //-for convinient
    width = window.innerWidth;
    height = window.innerHeight;
    ratio = window.devicePixelRatio;
    //-set threejs objects
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 35, width/height, 0.1, 10000);
    renderer = new THREE.WebGLRenderer();
    clock = new THREE.Clock(true);
    container = document.createElement('div');
    //-get shaders from index.html
    //ps01
    var PS_01_vert = document.getElementById('PS_01_vert').textContent;
    var PS_01_frag = document.getElementById('PS_01_frag').textContent;
    //ps02
    var PS_02_vert = document.getElementById('PS_02_vert').textContent;
    var PS_02_frag = document.getElementById('PS_02_frag').textContent;
    //ds01
    var DS_01_vert = document.getElementById('DS_01_vert').textContent;
    var DS_01_frag = document.getElementById('DS_01_frag').textContent;
    //-set PS_01 trails
    PS_01_size = 5;
    mPS_01 = [PS_01_size];
    tick_pre = [PS_01_size];
    for(var i = 0; i < PS_01_size; i++){
        mPS_01[i] = new THREE.PS_01({
            'slice': 300,
            'segment': 300,
            'ps01vert': PS_01_vert,
            'ps01frag': PS_01_frag,
            'radius': 180
        });

        tick_pre[i] = 0;
    }

    //-set PS_02
    mPS_02 = new THREE.PS_02({
        'slice': 100,
        'segment': 100,
        'ps02vert': PS_02_vert,
        'ps02frag': PS_02_frag,
        'radius': 200
    });

    //-set displaced sphere
    mDS_01_mat = new THREE.ShaderMaterial({
        transparent: true,
        blending: 'THREE.AddictiveBlending',
        depthWrite: true,
        uniforms:{
            'uTex': { type: 't', value: THREE.TextureLoader( './img/tex_01.png' )},
            'uTime': { type: 'f', value: 0.0 }
        },
        //blending: THREE.AdditiveBlending,
        vertexShader: DS_01_vert,
        fragmentShader: DS_01_frag
    });
    var mDS_01_geo = new THREE.SphereGeometry( 160, 128, 128 );
    mDS_01_mesh = new THREE.Mesh( mDS_01_geo, mDS_01_mat );

    //-set camera's default distance
    renderer.setPixelRatio(ratio);
    renderer.setSize(width, height);
    camera.position.z = 1500;

    //-add scene objects
    //scene.add(camera);
    scene.add( mDS_01_mesh );
    for(var i = 0; i < PS_01_size; i++){
        scene.add( mPS_01[i] );
    }
    scene.add( mPS_02 );

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    container.appendChild( stats.domElement );

    //-add canvas(renderer) dom to body
    container.appendChild(renderer.domElement); 
    document.body.appendChild(container); 
    //-get resized window when browser is modified 
    window.addEventListener('resize', windowResize, false);
    //-get mouse position
    document.addEventListener( 'mousemove', getMousePos, false );
};

/* setting render */
var render = function(){
    //camera.position.x += ( mouseX - camera.position.x ) * .05;
    //camera.position.y += ( - ( mouseY - 200) - camera.position.y ) * .05;
    
    scene.rotation.y += 0.003;
    scene.rotation.x += 0.001;

    var delta = clock.getDelta();
    tick += delta;

    if(tick < 0){ tick = 0; }
    
    /* update tick for trails object */
    for(var i = PS_01_size -1; i >= 0; i--){
        if(i != 0 ){
            tick_pre[i] = tick_pre[i-1];
        } else if (i == 0){
            tick_pre[i] = tick;
        }
    }

    /* update objects */
    for(var i = 0; i < PS_01_size; i++){
        mPS_01[i].update(tick_pre[i], i, PS_01_size);
    }
    mPS_02.update(tick);
    mDS_01_mat.uniforms['uTime'].value = tick;

    camera.lookAt( scene.position );
    renderer.render( scene, camera );
};

/* setting animate */
var animate = function(){
    requestAnimationFrame( animate );
    stats.update();
    render();
};

/* excute app */
document.addEventListener('DOMContentLoaded', function(){
    init();
    animate();
});


