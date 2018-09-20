// Variable initialisation
var canvas = document.querySelector( '#canvas' );
var context = canvas.getContext( '2d' );
var linePoints = [];
var toolMode = 'draw'
var toolSize = 10;
var toolSizePerm = 10;
var lastPoint = null;
var toolColor = '#000000'
var canvasState = [];
var undoButton = document.querySelector( '[data-action=undo]' );
var autoErase;
var eraseTimerStart = false;
var autoEraseAlert = null;
window.addEventListener( 'resize', resizeCanvas );
resizeCanvas();

// Defaults
context.strokeStyle = "#000000";
context.lineWidth = 10;
context.lineJoin = "round";
context.lineCap = "round";

// Event listeners
canvas.addEventListener( 'mousedown', draw );
canvas.addEventListener( 'touchstart', draw );
window.addEventListener( 'mouseup', stop );
window.addEventListener( 'touchend', stop );
document.querySelector( '#tools' ).addEventListener( 'click', selectTool );
document.querySelector( '#colors' ).addEventListener( 'click', selectTool );

// Functions
function cancel() {
	clearTimeout(autoErase);
	document.getElementById("alert-message").style.zIndex = -1;
	document.getElementById("canvas").style.pointerEvents = "auto";
	eraseTimerStart = false;
	document.getElementById("message-text").innerText = "If you're still drawing, let us know by touching below. The drawing will erase in 15 seconds.";
	if(document.getElementById("canvas").style.pointerEvents !== "none" & eraseTimerStart === false){
		eraseTimerStart = true;
		autoEraseAlert = setTimeout(clearAlert, 10000);
	}
}

function clearAlert(){
	document.getElementById("alert-message").style.zIndex = 2;
	document.getElementById("canvas").style.pointerEvents = "none";
	autoErase = setTimeout(clearCanvas, 16000);
	reduce(15);
}

function clearCanvas() {
    context.clearRect( 0, 0, canvas.width, canvas.height );
    canvasState.length = 0;
    undoButton.classList.add( 'disabled' );
	document.getElementById("alert-message").style.zIndex = -1;
	document.getElementById("canvas").style.pointerEvents = "auto";
	eraseTimerStart = false;
}

function draw( e ) {
	if (autoEraseAlert != null) {
		clearTimeout(autoEraseAlert);
		eraseTimerStart = false;
	}
  if ( e.which === 1 || e.type === 'touchstart' || e.type === 'touchmove') {
    window.addEventListener( 'mousemove', draw );
    window.addEventListener( 'touchmove', draw );
    var mouseX = e.pageX - canvas.offsetLeft;
    var mouseY = e.pageY - canvas.offsetTop;
    var mouseDrag = e.type === 'mousemove';
	var swag = Math.random()*10+10;
	var kush = Math.random()*10+10;
    if ( e.type === 'touchstart' || e.type === 'touchmove' ) {
        //console.log( e );
        mouseX = e.touches[0].pageX - canvas.offsetLeft;
        mouseY = e.touches[0].pageY - canvas.offsetTop;
        mouseDrag = e.type === 'touchmove';
    }
	/*	Splash stuff
	var banter = Math.random() - 0.5;
	if (banter > 0){
		banter = 1;
	}
	else{
		banter = -1;
	}
	var memes = Math.random() - 0.5;
	if (memes > 0){
		memes = 1;
	}
	else{
		memes = -1;
	}
	var splash = null;
	if ( e.type === 'mousedown'){
		splash = {x: mouseX + banter*swag, y: mouseY + memes*kush};
	}
		console.log(e);*/
	if (lastPoint !== null){
		var distX = mouseX - lastPoint.x;
		var distY = mouseY - lastPoint.y;
		var dist = Math.sqrt(distX*distX + distY*distY);
	} 
	else{
		var dist = 0;
	}
	if (dist < 50){
		toolSize = toolSizePerm - (toolSizePerm-1)*dist/50;
	}
	else{
		toolSize = 1;
	}
    if ( e.type === 'mousedown' || e.type === 'touchstart') saveState();  
	//lastPoint = { x: mouseX, y: mouseY, drag: mouseDrag, width: toolSize, color: toolColor, splash: splash};
	lastPoint = { x: mouseX, y: mouseY, drag: mouseDrag, width: toolSize, color: toolColor};
    linePoints.push( lastPoint );
    updateCanvas();
  }
}

