
function Curve(canvas, callback)
{
	'use strict';

	this.points 		= [];
	this.currentPoint 	= -1;
	this.c 				= document.getElementById(canvas);
	this.ctx 			= this.c.getContext('2d');
	this.height 		= this.c.height;
	this.width 			= this.c.width;
	this.redraw			= 0;
	this.values			= [];
	this.rgb			= [];
	this.onChange		= callback;

	if (this.height != this.width) {
		console.error("ERROR: Canvas must have same width and height.");
		return undefined;
	}

    this.addPoint = function(point){
        if(this.points.length == 0 || point.x > this.points[this.points.length-1].x){
            this.points.push(point);
        }
        else if(point.x < this.points[0].x){
            this.points.splice(0,0,point);
        }
        else{
            for (var i=0; i<this.points.length -1; i++){
                if(this.points[i].x < point.x && this.points[i+1].x > point.x){
                    this.points.splice(i+1, 0, point);
                    break;
                }
            }
        }
    }

	this.addPoint({x: 0.1, y: 0.1});
/*	this.addPoint({x: 0.250, y: 0.250});
	this.addPoint({x: 0.750, y: 0.750});
	this.addPoint({x: 0.9, y: 0.9});
*/
 	var me = this; 
	
	this.c.addEventListener('mousedown', function(ev) { 
		me.mouseDown(ev); 
	}, false);

    this.c.addEventListener('contextmenu', function(ev){
        me.rightClick(ev);
    }, false);

	this.c.addEventListener('mouseup',  function(ev) { 
		me.mouseUp(ev);  
		me.draw(); 
	}, false);
	
	this.c.addEventListener('mouseout',  function(ev) { 
		me.mouseUp(ev);  
		me.draw(); 
	}, false);

	this.c.addEventListener('mousemove',  function(ev) { 
		me.mouseMove(ev);
		if (me.redraw == 1) {
			me.draw();
			me.redraw = 0;
		}
	}, false);

	this.draw();
}

// Compare 2 points
Curve.prototype.isEqual = function(p1,p2)
{
	'use strict';

	if (p1.x == p2.x && p1.y == p2.y) {
		return true;
	} else {
		return false;
	}

}

// Draw the curve
Curve.prototype.draw = function() {
	'use strict';

	var p1,p4;

	this.values.splice(0, this.values.length);
	this.ctx.clearRect(0, 0, this.width, this.height);
	this.drawGrid();

    if(this.points.length == 1){
        this.ctx.beginPath();
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = '#000000';
        this.ctx.moveTo(0, (1.0-this.points[0].y) * this.height);
        this.ctx.lineTo(this.width, (1.0-this.points[0].y) * this.height);
        this.ctx.stroke();
    }
    else{
        for(var i=0;i<this.points.length-1;i++)
        {
            if (i<1) { 
                p1 = this.points[0];
            } else { 
                p1 = this.points[i-1];
            }	 
            if (i+2 > this.points.length-1) {
                p4 = this.points[i+1];
            } else { 
                p4 = this.points[i+2];
            } 
            this.quadratic(p1,this.points[i],this.points[i+1],p4);
        }
    }
	this.drawPoints();
}

// The background border
Curve.prototype.drawBorder = function() {
	'use strict';

	this.ctx.beginPath();
	this.ctx.lineWidth = 1;
	this.ctx.strokeStyle = '#000000';
	this.ctx.rect(0,0,this.width,this.height);
	this.ctx.stroke();
}

// The background grid
Curve.prototype.drawGrid = function() {
	'use strict';

    this.drawBorder();

	var space = this.width/4.0;	

	this.ctx.beginPath();
	this.ctx.lineWidth = 1;
	this.ctx.strokeStyle = '#aaaaaa';
	
	for(var i=0;i<this.height-space;i+=space)
	{
		this.ctx.moveTo(0, i+space); this.ctx.lineTo(this.height, i+space);
	}
	for(var i=0;i<this.height-space;i+=space)
	{
		this.ctx.moveTo(i+space, 0); this.ctx.lineTo(i+space, this.height);
	}
	this.ctx.stroke();
}

