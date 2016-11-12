// LaserWeb scope
var lw = lw || {};

(function () {
    'use strict';

    lw.viewer.Label = function(settings) {
        // Call parent constructor
        THREE.Object3D.call(this);

        // Defaults settings
        var render = settings.render || 'webgl';
        var size   = settings.size   || 10;
        var text   = settings.text;

        // Create canvas and get his 2D context
        var canvas  = document.createElement('canvas');
        var context = canvas.getContext('2d');

        // Calculate text width
        var height   = 100;
        context.font = "normal " + height + "px Arial";
        var metrics  = context.measureText(text);
        var width    = metrics.width;

        // Create text label
        canvas.width  = width;
        canvas.height = height;

        context.textAlign    = "center";
        context.textBaseline = "middle";
        context.fillStyle    = settings.color;
        context.font         = "normal " + height + "px Arial";

        context.fillText(text, width / 2, height / 2);

        var texture         = new THREE.Texture(canvas);
        texture.minFilter   = THREE.LinearFilter;
        texture.needsUpdate = true;

        var material = new THREE.SpriteMaterial({
            map        : texture,
            transparent: true,
            opacity    : 0.6
        });

        this.width      = (width / height) * this.height;
        this.height     = size;
        this.position.x = settings.x;
        this.position.y = settings.y;
        this.position.z = settings.z;

        var sprite = new THREE.Sprite(material);

        if (render == "2d") {
            sprite.scale.set(this.width / width, this.height / height, 1);
        }
        else {
            sprite.scale.set(width / height * size, size, 1);
        }

        this.add(sprite);
    }

    // Extends THREE.Object3D
    lw.viewer.Label.prototype             = Object.create(THREE.Object3D.prototype);
    lw.viewer.Label.prototype.constructor = lw.viewer.Label;

// End viewer scope
})();
