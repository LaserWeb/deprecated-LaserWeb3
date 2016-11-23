// LaserWeb scope
var lw = lw || {};

(function () {
    'use strict';

    var MATH_PI_2               = Math.PI * 2;
    var COLLINEARITY_EPSILON    = Number.EPSILON;
    var ANGLE_TOLERANCE_EPSILON = 0.01;

    // -------------------------------------------------------------------------

    // SVG trace scope
    lw.svg.trace = {};

    // -------------------------------------------------------------------------

    // Adaptive Subdivision of Bezier Curves
    // http://www.antigrain.com/research/adaptive_bezier/index.html
    lw.svg.trace.CubicBezier = function(settings) {
        this.init(settings);
    };

    // -------------------------------------------------------------------------

    // Initialize the class
    lw.svg.trace.CubicBezier.prototype.init = function(settings) {
        this.levelLimit         = settings.levelLimit         || 32;    // Max level depth
        this.traceLimit         = settings.traceLimit         || 10000; // Max trace calls
        this.cuspLimit          = settings.cuspLimit          || 0.0;   // 0 = disabled
        this.angleTolerance     = settings.angleTolerance     || 0.0;   // 0 = disabled
        this.approximationScale = settings.approximationScale || 1.0;

        this.distanceTolerance  = 0.5 / this.approximationScale;
        this.distanceTolerance *= this.distanceTolerance;

        this.p1 = settings.p1;
        this.p2 = settings.p2;
        this.p3 = settings.p3;
        this.p4 = settings.p4;

        this.points     = null;
        this.onPoint    = null;
        this.traceCount = null;

        if (settings.onPoint) {
            this.trace(settings.onPoint, settings.traceContext || this);
        }
    };

    // -------------------------------------------------------------------------

    // Compute and return the Bezier curves as points array
    lw.svg.trace.CubicBezier.prototype.trace = function(onPoint, thisArg) {
        // Reset points collection
        this.points     = [];
        this.traceCount = 0;

        if (onPoint) {
            this.onPoint = function(x, y, i) {
                onPoint.call(thisArg, x, y, i);
            };
        }

        // Compute points array
        this._push(this.p1.x, this.p1.y);

        this._trace(
            this.p1.x, this.p1.y,
            this.p2.x, this.p2.y,
            this.p3.x, this.p3.y,
            this.p4.x, this.p4.y,
        0);

        this._push(this.p4.x, this.p4.y);

        // Return the points collection
        return this.points;
    };

    // -------------------------------------------------------------------------

    lw.svg.trace.CubicBezier.prototype._push = function(x, y) {
        this.points.push(x, y);

        if (this.onPoint) {
            this.onPoint(x, y, this.points.length / 2);
        }
    };

    // -------------------------------------------------------------------------

    // Compute and return the Bezier curves as points array
    lw.svg.trace.CubicBezier.prototype._trace = function(x1, y1, x2, y2, x3, y3, x4, y4, level) {
        // Recursion limit
        if (level > this.levelLimit) {
            return null;
        }

        if (this.traceCount > this.traceLimit) {
            throw new Error('!!!SAFE LIMIT!!!');
            return null;
        }

        this.traceCount++;

        // Calculate all the mid-points of the line segments
        //----------------------
        var x12   = (x1   +   x2) / 2;
        var y12   = (y1   +   y2) / 2;
        var x23   = (x2   +   x3) / 2;
        var y23   = (y2   +   y3) / 2;
        var x34   = (x3   +   x4) / 2;
        var y34   = (y3   +   y4) / 2;
        var x123  = (x12  +  x23) / 2;
        var y123  = (y12  +  y23) / 2;
        var x234  = (x23  +  x34) / 2;
        var y234  = (y23  +  y34) / 2;
        var x1234 = (x123 + x234) / 2;
        var y1234 = (y123 + y234) / 2;

        // Enforce subdivision first time
        if (level > 0)  {
            // Try to approximate the full cubic curve by a single straight line
            //------------------
            var dx = x4 - x1;
            var dy = y4 - y1;

            var d2 = Math.abs(((x2 - x4) * dy - (y2 - y4) * dx));
            var d3 = Math.abs(((x3 - x4) * dy - (y3 - y4) * dx));

            var da1, da2;

            if (d2 > COLLINEARITY_EPSILON && d3 > COLLINEARITY_EPSILON) {
                // Regular care
                //-----------------
                if ((d2 + d3)*(d2 + d3) <= this.distanceTolerance * (dx*dx + dy*dy)) {
                    // If the curvature doesn't exceed the distance_tolerance value
                    // we tend to finish subdivisions.
                    //----------------------
                    if (this.angleTolerance < ANGLE_TOLERANCE_EPSILON) {
                        this._push(x1234, y1234);
                        return null;
                    }

                    // Angle & Cusp Condition
                    //----------------------
                    var a23 = Math.atan2(y3 - y2, x3 - x2);
                        da1 = Math.abs(a23 - Math.atan2(y2 - y1, x2 - x1));
                        da2 = Math.abs(Math.atan2(y4 - y3, x4 - x3) - a23);

                    if (da1 >= Math.PI) da1 = MATH_PI_2 - da1;
                    if (da2 >= Math.PI) da2 = MATH_PI_2 - da2;

                    if (da1 + da2 < this.angleTolerance) {
                        // Finally we can stop the recursion
                        //----------------------
                        this._push(x1234, y1234);
                        return null;
                    }

                    if (this.cuspLimit != 0.0) {
                        if (da1 > this.cuspLimit) {
                            this._push(x2, y2);
                            return null;
                        }

                        if (da2 > this.cuspLimit) {
                            this._push(x3, y3);
                            return null;
                        }
                    }
                }
            }
            else {
                if (d2 > COLLINEARITY_EPSILON) {
                    // p1,p3,p4 are collinear, p2 is considerable
                    //----------------------
                    if (d2 * d2 <= this.distanceTolerance * (dx*dx + dy*dy)) {
                        if (this.angleTolerance < ANGLE_TOLERANCE_EPSILON) {
                            this._push(x1234, y1234);
                            return null;
                        }

                        // Angle Condition
                        //----------------------
                        da1 = Math.abs(Math.atan2(y3 - y2, x3 - x2) - Math.atan2(y2 - y1, x2 - x1));

                        if (da1 >= Math.PI) da1 = MATH_PI_2 - da1;

                        if (da1 < this.angleTolerance) {
                            this._push(x2, y2);
                            this._push(x3, y3);
                            return null;
                        }

                        if (this.cuspLimit != 0.0) {
                            if (da1 > this.cuspLimit) {
                                this._push(x2, y2);
                                return null;
                            }
                        }
                    }
                }
                else if (d3 > COLLINEARITY_EPSILON) {
                    // p1,p2,p4 are collinear, p3 is considerable
                    //----------------------
                    if (d3 * d3 <= this.distanceTolerance * (dx*dx + dy*dy)) {
                        if (this.angleTolerance < ANGLE_TOLERANCE_EPSILON) {
                            this._push(x1234, y1234);
                            return null;
                        }

                        // Angle Condition
                        //----------------------
                        da1 = Math.abs(Math.atan2(y4 - y3, x4 - x3) - Math.atan2(y3 - y2, x3 - x2));

                        if (da1 >= Math.PI) da1 = MATH_PI_2 - da1;

                        if (da1 < this.angleTolerance) {
                            this._push(x2, y2);
                            this._push(x3, y3);
                            return null;
                        }

                        if (this.cuspLimit != 0.0) {
                            if (da1 > this.cuspLimit) {
                                this._push(x3, y3);
                                return null;
                            }
                        }
                    }
                }
                else {
                    // Collinear case
                    //-----------------
                    dx = x1234 - (x1 + x4) / 2;
                    dy = y1234 - (y1 + y4) / 2;

                    if (dx*dx + dy*dy <= this.distanceTolerance) {
                        this._push(x1234, y1234);
                        return null;
                    }
                }
            }
        }

        // Continue subdivision
        //----------------------
        this._trace(x1, y1, x12, y12, x123, y123, x1234, y1234, level + 1);
        this._trace(x1234, y1234, x234, y234, x34, y34, x4, y4, level + 1);
    };

    // -------------------------------------------------------------------------
})();
