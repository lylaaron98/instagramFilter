// Image of Husky Creative commons from Wikipedia:
// https://en.wikipedia.org/wiki/Dog#/media/File:Siberian_Husky_pho.jpg
var imgIn;
var imgOut;
var instruction='1) Change right image filter to RED  by pressing "R" key,\n 2) Change right image filter to BLUE  by pressing "B" key,\n 3) Change right image filter to GREEN  by pressing "G" key, 4) Change right image filter to Grey Scale  by pressing "Left Arrow" key,\n 5) Change right image filter to Negative Scale  by pressing "Right Arrow" key, 6) Change right image filter to Radial Blur  by pressing "UP" key, \n 7) Reset to original by clicking left mouse button';
var matrix = [
    [1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64],
    [1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64],
    [1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64],
    [1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64],
    [1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64],
    [1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64],
    [1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64],
    [1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64]
];
/////////////////////////////////////////////////////////////////
function preload() 
{
    imgIn = loadImage("assets/husky.jpg");
}
/////////////////////////////////////////////////////////////////
function setup() 
{
    createCanvas((imgIn.width * 2), imgIn.height);
}
/////////////////////////////////////////////////////////////////
function draw()
{	
	const imageClone = imgIn.get();
    background(125);
    image(imageClone, 0, 0);
    image(earlyBirdFilter(imageClone), imageClone.width, 0);
    noLoop();
    fill(0); 
    textSize(16);
    text(instruction,10,750);
}
/////////////////////////////////////////////////////////////////
function mousePressed()
{
  loop();
}
/////////////////////////////////////////////////////////////////
function earlyBirdFilter(img){
  var resultImg = createImage(imgIn.width, imgIn.height);
  resultImg = sepiaFilter(imgIn);
  resultImg = darkCorners(resultImg);
  resultImg = radialBlurFilter(resultImg);
  resultImg = borderFilter(resultImg)
  return resultImg;
}

function convolution(x, y, matrix, matrixSize, img)
{ 
    var totalRed = 0.0;
    var totalGreen = 0.0;
    var totalBlue = 0.0;
    var offset = floor(matrixSize / 2); 
    // convolution matrix loop 
    for (var i = 0; i < matrixSize; i++)
    {
        for (var j = 0; j < matrixSize; j++) 
        { 
            // Get pixel loc within convolution matrix
            var xloc = x + i - offset;
            var yloc = y + j - offset;
            var index = (xloc + img.width * yloc) * 4; 
            // ensure we don't address a pixel that doesn't exist 
            
         index = constrain(index, 0, img.pixels.length - 1);
            // multiply all values with the mask and sum up
            totalRed += img.pixels[index + 0] * matrix[i][j]; 
            totalGreen += img.pixels[index + 1] * matrix[i][j]; 
            totalBlue += img.pixels[index + 2] * matrix[i][j]; } 
    } // return the new color as an array
    return [totalRed, totalGreen, totalBlue]; 
}

function borderFilter(resultImg)
{
	//Draw the image onto the buffer
	var buffer = createGraphics(resultImg.width,resultImg.height);
	buffer.image(resultImg,0,0,resultImg.width,resultImg.height);
	
	//Draw a big, fat, white rectangle with rounded corners around the image
	buffer.noFill();
	buffer.stroke(255);
	buffer.strokeWeight(20);
	buffer.rect(0,0,resultImg.width,resultImg.height,50);
	
	//Draw another rectangle now, without rounded corners, in order to get rid of the little triangles
	//so you end up with the image at the end of the function, with a seamless frame
	buffer.rect(0,0,resultImg.width,resultImg.height);
	return buffer;
}

