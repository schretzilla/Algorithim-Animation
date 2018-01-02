//global vars
let startYCord = 100;
let startXCord = 50;
let maxRadius = 40;
let moveDuration = 500;
let circleObjectList = [];
//build canvas
var canvas = d3.select("#canvas-area")
        .append("svg")
        .attr("width", 1000)
        .attr("height", 400);

let weightsArray = generateRandomArrayWeights();

for(let i=0; i<10; i++){
  let circleSize = weightsArray[i];
  let circleEle = createCircleEle(i, circleSize);
  circleObjectList.push(circleEle);
}

//Generate the weights array then pass it to the workers
console.log(weightsArray);
// let insertionSortMoves = getInsertionSortMoves(weightsArray);
let bubbleSortMoves = getBubbleSortMoves(weightsArray);


//Kick off the animation
animate(bubbleSortMoves);

//Creates a circle element in a line along the designated x axis
function createCircleEle(eleStartIndex, circleSize){
  let circleXCord = startXCord + (eleStartIndex* 2 * maxRadius);

  //TODO use group instead of object class to reduce code
  // let groupTest = canvas.append("g");

  // groupTest.append("circle")
  //           .attr("cx", 20)
  //           .attr("cy", 20)
  //           .attr("r", 30);
  
  // let xtest = 500;
  // groupTest.transition()
  //       .duration(1000)  
  //       .attr("transform", "translate(0, " + xtest + ")");

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
// <swapList> the list of swaps that need to be made.
function animate(swapList){
  let currentMoves = swapList[0];
  let circle1Index = currentMoves[0];
  let circle2Index = currentMoves[1];
  let circle1 = circleObjectList[circle1Index];
  let circle2 = circleObjectList[circle2Index];
  
  //Update the circleslist
  circleObjectList[circle1Index] = circle2;
  circleObjectList[circle2Index] = circle1;

  animationLoop(circle1, circle2, 1, swapList);

}

//swapIndex, ending function for the recurrsion
function animationLoop(circle1, circle2, swapIndex, swapList){
  let animationTimeDuration = swapPlaces(circle1, circle2, 0);

  if(swapIndex < swapList.length){
    setTimeout(function(){
      console.log('swap #' + swapIndex);
      let currentMoves = swapList[swapIndex];
      let circle1Index = currentMoves[0];
      let circle2Index = currentMoves[1];
      let circle1 = circleObjectList[circle1Index];
      let circle2 = circleObjectList[circle2Index];

      //Update the circleslist
      circleObjectList[circle1Index] = circle2;
      circleObjectList[circle2Index] = circle1;

      console.log('swapping ' + circle1Index + ' with ' + circle2Index);
      animationLoop(circleObjectList[circle1Index], circleObjectList[circle2Index], swapIndex+1, swapList);
    }, animationTimeDuration);
  }
  
}

//Swap the position of the two circle elements
function swapPlaces(circleObject1, circleObject2){
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
    // newNum = newNum * 2;
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

//Compare each element to its neghibor and bubble the biggest to the top
function getBubbleSortMoves(weightsArray){
  let movesArray = [];

  for(let i=0; i<weightsArray.length-1; i++){
    for(let j=0; j<weightsArray.length; j++){
      let curNum = weightsArray[j];
      let nextNum = weightsArray[j+1];
      
      if(curNum > nextNum){
        //swap occures
        let temp = weightsArray[j];
        weightsArray[j] = nextNum;
        weightsArray[j+1] = temp;
  
        let swappedIndices = [j, j+1];
        movesArray.push(swappedIndices);
      }
    } 
  }

  console.log("Bubble sort result " + weightsArray);
  console.log("Bubble sort's moves: " + movesArray);
  return movesArray;
}

//Adds random fill color to an svg attribute
function getRandomColor(){
  return "hsl(" + Math.random() * 360 + ",100%,50%)"
}
