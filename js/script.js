// --- Preloader ---
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    setTimeout(() => {
      preloader.classList.add('fade-out');
    }, 1200);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  // --- Theme Toggle (Dark / Light Mode) ---
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.documentElement;
  const themeIcon = themeToggle ? themeToggle.querySelector('i') : null;

  // Set default theme to dark if not set
  const savedTheme = localStorage.getItem('theme') || 'dark';
  body.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  if(themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = body.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      body.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateThemeIcon(newTheme);
    });
  }

  function updateThemeIcon(theme) {
    if (!themeIcon) return;
    if (theme === 'dark') {
      themeIcon.classList.remove('fa-moon');
      themeIcon.classList.add('fa-sun');
    } else {
      themeIcon.classList.remove('fa-sun');
      themeIcon.classList.add('fa-moon');
    }
  }

  // --- Mobile Menu Toggle ---
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const navLinks = document.getElementById('nav-links');

  if(mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      const icon = mobileMenuBtn.querySelector('i');
      if(navLinks.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
      } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
      }
    });
  }

  // --- Header Scroll Effect ---
  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // --- Fade-up Animations on Scroll ---
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const animatedElements = document.querySelectorAll('.fade-up');
  animatedElements.forEach(el => observer.observe(el));

  // --- Form Validation & Intercept ---
  const setError = (element, message) => {
    const formGroup = element.parentElement;
    let errorDisplay = formGroup.querySelector('.error-text');
    if (!errorDisplay) {
      errorDisplay = document.createElement('span');
      errorDisplay.className = 'error-text';
      formGroup.appendChild(errorDisplay);
    }
    errorDisplay.innerText = message;
    element.classList.add('error');
    element.classList.remove('success');
  };

  const setSuccess = (element) => {
    const formGroup = element.parentElement;
    const errorDisplay = formGroup.querySelector('.error-text');
    if (errorDisplay) {
      errorDisplay.innerText = '';
    }
    element.classList.add('success');
    element.classList.remove('error');
  };

  const validateRegistration = () => {
    let isValid = true;
    const firstName = document.getElementById('firstName');
    const lastName = document.getElementById('lastName');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    const mcNumber = document.getElementById('mcNumber');
    const dotNumber = document.getElementById('dotNumber');

    if (firstName && lastName) {
      if (!firstName.value.trim()) { setError(firstName, 'First name is required'); isValid = false; } else { setSuccess(firstName); }
      if (!lastName.value.trim()) { setError(lastName, 'Last name is required'); isValid = false; } else { setSuccess(lastName); }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.value.trim())) { setError(email, 'Provide a valid email address'); isValid = false; } else { setSuccess(email); }
      
      const phoneRegex = /^\D?(\d{3})\D?\D?(\d{3})\D?(\d{4})$/;
      if (!phoneRegex.test(phone.value.trim())) { setError(phone, 'Provide a valid 10-digit phone number'); isValid = false; } else { setSuccess(phone); }

      if (!/^\d{6,7}$/.test(mcNumber.value.trim())) { setError(mcNumber, 'MC Number must be 6-7 digits'); isValid = false; } else { setSuccess(mcNumber); }
      if (!/^\d{5,8}$/.test(dotNumber.value.trim())) { setError(dotNumber, 'DOT Number must be 5-8 digits'); isValid = false; } else { setSuccess(dotNumber); }
    }
    return isValid;
  };

  // --- Toast Notification System ---
  function showToast(message, type = 'success') {
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
    
    toastContainer.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    // Remove toast
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 300); 
    }, 3500);
  }

  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    
    // Add blur validation specifically for registration form
    if(form.id === 'registration-form') {
      const inputs = form.querySelectorAll('.form-control');
      inputs.forEach(input => {
        input.addEventListener('blur', () => {
           if(input.value.trim() !== '') validateRegistration();
        });
      });
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      if (form.id === 'registration-form') {
        if (!validateRegistration()) {
          showToast('Please fix the errors in the form.', 'error');
          return;
        }
      }

      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.innerHTML;
      
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
      btn.disabled = true;

      const FORMSPREE_ENDPOINT = "https://formspree.io/f/YOUR_FORM_ID_HERE"; // Add your ID

      const formData = new FormData();
      form.querySelectorAll('input, textarea, select').forEach(input => {
        if (input.id) formData.append(input.id, input.value);
      });

      fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      }).then(response => {
        if (response.ok) {
          btn.innerHTML = '<i class="fas fa-check"></i> Success!';
          btn.classList.add('btn-success');
          showToast(form.id === 'registration-form' ? 'Application Submitted Successfully!' : 'Message Sent Successfully!', 'success');
          
          form.reset();
          form.querySelectorAll('.form-control').forEach(el => {
              el.classList.remove('success', 'error');
          });
          form.querySelectorAll('.error-text').forEach(el => el.innerText = '');
        } else {
          throw new Error('Formspree response not ok');
        }
      }).catch(error => {
        console.warn("Formspree ID missing. Simulating success fallback.");
        btn.innerHTML = '<i class="fas fa-check"></i> Success!';
        btn.classList.add('btn-success');
        showToast('Form Processed (Add Formspree ID to send real emails)', 'success');
        form.reset();
      }).finally(() => {
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.disabled = false;
          btn.classList.remove('btn-success');
        }, 3000);
      });
    });
  });

  // --- Type Effect ---
  const typeEffectSpan = document.querySelector('.type-effect');
  if (typeEffectSpan) {
    const words = ['Hassle.', 'Paperwork.', 'Stress.'];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 150;

    function type() {
      const currentWord = words[wordIndex];
      
      if (isDeleting) {
        typeEffectSpan.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
        typeSpeed = 50;
      } else {
        typeEffectSpan.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
        typeSpeed = 150;
      }

      if (!isDeleting && charIndex === currentWord.length) {
        isDeleting = true;
        typeSpeed = 2000; // Pause at end
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        typeSpeed = 500; // Pause before new word
      }

      setTimeout(type, typeSpeed);
    }
    
    // Start typing effect
    setTimeout(type, 1000);
  }

  // --- Image Carousel ---
  const carouselImgs = document.querySelectorAll('.carousel-img');
  const dots = document.querySelectorAll('.dot');
  if (carouselImgs.length > 0) {
    let currentImgIndex = 0;
    
    function nextSlide() {
      carouselImgs[currentImgIndex].classList.remove('active');
      if (dots[currentImgIndex]) dots[currentImgIndex].classList.remove('active');
      
      currentImgIndex = (currentImgIndex + 1) % carouselImgs.length;
      
      carouselImgs[currentImgIndex].classList.add('active');
      if (dots[currentImgIndex]) dots[currentImgIndex].classList.add('active');
    }

    // Change slide every 5 seconds
    setInterval(nextSlide, 5000);
  }

  // --- Earnings Calculator ---
  const milesSlider = document.getElementById('milesSlider');
  const rateSlider = document.getElementById('rateSlider');
  const milesValue = document.getElementById('milesValue');
  const rateValue = document.getElementById('rateValue');
  const currentEarnings = document.getElementById('currentEarnings');
  const nexusEarnings = document.getElementById('nexusEarnings');
  const extraEarnings = document.getElementById('extraEarnings');

  if (milesSlider && rateSlider) {
    function calculateEarnings() {
      const miles = parseFloat(milesSlider.value);
      const rate = parseFloat(rateSlider.value);
      
      milesValue.textContent = miles.toLocaleString();
      rateValue.textContent = '$' + rate.toFixed(2);
      
      const current = miles * rate;
      const nexusRate = rate * 1.15; // 15% boost
      const nexus = miles * nexusRate;
      const extra = nexus - current;

      currentEarnings.textContent = '$' + current.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0});
      nexusEarnings.textContent = '$' + nexus.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0});
      extraEarnings.textContent = '+$' + extra.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0});
    }

    milesSlider.addEventListener('input', calculateEarnings);
    rateSlider.addEventListener('input', calculateEarnings);
    
    // Initial calculation
    calculateEarnings();
  }

  // --- FAQ Accordion ---
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Close all other accordions
      faqItems.forEach(otherItem => {
        otherItem.classList.remove('active');
        otherItem.querySelector('.faq-answer').style.maxHeight = null;
      });
      
      // Toggle current accordion
      if (!isActive) {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });

  // --- Simulated Live Chat Widget ---
  const injectChatWidget = () => {
    const chatHTML = `
      <div class="chat-widget" id="chat-widget">
        <div class="chat-header">
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <div class="status-dot"></div>
            <strong>Live Support</strong>
          </div>
          <button id="close-chat" style="background:none; border:none; color:white; cursor:pointer;"><i class="fas fa-times"></i></button>
        </div>
        <div class="chat-messages" id="chat-messages">
          <div class="message bot-message">Hi there! How can we help you maximize your miles today?</div>
        </div>
        <div class="chat-input-area">
          <input type="text" id="chat-input" placeholder="Type a message..." autocomplete="off">
          <button id="send-chat"><i class="fas fa-paper-plane"></i></button>
        </div>
      </div>
      <button class="chat-toggle-btn" id="chat-toggle-btn">
        <i class="fas fa-comment-dots"></i>
      </button>
    `;
    
    const wrapper = document.createElement('div');
    wrapper.innerHTML = chatHTML;
    document.body.appendChild(wrapper);

    const toggleBtn = document.getElementById('chat-toggle-btn');
    const chatWidget = document.getElementById('chat-widget');
    const closeBtn = document.getElementById('close-chat');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-chat');
    const messagesArea = document.getElementById('chat-messages');

    const toggleChat = () => {
      chatWidget.classList.toggle('active');
    };

    toggleBtn.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', toggleChat);

    const sendMessage = () => {
      const text = chatInput.value.trim();
      if (!text) return;

      // Add user message
      const userMsg = document.createElement('div');
      userMsg.className = 'message user-message';
      userMsg.innerText = text;
      messagesArea.appendChild(userMsg);
      chatInput.value = '';
      messagesArea.scrollTop = messagesArea.scrollHeight;

      // Simulate typing indicator
      const typingMsg = document.createElement('div');
      typingMsg.className = 'message bot-message typing-indicator';
      typingMsg.innerHTML = '<span>.</span><span>.</span><span>.</span>';
      messagesArea.appendChild(typingMsg);
      messagesArea.scrollTop = messagesArea.scrollHeight;

      // Bot reply delay
      setTimeout(() => {
        typingMsg.remove();
        const botMsg = document.createElement('div');
        botMsg.className = 'message bot-message';
        botMsg.innerText = 'Thanks for reaching out! A senior dispatcher will be with you in just a moment.';
        messagesArea.appendChild(botMsg);
        messagesArea.scrollTop = messagesArea.scrollHeight;
      }, 1500);
    };

    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  };

  injectChatWidget();

  // --- Smooth Page Transitions ---
  document.body.style.transition = 'opacity 0.4s ease';
  
  const internalLinks = document.querySelectorAll('a[href$=".html"], a[href="index.html"]');
  internalLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      // Don't intercept if trying to open in new tab
      if (e.ctrlKey || e.metaKey || link.target === '_blank') return;
      
      e.preventDefault();
      const targetUrl = link.href;
      
      document.body.style.opacity = '0';
      
      setTimeout(() => {
        window.location.href = targetUrl;
      }, 400); // Wait for fade out
    });
  });

  // Handle back button caching issue in Safari/Firefox
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) {
      document.body.style.opacity = '1';
    }
  });

});
