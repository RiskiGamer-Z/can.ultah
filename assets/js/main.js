(function() {
	'use strict';

	const typewriterEl = document.getElementById('typewriter');
	const surpriseBtn = document.getElementById('btn-surprise');
	const scrollBtn = document.getElementById('btn-scroll');
	const letterBtn = document.getElementById('btn-letter');
	const heartsLayer = document.querySelector('.hearts');
	const confettiCanvas = document.getElementById('confetti-canvas');
	const fireworksCanvas = document.getElementById('fireworks-canvas');
	const wishForm = document.getElementById('wish-form');
	const wishInput = document.getElementById('wish-input');
	const wishList = document.getElementById('wish-list');
	const musicBtn = document.getElementById('btn-music');
	const bgMusic = document.getElementById('bg-music');
	const fireworksBtn = document.getElementById('btn-fireworks');
	const blowBtn = document.getElementById('btn-blow');
	const lightbox = document.getElementById('lightbox');
	const lightboxImg = lightbox ? lightbox.querySelector('.lightbox__img') : null;
	const lightboxCap = lightbox ? lightbox.querySelector('.lightbox__cap') : null;
	const lightboxClose = lightbox ? lightbox.querySelector('.lightbox__close') : null;
	const letterModal = document.getElementById('letter-modal');
	const letterClose = letterModal ? letterModal.querySelector('.modal__close') : null;

	// Set your default music here
	const MUSIC_SRC = 'assets/audio/lagu.mp3';
	const TYPEWRITER_TEXTS = [
		"Semoga harimu selembut senja dan sehangat pelukan.",
		"Doaku: bahagia yang tak bertepi untukmu.",
		"Terima kasih sudah jadi rumah yang terasa pulang.",
		"Di matamu, aku menemukan tujuan pulang."
	];

	// Initialize music source if available
	try {
		const srcEl = bgMusic.querySelector('source');
		if (srcEl) srcEl.src = MUSIC_SRC;
		bgMusic.load();
	} catch (e) { /* noop */ }

	// Typewriter effect
	let twIndex = 0;
	let twChar = 0;
	let twDeleting = false;
	function typeLoop() {
		const current = TYPEWRITER_TEXTS[twIndex % TYPEWRITER_TEXTS.length];
		if (!twDeleting) {
			twChar++;
			if (twChar > current.length) {
				twDeleting = true;
				setTimeout(typeLoop, 1600); // hold before deleting
				return;
			}
		} else {
			twChar--;
			if (twChar === 0) {
				twDeleting = false;
				twIndex++;
			}
		}
		typewriterEl.textContent = current.slice(0, twChar);
		setTimeout(typeLoop, twDeleting ? 32 : 56);
	}
	setTimeout(typeLoop, 600);

	// Hearts floating
	function spawnHeart() {
		const heart = document.createElement('div');
		heart.className = 'heart';
		heart.style.left = Math.random() * 100 + 'vw';
		heart.style.bottom = '-20px';
		heart.style.animationDuration = (2.8 + Math.random() * 1.6) + 's';
		heart.style.background = Math.random() > .5 ? 'var(--primary)' : 'var(--primary-2)';
		heartsLayer.appendChild(heart);
		setTimeout(() => heart.remove(), 4000);
	}
	setInterval(spawnHeart, 420);

	// Confetti canvas
	const ctx = confettiCanvas.getContext('2d');
	let confettiPieces = [];

	function createConfettiBurst() {
		const colors = ['#ff6b81', '#ff9aa2', '#ffd166', '#ffffff'];
		for (let i = 0; i < 120; i++) {
			confettiPieces.push({
				x: confettiCanvas.width / 2,
				y: confettiCanvas.height / 3,
				r: 2 + Math.random() * 3,
				c: colors[Math.floor(Math.random() * colors.length)],
				vx: (Math.random() - 0.5) * 6,
				vy: Math.random() * -4 - 2,
				life: 90 + Math.random() * 40
			});
		}
	}

	function updateConfetti() {
		ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
		confettiPieces = confettiPieces.filter(p => p.life > 0);
		for (const p of confettiPieces) {
			p.vy += 0.12; // gravity
			p.x += p.vx;
			p.y += p.vy;
			p.life--;
			ctx.fillStyle = p.c;
			ctx.beginPath();
			ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
			ctx.fill();
		}
		requestAnimationFrame(updateConfetti);
	}

	function resizeCanvas() {
		confettiCanvas.width = window.innerWidth;
		confettiCanvas.height = window.innerHeight;
		fireworksCanvas.width = window.innerWidth;
		fireworksCanvas.height = window.innerHeight;
	}
	window.addEventListener('resize', resizeCanvas);
	resizeCanvas();
	updateConfetti();

	// Fireworks engine
	const fw = fireworksCanvas.getContext('2d');
	let fireworks = [];
	let sparks = [];
	function launch(x, y) {
		const vx = (Math.random() - 0.5) * 2;
		const vy = - (6 + Math.random() * 2);
		fireworks.push({ x, y, vx, vy, life: 60 + Math.random() * 20, color: `hsl(${Math.floor(Math.random()*360)},90%,65%)` });
	}
	function explode(x, y, color) {
		const count = 80 + Math.floor(Math.random()*40);
		for (let i=0;i<count;i++) {
			const a = Math.random() * Math.PI * 2;
			const sp = 1 + Math.random() * 3.5;
			sparks.push({ x, y, vx: Math.cos(a)*sp, vy: Math.sin(a)*sp, life: 70 + Math.random()*30, color, r: 1 + Math.random()*2 });
		}
	}
	function stepFireworks() {
		fw.globalCompositeOperation = 'destination-out';
		fw.fillStyle = 'rgba(0,0,0,0.25)';
		fw.fillRect(0,0,fireworksCanvas.width, fireworksCanvas.height);
		fw.globalCompositeOperation = 'lighter';

		// update rockets
		const gravity = 0.06;
		fireworks = fireworks.filter(f => f.life > 0);
		for (const f of fireworks) {
			f.life--;
			f.vy += gravity;
			f.x += f.vx;
			f.y += f.vy;
			// draw
			fw.fillStyle = f.color;
			fw.beginPath();
			fw.arc(f.x, f.y, 2, 0, Math.PI*2);
			fw.fill();
			if (f.vy >= 0 || f.life < 50) {
				explode(f.x, f.y, f.color);
				f.life = 0;
			}
		}

		// update sparks
		sparks = sparks.filter(s => s.life > 0);
		for (const s of sparks) {
			s.life--;
			s.vy += gravity/2;
			s.x += s.vx;
			s.y += s.vy;
			fw.fillStyle = s.color;
			fw.beginPath();
			fw.arc(s.x, s.y, s.r, 0, Math.PI*2);
			fw.fill();
		}

		requestAnimationFrame(stepFireworks);
	}
	stepFireworks();

	function showFireworksBurst() {
		for (let i=0;i<5;i++) {
			launch(Math.random()*fireworksCanvas.width, fireworksCanvas.height - 10);
		}
	}

	// Lightbox gallery
	const galleryButtons = Array.from(document.querySelectorAll('.gallery__item'));
	for (const btn of galleryButtons) {
		btn.addEventListener('click', function() {
			const full = btn.getAttribute('data-full');
			const cap = btn.getAttribute('data-caption') || '';
			if (!full || !lightbox) return;
			lightboxImg.src = full;
			lightboxImg.alt = cap || 'Foto';
			lightboxCap.textContent = cap;
			lightbox.classList.add('is-open');
		});
	}
	function closeLightbox() { if (!lightbox) return; lightbox.classList.remove('is-open'); }
	if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
	if (lightbox) lightbox.addEventListener('click', function(e) { if (e.target === lightbox) closeLightbox(); });
	window.addEventListener('keydown', function(e) { if (e.key === 'Escape') { closeLightbox(); closeLetter(); } });

	// Wishes persistence
	const STORAGE_KEY = 'ultah_wishes_v1';
	function loadWishes() {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			return raw ? JSON.parse(raw) : [];
		} catch (_) { return []; }
	}
	function saveWishes(items) {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
		} catch (_) {}
	}
	function renderWishes(items) {
		wishList.innerHTML = '';
		for (const item of items) {
			const li = document.createElement('li');
			li.textContent = item.text;
			wishList.appendChild(li);
		}
	}

	let wishes = loadWishes();
	renderWishes(wishes);

	wishForm.addEventListener('submit', function(e) {
		e.preventDefault();
		const text = wishInput.value.trim();
		if (!text) return;
		wishes.unshift({ id: Date.now(), text });
		saveWishes(wishes);
		renderWishes(wishes);
		wishInput.value = '';
	});

	// Buttons behaviors
	surpriseBtn.addEventListener('click', function() {
		createConfettiBurst();
		showFireworksBurst();
		try { bgMusic.currentTime = 0; bgMusic.play().catch(() => {}); } catch (_) {}
	});

	scrollBtn.addEventListener('click', function() {
		document.getElementById('reasons').scrollIntoView({ behavior: 'smooth', block: 'start' });
	});

	musicBtn.addEventListener('click', function() {
		if (bgMusic.paused) {
			bgMusic.play().catch(() => {});
			musicBtn.textContent = 'Jeda Musik';
		} else {
			bgMusic.pause();
			musicBtn.textContent = 'Putar Musik';
		}
	});

	if (fireworksBtn) fireworksBtn.addEventListener('click', showFireworksBurst);

	// Candle interactions
	function setFlames(on) {
		const flames = document.querySelectorAll('.flame');
		for (const fl of flames) {
			if (on) fl.classList.remove('is-off'); else fl.classList.add('is-off');
		}
	}
	if (blowBtn) blowBtn.addEventListener('click', function() {
		setFlames(false);
		// celebratory fireworks when blown out
		showFireworksBurst();
	});

	// Letter modal
	function openLetter() { if (!letterModal) return; letterModal.classList.add('is-open'); }
	function closeLetter() { if (!letterModal) return; letterModal.classList.remove('is-open'); }
	if (letterBtn) letterBtn.addEventListener('click', openLetter);
	if (letterClose) letterClose.addEventListener('click', closeLetter);
	if (letterModal) letterModal.addEventListener('click', function(e) { if (e.target === letterModal) closeLetter(); });

})();


