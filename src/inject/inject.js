const initializeContent = async () => {
	console.log('[LMUCast+] Player has initialized, injecting content')
	const html = await (await fetch(chrome.runtime.getURL('/html/controls.html'))).text()
	
	// Insert the HTML
	const lastControlElement = document.querySelector('#player-control-panel:last-child');
	lastControlElement.insertAdjacentHTML('beforeend', html)

	// Get the dropdown & icon
	const playerElement = document.querySelector('#player')
	const dropdownElement = document.querySelector('#playback-speed select')
	const dropdownIcon = document.querySelector('#playback-speed #icon')
	const videoElement = document.querySelector('video')
	const pauseButton = document.querySelector('#playpause')


	// Sync the playstate of the video-element to display a play/pause icon
	videoElement.addEventListener('play', () => {
		playerElement.classList.remove('paused')
		playerElement.classList.add('playing')
	})
	videoElement.addEventListener('pause', () => {
		playerElement.classList.add('paused')
		playerElement.classList.remove('playing')
	})

	const handleVideoPlayPause = (event) => {
		event.preventDefault();
		pauseButton.click();
	}

	// Clicking on the video should also pause/play
	videoElement.addEventListener('click', handleVideoPlayPause)
	// In the dual-video thingies, a canvas is used, that should work the same:
	document.querySelectorAll('canvas').forEach(e => {
		e.addEventListener('click', handleVideoPlayPause)
	})

	dropdownIcon.addEventListener('click', (event) => {
		event.preventDefault();
		dropdownElement.click();
	})

	// And now, sync the state of the video-element with the dropdown:
	let playbackRate = videoElement.playbackRate;
	dropdownElement.value = playbackRate;



	dropdownElement.addEventListener('change', (event) => {
		videoElement.playbackRate = event.target.value;
	})
}

const checkForPlayerLoading = () => {
	// Check if the player has been started:
	if(document.querySelector('#player-control-panel:last-child')) {
		initializeContent();
		return;
	}

	// Otherwise, wait for it:
	let observer;
	observer = new MutationObserver(function (mutations) {
		// Don't care about the mutations -> has the player been loaded, yet?
		console.log('mutations.')
		if(document.querySelector('#player-control-panel:last-child')) {
			observer.disconnect();
			initializeContent();
		}
	});

	observer.observe(document.querySelector('#player'), {
		subtree: true,
		childList: true
	});
}


// Check the loading state of the document
if(document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', checkForPlayerLoading);
} else {
	checkForPlayerLoading();
}