// Main function. Calculate curve coeficients and draw the curve
Curve.prototype.quadratic = function(p1,p2,p3,p4) {
	'use strict';

	var x0,x1,x2,x3,y0,y1,y2,y3,dx,dy;

	this.ctx.strokeStyle = '#000000'; 
  	this.ctx.lineWidth = 1.5;
  	var slope = 0;

	x0 = p2.x;
	x3 = p3.x;

	y0 = p2.y;
	y3 = p3.y;

	dx = x3 - x0;
	dy = y3 - y0;

	x1 = ((2.0*x0)/3.0) + (x3/3.0)    
	x2 = (x0/3.0) + ((2.0*x3)/3.0);


	if (this.isEqual(p1,p2) && this.isEqual(p3,p4))
	{
      y1 = y0 + (dy / 3.0);
      y2 = y0 + ((dy * 2.0) / 3.0);
 	} 
	if (this.isEqual(p1,p2) && !this.isEqual(p3,p4) )
	{

		slope = ((p4.y) - y0) / (p4.x - x0);
		y2 = y3 - ((slope * dx) / 3.0);
		y1 = y0 + ((y2 - y0) / 2.0);
 
	}
	if (!this.isEqual(p1,p2) && this.isEqual(p3,p4) ) 
	{
      slope = (y3 - (p1.y)) / (x3 - p1.x);

      y1 = y0 + ((slope * dx) / 3.0);
      y2 = y3 + ((y1 - y3) / 2.0);
 	}

	if ( !this.isEqual(p1,p2) && !this.isEqual(p3,p4) ) {
		slope = (y3 - (p1.y)) / (x3 - p1.x);
		y1 = y0 + ((slope * dx) / 3.0);
		slope = ((p4.y) - y0) / (p4.x - x0);
		y2 = y3 - ((slope * dx) / 3.0);
 	}

	this.ctx.beginPath(); 	
	this.ctx.moveTo(x0*this.width, this.height-(y0*this.height)); 

	var step =(x3-x0)/20.0;	
	var tx = x0;

	for(var i=0.0;i<=1.05;i+=0.05) {	
		
		var ty =     (y0 * Math.pow((1-i),3)) +
	  		(3 * y1 * Math.pow((1-i),2) * i)     +
	  		(3 * y2 * (1-i) * i     * i)     +
	      	(y3 * i     * i     * i);

		this.ctx.lineTo(tx*this.width,this.height-(ty*this.height));
		this.values.push({x: tx, y: ty});
		tx = tx + step;

	}

	this.ctx.moveTo(0, this.height-(this.points[0].y*this.height));
	this.ctx.lineTo(this.points[0].x*this.width,this.height-(this.points[0].y*this.height));

	this.ctx.moveTo(this.points[this.points.length-1].x*this.width, this.height-(this.points[this.points.length-1].y*this.height));
	this.ctx.lineTo(this.width,this.height-(this.points[this.points.length-1].y*this.height));
	
	this.ctx.stroke();


	// Uncomment this for view the control points
	/*
	this.ctx.fillStyle = '#00ff00'; 
	this.ctx.beginPath();	

	this.ctx.moveTo(x1,y1);
	this.ctx.arc(x1,y1, 3, 0 , 2 * Math.PI, false);
	this.ctx.moveTo(x2,y2);
	this.ctx.arc(x2,y2, 3, 0 , 2 * Math.PI, false);
	
	this.ctx.fill();
	*/
	return true;

}

// Draw the control points
Curve.prototype.drawPoints = function() {
	'use strict';	

	this.ctx.fillStyle = '#ff0000'; 
	this.ctx.beginPath();	

    
        for(var i=0;i<this.points.length;i++)
        { 
            this.ctx.moveTo(this.points[i].x*this.width,this.height-(this.points[i].y*this.height));
            this.ctx.arc(this.points[i].x*this.width,this.height-(this.points[i].y*this.height), 3, 0 , 2 * Math.PI, false);
        }
	    this.ctx.fill();
    
}

Curve.prototype.getPointAtEvent = function(event){
    var pointerX = (event.pageX-this.c.offsetLeft)/this.width,
        pointerY = 1.0-((event.pageY-this.c.offsetTop)/this.height);

    console.log(event.pageY);
    console.log(this.c.offsetTop);
    console.log(this.height);

    const threshold = 0.1;
	var dis = 10000;
	var clickedPoint = -1;

	for (var i=0;i<this.points.length;i++)
	{
		var x1 = pointerX-this.points[i].x;
		var y1 = pointerY-this.points[i].y;

		var tdis = Math.sqrt(x1*x1+y1*y1);
		if (tdis < dis && tdis < threshold) { 
			dis = tdis;
			clickedPoint = i;
            console.log("Found Point: ", i);
		}
	}	
    return clickedPoint;
}

Curve.prototype.mouseDown = function(event) {
	'use strict';

	if(!event) var event = window.event;
    var clickedPoint = this.getPointAtEvent(event);
	
    if (clickedPoint !== -1 ){
        this.currentPoint = clickedPoint;
    }
    else{
        var pointerX = (event.pageX-this.c.offsetLeft)/this.width,
            pointerY = 1.0-((event.pageY-this.c.offsetTop)/this.height);
        const newPoint = {x: pointerX, y:pointerY};
        this.currentPoint = this.addPoint(newPoint);
    }
}

Curve.prototype.rightClick = function(event) {
	'use strict';

	if(!event) var event = window.event;
    var clickedPoint = this.getPointAtEvent(event);
	
    if (clickedPoint !== -1 ){
        this.points.splice(clickedPoint, 1);
    }
}

Curve.prototype.mouseUp = function(event) {
   'use strict';

	this.currentPoint = -1;
}

Curve.prototype.mouseMove = function(event) {
   'use strict';

   	var prevx,nextx;

	if (this.currentPoint == -1) return;

    try{
        if (this.currentPoint > 0) prevx = this.points[this.currentPoint-1].x; else prevx = 0;
        if (this.currentPoint==this.points.length-1) 
            nextx = 1.0; 
        else 
            nextx = this.points[this.currentPoint+1].x;
        
        var x = (event.pageX-this.c.offsetLeft)/this.width;
        var y = 1.0-((event.pageY-this.c.offsetTop)/this.height);
        if(x > prevx && x < nextx) {
            this.points[this.currentPoint].x = x;
            this.points[this.currentPoint].y = y;
        
            this.redraw = 1;		
        }
    }
    catch(e){
    }
}

// Return the normalized Y value for the specified X value. X should be passed normnalized too
Curve.prototype.getY = function(xpos) {
	'use strict';

    var ret = 0;
    if(this.points.length == 1){
        ret = this.points[0].y;
    }
    else if(this.points.length > 1){
        if (xpos < this.values[0].x) xpos = this.values[0].x;
        if (xpos > this.values[this.values.length-1].x) xpos = this.values[this.values.length-1].x;

        for(var i=0;i<this.values.length-2;i++)
        {
            if(xpos >= this.values[i].x && xpos < this.values[i+1].x) break;
        }
        var valuea = (xpos - this.values[i].x)/ (this.values[i+1].x-this.values[i].x);
        var valueb = valuea *  (this.values[i+1].y-this.values[i].y);

        var ret = this.values[i].y+valueb;
    }

	if (ret < 0.0) return 0.0;
	if (ret > 1.0) return 1.0;

	return ret;
}

