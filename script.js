// script.js

document.addEventListener('DOMContentLoaded', () => {
  /* ----- Rotary Dial Functionality ----- */
  const numbers = document.querySelectorAll('.number');
  const submitBtn = document.getElementById('submit-btn');

  RPH = {};

  RPH.math = {
  
      getDistance: function(x1, y1, x2, y2) {
  
          return Math.pow(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2), 0.5);
  
      },
  
      getAngle: function(x1, y1, x2, y2) {
  
          var angle;
  
          if (Math.abs(x1 - x2) < RPH.W / 100 && y2 > y1) return 1 * Math.PI / 2;
          if (Math.abs(x1 - x2) < RPH.W / 100 && y2 < y1) return 3 * Math.PI / 2;
  
          angle = Math.atan((y2 - y1) / (x2 - x1));
  
          if (x1 < x2) {
  
              if (angle < 0) return angle + 2 * Math.PI;
              return angle;
  
          }
  
          return angle + Math.PI;
  
      }
  
  };
  
  RPH.mouse = {
  
      x: 0,
      y: 0,
      xDrag: 0,
      yDrag: 0,
      isDragging: false,
  
      get: function(e) {
  
          var rect = RPH.canvas.getBoundingClientRect();
          this.x = e.clientX - rect.left;
          this.y = e.clientY - rect.top;
  
      },
  
      down: function(e) {
  
          this.get(e);
          this.xDrag = this.x;
          this.yDrag = this.y;
          this.isDragging = true;
  
      },
  
      up: function(e) {
  
          this.get(e);
          this.isDragging = false;
  
      },
  
      move: function(e) {
  
          this.get(e);
  
      },
  
      draw: function(e) {
  
          RPH.pen.circle(this.x, this.y, 5);
  
      }
  
  };
  
  RPH.pen = {
  
      clear: function() {
  
          RPH.ctx.clearRect(0, 0, RPH.W, RPH.H);
  
      },
  
      rect: function(x, y, w, h) {
  
          RPH.ctx.beginPath();
          RPH.ctx.rect(x, y, w, h);
          RPH.ctx.closePath();
          RPH.ctx.fill();
  
      },
  
      circle: function(x, y, r) {
  
          RPH.ctx.beginPath();
          RPH.ctx.arc(x, y, r, 0, Math.PI * 2, true);
          RPH.ctx.fill();
  
      }
  
  };
  
  RPH.phone = {
  
      alpha: 0,
      alphaPrev: 0,
      oBeta: Math.PI * 4 / 9,
      dBeta: Math.PI / 7,
      rBeta: Math.PI / 24,
  
      r0: 0.35,
      r2: 0.23,
      r1: 0.29,
      r3: 0.04,
  
      fontString: "",
  
      activeDigit: -1,
  
      setDrag: function() {
  
          var xc = this.centroid.x,
              yc = this.centroid.y;
  
          this.alpha = RPH.math.getAngle(RPH.W * xc, RPH.H * yc, RPH.mouse.x, RPH.mouse.y) - RPH.math.getAngle(RPH.W * xc, RPH.H * yc, RPH.mouse.xDrag, RPH.mouse.yDrag);
  
          // dialing only works forward
          this.alpha = (this.alpha < 0) ? 0 : this.alpha;
  
          if (this.alpha > ((10 - this.activeDigit) * this.dBeta + this.rBeta)) {
  
              RPH.mouse.isDragging = false;
  
              if (RPH.dialer.number.length < 12) RPH.dialer.number += this.activeDigit;
              if (RPH.dialer.number.length === 3 || RPH.dialer.number.length === 7) RPH.dialer.number += '-';
              document.getElementById('phone-number').value = RPH.dialer.number;
              this.activeDigit = -1;
  
          }
  
      },
  
      setActiveDigit: function() {
  
          var angle;
  
          this.activeDigit = -1;
  
          for (i = 0; i < 10; i += 1) {
  
              angle = this.oBeta + this.dBeta * i + this.alpha;
  
              xt = RPH.W * this.centroid.x + RPH.minWH * this.r1 * Math.cos(angle);
              yt = RPH.H * this.centroid.y + RPH.minWH * this.r1 * Math.sin(angle);
  
              if (RPH.math.getDistance(RPH.mouse.x, RPH.mouse.y, xt, yt) < RPH.minWH * this.r3) {
  
                  this.activeDigit = i;
  
              }
  
          }
  
      },
  
      drawRing: function() {
  
          var xc = this.centroid.x,
              yc = this.centroid.y;
  
          RPH.ctx.fillStyle = "#444444";
          RPH.pen.circle(RPH.W * xc, RPH.H * yc, RPH.minWH * this.r0);
  
          RPH.ctx.fillStyle = "rgb(240,245,240)";
          RPH.pen.circle(RPH.W * xc, RPH.H * yc, RPH.minWH * this.r2);
  
      },
  
      drawLine: function() {
  
          var angle = this.oBeta + 10 * this.dBeta + this.rBeta,
              xc = this.centroid.x,
              yc = this.centroid.y;
  
          RPH.ctx.strokeStyle = "rgb(240,245,240)";
  
          RPH.ctx.beginPath();
          RPH.ctx.moveTo(RPH.W * xc + this.r0 * RPH.minWH * Math.cos(angle), RPH.H * yc + this.r0 * RPH.minWH * Math.sin(angle));
          RPH.ctx.lineTo(RPH.W * xc + this.r1 * RPH.minWH * Math.cos(angle), RPH.H * yc + this.r1 * RPH.minWH * Math.sin(angle));
          RPH.ctx.lineWidth = RPH.minWH / 150;
          RPH.ctx.stroke();
  
      },
  
      drawNumber: function() {
  
          RPH.ctx.font = RPH.minWH / 25 + "px " + this.fontString;
          RPH.ctx.fillStyle = "#444444";
          RPH.ctx.fillText(RPH.dialer.number, RPH.W * this.text.x, RPH.H * this.text.y);
  
      },
  
      drawDigits: function() {
  
          var i, angle;
  
          RPH.ctx.font = RPH.minWH / 18 + "px Courier";
  
          for (i = 0; i < 10; i += 1) {
  
              RPH.ctx.fillStyle = (this.activeDigit === i) ? "rgb(180,205,200)" : "rgb(240,245,240)";
  
              angle = RPH.phone.oBeta + RPH.phone.dBeta * i + RPH.phone.alpha;
              RPH.pen.circle(
                  RPH.W * this.centroid.x + RPH.minWH * this.r1 * Math.cos(angle),
                  RPH.H * this.centroid.y + RPH.minWH * this.r1 * Math.sin(angle),
                  RPH.minWH * this.r3
              );
  
              RPH.ctx.fillStyle = "#444444";
              angle = RPH.phone.oBeta + RPH.phone.dBeta * i;
  
              RPH.ctx.fillText(
                  i,
                  RPH.W * this.centroid.x + RPH.minWH * this.r1 * Math.cos(angle),
                  RPH.H * this.centroid.y + RPH.minWH * this.r1 * Math.sin(angle)
              );
  
          }
  
      },
  
      centroid: {
  
          x: 0.5,
          y: 0.55
  
      },
  
      text: {
  
          x: 0.5,
          y: 0.1,
          isHovered: function() {
  
              return (RPH.mouse.y / RPH.minWH < this.y + 0.02) && (RPH.mouse.y / RPH.minWH > this.y - 0.02);
  
          }
  
      }
  
  };
  
  RPH.dialer = {
  
      number: "",
  
      dial: function() {
  
          window.location = "tel:" + this.number;
  
      }
  
  };
  
  RPH.mouseUp = function(e) {
  
      RPH.mouse.up(e);
  
  };
  
  RPH.mouseDown = function(e) {
  
      RPH.mouse.down(e);
  
      RPH.mouse.isDragging = (RPH.phone.alpha < 0.03 && RPH.phone.activeDigit !== -1);
  
      if (RPH.phone.text.isHovered()) {
  
          RPH.dialer.dial();
  
      }
  
  };
  
  RPH.mouseMove = function(e) {
  
      RPH.mouse.move(e);
  
      if (RPH.mouse.isDragging) {
  
          RPH.phone.setDrag();
  
      } else if (RPH.phone.alpha < 0.03) {
  
          RPH.phone.setActiveDigit();
  
      }
  
      RPH.fontString = (RPH.phone.text.isHovered()) ? "bold " : "";
      RPH.fontString += RPH.minWH / 30 + "px Courier";
  
  
  };
  
  // !main
  RPH.draw = function() {
  
      RPH.pen.clear();
  
      RPH.ctx.textAlign = "center";
      RPH.ctx.textBaseline = "middle";
  
      RPH.phone.drawRing();
      RPH.phone.drawLine();
      RPH.phone.drawDigits();
  
      if (RPH.phone.alpha > 0 && !RPH.mouse.isDragging) {
  
          RPH.phone.alpha -= 0.02;
  
      }
  
      RPH.canvas.addEventListener('mousedown', RPH.mouseDown);
      RPH.canvas.addEventListener('mousemove', RPH.mouseMove);
      RPH.canvas.addEventListener('mouseup', RPH.mouseUp);
  
  };
  
  function touchHandler(event) {
  
      var touch = event.changedTouches[0],
          simulatedEvent = document.createEvent("MouseEvent");
  
      simulatedEvent.initMouseEvent({
              touchstart: "mousedown",
              touchmove: "mousemove",
              touchend: "mouseup"
          }[event.type], true, true, window, 1,
          touch.screenX, touch.screenY,
          touch.clientX, touch.clientY, false,
          false, false, false, 0, null);
  
      touch.target.dispatchEvent(simulatedEvent);
      event.preventDefault();
  
  }
  
  RPH.init = function() {
  
      document.addEventListener("touchstart", touchHandler, true);
      document.addEventListener("touchmove", touchHandler, true);
      document.addEventListener("touchend", touchHandler, true);
      document.addEventListener("touchcancel", touchHandler, true);
  
      RPH.canvas = document.getElementById("retrophone");
      RPH.ctx = RPH.canvas.getContext("2d");
  
      this.resizeCanvas();
      return setInterval(RPH.draw, 10);
  
  };
  
  RPH.resizeCanvas = function() {
  
      RPH.canvas.width = 600;
      RPH.canvas.height = 600;
      RPH.W = RPH.canvas.width;
      RPH.H = RPH.canvas.height;
      RPH.minWH = Math.min(RPH.W, RPH.H);
  
  };
  
  RPH.init();
  
  window.addEventListener('resize', RPH.resizeCanvas, false);

  submitBtn.addEventListener('click', () => {
    const phoneNumber = phoneNumberInput.value;
    if (phoneNumber.length === 10) {
      alert(`Phone Number Entered: ${phoneNumber}`);
      // You can add form submission logic here
    } else {
      alert('Please enter a 10-digit phone number.');
    }
  });

  function appendNumber(num) {
    if (phoneNumberInput.value.length < 10) {
      phoneNumberInput.value += num;
    }
  }

  /* ----- First Name Dropdown Functionality ----- */
  const dropdownBtn = document.getElementById('dropdown-btn');
  const dropdownMenu = document.getElementById('dropdown-menu');
  const firstNameInput = document.getElementById('first-name');
  const dropdownItems = document.querySelectorAll('.dropdown-item');

  // Toggle dropdown visibility
  dropdownBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent event from bubbling up to document
    const isExpanded = dropdownBtn.getAttribute('aria-expanded') === 'true';
    dropdownBtn.setAttribute('aria-expanded', !isExpanded);
    dropdownMenu.style.display = isExpanded ? 'none' : 'block';
  });

  // Handle letter selection
  dropdownItems.forEach(item => {
    item.addEventListener('click', () => {
      appendLetter(item.textContent);
      dropdownMenu.style.display = 'none';
      dropdownBtn.setAttribute('aria-expanded', 'false');
    });

    // Keyboard accessibility for dropdown items
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        item.click();
      }
    });
  });

  // Append selected letter to First Name input
  function appendLetter(letter) {
    if (firstNameInput.value.length < 20) { // Optional: Limit first name length
      firstNameInput.value += letter;
    }
  }

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!dropdownMenu.contains(e.target) && e.target !== dropdownBtn) {
      dropdownMenu.style.display = 'none';
      dropdownBtn.setAttribute('aria-expanded', 'false');
    }
  });

  // Close dropdown on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      dropdownMenu.style.display = 'none';
      dropdownBtn.setAttribute('aria-expanded', 'false');
    }
  });
