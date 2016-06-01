// namespace
var SLAcer = SLAcer || {};

;(function() {

    // Constructor
    function Mesh(geometry, material) {
        // normalize geometry
        if (geometry instanceof THREE.BufferGeometry) {
            geometry = new THREE.Geometry().fromBufferGeometry(geometry);
        }

        // center geometry
        geometry.center();

        // bounding box min coords
        //var min = geometry.boundingBox.min;

        // set geometry origin to [0, 0]
        //geometry.translate(-min.x, -min.y, -min.z);

        // call parent constructor
        THREE.Mesh.call(this, geometry, material || new THREE.MeshNormalMaterial());

        // get geometry volume
        this.getVolume();
    }

    // extends
    Mesh.prototype = Object.create(THREE.Mesh.prototype);
    Mesh.prototype.constructor = Mesh;

    // -------------------------------------------------------------------------

    Mesh.prototype.getSize = function() {
        return this.geometry.boundingBox.size();
    };

    // http://stackoverflow.com/questions/23279521
    Mesh.prototype.getVolume = function(update) {
        if (! update && this.userData.volume !== undefined) {
            return this.userData.volume;
        }

        var volume   = 0;
        var faces    = this.geometry.faces;
        var vertices = this.geometry.vertices;

        var face, v1, v2, v3;

        for (var i = 0; i < faces.length; i++) {
            face = faces[i];

            v1 = vertices[face.a];
            v2 = vertices[face.b];
            v3 = vertices[face.c];

            volume += (
                -(v3.x * v2.y * v1.z)
                +(v2.x * v3.y * v1.z)
                +(v3.x * v1.y * v2.z)
                -(v1.x * v3.y * v2.z)
                -(v2.x * v1.y * v3.z)
                +(v1.x * v2.y * v3.z)
            ) / 6;
        }

        return (this.userData.volume = volume);
    };

    // -------------------------------------------------------------------------

    // export module
    SLAcer.Mesh = Mesh;

})();
