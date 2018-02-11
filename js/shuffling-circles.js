// TODO: make step through process for user

//global vars
// Starting coordinates for all circles
let startYCord = 150;
let startXCord = 50;

// The max radius for any circle object
let maxRadius = 50;


//build canvas
var bubbleCanvas = d3.select("#bubble-sort-canvas")
                    .append("svg")
                    .attr("width", 1000)
                    .attr("height", 400);

// Create and draw bubble collection of circles to be sorted
let bubbleSortWeightsArray = generateRandomArrayWeights();
let bubbleSortObjects = drawCircles(bubbleCanvas, 10, bubbleSortWeightsArray);


var selectionSortCanvas = d3.select("#selection-sort-canvas")
                            .append("svg")
                            .attr("width", 1000)
                            .attr("height", 400);

// Create and draw selection sorts collection of circles to be sorted
let selectionSortWeights = generateRandomArrayWeights();
let selectionSortObjects = drawCircles(selectionSortCanvas, 10, selectionSortWeights);

//Insertion sort logic
var insertionSortCanvas = d3.select("#insertion-sort-canvas")
                            .append("svg")
                            .attr("width", 1000)
                            .attr("height", 400);

let insertionSortWeightsArray = generateRandomArrayWeights();
let insertionSortObjects = drawCircles(insertionSortCanvas, 10, insertionSortWeightsArray);


// Draw circles onto a canvas
// canvas: The canvas to draw onto
// numberOfCircles: Number of circles to draw
// weightsArray: the list of circles weights
function drawCircles(canvas, numberOfCircles, weightsArray){
  let createdCirclesObjs = [];
  for(let i=0; i<numberOfCircles; i++){
    let circleSize = weightsArray[i];
    let circleEle = createCircleEle(canvas, i, circleSize);
    createdCirclesObjs.push(circleEle);
  }

  return createdCirclesObjs;
}

//Creates a circle element in a line along the designated x axis
function createCircleEle(canvas, eleStartIndex, circleSize){
  // The current circle's x coordinate
  let circleXCord = startXCord + (eleStartIndex * 2 * maxRadius);

  //TODO use group instead of object class to reduce code
  let circleEle = canvas.append("circle")
                    .attr("cx", circleXCord)
                    .attr("cy", startYCord)
                    .attr("r", circleSize)
                    .attr("fill", getRandomColor);
  let textEle = canvas.append("text")
                    .attr("x", circleXCord)
                    .attr("y", startYCord)
                    .attr("dy", ".5em")
                    .style("text-anchor", "middle")
                    .text(circleSize);

  let circleObject = {
    circleElement: circleEle,
    textElement: textEle
  }

  return circleObject;
}

// TODO: Passing index could be replaced by poping the steps off the stepList
// Recrusive function to animate the steps of the algorithm
// stepIndex: the current step of the algorithm
// stepList: the total list of steps in the algorithm
// compareForward: the direction to compare logic in. True if comparing n < n - 1
function animateLoop(canvas, stepIndex, stepList, circleObjects, compareForward){
  curAlgoritmStep = stepList[stepIndex];
  console.log("index A: " + curAlgoritmStep.indexA);
  console.log("index B: " + curAlgoritmStep.indexB);

  let circle1Index = curAlgoritmStep.indexA;
  let circle2Index = curAlgoritmStep.indexB;

  let circle1 = circleObjects[circle1Index];
  let circle2 = circleObjects[circle2Index];

  let comparisonDelayTime = drawLogic(canvas, circle1, circle2, compareForward);

  d3.timeout(function(){
    let swapDelayTime = 500;
    if(curAlgoritmStep.swapRequired){
      swapDelayTime = swapPlaces(circle1, circle2);

      //Update the circleslist
      circleObjects[circle1Index] = circle2;
      circleObjects[circle2Index] = circle1;
      console.log('swapping ' + circle1Index + ' with ' + circle2Index);
    }

    d3.timeout(function(){
      if(stepIndex < stepList.length-1){
        animateLoop(canvas, stepIndex+1, stepList, circleObjects, compareForward);
      }
    }, swapDelayTime);

  }, comparisonDelayTime);

}

