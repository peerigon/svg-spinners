"use strict";

function ArcSpinner(namespace) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    var size = 100; // These sizes are just internal. Usually you'd inject
                    // the spinner into a container and modify that dimensions.
    var padding = 50;
    var outerSize = size + padding * 2;
    var offset = size / 2 + padding;

    this._render = this._render.bind(this);

    namespace = namespace || "arc-spinner";

    svg.setAttribute("class", namespace);
    svg.setAttribute("viewBox", "0 0 " + outerSize + " " + outerSize);

    path.setAttribute("transform", "translate(" + offset + ", " + offset + ")");
    path.setAttribute("class", namespace + "-path");

    svg.appendChild(path);

    this.node = svg;
    this._path = path;
}

ArcSpinner.prototype.node = null;

ArcSpinner.prototype._options = null;
ArcSpinner.prototype._callbackId = null;
ArcSpinner.prototype._start = 0;
ArcSpinner.prototype._path = null;

ArcSpinner.prototype.start = function (options) {
    options = options || {};
    options.speed = options.speed || 1;
    options.ease = "ease" in options? options.ease : true;
    this._options = options;
    if (this._callbackId !== null) {
        this.stop();
    }
    this._callbackId = window.requestAnimationFrame(this._render);
};

ArcSpinner.prototype.stop = function () {
    window.cancelAnimationFrame(this._callbackId);
    this._callbackId = null;
};

ArcSpinner.prototype._ease = function (value, time, duration) {
    if (this._options.ease === false) {
        return value;
    }
    time /= duration / 2;
    if (time < 1) {
        return value / 2 * Math.pow(time, 5);
    }
    time -= 2;
    return value / 2 * (Math.pow(time, 5) + 2);
};

ArcSpinner.prototype._render = function (timestamp) {
    var r = 50;
    var start = this._start;
    var d = "";
    var speed = this._options.speed;
    var turnDuration = 1 / speed;
    var firstCommand = "M";
    var isEvenTurn;
    var n;
    var nFraction;
    var radian;
    var t;
    var x;
    var y;
    var ccw; // counter-clockwise

    if (start) {
        t = (timestamp - start) / 1000;
        n = speed * t;
        nFraction = this._ease(n % 1, t % turnDuration, turnDuration);
        n = Math.floor(n) + nFraction;
    } else {
        this._start = timestamp;
        n = 0;
    }

    isEvenTurn = Math.floor(n) % 2 === 0;
    ccw = Math.round(n) === Math.floor(n + 1);
    radian = n * 2 * Math.PI;
    x = Math.sin(radian) * r;
    y = Math.cos(radian) * -r;

    if (this._options.fill) {
        d = "M 0 0";
        firstCommand = "L";
    }
    // Fix for missing precision
    // @see http://stackoverflow.com/questions/27659518/precision-of-svg-coordinates
    if (nFraction < 0.00001 || nFraction > 0.99999) {
        if (isEvenTurn) {
            d += firstCommand + " 0 -" + r + " " +
                "L 0 -" + r;
        } else {
            d += firstCommand + " 0 -" + r + " " +
                "A " + r + " " + r + " " +
                    "0 0 1 " +
                    "0 " + r + " " +
                "A " + r + " " + r + " " +
                    "0 1 1 " +
                    "0 -" + r + " ";
        }
    } else {
        if (isEvenTurn) {
            d += firstCommand + " 0 -" + r + " " +
                "A " + r + " " + r + " " +
                    "0 " + Number(ccw) + " 1 " +
                    x + " " + y;
        } else {
            d += firstCommand + " " + x + " " + y + " " +
                "A " + r + " " + r + " " +
                    "0 " + Number(!ccw) + " 1 " +
                    "0 -" + r;
        }
    }


    this._path.setAttribute("d", d);

    this._callbackId = window.requestAnimationFrame(this._render);
};

if (typeof module === "object") {
    module.exports = ArcSpinner;
}