function reduce(sec){
	var alertMessage = document.getElementById("message-text");
	if (sec >= 0 && eraseTimerStart == true) {
		alertMessage.innerText = "If you're still drawing, let us know by touching below. The drawing will erase in "+sec+" seconds.";
		var repeat = setTimeout(reduce, 1000, sec-1);
	}
}

function highlightButton( button ) {
  var buttons = button.parentNode.querySelectorAll( 'img' );
  buttons.forEach( function( element ){ element.classList.remove( 'active' ) } );
  button.classList.add( 'active' );
}

function renderLine() {
  for ( var i = 0, length = linePoints.length; i < length; i++ ) {
      context.lineWidth = linePoints[i].width; 

    if ( !linePoints[i].drag ) {
      //context.stroke();
      context.beginPath();

    //context.lineWidth = linePoints[i].width; 
      context.strokeStyle = linePoints[i].color;
      context.moveTo( linePoints[i].x, linePoints[i].y );
      context.lineTo( linePoints[i].x + 0.5, linePoints[i].y + 0.5 );
    }
	else {
        context.moveTo( linePoints[i-1].x, linePoints[i-1].y );
      context.lineTo( linePoints[i].x, linePoints[i].y );
    }
      context.stroke();
      context.beginPath();
	/*	Splash dot stuff
	if (linePoints[i].splash != null){
		context.arc(linePoints[i].splash.x, linePoints[i].splash.y, 2, 2*Math.PI, false);
		context.fillStyle = linePoints[i].color;
		context.fill();
	}*/
      context.stroke();
      context.beginPath();
  }

  if ( toolMode === 'erase' ) {
    context.globalCompositeOperation = 'destination-out';
  } else {
    context.globalCompositeOperation = 'source-over';
  }
  
  //context.stroke();
}

function resizeCanvas() {
 canvas.width = canvas.clientWidth;
 canvas.height = canvas.clientHeight;
    if ( canvasState.length ) updateCanvas();
}

function saveState() {
  canvasState.unshift( context.getImageData( 0, 0, canvas.width, canvas.height ) );
  linePoints = [];
  if ( canvasState.length > 25 ) canvasState.length = 25;
  undoButton.classList.remove( 'disabled' );
}

function selectTool( e ) {
	if (autoEraseAlert != null) {
		clearTimeout(autoEraseAlert);
		eraseTimerStart = false;
	}
  if ( e.target === e.currentTarget ) return;
  if ( !e.target.dataset.action ) highlightButton( e.target );
  toolSize = e.target.dataset.size || toolSize;
  toolSizePerm = e.target.dataset.size || toolSize;
  toolMode = e.target.dataset.mode || toolMode;
  toolColor = e.target.dataset.color || toolColor;
  if ( e.target === undoButton ) undoState();
  if ( e.target.dataset.action == 'delete' ) clearCanvas();
}

function stop( e ) {
  if ( e.which === 1 || e.type === 'touchend') {
    window.removeEventListener( 'mousemove', draw );
    window.removeEventListener( 'touchmove', draw );
  }
  if(document.getElementById("canvas").style.pointerEvents !== "none" & eraseTimerStart === false){
	  eraseTimerStart = true;
	autoEraseAlert = setTimeout(clearAlert, 10000);
  }
}

function undoState() {
  context.putImageData( canvasState.shift(), 0, 0 );
  if ( !canvasState.length ) undoButton.classList.add( 'disabled' );
}

function updateCanvas() {
  context.clearRect( 0, 0, canvas.width, canvas.height );
  context.putImageData( canvasState[ 0 ], 0, 0 );
  renderLine();
}