//Setup the canvas then kick off the selection animation loop
function selectionSortAnimation(canvas, stepList){
  let curMin = selectionSortObjects[stepList[0].indexA].textElement.text();
  let minText = canvas.append("text")
                      .attr("x", 40)
                      .attr("y", 10)
                      .attr("dy", ".5em")
                      .style("text-anchor", "left")
                      .attr("font-size", "20px")
                      .text("Current Min: " + curMin);

  selectionSortAnimationLoop(canvas, 0, stepList, minText);
}

function selectionSortAnimationLoop(canvas, stepIndex, stepList, minTextEle){
  curAlgoritmStep = stepList[stepIndex];

  let circle1Index = curAlgoritmStep.indexA;
  let circle2Index = curAlgoritmStep.indexB;
  // TODO: pass in the list of objects to sort, don't use global
  let circle1 = selectionSortObjects[circle1Index];
  let circle2 = selectionSortObjects[circle2Index];

  let comparisonDelayTime;
  if(curAlgoritmStep.action != "swap"){
    comparisonDelayTime = drawSelectionLogic(canvas, circle1, circle2, minTextEle);
  } else {
    comparisonDelayTime = announceSwap(canvas, circle1, circle2);
  }

  d3.timeout(function(){
    let swapDelayTime = 500;
    if(curAlgoritmStep.action == "swap"){
      swapDelayTime = swapPlaces(circle1, circle2);

      //Update the circleslist
      selectionSortObjects[circle1Index] = circle2;
      selectionSortObjects[circle2Index] = circle1;
      console.log('swapping ' + circle1Index + ' with ' + circle2Index);
    }

    d3.timeout(function(){
      if(stepIndex < stepList.length-1){
        selectionSortAnimationLoop(canvas, stepIndex+1, stepList, minTextEle);
      }
    }, swapDelayTime);

  }, comparisonDelayTime);
}

function announceSwap(canvas, circleObject1, circleObject2){
  //Draw text
  let circleAValue = circleObject1.textElement.text();
  let circleBValue = circleObject2.textElement.text();

  //time of text announcement visibility
  textVisiblityTime = 2000;

  // Show anouncement text
  let announcementText = canvas.append("text")
                      .attr("x", 500)
                      .attr("y", 20)
                      .attr("dy", ".5em")
                      .style("text-anchor", "middle")
                      .attr("font-size", "20px")
                      .text("Swapping " + circleBValue + " for new min " + circleAValue + ".");

  announcementText.transition()
                  .delay(textVisiblityTime)
                  .remove();


  return textVisiblityTime;
}

//TODO combine with draw logic
function drawSelectionLogic(canvas, circleObject1, circleObject2, minText){
  let distanceAbove = -60;
  let identiferSize = 10;
  let removalDelay = 2000;
  let thoughtTimeDelay = 1000; //Time to delay before answering the comparison
  let circle1 = circleObject1.circleElement;
  let circle2 = circleObject2.circleElement;

  //Draw text
  let circleAValue = circleObject1.textElement.text();
  let circleBValue = circleObject2.textElement.text();

  //create group element
  let questionGroup = canvas.append("g");
 
  // Show comparison text
  let comparisonTextEle = questionGroup.append("text")
  .attr("x", 500)
  .attr("y", 20)
  .attr("dy", ".5em")
  .style("text-anchor", "middle")
  .attr("font-size", "20px")
  .text("Is " + circleAValue + " < " + circleBValue + " ?");

  // Determine outcome text
  // A realist's assumption
  let outcomeColor = "green";
  let outcomeText = "Yes, do nothing!";

  // Test if a new min has been found
  if(circleAValue > circleBValue){
    outcomeColor = "red";
    outcomeText = "Nope, save the new min!";
    minText.transition()
    .delay(thoughtTimeDelay + 300)
    .text("Current Min: " + circleBValue);
  }

  // Create text area for outcome of comparison
  let outcomeTextEle = questionGroup.append("text")
                    .style("fill", outcomeColor)
                    .transition()
                    .delay(thoughtTimeDelay)
                    .attr("x", 500)
                    .attr("y", 45)
                    .attr("dy", ".5em")
                    .style("text-anchor", "middle")
                    .attr("font-size", "20px")
                    .text(outcomeText);

  // The group for the identifier arrows
  let identifierGroup = canvas.append("g");

  // Draw identifier arrows
  createIdentifierArrow(identifierGroup, circle1);
  createIdentifierArrow(identifierGroup, circle2);

  // Remove the Identifier group object
  identifierGroup.transition()
                .delay(removalDelay)
                .remove();

  // Remove the question group
  questionGroup.transition()
          .delay(removalDelay)
          .remove();
  
  // minText.transition()
  //       .delay(removalDelay)
  //       .remove();
  
  return(removalDelay);
}

