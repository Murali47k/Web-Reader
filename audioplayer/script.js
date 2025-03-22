// Wrap everything in DOMContentLoaded to ensure the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Get elements from the page
    const readBtn = document.getElementById('readBtn');         // Floating "Read" button from index.html
    const customPlayer = document.getElementById('customPlayer');   // Custom player container
    const closeBtn = document.getElementById('closeBtn');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const progressBar = document.getElementById('progressBar');
    const timeLabel = document.getElementById('timeLabel');
    const myAudio = document.getElementById('myAudio');             // Hidden audio element
  
    // Ensure the custom player is hidden initially
    customPlayer.style.display = 'none';
    // Also hide the read button until text is selected
    readBtn.style.display = 'none';
  
    /* --- DRAGGABLE LOGIC FOR CUSTOM PLAYER --- */
    let isDragging = false, offsetX = 0, offsetY = 0;
    customPlayer.addEventListener('mousedown', (e) => {
      isDragging = true;
      offsetX = e.clientX - customPlayer.offsetLeft;
      offsetY = e.clientY - customPlayer.offsetTop;
    });
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      customPlayer.style.left = (e.clientX - offsetX) + 'px';
      customPlayer.style.top = (e.clientY - offsetY) + 'px';
    });
    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
  
    /* --- CUSTOM PLAYER CONTROLS --- */
    let isPlaying = false;
    playPauseBtn.addEventListener('click', () => {
      if (!isPlaying) {
        myAudio.play();
      } else {
        myAudio.pause();
      }
    });
    myAudio.addEventListener('play', () => {
      isPlaying = true;
      playPauseBtn.textContent = 'Pause';
    });
    myAudio.addEventListener('pause', () => {
      isPlaying = false;
      playPauseBtn.textContent = 'Play';
    });
    myAudio.addEventListener('timeupdate', () => {
      const currentTime = myAudio.currentTime;
      const duration = myAudio.duration;
      if (duration > 0) {
        progressBar.value = (currentTime / duration) * 100;
      }
      updateTimeLabel(currentTime, duration);
    });
    progressBar.addEventListener('input', () => {
      const duration = myAudio.duration;
      const seekTime = (progressBar.value / 100) * duration;
      myAudio.currentTime = seekTime;
    });
    function formatTime(time) {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
    function updateTimeLabel(current, total) {
      if (isNaN(total)) {
        timeLabel.textContent = `0:00 / 0:00`;
      } else {
        timeLabel.textContent = `${formatTime(current)} / ${formatTime(total)}`;
      }
    }
    closeBtn.addEventListener('click', () => {
      customPlayer.style.display = 'none';
      myAudio.pause();
    });
  
    /* --- READ BUTTON LOGIC --- */
    // Show the Read button when text is selected
    document.addEventListener('mouseup', (e) => {
      const selectedText = window.getSelection().toString().trim();
      if (selectedText.length > 0) {
        readBtn.style.top = (e.pageY + 10) + 'px';
        readBtn.style.left = (e.pageX + 10) + 'px';
        readBtn.style.display = 'block';
      } else {
        readBtn.style.display = 'none';
      }
    });
    
    // When the Read button is clicked, send the selected text to the Flask server
    readBtn.addEventListener('click', () => {
      const selectedText = window.getSelection().toString().trim();
      if (!selectedText) return;
      fetch('http://127.0.0.1:5000/tts_from_text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: selectedText })
      })
      .then(response => response.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        myAudio.src = url;
        // Show the custom player only after audio is received
        customPlayer.style.display = 'block';
        myAudio.play();
      })
      .catch(err => console.error('Error:', err));
      // Hide the Read button after clicking
      readBtn.style.display = 'none';
    });
  });
  