/* ----- Surname Checkbox Grid Functionality ----- */
const surnameCheckboxes = document.querySelectorAll('input[name="surname-letter"]');
const surnameInput = document.getElementById('surname');

surnameCheckboxes.forEach(checkbox => {
  checkbox.addEventListener('change', () => {
    updateSurname();
  });

  // Keyboard accessibility: Enter or Space to toggle checkbox
  checkbox.nextElementSibling.setAttribute('tabindex', '0');
  checkbox.nextElementSibling.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      checkbox.checked = !checkbox.checked;
      checkbox.dispatchEvent(new Event('change'));
    }
  });
});

// Update the surname input field based on checked checkboxes
function updateSurname() {
  const selectedLetters = [];
  surnameCheckboxes.forEach(checkbox => {
    if (checkbox.checked) {
      selectedLetters.push(checkbox.value);
    }
  });
  surnameInput.value = selectedLetters.join('');
}

  const daySlider = document.getElementById('day-slider');
  const monthSlider = document.getElementById('month-slider');
  const yearSlider = document.getElementById('year-slider');

  const dayValue = document.getElementById('day-value');
  const monthValue = document.getElementById('month-value');
  const yearValue = document.getElementById('year-value');

  const dayLockButton = document.getElementById('day-lock');
  const monthLockButton = document.getElementById('month-lock');
  const yearLockButton = document.getElementById('year-lock');

  let dayLocked = false;
  let monthLocked = false;
  let yearLocked = false;

  // Update Day Value
  daySlider.addEventListener('input', () => {
    dayValue.value = daySlider.value;
  });

  // Update Month Value
  monthSlider.addEventListener('input', () => {
    monthValue.value = monthSlider.value;
  });

  // Update Year Value
  yearSlider.addEventListener('input', () => {
    yearValue.value = yearSlider.value;
  });

  // Lock Button Event Listeners
  dayLockButton.addEventListener('click', () => {
    dayLocked = true;
    dayLockButton.disabled = true;
  });

  monthLockButton.addEventListener('click', () => {
    monthLocked = true;
    monthLockButton.disabled = true;
  });

  yearLockButton.addEventListener('click', () => {
    yearLocked = true;
    yearLockButton.disabled = true;
  });

  // Function to gradually decrease slider value
  function decreaseSliderValue(slider, valueDisplay, minValue, isLocked) {
    if (isLocked) return;

    let currentValue = parseInt(slider.value);
    if (currentValue > minValue) {
      slider.value = currentValue - 1;
      valueDisplay.value = slider.value;
    }
  }

  // Set intervals to decrease slider values
  setInterval(() => {
    decreaseSliderValue(daySlider, dayValue, parseInt(daySlider.min), dayLocked);
  }, 500); // Decrease every 0.5 seconds

  setInterval(() => {
    decreaseSliderValue(monthSlider, monthValue, parseInt(monthSlider.min), monthLocked);
  }, 500);

  setInterval(() => {
    decreaseSliderValue(yearSlider, yearValue, parseInt(yearSlider.min), yearLocked);
  }, 500);
});