// Draws out the logic that happens in the comparison of the provided circle objects
// compareForward: Compare if element n < n + 1
function drawLogic(canvas, circleObject1, circleObject2, compareForward){
  let distanceAbove = -60;
  let identiferSize = 10;
  let removalDelay = 2000;
  let thoughtTimeDelay = 1000; //Time to delay before answering the comparison
  let circle1 = circleObject1.circleElement;
  let circle2 = circleObject2.circleElement;

  //Draw text
  let circleAValue = circleObject1.textElement.text();
  let circleBValue = circleObject2.textElement.text();

  //create group element
  let questionGroup = canvas.append("g");


  // Determine outcome text
  // A realist's assumption
  let outcomeColor = "red";
  let outcomeText = "No, Don't swap!";

  //TODO: Get rid of this flag stuff. Likely would have to play with j- index in insertion sort
  //Compare text for either forward or backwords
  let comparisonText = "";
  if(compareForward)
  {
    // Compare forward
    comparisonText = "Is " + circleAValue + " > " + circleBValue + " ?"
    if(circleAValue > circleBValue){
      outcomeColor = "green";
      outcomeText = "Yes, so swap!";
    }
  }
  else
  {
    // Compare backwords
    comparisonText = "Is " + circleAValue + " < " + circleBValue + " ?"
    if(circleAValue < circleBValue){
      outcomeColor = "green";
      outcomeText = "Yes, so swap!";
    }
  }

  // Show comparison text
  let comparisonTextEle = questionGroup.append("text")
                      .attr("x", 500)
                      .attr("y", 20)
                      .attr("dy", ".5em")
                      .style("text-anchor", "middle")
                      .attr("font-size", "20px")
                      .text(comparisonText);

  // Create text area for outcome of comparison
  let outcomeTextEle = questionGroup.append("text")
                    .style("fill", outcomeColor)
                    .transition()
                    .delay(thoughtTimeDelay)
                    .attr("x", 500)
                    .attr("y", 45)
                    .attr("dy", ".5em")
                    .style("text-anchor", "middle")
                    .attr("font-size", "20px")
                    .text(outcomeText);

  // The group for the identifier arrows
  let identifierGroup = canvas.append("g");

  // Draw identifier arrows
  createIdentifierArrow(identifierGroup, circle1);
  createIdentifierArrow(identifierGroup, circle2);

  // Remove the Identifier group object
  identifierGroup.transition()
                .delay(removalDelay)
                .remove();

  // Remove the question group
  questionGroup.transition()
          .delay(removalDelay)
          .remove();
  
  return(removalDelay);
}

