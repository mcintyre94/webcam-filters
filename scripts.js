const video = document.querySelector('.player');
const canvases = [...document.querySelectorAll('.photo')];
const ctxs = canvases.map(canvas => canvas.getContext('2d'));
const strip = document.querySelector('.strip');
const snap = document.querySelector('.snap');

let focusedCanvas = 'all';

function getVideo(){
	navigator.mediaDevices.getUserMedia({video: true, audio: false})
		.then(localMediaStream => {
			console.log(localMediaStream);
			video.src = window.URL.createObjectURL(localMediaStream);
			video.play();
		})
		.catch(err => console.error('NO WEBCAM :(', err));
}

function paintToCanvas(){
	const width = video.videoWidth;
	const height = video.videoHeight;

	console.log(height, width);

	canvases.forEach((canvas, i) => {

		canvas.width = width;
		canvas.height = height;

		return setInterval(() => {
			paintSingleCanvas(i, width, height);
		}, 16);
	});
}

function paintSingleCanvas(i, width, height){

	if(focusedCanvas != 'all' && focusedCanvas != i){
		return;
	}

	ctxs[i].drawImage(video, 0, 0, width, height)

	let pixels = ctxs[i].getImageData(0, 0, width, height);
	
	if(i == 4){
		// no change in pixels
	}else if(i%3 == 0){
		pixels = redEffect(pixels);
	}else if(i%3 == 1){
		ctxs[i].globalAlpha = 0.1;
		pixels = rgbSplit(pixels);
	}else if(i%3 == 2){
		pixels = greenEffect(pixels);
	}

	ctxs[i].putImageData(pixels, 0, 0);
}

function focusCanvas(i){
	canvases.forEach((canvas, idx) => {
		if(idx != i){

			// hide the canvas
			canvas.style.display = 'none';
		}
	});

	canvases[i].style.width = '100%';
	canvases[i].style.height = '100%';

	focusedCanvas = i;
}

function showAllCanvases(){
	canvases[focusedCanvas].style.width = '30%';
	canvases[focusedCanvas].style.height = '30%';

	canvases.forEach(canvas => {
		canvas.style.display = 'block';
	});

	focusedCanvas = 'all';
}

function takePhoto(){
	snap.currentTime = 0;
	snap.play();

	// get data from canvas
	const data = canvas.toDataURL('image/jpeg');

	const link = document.createElement('a');
	link.href = data;
	link.setAttribute('download', 'awesome');
	link.innerHTML = `<img src="${data}" alt="Awesome stuff" />`;
	strip.insertBefore(link, strip.firstChild);
}

function redEffect(pixels){
	for(let i=0; i<pixels.data.length; i+=4){
		pixels.data[i] += 200; // r
		pixels.data[i+1] -= 50;
		pixels.data[i+2] *= 0.5;
	}

	return pixels;
}

function rgbSplit(pixels){
	for(let run=0; run<1; run++){
		for(let i=0; i<pixels.data.length; i+=4){
			pixels.data[i -  150] = pixels.data[i]; 
			pixels.data[i + 500]  = pixels.data[i+1];
			pixels.data[i - 550] = pixels.data[i+2];
		}
	}

	return pixels;
}

function greenEffect(pixels){
	for(let i=0; i<pixels.data.length; i+=4){
		pixels.data[i] -= 100; // r
		pixels.data[i+1] *= 2;
		pixels.data[i+2] -= 50;
	}

	return pixels;
}

getVideo();

video.addEventListener('canplay', paintToCanvas);

canvases.forEach((canvas, i) => canvas.addEventListener('mousedown', () => {
	if(focusedCanvas == 'all'){
		focusCanvas(i);
	}else{
		showAllCanvases();
	}
}));