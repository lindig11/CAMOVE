var Walking = function () {
	//DEBUG
	// var line1;
	// var line2;
	// var line11;
	// var lineAlpha;
	// var lineBeta;
	// var lineGamma;

	//keywords
	var _KEYWALKING = "walking";
	var _KEYSTATIC = "static";
	var _KEYSTEP = "step";

	var _stepsList = new Array();
	var _lastStepTime = new Date().getTime();
	var _isWalking = false;
	var _stepCount = 0;

	var _onWalking = function(){
		if(defaults.CSS){apply(_KEYWALKING);}
		if(defaults.onWalking !== undefined){
			defaults.onWalking();
		}
	};
	var _onStatic = function(){
		if(defaults.CSS){apply(_KEYSTATIC);}
		if(defaults.onStatic !== undefined){
			defaults.onStatic();
		}
	};

	var defaults = {
		onWalking: undefined,
		onStatic: undefined,
		onStep: undefined,

		STEP_SENSITIVITY: 0.8, //what counts as step
		SPEED_S_W : 1.0, //walking around 1.4 steps per second
		WINDOW_S_W: 10000,
		SPEED_W_S: 0.8,
		WINDOW_W_S: 10000,
		// MAX_STD_OVER_AVG_S_W: 1.0, //performance?
		MIN_DELAY_START_NEXT_STEP: 90,

		CSS: false
	}
	
	// Create options by extending defaults with the passed arguments 
  	// https://scotch.io/tutorials/building-your-own-javascript-modal-plugin
	if (arguments[0] && typeof arguments[0] === "object") {
		extendDefaults(arguments[0]);
	}

	//initialize class to default for walking
	$("*").addClass(_KEYSTATIC);

	if (window.DeviceMotionEvent && window.DeviceOrientationEvent) {
		window.addEventListener("devicemotion", function(evt){
			stepDetection(evt);
			walkDetection();
		}, false);
	};

	//Debug
	// var smoothie = new SmoothieChart({interpolation:'linear'}); //{maxValue:2.5,minValue:-2.5}
	// line1 = new TimeSeries();
	// // line2 = new TimeSeries();
	// smoothie.streamTo(document.getElementById("myCanvas"));
	// smoothie.addTimeSeries(line1, {strokeStyle:"rgb(0,255,0)"});
	// // smoothie.addTimeSeries(line2, {strokeStyle:"rgb(255,255,255)"});
	// var smoothie2 = new SmoothieChart({interpolation:'step'});
	// line11 = new TimeSeries();
	// smoothie2.streamTo(document.getElementById("myCanvas2"));
	// smoothie2.addTimeSeries(line11);
	// ///
	// lineAlpha = new TimeSeries();
	// lineBeta = new TimeSeries();
	// lineGamma = new TimeSeries();
	// var smoothie3 = new SmoothieChart();
	// smoothie3.streamTo(document.getElementById("rotation"));
	// smoothie3.addTimeSeries(lineAlpha, {strokeStyle:"rgb(255,0,0)"});
	// smoothie3.addTimeSeries(lineBeta, {strokeStyle:"rgb(0,255,0)"});
	// smoothie3.addTimeSeries(lineGamma, {strokeStyle:"rgb(0,0,255)"});
	

	//setter function
	this.set = function() {
		if (arguments[0] && typeof arguments[0] === "object") {
			extendDefaults(arguments[0]);
		}
	}

	//getter functions
	this.get = function(arg){return defaults[arg]};
	this.getAll = function(){return defaults};


	var _halfStep = false;
	function stepDetection(evt) {
		var yg = evt.acceleration.y; //earth acceleration removed
		var now = new Date().getTime();

		//DEBUG
		// line11.append(new Date().getTime(), yg);

		if(_stepsList.length > 0 && _stepsList[0][1] < new Date().getTime() - Math.max(defaults.SPEED_S_W*defaults.WINDOW_S_W, defaults.SPEED_W_S*defaults.WINDOW_W_S) ){
			_stepsList.shift();
		}
		if (yg > defaults.STEP_SENSITIVITY && _lastStepTime + defaults.MIN_DELAY_START_NEXT_STEP <= now) {
			_halfStep = true;
		}
		
		if (yg < -defaults.STEP_SENSITIVITY) {
			if (_halfStep == true) {
				_stepCount++;
				_halfStep = false;
					
				_stepsList.push([now-_lastStepTime, now]);
				_lastStepTime = now;

				if(defaults.onStep !== undefined){
					defaults.onStep();
				}
			}
		}

		//DEBUG
		// line1.append(new Date().getTime(), stepDetected ? 1 : 0);
		// var time = _isWalking ? defaults.WINDOW_W_S : defaults.WINDOW_S_W;
		// var speed = _stepsList.filter(function(t){
		// 	return t[1] >= now-time;
		// }).length/time*1000;
		// $('#stepsPerSecond').text(Math.round(speed*100)/100);
	}
	
	var _timeStateChange = new Date().getTime(); //use to wait window time till next state change can happen
	function walkDetection() {

		var now = new Date().getTime();


		if(_isWalking && _timeStateChange + defaults.WINDOW_W_S <= now){ //grace period between state change
			var currentSteps = _stepsList.filter(function(t){
				return t[1] >= now-defaults.WINDOW_W_S;
			}).length;
			if(currentSteps <= defaults.SPEED_W_S*defaults.WINDOW_W_S/1000){ //state change condition
				_onStatic();
				_isWalking = false;
				_timeStateChange = now;
			}
		}else if(_timeStateChange + defaults.WINDOW_S_W <= now){
			var currentSteps = _stepsList.filter(function(t){
				return t[1] >= now-defaults.WINDOW_S_W;
			}).length;
			if(currentSteps >= defaults.SPEED_S_W*defaults.WINDOW_S_W/1000){
				_onWalking();
				_isWalking = true;
				_timeStateChange = now;
			}
		}
	}

	// Utility method to extend defaults with user options (see: https://scotch.io/tutorials/building-your-own-javascript-modal-plugin)
	function extendDefaults(properties) {
		for (property in properties) {
			if (properties.hasOwnProperty(property)) {
				defaults[property] = properties[property];
			}
		}
  	}

	//apply all CSS rules according to current walking state
	function apply(status, count) {
		if(status===_KEYSTATIC || status===_KEYWALKING){
			$("*").removeClass(_KEYSTATIC+" "+_KEYWALKING);
			$("*").addClass(status);
		}
	}
}