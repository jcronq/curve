function Curve(config)
{
	'use strict';

	this.points 		= [];
	this.currentPoint 	= -1;
	this.onChange		= config.callback || function(){};

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

    for (var i=0; i < config.points.length; i++ )
        this.addPoint(config.points[i]);
}

Curve.prototype.removePoint = function(pointIndex){
    this.points.splice(pointIndex, 1);
}

Curve.prototype.movePoint = function(pointIndex, newValue){
    this.points[pointIndex] = newValue;
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

Curve.prototype.getClosestPointToCoordinate = function(coordinate, threshold=0.1){
    var pointerX = coordinate.x;
    var pointerY = coordinate.y;

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
		}
	}	
    return clickedPoint;
}

// Return the normalized Y value for the specified X value. X should be passed normnalized too
Curve.prototype.getValueAt = function(xpos) {
	'use strict';

    var ret = 0;
    if(this.points.length == 1){
        ret = this.points[0].y;
    }

	return ret;
}