function radialBlurFilter(resultImg)
{

	for(var x=0;x<resultImg.width;x++)
	{
		for(var y=0;y<resultImg.height;y++)
		{		
			var pixelIndex = ((resultImg.width * y) + x) * 4;
			var oldRed = imgIn.pixels[pixelIndex+0];
			var oldGreen = imgIn.pixels[pixelIndex+1];
			var oldBlue = imgIn.pixels[pixelIndex+2];
			//c[0] => red, c[1] => green, c[2] => blue
			var c = convolution(x,y,matrix,matrix.length,resultImg);
			
			var mouseDist = abs(dist(x,y,mouseX,mouseY));
			var dynBlur = map(mouseDist,100,300,0,1);
			dynBlur = constrain(dynBlur,0,1);
			
			var newRed = c[0]*dynBlur + oldRed*(1-dynBlur);
			var newGreen = c[1]*dynBlur + oldGreen*(1-dynBlur);
			var newBlue = c[2]*dynBlur + oldBlue*(1-dynBlur);
			
			resultImg.pixels[pixelIndex+0] = newRed;
			resultImg.pixels[pixelIndex+1] = newGreen;
			resultImg.pixels[pixelIndex+2] = newBlue;
			resultImg.pixels[pixelIndex+3] = 255;

		}
	}
	
	resultImg.updatePixels();
	return resultImg;
}

function darkCorners(resultImg)
{
	var midX = resultImg.width/2;
	var midY = resultImg.height/2;
	maxDist = abs(dist(0,0,midX,midY));
	
	for(var x=0;x<resultImg.width;x++)
	{
		for(var y=0;y<resultImg.height;y++)
		{
			var d= abs(dist(x,y,midX,midY));
			if(d>=300)
			{
			var pixelIndex = ((resultImg.width * y) + x) * 4;
			var oldRed = imgIn.pixels[pixelIndex+0];
			var oldGreen = imgIn.pixels[pixelIndex+1];
			var oldBlue = imgIn.pixels[pixelIndex+2];
			var dynLum = 1;
			if(d<450)//300 to 449
			{
				dynLum = map(d,300,449,1,0.4);
			}else{
				dynLum = map(d,450,maxDist,0.4,0);
			}
			var newRed = oldRed*dynLum;
			var newGreen = oldGreen*dynLum;
			var newBlue = oldBlue*dynLum;
			
			resultImg.pixels[pixelIndex+0] = newRed;
			resultImg.pixels[pixelIndex+1] = newGreen;
			resultImg.pixels[pixelIndex+2] = newBlue;
			resultImg.pixels[pixelIndex+3] = 255;
			
			}
		}
	}
	
	resultImg.updatePixels();
	return resultImg;
}

function sepiaFilter(resultImg)
{
	imgIn.loadPixels();
	resultImg.loadPixels();
	
	for(var x=0;x<resultImg.width;x++)
	{
		for(var y=0;y<resultImg.height;y++)
		{
			var pixelIndex = ((resultImg.width * y) + x) * 4;
			var oldRed = imgIn.pixels[pixelIndex+0];
			var oldGreen = imgIn.pixels[pixelIndex+1];
			var oldBlue = imgIn.pixels[pixelIndex+2];
			
			var newRed = (oldRed * .393) + (oldRed *.769) * (oldRed *.189);
			var newGreen = (oldGreen* .349) + (oldGreen *.686) * (oldGreen *.168);
			var newBlue = (oldBlue * .272) + (oldBlue *.534) * (oldBlue *.131);
			
			
			resultImg.pixels[pixelIndex+0] = newRed;
			resultImg.pixels[pixelIndex+1] = newGreen;
			resultImg.pixels[pixelIndex+2] = newBlue;
			resultImg.pixels[pixelIndex+3] = 255;

		}
	}
	
	resultImg.updatePixels();
	return resultImg;
}

/////////////////////////////////////////////////////////////////
// Other extra filter, initiating change with keypress