// Draws out the logic that happens in the comparison of the provided circle objects
function insertionSortAnimationogic(canvas, circleObject1, circleObject2){
  let distanceAbove = -60;
  let identiferSize = 10;
  let removalDelay = 2000;
  let thoughtTimeDelay = 1000; //Time to delay before answering the comparison
  let circle1 = circleObject1.circleElement;
  let circle2 = circleObject2.circleElement;

  //Draw text
  let circleAValue = circleObject1.textElement.text();
  let circleBValue = circleObject2.textElement.text();

  //create group element
  let questionGroup = canvas.append("g");


  // Determine outcome text
  // A realist's assumption
  let outcomeColor = "red";
  let outcomeText = "No, Don't swap!";
  if(circleAValue < circleBValue){
    outcomeColor = "green";
    outcomeText = "Yes, so swap!";
  }

  // Show comparison text
  let comparisonTextEle = questionGroup.append("text")
                      .attr("x", 500)
                      .attr("y", 20)
                      .attr("dy", ".5em")
                      .style("text-anchor", "middle")
                      .attr("font-size", "20px")
                      .text("Is " + circleAValue + " < " + circleBValue + " ?");

  // Create text area for outcome of comparison
  let outcomeTextEle = questionGroup.append("text")
                    .style("fill", outcomeColor)
                    .transition()
                    .delay(thoughtTimeDelay)
                    .attr("x", 500)
                    .attr("y", 45)
                    .attr("dy", ".5em")
                    .style("text-anchor", "middle")
                    .attr("font-size", "20px")
                    .text(outcomeText);

  // The group for the identifier arrows
  let identifierGroup = canvas.append("g");

  // Draw identifier arrows
  createIdentifierArrow(identifierGroup, circle1);
  createIdentifierArrow(identifierGroup, circle2);

  // Remove the Identifier group object
  identifierGroup.transition()
                .delay(removalDelay)
                .remove();

  // Remove the question group
  questionGroup.transition()
          .delay(removalDelay)
          .remove();
  
  return(removalDelay);
}

// Draws an identifier arrow above the provided circle
// group: the group to append the arrow to
// circle: the circle to point down to
function createIdentifierArrow(group, circle){
  let lineLength = 30;

  // The distance from the middle line and its wings
  let pointerArrowDisplacement = 12;
  let lineThickness = 4;
  // The distance above the circles
  let distanceAbove = -60;
  // Displacement used to give the arrow more of a point
  let arrowPointDisplacement = 1;

  let arrowColor = "black";

  let lineMiddle1 = group.append("line")
    .attr("x1", circle.attr("cx"))
    .attr("y1", parseInt(circle.attr("cy")) + distanceAbove)
    .attr("x2", circle.attr("cx"))
    .attr("y2", parseInt(circle.attr("cy")) + distanceAbove - lineLength)
    .attr("stroke-width", lineThickness)
    .attr("stroke", arrowColor);

  let lineLeft1 = group.append("line")
    .attr("x1", parseInt(circle.attr("cx"))  + arrowPointDisplacement) 
    .attr("y1", parseInt(circle.attr("cy")) + distanceAbove)
    .attr("x2", parseInt(circle.attr("cx")) - pointerArrowDisplacement) 
    .attr("y2", parseInt(circle.attr("cy")) + distanceAbove - lineLength/2)
    .attr("stroke-width", lineThickness)
    .attr("stroke", arrowColor);

  let lineRight1 = group.append("line")
    .attr("x1", circle.attr("cx") - arrowPointDisplacement)
    .attr("y1", parseInt(circle.attr("cy")) + distanceAbove)
    .attr("x2", parseInt(circle.attr("cx")) + pointerArrowDisplacement) 
    .attr("y2", parseInt(circle.attr("cy")) + distanceAbove - lineLength/2)
    .attr("stroke-width", lineThickness)
    .attr("stroke", arrowColor);
}

