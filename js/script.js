"use strict";
/**
 * Median cut algorithm for generating a color palette given an image.
 */

var canvas = document.createElement('canvas');
var ctx = canvas.getContext("2d");
var imageUrl = "images/image.jpg";
var image = new Image();
var MAX_DEPTH = 3;

function init(){
    loadImage();
}

function loadImage(){
    image.src = imageUrl;
    image.onload = onImageLoad;
}

function onImageLoad(){
    var w = 500;
    var h = w * image.height/image.width
    canvas.width = w;
    canvas.height = h;
    paintImage(w, h);
    initSwatch();
}

function paintImage(w, h){
    ctx.drawImage(image, 0, 0, w, h);
    
}

function getPixels(){
    return ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    
}

function parseImageData(data){
   var result = [];
   for(var i = 0; i < data.length; i += 4){
       var pixel = {};
       pixel.r = data[i];
       pixel.g = data[i+1];
       pixel.b = data[i+2];

       result.push(pixel);
   }
   return result;
}

function render(swatch){
    document.body.appendChild(canvas);
    var sw = document.createElement('div');
    swatch.forEach(function(color){
        var div = document.createElement('div');
        div.style.width = '100px';
        div.style.height = '100px';
        div.style.display = 'inline-block';
        div.style['background-color'] = `rgb(${color.r}, ${color.g}, ${color.b})`;
        sw.appendChild(div);
    });
    var last = swatch[swatch.length - 1]
    // document.body.style['background-color'] = `rgb(${last.r}, ${last.g}, ${last.b})`;
    document.body.appendChild(sw);
}


function initSwatch(){
    var pixels = parseImageData(getPixels());
    var swatch = quantize(pixels, 0, 16);
    render(swatch);
}

function quantize(pixels, depth = 0){
    
    
    if(depth === MAX_DEPTH){
        var color = pixels.reduce(function(prev, current){
            prev.r += current.r;
            prev.g += current.g;
            prev.b += current.b;
            return prev;
        }, {
            r: 0,
            g: 0,
            b: 0
        });

        color.r = Math.round(color.r/pixels.length);
        color.g = Math.round(color.g/pixels.length);
        color.b = Math.round(color.b/pixels.length);
        return [color];
    }
    
    var channel = computeChannelWithHighestRange(pixels);

    pixels.sort(function(p1, p2){
        return p1[channel] - p2[channel];
    });

    var mid = pixels.length/2;

    var result = [...quantize(pixels.slice(0, mid), depth+1), ...quantize(pixels.slice(mid), depth+1)]
    
    return result;
    
}

function computeChannelWithHighestRange(data){
    var rMin = Number.POSITIVE_INFINITY;
    var rMax = Number.NEGATIVE_INFINITY;
    var gMin = Number.POSITIVE_INFINITY;
    var gMax = Number.NEGATIVE_INFINITY;
    var bMin = Number.POSITIVE_INFINITY;
    var bMax = Number.NEGATIVE_INFINITY;

    data.forEach(function(pixel){
        rMax = Math.max(rMax, pixel.r);
        rMin = Math.min(rMin, pixel.r);
        gMax = Math.max(gMax, pixel.g);
        gMin = Math.min(gMin, pixel.g);
        bMax = Math.max(bMax, pixel.b);
        bMin = Math.min(bMin, pixel.b);
    });

    var rRange = rMax - rMin;
    var gRange = gMax - gMin;
    var bRange = bMax - bMin;
    var biggestRange = Math.max(rRange, gRange, bRange);
    if(biggestRange === rRange){
        return 'r';
    } else if(biggestRange === gRange){
        return 'g';
    }
    return 'b';
}

window.onload = init;