config = {
    callback: ()=>{console.log('callback')},
    points: [
        {x: 0, y:0},
        {x: 1, y:1},
        {x:0.75, y:0.25},
        {x:0.25, y:0.75},
    ]
};
curve1 = new Curve(config);
//curve1 = new Curve('curve',()=> console.log("Callback") );
