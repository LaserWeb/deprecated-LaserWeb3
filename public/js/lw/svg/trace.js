// LaserWeb scope
var lw = lw || {};

(function () {
    'use strict';

    var MATH_PI_2               = Math.PI * 2;
    var DEG_TO_RAD              = Math.PI / 180;
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

    // =========================================================================

    // Adaptive Subdivision of Bezier Curves
    // http://www.antigrain.com/research/adaptive_bezier/index.html
    lw.svg.trace.QuadricBezier = function(settings) {
        this.init(settings);
    };

    // -------------------------------------------------------------------------

    // Initialize the class
    lw.svg.trace.QuadricBezier.prototype.init = function(settings) {
        this.levelLimit         = settings.levelLimit         || 32;    // Max level depth
        this.traceLimit         = settings.traceLimit         || 10000; // Max trace calls
        this.angleTolerance     = settings.angleTolerance     || 0.0;   // 0 = disabled
        this.approximationScale = settings.approximationScale || 1.0;

        this.distanceTolerance  = 0.5 / this.approximationScale;
        this.distanceTolerance *= this.distanceTolerance;

        this.p1 = settings.p1;
        this.p2 = settings.p2;
        this.p3 = settings.p3;

        this.points     = null;
        this.onPoint    = null;
        this.traceCount = null;

        if (settings.onPoint) {
            this.trace(settings.onPoint, settings.traceContext || this);
        }
    };

    // -------------------------------------------------------------------------

    // Compute and return the Bezier curves as points array
    lw.svg.trace.QuadricBezier.prototype.trace = function(onPoint, thisArg) {
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
        0);

        this._push(this.p3.x, this.p3.y);

        // Return the points collection
        return this.points;
    };

    // -------------------------------------------------------------------------

    lw.svg.trace.QuadricBezier.prototype._push = function(x, y) {
        this.points.push(x, y);

        if (this.onPoint) {
            this.onPoint(x, y, this.points.length / 2);
        }
    };

    // -------------------------------------------------------------------------

    // Compute and return the Bezier curves as points array
    lw.svg.trace.QuadricBezier.prototype._trace = function(x1, y1, x2, y2, x3, y3, level) {
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
        var x123  = (x12  +  x23) / 2;
        var y123  = (y12  +  y23) / 2;

        // Enforce subdivision first time
        if (level > 0)  {
            // Try to approximate the full cubic curve by a single straight line
            //------------------
            var dx = x3 - x1;
            var dy = y3 - y1;

            var d = Math.abs(((x2 - x3) * dy - (y2 - y3) * dx));

            if (d > COLLINEARITY_EPSILON) {
                // Regular care
                //-----------------
                if ((d * d) <= this.distanceTolerance * (dx*dx + dy*dy)) {
                    // If the curvature doesn't exceed the distance_tolerance value
                    // we tend to finish subdivisions.
                    //----------------------
                    if (this.angleTolerance < ANGLE_TOLERANCE_EPSILON) {
                        this._push(x123, y123);
                        return null;
                    }

                    // Angle & Cusp Condition
                    //----------------------
                    var da = Math.abs(Math.atan2(y3 - y2, x3 - x2) - Math.atan2(y2 - y1, x2 - x1));

                    if (da >= Math.PI) da = MATH_PI_2 - da;

                    if (da < this.angleTolerance) {
                        // Finally we can stop the recursion
                        //----------------------
                        this._push(x123, y123);
                        return null;
                    }
                }
            }
            else {
                // Collinear case
                //-----------------
                dx = x123 - (x1 + x3) / 2;
                dy = y123 - (y1 + y3) / 2;

                if (dx*dx + dy*dy <= this.distanceTolerance) {
                    this._push(x123, y123);
                    return null;
                }
            }
        }

        // Continue subdivision
        //----------------------
        this._trace(x1, y1, x12, y12, x123, y123, level + 1);
        this._trace(x123, y123, x23, y23, x3, y3, level + 1);
    };

    // =========================================================================

    // Arcs...
    // https://github.com/MadLittleMods/svg-curve-lib/blob/f07d6008a673816f4cb74a3269164b430c3a95cb/src/js/svg-curve-lib.js#L84
    lw.svg.trace.Arc = function(settings) {
        this.init(settings);
    };

    // -------------------------------------------------------------------------

    // Initialize the class
    lw.svg.trace.Arc.prototype.init = function(settings) {
        this.p1    = settings.p1;
        this.p2    = settings.p2;
        this.rx    = settings.rx;
        this.ry    = settings.ry;
        this.angle = settings.angle;
        this.large = settings.large;
        this.sweep = settings.sweep;

        this.points  = null;
        this.onPoint = null;
        this.radians = null;

        if (settings.onPoint) {
            this.trace(settings.onPoint, settings.traceContext || this);
        }
    };

    // -------------------------------------------------------------------------

    lw.svg.trace.Arc.prototype._push = function(x, y) {
        this.points.push(x, y);

        if (this.onPoint) {
            this.onPoint(x, y, this.points.length / 2);
        }
    };

    // -------------------------------------------------------------------------

    function mod(x, m) {
        return (x % m + m) % m;
    }

    function angleBetween(v0, v1) {
        var p    = v0.x * v1.x + v0.y * v1.y;
        var n    = Math.sqrt((Math.pow(v0.x, 2) + Math.pow(v0.y, 2)) * (Math.pow(v1.x, 2) + Math.pow(v1.y, 2)));
        var sign = v0.x * v1.y - v0.y * v1.x < 0 ? -1 : 1;

        return sign * Math.acos(p / n);
    }

    // Compute and return the Arc as points array
    lw.svg.trace.Arc.prototype.trace = function(onPoint, thisArg) {
        // Reset points collection
        this.points = [];

        // If the endpoints are identical, then this is equivalent
        // to omitting the elliptical arc segment entirely.
        if(this.p1.x === this.p2.x && this.p1.y === this.p2.y) {
            return this.points;
        }

        this.rx = Math.abs(this.rx);
        this.ry = Math.abs(this.ry);

        // If rx = 0 or ry = 0 then this arc is treated as
        // a straight line segment joining the endpoints.
        if(this.rx === 0 || this.ry === 0) {
            this.points.push(this.p1, this.p2);
            return this.points;
        }

        // Get angle in radians
        this.radians = mod(this.angle, 360) * DEG_TO_RAD;

        // Following "Conversion from endpoint to center parameterization"
        // http://www.w3.org/TR/SVG/implnote.html#ArcConversionEndpointToCenter

        // Step #1: Compute transformedPoint
        var dx = (this.p1.x - this.p2.x) / 2;
        var dy = (this.p1.y - this.p2.y) / 2;

        var transformedPoint = {
            x:  Math.cos(this.radians) * dx + Math.sin(this.radians) * dy,
            y: -Math.sin(this.radians) * dx + Math.cos(this.radians) * dy
        };

        // Ensure radii are large enough
        var radiiCheck = Math.pow(transformedPoint.x, 2) / Math.pow(this.rx, 2) + Math.pow(transformedPoint.y, 2) / Math.pow(this.ry, 2);

        if (radiiCheck > 1) {
            this.rx = Math.sqrt(radiiCheck) * this.rx;
            this.ry = Math.sqrt(radiiCheck) * this.ry;
        }

        // Step #2: Compute transformedCenter
        var cSquareNumerator = Math.pow(this.rx, 2) * Math.pow(this.ry, 2) - Math.pow(this.rx, 2) * Math.pow(transformedPoint.y, 2) - Math.pow(this.ry, 2) * Math.pow(transformedPoint.x, 2);
        var cSquareRootDenom = Math.pow(this.rx, 2) * Math.pow(transformedPoint.y, 2) + Math.pow(this.ry, 2) * Math.pow(transformedPoint.x, 2);
        var cRadicand        = cSquareNumerator / cSquareRootDenom;

        // Make sure this never drops below zero because of precision
        cRadicand = cRadicand < 0 ? 0 : cRadicand;
        var cCoef = (this.large !== this.sweep ? 1 : -1) * Math.sqrt(cRadicand);
        var transformedCenter = {
            x: cCoef * ( (this.rx * transformedPoint.y) / this.ry),
            y: cCoef * (-(this.ry * transformedPoint.x) / this.rx)
        };

        // Step #3: Compute center
        this.center = {
            x: Math.cos(this.radians) * transformedCenter.x - Math.sin(this.radians) * transformedCenter.y + ((this.p1.x + this.p2.x) / 2),
            y: Math.sin(this.radians) * transformedCenter.x + Math.cos(this.radians) * transformedCenter.y + ((this.p1.y + this.p2.y) / 2)
        };

        // Step #4: Compute start/sweep angles
        // Start angle of the elliptical arc prior to the stretch and rotate operations.
        // Difference between the start and end angles
        var startVector = {
            x: (transformedPoint.x - transformedCenter.x) / this.rx,
            y: (transformedPoint.y - transformedCenter.y) / this.ry
        };

        var endVector = {
            x: (-transformedPoint.x - transformedCenter.x) / this.rx,
            y: (-transformedPoint.y - transformedCenter.y) / this.ry
        };

        this.startAngle = angleBetween({ x: 1, y: 0 }, startVector);
        this.sweepAngle = angleBetween(startVector, endVector);

        if (! this.sweep && this.sweepAngle > 0) {
            this.sweepAngle -= MATH_PI_2;
        }

        else if (this.sweep && this.sweepAngle < 0) {
            this.sweepAngle += MATH_PI_2;
        }

        // We use % instead of `mod(..)` because we want it to be -360deg to 360deg(but actually in radians)
        this.sweepAngle %= MATH_PI_2;

        for (var p, t = 0; t <= 1; t += 0.01) {
            p = this.getPoint(t);
            this._push(p.x, p.y);
        }
        this._push(this.p2.x, this.p2.y);

        // Return the points collection
        return this.points;
    };

    // -------------------------------------------------------------------------

    lw.svg.trace.Arc.prototype.getPoint = function(t) {
        // From http://www.w3.org/TR/SVG/implnote.html#ArcParameterizationAlternatives
        var angle = this.startAngle + (this.sweepAngle * t);

        var ellipseComponentX = this.rx * Math.cos(angle);
        var ellipseComponentY = this.ry * Math.sin(angle);

        return {
            x: Math.cos(this.radians) * ellipseComponentX - Math.sin(this.radians) * ellipseComponentY + this.center.x,
            y: Math.sin(this.radians) * ellipseComponentX + Math.cos(this.radians) * ellipseComponentY + this.center.y
        };
    };

    // -------------------------------------------------------------------------
})();
