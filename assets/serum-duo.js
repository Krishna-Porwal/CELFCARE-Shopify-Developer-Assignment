document.addEventListener('DOMContentLoaded', () => {
  const hero = document.querySelector('.serum-hero');
  if (!hero) return;

  const priceNode = hero.querySelector('[data-price-display]');
  const imageNode = document.getElementById('SerumHeroImage');
  const buttons = hero.querySelectorAll('[data-serum-variant]');
  const errorNode = hero.querySelector('[data-serum-error]');
  const addToCartButton = hero.querySelector('[data-serum-add-to-cart]');
  const stickyButton = hero.querySelector('[data-serum-add-to-cart-sticky]');
  const refillCheckbox = hero.querySelector('[data-serum-refill-checkbox]');
  const mobileGallery = hero.querySelector('[data-mobile-gallery]');
  const galleryTrack = hero.querySelector('[data-gallery-slider]');
  const galleryThumbs = hero.querySelectorAll('[data-gallery-thumb]');
  const stickyBar = hero.querySelector('[data-sticky-cta]');

  const updateSelectedVariant = (button) => {
    buttons.forEach((item) => {
      const selected = item === button;
      item.classList.toggle('is-selected', selected);
      item.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });

    const variantId = button.dataset.variantId;
    const variantPrice = button.dataset.variantPrice;
    const imageUrl = button.dataset.variantImage;
    const url = button.dataset.variantUrl;

    if (priceNode) priceNode.textContent = variantPrice;
    if (imageNode && imageUrl) imageNode.src = imageUrl;
    if (addToCartButton) addToCartButton.dataset.selectedVariantId = variantId;
    if (stickyButton) stickyButton.dataset.selectedVariantId = variantId;
    if (url) {
      const newUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
      history.replaceState({}, '', newUrl);
    }
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => updateSelectedVariant(button));
  });

  const openCartDrawer = () => {
    const cartDrawer = document.querySelector('cart-drawer');
    if (!cartDrawer) return;

    if (typeof cartDrawer.open === 'function') {
      cartDrawer.open(document.activeElement || cartDrawer);
      return;
    }

    cartDrawer.classList.add('active');
    document.body.classList.add('overflow-hidden');
  };

  const addToCart = async (button) => {
    const selectedVariantId = button?.dataset.selectedVariantId;
    const refillVariantId = hero.dataset.refillVariantId;
    const items = [];

    if (!selectedVariantId) {
      if (errorNode) {
        errorNode.textContent = 'Please choose a serum variant.';
      }
      return;
    }

    items.push({ id: Number(selectedVariantId), quantity: 1 });

    // Re-query the checkbox at click time in case the node reference is stale
    const currentRefillCheckbox = hero.querySelector('[data-serum-refill-checkbox]');
    const refillChecked = currentRefillCheckbox ? currentRefillCheckbox.checked : false;
    // Only include refill if configured with a real numeric variant id (>0)
    const refillIdNum = Number(refillVariantId);
    if (refillChecked && refillVariantId && !Number.isNaN(refillIdNum) && refillIdNum > 0) {
      items.push({ id: refillIdNum, quantity: 1 });
    }
    
    try {
      if (errorNode) errorNode.textContent = '';
      
      // Create or find a debug node to show request/response for troubleshooting
      let debugNode = hero.querySelector('[data-refill-debug]');
      if (!debugNode) {
        debugNode = document.createElement('pre');
        debugNode.setAttribute('data-refill-debug', '');
        debugNode.style.whiteSpace = 'pre-wrap';
        debugNode.style.fontSize = '12px';
        debugNode.style.marginTop = '8px';
        debugNode.style.maxHeight = '200px';
        debugNode.style.overflow = 'auto';
        debugNode.style.background = 'rgba(0,0,0,0.03)';
        debugNode.style.padding = '8px';
        const container = hero.querySelector('.serum-hero__content') || hero;
        container.appendChild(debugNode);
      }
      
      // Log runtime values
      console.log('Serum Duo addToCart - selectedVariantId:', selectedVariantId);
      console.log('Serum Duo addToCart - refillVariantId (raw):', refillVariantId, 'refillIdNum:', refillIdNum);
      console.log('Serum Duo addToCart - refill checked:', refillChecked);
      console.log('Serum Duo addToCart - items payload:', items);
      debugNode.textContent = 'Request payload:\n' + JSON.stringify({ items }, null, 2) + '\n\nSending request...';
      
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          items,
          sections: ['cart-drawer', 'cart-icon-bubble'],
          sections_url: window.location.pathname
        })
      });
      
      const data = await response.json();
      console.log('Serum Duo addToCart - response status:', response.status);
      console.log('Serum Duo addToCart - response:', data);
      debugNode.textContent = 'Request payload:\n' + JSON.stringify({ items }, null, 2) + '\n\nResponse status: ' + response.status + '\n' + JSON.stringify(data, null, 2);
      
      if (!response.ok) {
        // show visible error
        const message = data?.message || 'Unable to add to cart.';
        if (errorNode) errorNode.textContent = message;
        return;
      }
      
      // Response may include cart data or a sections payload. Try to detect line items.
      const returnedItems = data?.items || (data?.cart && data.cart.items) || null;
      
      // If returnedItems present, check for refill id
      if (returnedItems) {
        const hasRefill = returnedItems.some((it) => Number(it.variant_id || it.id) === refillIdNum);
        if (!hasRefill && refillChecked && refillIdNum > 0) {
          const msg = 'Refill variant not present in cart response. Response items: ' + JSON.stringify(returnedItems.map((i) => ({ id: i.id || i.variant_id, quantity: i.quantity || i.qty })), null, 2);
          if (errorNode) errorNode.textContent = 'Refill was not added. ' + msg;
          console.warn(msg);
        }
      }
      
      const cartDrawer = document.querySelector('cart-drawer');
      if (cartDrawer && typeof cartDrawer.renderContents === 'function') {
        cartDrawer.renderContents(data);
      } else {
        openCartDrawer();
      }
      
      document.body.classList.add('overflow-hidden');
    } catch (error) {
      if (errorNode) {
        errorNode.textContent = error.message || 'Something went wrong while adding to cart.';
      }
      console.error('Serum Duo addToCart error:', error);
    }

    // Note: request/response handled above with instrumentation; no duplicate call.
  };

  addToCartButton?.addEventListener('click', () => addToCart(addToCartButton));
  stickyButton?.addEventListener('click', () => addToCart(stickyButton));

  if (mobileGallery && galleryTrack) {
    galleryTrack.addEventListener('scroll', () => {
      const slides = [...galleryTrack.querySelectorAll('[data-gallery-slide]')];
      const slideWidth = galleryTrack.clientWidth;
      const index = Math.round(galleryTrack.scrollLeft / slideWidth);

      galleryThumbs.forEach((thumb, thumbIndex) => {
        thumb.classList.toggle('is-active', thumbIndex === index);
      });
    }, { passive: true });

    galleryThumbs.forEach((thumb, index) => {
      thumb.addEventListener('click', () => {
        const slides = [...galleryTrack.querySelectorAll('[data-gallery-slide]')];
        const targetSlide = slides[index];
        if (targetSlide) {
          targetSlide.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
        }
      });
    });
  }

  if (addToCartButton && stickyBar) {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const updateStickyVisibility = () => {
      if (!mediaQuery.matches) {
        stickyBar.classList.remove('is-visible');
        stickyBar.setAttribute('aria-hidden', 'true');
        return;
      }

      const currentlyVisible = addToCartButton.getBoundingClientRect().top < window.innerHeight && addToCartButton.getBoundingClientRect().bottom >= 0;
      const shouldShow = !currentlyVisible;
      stickyBar.classList.toggle('is-visible', shouldShow);
      stickyBar.setAttribute('aria-hidden', shouldShow ? 'false' : 'true');
    };

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!mediaQuery.matches) return;
          const visible = entry.isIntersecting;
          stickyBar.classList.toggle('is-visible', !visible);
          stickyBar.setAttribute('aria-hidden', String(!visible));
          stickyBar.style.transition = reducedMotion.matches ? 'none' : 'transform 0.2s ease';
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(addToCartButton);
    window.addEventListener('scroll', updateStickyVisibility, { passive: true });
    window.addEventListener('resize', updateStickyVisibility);
    updateStickyVisibility();
  }
});
