(() => {
  const trainingPath = '/businesses/gold-appraiser-training';
  const isTrainingPage = () => window.location.pathname.replace(/\/$/, '') === trainingPath;
  let mountTimer = null;

  const mount = () => {
    if (!isTrainingPage()) return;
    if (document.getElementById('gold-appraiser-enquiry')) return;
    const main = document.querySelector('main');
    if (!main) return scheduleMount(250);

    const section = document.createElement('section');
    section.id = 'gold-appraiser-enquiry';
    section.className = 'gjm-lead-section';
    section.innerHTML = `
      <div class="gjm-lead-shell">
        <div class="gjm-lead-copy">
          <span class="gjm-lead-kicker">PrimeGold Academy · Thanjavur</span>
          <h2>Become a Gold Appraiser in 7 days</h2>
          <p class="gjm-lead-tamil" lang="ta">7 நாளில் தங்க மதிப்பீட்டாளர் ஆகுங்கள் – அடுத்த Batch-ல் இடம் பெறுங்கள்.</p>
          <ul class="gjm-lead-chips">
            <li>6 days theory at our Thanjavur centre, or online</li>
            <li>1 day practical in Thanjavur or your district</li>
            <li>Certificate on completion</li>
            <li>Special offer ₹5,000 + GST</li>
            <li>Placement support through GetJobMe</li>
          </ul>
          <a class="gjm-lead-whatsapp" href="https://wa.me/917200824009?text=GOLD" target="_blank" rel="noopener">
            <span>Quick reply on WhatsApp</span>
            <strong>Send GOLD to 72008 24009</strong>
          </a>
          <p class="gjm-lead-or">or fill the 1-minute form 👇</p>
        </div>
        <form class="gjm-lead-card" id="gold-appraiser-lead-form" novalidate>
          <div class="gjm-lead-grid">
            <div class="gjm-lead-field gjm-lead-field--full">
              <label for="gjm-lead-name">Full name *</label>
              <input id="gjm-lead-name" name="fullName" autocomplete="name" maxlength="100" required>
            </div>
            <div class="gjm-lead-field">
              <label for="gjm-lead-mobile">WhatsApp mobile number *</label>
              <input id="gjm-lead-mobile" name="mobileNo" type="tel" inputmode="numeric" autocomplete="tel" maxlength="15" placeholder="10-digit mobile number" required>
            </div>
            <div class="gjm-lead-field">
              <label for="gjm-lead-location">City / District *</label>
              <input id="gjm-lead-location" name="currentLocation" autocomplete="address-level2" maxlength="120" required>
            </div>
            <div class="gjm-lead-field">
              <label for="gjm-lead-occupation">Current occupation</label>
              <input id="gjm-lead-occupation" name="occupation" maxlength="120" placeholder="Student, employee, business…">
            </div>
            <div class="gjm-lead-field">
              <label for="gjm-lead-language">Preferred communication</label>
              <select id="gjm-lead-language" name="preferredLanguage">
                <option value="Tamil">Tamil</option>
                <option value="English">English</option>
                <option value="Tamil and English">Tamil and English</option>
              </select>
            </div>
          </div>
          <div class="gjm-lead-honeypot" aria-hidden="true">
            <label for="gjm-lead-website">Website</label>
            <input id="gjm-lead-website" name="website" tabindex="-1" autocomplete="off">
          </div>
          <label class="gjm-lead-consent">
            <input type="checkbox" name="consent" required>
            <span>I agree that Canny Heads Consulting may contact me about Gold Appraiser Training by phone or WhatsApp.</span>
          </label>
          <button class="gjm-lead-submit" type="submit">Submit training enquiry</button>
          <div class="gjm-lead-status" role="status" aria-live="polite"></div>
          <div class="gjm-booking-payment" id="gjm-booking-payment" hidden>
            <strong>Reserve your seat with a ₹999 booking advance</strong>
            <span>The ₹999 advance will be adjusted against your final course payment. Applicable GST will be collected with the final payment.</span>
            <button class="gjm-booking-pay" type="button">Pay ₹999 Booking Advance</button>
            <div class="gjm-payment-status" role="status" aria-live="polite"></div>
          </div>
          <p class="gjm-lead-note">Submitting an enquiry is free. After submission, you may securely pay the optional ₹999 booking advance through Razorpay to reserve your seat. Your details are used only for training follow-up.</p>
        </form>
        <div class="gjm-lead-details">
          <div class="gjm-lead-booking-offer">
            <strong>Reserve your seat with a ₹999 booking advance to avail the special offer.</strong>
            <span lang="ta">₹999 முன்பணம் செலுத்தி சிறப்புச் சலுகையில் உங்கள் இடத்தை முன்பதிவு செய்யுங்கள்.</span>
          </div>
          <p>Share your details and the Canny Heads team will contact you with the next Thanjavur batch schedule, practical-session details and the current special offer.</p>
          <p lang="ta">அடுத்த பயிற்சி Batch விவரங்களைப் பெற உங்கள் பெயர் மற்றும் WhatsApp எண்ணைப் பதிவு செய்யுங்கள்.</p>
          <p class="gjm-lead-small">Training builds career readiness for jewellery and gold-loan roles; through GetJobMe we find suitable employers and arrange interviews for you to get placed.</p>
        </div>
      </div>`;
    main.prepend(section);

    document.querySelectorAll('a').forEach((link) => {
      if (link.textContent.trim().toLowerCase() === 'start an enquiry') {
        link.href = '#gold-appraiser-enquiry';
        link.addEventListener('click', (event) => {
          event.preventDefault();
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
    });

    section.querySelector('.gjm-lead-whatsapp').addEventListener('click', () => {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'gold_appraiser_whatsapp_click', lead_source: new URLSearchParams(window.location.search).get('utm_source') || 'website' });
    });

    const form = section.querySelector('#gold-appraiser-lead-form');
    const button = form.querySelector('button[type="submit"]');
    const status = form.querySelector('.gjm-lead-status');
    const paymentPanel = form.querySelector('#gjm-booking-payment');
    const paymentButton = form.querySelector('.gjm-booking-pay');
    const paymentStatus = form.querySelector('.gjm-payment-status');
    let activeLead = null;
    const params = new URLSearchParams(window.location.search);
    const value = (name) => params.get(name) || '';

    const loadRazorpay = () => new Promise((resolve, reject) => {
      if (window.Razorpay) return resolve();
      const existing = document.querySelector('script[data-gjm-razorpay]');
      if (existing) {
        existing.addEventListener('load', resolve, { once: true });
        existing.addEventListener('error', reject, { once: true });
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.dataset.gjmRazorpay = 'true';
      script.onload = resolve;
      script.onerror = () => reject(new Error('Unable to load the secure payment window'));
      document.head.appendChild(script);
    });

    paymentButton.addEventListener('click', async () => {
      if (!activeLead?.reference || !activeLead?.mobileNo) return;
      paymentButton.disabled = true;
      paymentButton.textContent = 'Opening secure payment…';
      paymentStatus.className = 'gjm-payment-status';
      paymentStatus.textContent = '';
      try {
        const orderResponse = await fetch(`https://www.getjobme.com/api/public-leads/gold-appraiser/${encodeURIComponent(activeLead.reference)}/payment-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mobileNo: activeLead.mobileNo }),
        });
        const order = await orderResponse.json().catch(() => ({}));
        if (!orderResponse.ok) throw new Error(order.message || 'Unable to start the booking payment');
        await loadRazorpay();

        const checkout = new window.Razorpay({
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: 'Canny Heads Consulting',
          description: 'Gold Appraiser Training booking advance',
          order_id: order.id,
          prefill: {
            name: activeLead.fullName,
            contact: activeLead.mobileNo,
          },
          theme: { color: '#0b7653' },
          handler: async (paymentResult) => {
            paymentStatus.className = 'gjm-payment-status';
            paymentStatus.textContent = 'Verifying payment…';
            try {
              const verifyResponse = await fetch(`https://www.getjobme.com/api/public-leads/gold-appraiser/${encodeURIComponent(activeLead.reference)}/payment-verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...paymentResult, mobileNo: activeLead.mobileNo }),
              });
              const verified = await verifyResponse.json().catch(() => ({}));
              if (!verifyResponse.ok) throw new Error(verified.message || 'Unable to verify payment');
              paymentStatus.className = 'gjm-payment-status is-success';
              paymentStatus.textContent = verified.message || 'Payment successful. Your ₹999 booking advance is confirmed.';
              paymentButton.hidden = true;
              window.dataLayer = window.dataLayer || [];
              window.dataLayer.push({ event: 'gold_appraiser_booking_paid', value: 999, currency: 'INR' });
            } catch (error) {
              paymentStatus.className = 'gjm-payment-status is-error';
              paymentStatus.textContent = `${error.message}. If money was debited, our team will verify it from Razorpay.`;
              paymentButton.disabled = false;
              paymentButton.textContent = 'Retry ₹999 Payment';
            }
          },
          modal: {
            ondismiss: () => {
              paymentButton.disabled = false;
              paymentButton.textContent = 'Pay ₹999 Booking Advance';
            },
          },
        });
        checkout.on('payment.failed', (response) => {
          paymentStatus.className = 'gjm-payment-status is-error';
          paymentStatus.textContent = response.error?.description || 'Payment was not completed. You may try again.';
        });
        checkout.open();
      } catch (error) {
        paymentStatus.className = 'gjm-payment-status is-error';
        paymentStatus.textContent = error.message || 'Unable to start payment. Please try again.';
        paymentButton.disabled = false;
        paymentButton.textContent = 'Pay ₹999 Booking Advance';
      }
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      status.className = 'gjm-lead-status';
      status.textContent = '';
      if (!form.reportValidity()) return;

      const data = new FormData(form);
      button.disabled = true;
      button.textContent = 'Submitting…';

      try {
        const response = await fetch('https://www.getjobme.com/api/public-leads/gold-appraiser', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: data.get('fullName'),
            mobileNo: data.get('mobileNo'),
            currentLocation: data.get('currentLocation'),
            occupation: data.get('occupation'),
            preferredLanguage: data.get('preferredLanguage'),
            website: data.get('website'),
            consent: data.get('consent') === 'on',
            utmSource: value('utm_source'),
            utmMedium: value('utm_medium'),
            utmCampaign: value('utm_campaign'),
            utmContent: value('utm_content'),
            googleClickId: value('gclid') || value('gbraid') || value('wbraid'),
            landingPage: window.location.href,
            referrer: document.referrer,
          }),
        });
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.message || 'Unable to submit your enquiry');

        status.className = 'gjm-lead-status is-success';
        status.textContent = body.bookingPaid
          ? 'Your enquiry and ₹999 booking advance are already received.'
          : (body.message || 'Thank you. Your enquiry has been received.');
        activeLead = {
          reference: body.reference,
          mobileNo: String(data.get('mobileNo') || ''),
          fullName: String(data.get('fullName') || ''),
        };
        paymentPanel.hidden = Boolean(body.bookingPaid);
        paymentButton.hidden = false;
        paymentButton.disabled = false;
        paymentButton.textContent = 'Pay ₹999 Booking Advance';
        paymentStatus.className = 'gjm-payment-status';
        paymentStatus.textContent = '';
        form.classList.add('is-submitted');
        form.reset();
        window.setTimeout(() => {
          form.scrollIntoView({ behavior: 'smooth', block: 'center' });
          if (!body.bookingPaid) paymentButton.focus({ preventScroll: true });
        }, 100);
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: 'gold_appraiser_lead_submitted', lead_source: value('utm_source') || 'website' });
      } catch (error) {
        status.className = 'gjm-lead-status is-error';
        status.textContent = error.message || 'Unable to submit your enquiry. Please try again.';
      } finally {
        button.disabled = false;
        button.textContent = 'Submit training enquiry';
      }
    });
  };

  function scheduleMount(delay = 120) {
    window.clearTimeout(mountTimer);
    mountTimer = window.setTimeout(() => {
      if (isTrainingPage()) {
        mount();
      } else {
        document.getElementById('gold-appraiser-enquiry')?.remove();
      }
    }, delay);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => scheduleMount(350), { once: true });
  } else {
    scheduleMount(350);
  }

  window.addEventListener('popstate', () => scheduleMount());
  for (const method of ['pushState', 'replaceState']) {
    const original = window.history[method];
    window.history[method] = function (...args) {
      const result = original.apply(this, args);
      scheduleMount();
      return result;
    };
  }
  const observeRoot = document.documentElement || document;
  new MutationObserver(() => scheduleMount()).observe(observeRoot, { childList: true, subtree: true });
})();