function greyScale(img)
{
    img.loadPixels();
    for(var x=0;x<img.width;x++)
        {
            for(var y=0;y<img.width;y++)
                {
                    var pixelIndex=((img.width*y)+x)*4;
                    var oldRed=img.pixels[pixelIndex+0]
                    var oldGreen=img.pixels[pixelIndex+1]
                    var oldBlue=img.pixels[pixelIndex+2];
                    //averge of all the three colours are stored in variable grey
                    var grey=(oldRed+oldGreen+oldBlue)/3
              		// red, green and blue to hold the value of variable grey
              		img.pixels[pixelIndex+0]=grey;
              		img.pixels[pixelIndex+1]=grey;
              		img.pixels[pixelIndex+2]=grey;
              		img.pixels[pixelIndex+3]=255;
                    
                }  
        }
   		img.updatePixels();
    	return img;
}

function negative(img)
{
    img.loadPixels();
    
    for(var x=0;x<img.width;x++)
        {
            for(var y=0;y<img.width;y++)
                {
                    var pixelIndex=((img.width*y)+x)*4;
                    var oldRed=img.pixels[pixelIndex+0]
                    var oldGreen=img.pixels[pixelIndex+1]
                    var oldBlue=img.pixels[pixelIndex+2];
              		//subtracting the values of oldRed, oldGreen and oldBlue from white
              		img.pixels[pixelIndex+0]=255-oldRed;
              		img.pixels[pixelIndex+1]=255-oldGreen;
              		img.pixels[pixelIndex+2]=255-oldBlue;
             		img.pixels[pixelIndex+3]=255;
                    
                }  
        }
    	img.updatePixels();
    	return img;
}

function redFilter(img)
{
    img.loadPixels();
    
    for(var x=0;x<img.width;x++)
        {
            for(var y=0;y<img.width;y++)
                {
                    var pixelIndex=((img.width*y)+x)*4;
                    var oldRed=img.pixels[pixelIndex+0];
              		//setting oldRed to its orignal while other holds 0
              		img.pixels[pixelIndex+0]=oldRed;
              		img.pixels[pixelIndex+1]=0;
              		img.pixels[pixelIndex+2]=0;
              		img.pixels[pixelIndex+3]=255;        
                    
                }  
        }
		img.updatePixels();
    	return img;
}

function greenFilter(img)
{
    img.loadPixels();
    
    for(var x=0;x<img.width;x++)
        {
            for(var y=0;y<img.width;y++)
                {
                    var pixelIndex=((img.width*y)+x)*4;
                    var oldGreen=img.pixels[pixelIndex+1]            
              		img.pixels[pixelIndex+0]=0;
              		//setting oldGed to its orignal while other holds 0
              		img.pixels[pixelIndex+1]=oldGreen;
              		img.pixels[pixelIndex+2]=0;
              		img.pixels[pixelIndex+3]=255;        
                    
                }  
        }
    	img.updatePixels();
    	return img;
}

function blueFilter(img)
{
    img.loadPixels();
    
    for(var x=0;x<img.width;x++)
        {
            for(var y=0;y<img.width;y++)
                {
                    var pixelIndex=((img.width*y)+x)*4;
                    var oldBlue=img.pixels[pixelIndex+2];

              		img.pixels[pixelIndex+0]=0;
              		img.pixels[pixelIndex+1]=0;
              		//setting oldBlue to its orignal while other holds 0
              		img.pixels[pixelIndex+2]=oldBlue;
              		img.pixels[pixelIndex+3]=255;          
                }  
        }
    	img.updatePixels();
    	return img;
}



function keyPressed()
{
   
    if (keyCode === LEFT_ARROW) 
    {
        image(greyScale(imgIn), imgIn.width, 0);
        preload();
    }
    
   if (keyCode === RIGHT_ARROW) 
    {      
        image(negative(imgIn), imgIn.width, 0);
        preload();
    }
    
	if (keyCode === UP_ARROW) 
    {      
        image(radialBlurFilter(imgIn), imgIn.width, 0);
        preload();
    }
    if (keyCode === 82) 
    {      
        image(redFilter(imgIn), imgIn.width, 0);
        preload();
    }
     if (keyCode === 71) 
    {      
        image(greenFilter(imgIn), imgIn.width, 0);
        preload();
    }
     if (keyCode === 66) 
    {      
        image(blueFilter(imgIn), imgIn.width, 0);
        preload();
    }

}
