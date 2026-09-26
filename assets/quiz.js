document.addEventListener('DOMContentLoaded', () => {
  const quizSection = document.querySelector('[data-quiz-section]');
  if (!quizSection) return;

  const steps = Array.from(quizSection.querySelectorAll('[data-quiz-step]'));
  const progressBar = quizSection.querySelector('[data-quiz-progress-bar]');
  const backButton = quizSection.querySelector('[data-quiz-back]');
  const resultBox = quizSection.querySelector('[data-quiz-result]');
  const recommendationNode = quizSection.querySelector('[data-quiz-recommendation]');
  const recommendationCopy = quizSection.querySelector('[data-quiz-recommendation-copy]');
  const addToCartButton = quizSection.querySelector('[data-quiz-add-to-cart]');

  const state = {
    step: 0,
    answers: {},
    recommendation: null
  };

  const recommendationMap = {
    Duo: {
      label: 'Duo',
      copy: 'A complete hydration + firming duo for balanced, healthier-looking skin.'
    },
    InstaFirm: {
      label: 'InstaFirm',
      copy: 'A targeted firming formula for bouncy, lifted, and smoother-feeling skin.'
    },
    InstaLift: {
      label: 'InstaLift',
      copy: 'A lifting and plumping formula designed for an instantly refreshed glow.'
    }
  };

  const recommendationLogic = (answers) => {
    const age = answers.age || '';
    const concern = answers.concern || '';
    const skinType = answers.skinType || '';
    const routine = answers.routine || '';

    if (concern === 'Dryness' || routine === 'Barrier repair' || skinType === 'Sensitive') {
      return 'Duo';
    }

    if (age === '50+' || concern === 'Fine lines' || routine === 'Actives') {
      return 'InstaFirm';
    }

    if (concern === 'Dullness' || skinType === 'Combination' || routine === 'Hydrating') {
      return 'InstaLift';
    }

    return 'Duo';
  };

  const updateProgress = () => {
    const percent = ((state.step + 1) / steps.length) * 100;
    if (progressBar) {
      progressBar.style.width = `${percent}%`;
    }
  };

  const renderStep = () => {
    steps.forEach((step, index) => {
      const visible = index === state.step && !resultBox.hidden;
      step.hidden = index !== state.step;
      if (visible) {
        step.hidden = false;
      }
    });

    const currentStepVisible = state.step < steps.length;
    if (!currentStepVisible) {
      resultBox.hidden = false;
      const recommendation = recommendationLogic(state.answers);
      state.recommendation = recommendation;
      if (recommendationNode) recommendationNode.textContent = recommendationMap[recommendation].label;
      if (recommendationCopy) recommendationCopy.textContent = recommendationMap[recommendation].copy;
      addToCartButton.dataset.recommendation = recommendation;
      backButton.hidden = true;
      updateProgress();
      return;
    }

    const activeStepIndex = state.step;
    steps.forEach((step, index) => {
      step.hidden = index !== activeStepIndex;
    });
    resultBox.hidden = true;
    backButton.hidden = state.step === 0;
    updateProgress();
  };

  const saveAnswer = (question, answer) => {
    state.answers[question] = answer;
  };

  const updateCartAttributes = async () => {
    const attributes = {
      age: state.answers.age || '',
      concern: state.answers.concern || '',
      skin_type: state.answers.skinType || '',
      routine: state.answers.routine || ''
    };

    const response = await fetch('/cart/update.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({ attributes })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Quiz cart attribute update failed:', data);
    }
  };

  steps.forEach((step, index) => {
    const options = step.querySelectorAll('[data-answer]');
    options.forEach((option) => {
      option.addEventListener('click', () => {
        const answer = option.dataset.answer;
        if (index === 0) saveAnswer('age', answer);
        if (index === 1) saveAnswer('concern', answer);
        if (index === 2) saveAnswer('skinType', answer);
        if (index === 3) saveAnswer('routine', answer);

        state.step += 1;
        renderStep();
      });
    });
  });

  backButton?.addEventListener('click', () => {
    if (state.step > 0) {
      state.step -= 1;
      renderStep();
    }
  });

  addToCartButton?.addEventListener('click', async () => {
    const recommendation = state.recommendation || recommendationLogic(state.answers);
    const variantIds = {
      Duo: quizSection.dataset.duoVariantId,
      InstaFirm: quizSection.dataset.instafirmVariantId,
      InstaLift: quizSection.dataset.instaliftVariantId
    };

    const selectedVariant = variantIds[recommendation];

    if (!selectedVariant) {
      return;
    }

    const response = await fetch('/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({
        items: [{ id: Number(selectedVariant), quantity: 1 }],
        sections: ['cart-drawer', 'cart-icon-bubble'],
        sections_url: window.location.pathname
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(data);
      return;
    }

    const cartDrawer = document.querySelector('cart-drawer');
    if (cartDrawer && typeof cartDrawer.renderContents === 'function') {
      cartDrawer.renderContents(data);
    } else {
      cartDrawer?.classList.add('active');
      document.body.classList.add('overflow-hidden');
    }

    await updateCartAttributes();
  });

  renderStep();
});
