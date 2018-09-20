// Variable initialisation
var canvas = document.querySelector( '#canvas' );
var context = canvas.getContext( '2d' );
var linePoints = [];
var toolMode = 'draw'
var toolSize = 5;
var toolColor = '#000000'
var canvasState = [];
var undoButton = document.querySelector( '[data-action=undo]' );
window.addEventListener( 'resize', resizeCanvas );
resizeCanvas();

// Defaults
context.strokeStyle = "#000000";
context.lineWidth = 5;
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
function clearCanvas() {
  var result = confirm( 'Are you sure you want to delete the picture?' );
  if ( result ) {
    context.clearRect( 0, 0, canvas.width, canvas.height );
    canvasState.length = 0;
    undoButton.classList.add( 'disabled' );
  }
}

function draw( e ) {
  if ( e.which === 1 || e.type === 'touchstart' || e.type === 'touchmove') {
    window.addEventListener( 'mousemove', draw );
    window.addEventListener( 'touchmove', draw );
    var mouseX = e.pageX - canvas.offsetLeft;
    var mouseY = e.pageY - canvas.offsetTop;
    var mouseDrag = e.type === 'mousemove';
      var swag = Math.random();
      if (swag < 0.33){
            toolSize = toolSize + 1; 
        }
        else if (swag < 0.66  && toolSize > 5){
            toolSize = toolSize - 1; 
        }
    if ( e.type === 'touchstart' || e.type === 'touchmove' ) {
        //console.log( e );
        mouseX = e.touches[0].pageX - canvas.offsetLeft;
        mouseY = e.touches[0].pageY - canvas.offsetTop;
        mouseDrag = e.type === 'touchmove';
    }
    if ( e.type === 'mousedown' || e.type === 'touchstart') saveState();        
    linePoints.push( { x: mouseX, y: mouseY, drag: mouseDrag, width: toolSize, color: toolColor } );
    updateCanvas();
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
    } else {
        context.moveTo( linePoints[i-1].x, linePoints[i-1].y );
      context.lineTo( linePoints[i].x, linePoints[i].y );
    }
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
  if ( e.target === e.currentTarget ) return;
  if ( !e.target.dataset.action ) highlightButton( e.target );
  toolSize = e.target.dataset.size || toolSize;
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