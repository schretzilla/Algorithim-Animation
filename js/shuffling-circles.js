//global vars
let startYCord = 150;
let startXCord = 50;

// The max radius for any circle object
let maxRadius = 40;
let bubbleSortObjects = [];

//build canvas
var canvas = d3.select("#canvas-area")
        .append("svg")
        .attr("width", 1000)
        .attr("height", 400);

let weightsArray = generateRandomArrayWeights();

//Create 10 circles
for(let i=0; i<10; i++){
  let circleSize = weightsArray[i];
  let circleEle = createCircleEle(i, circleSize);
  bubbleSortObjects.push(circleEle);
}

//Generate the weights array then pass it to the workers
console.log(weightsArray);
// let insertionSortMoves = getInsertionSortMoves(weightsArray);

//Creates a circle element in a line along the designated x axis
function createCircleEle(eleStartIndex, circleSize){
  let circleXCord = startXCord + (eleStartIndex* 2 * maxRadius);

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

// Kicks off the recursive animation for swap lists
// <algorithmSteps> the list of steps that were made during the sort
function animate(algorithmSteps){
  let curAlgoritmStep = algorithmSteps[0];
  let circle1 = bubbleSortObjects[curAlgoritmStep.indexA].circleElement;
  let circle2 = bubbleSortObjects[curAlgoritmStep.indexB].circleElement;

  animateLoop(0, algorithmSteps);
}

function animateLoop(stepIndex, stepList){
  curAlgoritmStep = stepList[stepIndex];
  console.log("index A: " + curAlgoritmStep.indexA);
  console.log("index B: " + curAlgoritmStep.indexB);

  let circle1Index = curAlgoritmStep.indexA;
  let circle2Index = curAlgoritmStep.indexB;
  let circle1 = bubbleSortObjects[circle1Index];
  let circle2 = bubbleSortObjects[circle2Index];

  let comparisonDelayTime = drawIdentifierDots(circle1, circle2);

  d3.timeout(function(){
    let swapDelayTime = 500;
    if(curAlgoritmStep.swapRequired){
      swapDelayTime = swapPlaces(circle1, circle2, 0);

      //Update the circleslist
      bubbleSortObjects[circle1Index] = circle2;
      bubbleSortObjects[circle2Index] = circle1;
      console.log('swapping ' + circle1Index + ' with ' + circle2Index);
    }

    d3.timeout(function(){
      if(stepIndex < stepList.length-1){
        animateLoop(stepIndex+1, stepList);
      }
    }, swapDelayTime);

  }, comparisonDelayTime);

}


function drawIdentifierDots(circleObject1, circleObject2){
  let distanceAbove = -60;
  let identiferSize = 10;
  let removalDelay = 2000;
  let thoughtTimeDelay = 1000; //Time to delay before answering the comparison
  let circle1 = circleObject1.circleElement;
  let circle2 = circleObject2.circleElement;

  //Drawl text
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
                      .text("Is " + circleAValue + " > " + circleBValue + " ?");

  // Create text area for outcome of comparison
  let outcomeTextEle = questionGroup.append("text")
                    .transition()
                    .delay(thoughtTimeDelay)
                    .attr("x", 500)
                    .attr("y", 45)
                    .attr("dy", ".5em")
                    .style("text-anchor", "middle")
                    .attr("font-size", "20px");

  // Determine outcome text
  if(circleAValue > circleBValue){
    outcomeTextEle.style("fill", "green")
                  .text("Yes, so swap!");
  }
  else{
    outcomeTextEle.style("fill", "red")
                  .text("No, Don't swap!");
  }

  //Identifier object group setup
  let identifierGroup = canvas.append("g");

  let identifierEle1 = identifierGroup.append("circle")
                    .attr("cx", circle1.attr("cx"))
                    .attr("cy", startYCord + distanceAbove)
                    .attr("r", identiferSize)
                    .attr("fill", "red");
  
  let identifierEle2 = identifierGroup.append("circle")
                    .attr("cx", circle2.attr("cx"))
                    .attr("cy", startYCord + distanceAbove)
                    .attr("r", identiferSize)
                    .attr("fill", "green");

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

//Generate random array of ints between 1-50
function generateRandomArrayWeights(){
  let weightsArray = [];
  let maxValue = 40;
  let minValue = 10;
  for(let i=0; i<10; i++){
    let newNum = Math.floor(Math.random() * maxValue) + minValue;
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
  let bubbleSortMoves = getBubbleSortMoves(weightsArray);
  animate(bubbleSortMoves);
} );

// TODO: Implement way to restart algorithm
// $('#bubble-sort-restart').click(function(){
//   //clear canvas an restart
//   restartAnimation = true;
// })