//Swap the position of the two circle elements
function swapPlaces(circleObject1, circleObject2){
  // The time it takes for one movement
  let moveDuration = 500;

  // The displaced y position where cirlce1's swaps will occure
  let stagingYCord1 = 200;
  // The displaced y position where circleElement2's swaps will occure
  let stagingYCord2 = 200 + (2*maxRadius);

  let circleElement1 = circleObject1.circleElement;
  let circleElement2 = circleObject2.circleElement;

  let textElement1 = circleObject1.textElement;
  let textElement2 = circleObject2.textElement;

  //Move one circle up one full circle radius
  circleElement1.transition()
      .duration(moveDuration)  
      .attr("cy", stagingYCord1);

  textElement1.transition()
      .duration(moveDuration)  
      .attr("y", stagingYCord1);

  //Move the other circle up 2 full radius
  circleElement2.transition()
      .duration(moveDuration)
      .attr("cy", stagingYCord2);
  
  textElement2.transition()
      .duration(moveDuration)
      .attr("y", stagingYCord2);

  //Swap circles' x positions
  circleElement1.transition()
    .delay(moveDuration)
    .duration(moveDuration)
    .attr("cx", circleElement2.attr("cx"));

  textElement1.transition()
    .delay(moveDuration)
    .duration(moveDuration)
    .attr("x", circleElement2.attr("cx"));

  circleElement2.transition()
    .delay(moveDuration)
    .duration(moveDuration)
    .attr("cx", circleElement1.attr("cx"));

  textElement2.transition()
    .delay(moveDuration)
    .duration(moveDuration)
    .attr("x", circleElement1.attr("cx"));

  //Move back to original line
  circleElement1.transition()
    .delay(2*moveDuration)
    .duration(moveDuration)
    .attr("cy", startYCord);

  circleElement2.transition()
    .delay(2*moveDuration)
    .duration(moveDuration)
    .attr("cy", startYCord);

  textElement1.transition()
    .delay(2*moveDuration)
    .duration(moveDuration)
    .attr("y", startYCord);

  textElement2.transition()
    .delay(2*moveDuration)
    .duration(moveDuration)
    .attr("y", startYCord);

  return 3*moveDuration;
}

//Generate random unqiue array of ints between 1-50
function generateRandomArrayWeights(){
  let weightsArray = [];
  let maxValue = 40;
  let minValue = 10;
  for(let i=0; i<10; i++){
    let newNum;
    //confirm that each number is unique
    do 
    {
      newNum = Math.floor(Math.random() * maxValue) + minValue;
    } while(weightsArray.includes(newNum));

    weightsArray.push(newNum);

  }

  return weightsArray;
}

//Return a list of all swap pairs needed for the list to become sorted
function getInsertionSortMoves(weightsArray){
  //Records the pairs of indexs that are swapped
  let movesArray = [];

  // TODO: handle this off by 1 weirdness
  for(let i=0; i<weightsArray.length-1; i++){
    let curNum = weightsArray[i];
    for(let j=i+1; j<weightsArray.length; j++){
      let nextNum = weightsArray[j];
      //Test if next number is smaller than current number
      if(nextNum < curNum ){
        //swap
        weightsArray[i] = nextNum;
        weightsArray[j] = curNum;
        
        //update the cur number 
        curNum = nextNum;

        //Record the swapped positions
        let swappedIndices = [i, j];
        movesArray.push(swappedIndices);
      }
    }
  }

  console.log(weightsArray);
  console.log(movesArray);
  return movesArray;
}

//Compare each element to its neighbor and bubble the biggest to the top
// Returns each comparison used during the sort
function getBubbleSortMoves(weightsArray){
  // stores the list of each step taken in the algorithm
  let algorithmSteps = [];

  for(let i=0; i<weightsArray.length-1; i++){
    for(let j=0; j<weightsArray.length-1; j++){
      
      // Algorithm Step object 
      // console.log("index B : " + int(j+1));
      let algorithmStep = {
        indexA: j,
        indexB: j+1,
        swapRequired: false
      }
      console.log(algorithmStep.indexB);
      let curNum = weightsArray[j];
      let nextNum = weightsArray[j+1];      
      if(curNum > nextNum){
        //swap occures
        let temp = weightsArray[j];
        weightsArray[j] = nextNum;
        weightsArray[j+1] = temp;
        
        // let swappedIndices = [j, j+1];
        // Swap is required
        algorithmStep.swapRequired = true;
        // algorithmSteps.push(swappedIndices);
      }

      algorithmSteps.push(algorithmStep);
    } 
  }

  console.log("Bubble sort result " + weightsArray);
  // console.log("Bubble sort's moves: " + algorithmSteps);
  return algorithmSteps;
}

