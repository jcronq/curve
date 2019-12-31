
function CurveView(canvas, curve)
{
	'use strict';

    this.curve          = curve;
	this.c 				= document.getElementById(canvas);
	this.ctx 			= this.c.getContext('2d');
	this.height 		= this.c.height;
	this.width 			= this.c.width;
	this.redraw			= 0;
	this.onChange		= config.callback;

    this.point_selection_threshold = config.point_select_threshold || 0.1;

	if (this.height != this.width) {
		console.error("ERROR: Canvas must have same width and height.");
		return undefined;
	}
 	
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
CurveView.prototype.isEqual = function(p1,p2)
{
	'use strict';

	if (p1.x == p2.x && p1.y == p2.y) {
		return true;
	} else {
		return false;
	}
}

// Draw the curve
CurveView.prototype.draw = function() {
	'use strict';

    const points = this.curve.points;
	var p1,p4;

	this.ctx.clearRect(0, 0, this.width, this.height);
	this.drawGrid();

    if(points.length == 1){
        this.ctx.beginPath();
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = '#000000';
        this.ctx.moveTo(0, (1.0-this.curve.points[0].y) * this.height);
        this.ctx.lineTo(this.width, (1.0-this.curve.points[0].y) * this.height);
        this.ctx.stroke();
    }
    else{
        for(var i=0;i<this.curve.points.length-1;i++)
        {
            if (i<1) { 
                p1 = points[0];
            } else { 
                p1 = points[i-1];
            }	 
            if (i+2 > points.length-1) {
                p4 = points[i+1];
            } else { 
                p4 = points[i+2];
            } 
            this.quadratic(p1,points[i],points[i+1],p4);
        }
    }
	this.drawPoints();
}

// The background border
CurveView.prototype.drawBorder = function() {
	'use strict';

	this.ctx.beginPath();
	this.ctx.lineWidth = 1;
	this.ctx.strokeStyle = '#000000';
	this.ctx.rect(0,0,this.width,this.height);
	this.ctx.stroke();
}

// The background grid
CurveView.prototype.drawGrid = function() {
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
CurveView.prototype.quadratic = function(p1,p2,p3,p4) {
	'use strict';

    const points = this.curve.points;
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
//		this.values.push({x: tx, y: ty});
		tx = tx + step;

	}

	this.ctx.moveTo(0, this.height-(points[0].y*this.height));
	this.ctx.lineTo(points[0].x*this.width,this.height-(points[0].y*this.height));

	this.ctx.moveTo(points[points.length-1].x*this.width, this.height-(points[points.length-1].y*this.height));
	this.ctx.lineTo(this.width,this.height-(points[points.length-1].y*this.height));
	
	this.ctx.stroke();
	return true;
}

// Draw the control points
CurveView.prototype.drawPoints = function() {
	'use strict';	

    const points = this.curve.points;
	this.ctx.fillStyle = '#ff0000'; 
	this.ctx.beginPath();	
    
    for(var i=0;i<points.length;i++)
    { 
        this.ctx.moveTo(points[i].x*this.width,this.height-(points[i].y*this.height));
        this.ctx.arc(points[i].x*this.width,this.height-(points[i].y*this.height), 3, 0 , 2 * Math.PI, false);
    }
    this.ctx.fill();
}

CurveView.prototype.getCoordinateFromEvent = function(event){
	if(!event) var event = window.event;
    var pointerCoordinate = {
        x: (event.pageX-this.c.offsetLeft)/this.width,
        y: 1.0-((event.pageY-this.c.offsetTop)/this.height)
    }
    return pointerCoordinate;
}

CurveView.prototype.mouseDown = function(event) {
	'use strict';

    var pointerCoordinate = this.getCoordinateFromEvent(event);
    var clickedPoint = this.curve.getClosestPointToCoordinate(pointerCoordinate, this.point_selection_threshold);
	
    if (clickedPoint !== -1 ){
        this.currentPoint = clickedPoint;
    }
    else{
        this.currentPoint = this.curve.addPoint(pointerCoordinate);
    }
}

CurveView.prototype.rightClick = function(event) {
	'use strict';

    var pointerCoordinate = this.getCoordinateFromEvent(event);
    var clickedPoint = this.curve.getClosestPointToCoordinate(pointerCoordinate, this.point_selection_threshold);
	
    if (clickedPoint !== -1 ){
        this.curve.removePoint(clickedPoint);
    }
}

CurveView.prototype.mouseUp = function(event) {
   'use strict';

	this.currentPoint = -1;
}

CurveView.prototype.mouseMove = function(event) {
   'use strict';

   	var prevx,nextx;
    const points = this.curve.points;
	if (this.currentPoint == -1) return;

    try{
        if (this.currentPoint > 0) 
            prevx = points[this.currentPoint-1].x; 
        else 
            prevx = 0;
        if (this.currentPoint==points.length-1) 
            nextx = 1.0; 
        else 
            nextx = points[this.currentPoint+1].x;
        
        var newPosition = {
            x: (event.pageX-this.c.offsetLeft)/this.width,
            y: 1.0-((event.pageY-this.c.offsetTop)/this.height)
        }; 
        if(newPosition.x > prevx && newPosition.x < nextx) {
            this.curve.movePoint(this.currentPoint, newPosition);
        
            this.redraw = 1;		
        }
    }
    catch(e){
    }
}

