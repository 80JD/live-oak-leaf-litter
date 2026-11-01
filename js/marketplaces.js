/* Fail closed: dated previews never silently become permanent price promises. */
(() => {
  const note = document.getElementById('marketplace-price-note');
  if (!note) return;
  const etsy = [...document.querySelectorAll('[data-etsy-price]')];
  const ebay = document.querySelector('[data-ebay-price]');
  const fallback = () => {
    etsy.forEach(el => { el.textContent = 'Check current price on Etsy'; });
    if (ebay) ebay.textContent = 'Check current price on eBay';
    note.textContent = 'Open the marketplace to see current price, stock, shipping, and tax. Checkout happens there.';
  };
  let timer;
  async function refresh() {
    clearTimeout(timer);
    try {
      const response = await fetch('data/marketplace-listings.json', {cache: 'no-store'});
      if (!response.ok) throw new Error('Unavailable');
      const data = await response.json();
      const checked = Date.parse(data.checked_at);
      const expires = Date.parse(data.expires_at);
      const now = Date.now();
      if (!Number.isFinite(checked) || !Number.isFinite(expires) || checked > now + 60000 || expires <= now || expires - checked > 86400000) throw new Error('Stale');
      const money = value => {
        if (!Number.isFinite(value) || value <= 0) throw new Error('Invalid price');
        return new Intl.NumberFormat('en-US', {style:'currency', currency:'USD'}).format(value);
      };
      const labels = etsy.map(el => {
        const listing = data.etsy.listings[el.dataset.etsyPrice];
        if (listing.currency !== 'USD') throw new Error('Currency');
        return money(listing.price);
      });
      if (data.ebay.currency !== 'USD' || data.ebay.price_max < data.ebay.price_min) throw new Error('Range');
      const range = money(data.ebay.price_min) + '–' + money(data.ebay.price_max);
      etsy.forEach((el,i) => { el.textContent = labels[i] + ' on Etsy · plus shipping & tax'; });
      if (ebay) ebay.textContent = range + ' · varies by size';
      const date = new Intl.DateTimeFormat('en-US', {timeZone:'America/Chicago',month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit',timeZoneName:'short'}).format(checked);
      note.textContent = 'Listing prices checked ' + date + '. These are dated previews, not a real-time quote. Shipping, tax, stock, and offers are confirmed on the marketplace.';
      timer = setTimeout(fallback, Math.min(expires - now, 86400000));
    } catch { fallback(); }
  }
  refresh();
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
})();