function getInsertionSortMoves(weightsArray){
  // stores the list of each step taken in the algorithm
  let algorithmSteps = [];

  console.log("Insertion Sort Start " + weightsArray);

  for(let i=0; i<weightsArray.length; i++)
  {
    for(j=i; j>0; j--)
    {
      // Algorithm Step object 
      // console.log("index B : " + int(j+1));
      let algorithmStep = {
        indexA: j,
        indexB: j-1,
        swapRequired: false
      }

      if(!isGreaterThanPrevious(weightsArray, j))
      {
        //Swap
        swapWithPrevious(weightsArray, j);
        // Set algorithm step to show the swap
        algorithmStep.swapRequired = true;
      }
      // Could break out early in else case here but it might make the animation less clear

      // push onto algorithm steps
      algorithmSteps.push(algorithmStep);

    }
  }

  console.log("Insertion sort results " + weightsArray);

  return algorithmSteps;
}

// Swap the supplied array's index with it's previous index
function swapWithPrevious(weightsList, index)
{
  //TODO: catch out of bounds error
  let temp = weightsList[index];
  weightsList[index] = weightsList[index-1];
  weightsList[index-1] = temp;
}

// Returns true if the index previous to the supplied index is of a greater weight
function isGreaterThanPrevious(weightsList, index)
{
  return(weightsList[index-1] < weightsList[index])
}

function getSelectionSortMoves(weightsArray){
  console.log("SelectionSort Start: " + weightsArray);
  //Stores all the algorithm steps
  let algorithmSteps = [];

  for(let i=0; i<weightsArray.length-1; i++){
    let minIndex = i;    
    let minWeight = weightsArray[minIndex];
    for(let j=i; j<weightsArray.length-1; j++){
      let algorithmStep = {
        indexA: minIndex,
        indexB: j+1,
        action: "none",
      }

      let nextWeight = weightsArray[j+1];
      if(minWeight > nextWeight){
        // Update the minimum
        minIndex = j+1; 
        minWeight = weightsArray[minIndex];
        algorithmStep.action = "new min";
      }
      algorithmSteps.push(algorithmStep);
    }

    //TODO: Javascript enum class? for actions
    // Stores the swap step
    let algorithmStep = {
      indexA: minIndex,
      indexB: i,
      action: "swap"
    }
    algorithmSteps.push(algorithmStep)
    
    //swap the min's index
    let valueToMove = weightsArray[i];
    weightsArray[i] = minWeight;
    weightsArray[minIndex] = valueToMove;
  }

  console.log("Selection Start Finish: " + weightsArray);
  return algorithmSteps;
}

//Adds random fill color to an svg attribute
function getRandomColor(){
  return "hsl(" + Math.random() * 360 + ",100%,50%)"
}

// Event listener for Bubble-sort start click
// Kicks off the animatio for buble sort
$('#bubble-sort-start').click(function(){
  console.log("start animation");
  $('#bubble-sort-start').addClass("disabled", true);
  //Kick off the animation
  let bubbleSortMoves = getBubbleSortMoves(bubbleSortWeightsArray);
  animateLoop(bubbleCanvas, 0, bubbleSortMoves, bubbleSortObjects, true);
} );

$('#selection-sort-start').click(function(){
  console.log("Start Selction Sort Animation");
  $('#selection-sort-start').addClass("disabled", true);

  //Kick off animation
  let selectionSortMoves = getSelectionSortMoves(selectionSortWeights);

  selectionSortAnimation(selectionSortCanvas, selectionSortMoves);
  
})

// Event listener for Insertion-sort start click
// Kicks off the animatio for buble sort
$('#insertion-sort-start').click(function(){
  console.log("start animation");
  $('#insertion-sort-start').addClass("disabled", true);
  //Kick off the animation
  let insertionSortMoves = getInsertionSortMoves(insertionSortWeightsArray);
  animateLoop(insertionSortCanvas, 0, insertionSortMoves, insertionSortObjects, false);
} );

// TODO: Implement way to restart algorithm
// $('#bubble-sort-restart').click(function(){
//   //clear canvas an restart
//   restartAnimation = true;
// })

