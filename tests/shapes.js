define(function(require) {

    var Engine = require('Engine');
    var Collider = require('Collider');
    var RigidBody = require('RigidBody');
    var GhostObject = require('GhostObject');
    var BoxShape = require('shape/Box');
    var SphereShape = require('shape/Sphere');
    var CylinderShape = require('shape/Cylinder');
    var CapsuleShape = require('shape/Capsule');
    var ConeShape = require('shape/Cone');
    var ConvexTriangleMeshShape = require('shape/ConvexTriangleMesh');
    var BvhTriangleMeshShape = require('shape/BvhTriangleMesh');
    var ConvexHullShape = require('shape/ConvexHull');
    var StaticPlaneShape = require('shape/StaticPlane');
    var CompoundShape = require('shape/Compound');
    var PhysicsMaterial = require("Material");

    var qtek = require('qtek/qtek');

    var engine = new Engine({
        ammoUrl : '../lib/ammo.fast.js'
    });
    engine.init();
    var renderer = new qtek.Renderer({
        canvas : document.getElementById('Main')
    });
    var shadowMapPass = new qtek.prePass.ShadowMap({
        shadowCascade : 3,
    });
    renderer.resize(window.innerWidth, window.innerHeight);
    
    var animation = new qtek.animation.Animation();
    animation.start();
    
    var scene = new qtek.Scene();
    var camera = new qtek.camera.Perspective({
        aspect : renderer.width / renderer.height
    });
    camera.position.set(0, 10, 30);
    camera.lookAt(qtek.math.Vector3.ZERO);

    var light = new qtek.light.Directional({
        shadowResolution : 1024,
        shadowBias : 0.005
    });
    light.position.set(1, 2, 1);
    light.lookAt(qtek.math.Vector3.ZERO);
    scene.add(light);
    scene.add(new qtek.light.Ambient({intensity : 0.1}));

    var planeMesh = new qtek.Mesh({
        material : new qtek.Material({
            shader : qtek.shader.library.get('buildin.physical')
        }),
        geometry : new qtek.geometry.Plane(),
        scale : new qtek.math.Vector3(100, 100, 1)
    });
    planeMesh.material.set('glossiness', 0.2);
    planeMesh.rotation.rotateX(-Math.PI / 2);


    var floorBody = new RigidBody({
        shape : new StaticPlaneShape()
    });
    engine.addCollider(new Collider({
        collisionObject : floorBody,
        physicsMaterial : new PhysicsMaterial(),
        sceneNode : planeMesh,
        isStatic : true
    }));
    // scene.add(planeMesh);
    
    /****************************
                Cube
     ****************************/
    var cubeGeo = new qtek.geometry.Cube();
    var material = new qtek.Material({
        shader : qtek.shader.library.get('buildin.physical', 'diffuseMap')
    });
    var texture = qtek.util.texture.createChessboard();
    material.set('diffuseMap', texture);
    var boxShape = new BoxShape({
        halfExtents : new qtek.math.Vector3(1, 1, 1)
    });
    for (var i = 0; i < 50; i++) {
        
        var cubeMesh = new qtek.Mesh({
            geometry : cubeGeo,
            material : material,
            position : new qtek.math.Vector3(20 - Math.random() * 40, Math.random() * 40, 20 - Math.random() * 40)
        });
        scene.add(cubeMesh);

        var cubeBody = new RigidBody({
            shape : boxShape,
            mass : 1
        });

        engine.addCollider(new Collider({
            collisionObject : cubeBody,
            physicsMaterial : new PhysicsMaterial(),
            sceneNode : cubeMesh
        }));
    }


    /****************************
                Sphere
     ****************************/
    var sphereGeo = new qtek.geometry.Sphere({
        widthSegments : 50,
        heightSegments : 50
    });
    var sphereShape = new SphereShape({
        radius : 1
    });
    for (var i = 0; i < 50; i++) {
        
        var sphereMesh = new qtek.Mesh({
            geometry : sphereGeo,
            material : material,
            position : new qtek.math.Vector3(20 - Math.random() * 40, Math.random() * 40, 20 - Math.random() * 40)
        });
        scene.add(sphereMesh);

        var sphereBody = new RigidBody({
            shape : sphereShape,
            mass : 1,
            angularDamping : 0.4
        });

        engine.addCollider(new Collider({
            collisionObject : sphereBody,
            physicsMaterial : new PhysicsMaterial({
                friction : 0.9
            }),
            sceneNode : sphereMesh
        }));
    }


    /****************************
                  Cylinder
     ****************************/
    var cylinderGeo = new qtek.geometry.Cylinder({
        heightSegments : 10,
        capSegments : 40
    });

    var cylinderShape = new CylinderShape();
    for (var i = 0; i < 50; i++) {
        
        var cylinderMesh = new qtek.Mesh({
            geometry : cylinderGeo,
            material : material,
            position : new qtek.math.Vector3(20 - Math.random() * 40, Math.random() * 40, 20 - Math.random() * 40)
        });
        scene.add(cylinderMesh);

        var cylinderBody = new RigidBody({
            shape : cylinderShape,
            mass : 1
        });

        engine.addCollider(new Collider({
            collisionObject : cylinderBody,
            physicsMaterial : new PhysicsMaterial({
                friction : 0.9
            }),
            sceneNode : cylinderMesh
        }));
    }

    /****************************
            Convex Mesh 
     ****************************/
    var convexGeo = new qtek.geometry.Sphere({
        widthSegments : 4,
        heightSegments : 4
    });
    var convexShape = new ConvexTriangleMeshShape({
        geometry : convexGeo
    });
    for (var i = 0; i < 50; i++) {
        
        var convexMesh = new qtek.Mesh({
            geometry : convexGeo,
            material : material,
            position : new qtek.math.Vector3(20 - Math.random() * 40, Math.random() * 40, 20 - Math.random() * 40)
        });
        scene.add(convexMesh);

        var convexBody = new RigidBody({
            shape : convexShape,
            mass : 1
        });

        engine.addCollider(new Collider({
            collisionObject : convexBody,
            physicsMaterial : new PhysicsMaterial({
                friction : 0.9
            }),
            sceneNode : convexMesh
        }));
    }

    /****************************
            Convex Hull
            Suzanne Monkey
     ****************************/
    var loader = new qtek.loader.GLTF();
    loader.load('assets/suzanne.json');
    loader.success(function(res) {
        var _scene = res.scene;
        var geo = _scene.getNode('Suzanne').geometry;
        var scaleMat = new qtek.math.Matrix4();
        scaleMat.scale(new qtek.math.Vector3(3, 3, 3));
        geo.applyTransform(scaleMat);

        var mesh = new qtek.Mesh({
            geometry : geo,
            material : material
        });
        mesh.position.y = 20;
        mesh.material.set('glossiness', 0.7);

        var rigidBody = new RigidBody({
            shape : new ConvexHullShape({
                geometry : geo
            }),
            mass : 1
        });

        var collider = new Collider({
            collisionObject : rigidBody,
            physicsMaterial : new PhysicsMaterial({
                friction : 0.9
            }),
            sceneNode : mesh
        });
        engine.addCollider(collider);

        scene.add(mesh);
    });

    /****************************
            BVH Mesh
     ****************************/
    var loader = new qtek.loader.GLTF();
    loader.load('assets/env_stealth_collision.json');
    loader.success(function(res) {
        var _scene = res.scene;
        var geo = _scene.getNode('env_stealth_collision').geometry;
        var scaleMat = new qtek.math.Matrix4();
        scaleMat.scale(new qtek.math.Vector3(3, 3, 3));
        geo.applyTransform(scaleMat);

        var mesh = new qtek.Mesh({
            geometry : geo,
            culling : false,
            material : new qtek.Material({
                shader : qtek.shader.library.get('buildin.physical')
            })
        });
        mesh.position.set(-40, 0, -30);
        mesh.material.set('glossiness', 0.2);

        var body = new RigidBody({
            shape : new BvhTriangleMeshShape({
                geometry : geo
            }),
            mass : 1
        });

        engine.addCollider(new Collider({
            collisionObject : body,
            physicsMaterial : new PhysicsMaterial({
                friction : 0.9
            }),
            isStatic : true,
            sceneNode : mesh
        }));
        scene.add(mesh);
    });
    
    /****************************
            Ghost Object
     ****************************/
    var boxShape = new BoxShape({
        halfExtents : new qtek.math.Vector3(10, 10, 10)
    });
    var ghostObject = new GhostObject({
        shape : boxShape
    });
    var emptyNode = new qtek.Node({
        position : new qtek.math.Vector3(10, 0, 10)
    });
    var collider = new Collider({
        collisionObject : ghostObject,
        isGhostObject : true,
        sceneNode : emptyNode
    });

    engine.addCollider(collider);

    var force = new qtek.math.Vector3(0, 1, 0);
    var pos = new qtek.math.Vector3(0, 0, 10);
    collider.on('collision', function(contacts) {
        for (var i = 0; i < contacts.length; i++) {
            contacts[i].otherCollider.collisionObject.applyImpulse(force, pos);
        }
    });

    var control = new qtek.plugin.OrbitControl({
        target : camera,
        domElement : renderer.canvas
    });
    animation.on('frame', function(dTime) {
        control.update(dTime);
        engine.step(dTime);
        shadowMapPass.render(renderer, scene, camera);
        renderer.render(scene, camera);
    });
});