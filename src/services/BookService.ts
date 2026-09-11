/**
 * BookService — HTML book preview + local demo checkout
 */
import type {BookOrder, BookType, BookSize, ShippingAddress} from '../models';
import {orderStorage, stepStorage, tripStorage} from '../utils/storage';
import {generateUUID, nowISO, formatDate, formatCurrency, log} from '../utils/helpers';
import {BOOK_PRICING, BOOK_SPECS, LOCAL_USER_ID} from '../utils/constants';

class BookService {
  calculatePrice(bookType: BookType, bookSize: BookSize, pageCount: number): number {
    const base = BOOK_PRICING[bookType][bookSize];
    const extra = Math.max(0, pageCount - BOOK_SPECS.MIN_PAGES) * 50;
    return base + extra;
  }

  estimatePages(stepCount: number): number {
    return Math.min(
      BOOK_SPECS.MAX_PAGES,
      Math.max(BOOK_SPECS.MIN_PAGES, stepCount * BOOK_SPECS.PAGES_PER_STEP + 4),
    );
  }

  async buildPreviewHtml(tripId: string): Promise<string> {
    const trip = await tripStorage.get(tripId);
    if (!trip) throw new Error('Trip not found');
    const steps = await stepStorage.getForTrip(tripId);

    const pages = steps
      .map(
        (step, i) => `
      <section class="page">
        <div class="page-num">${i + 1}</div>
        <h2>${escapeHtml(step.name)}</h2>
        <p class="meta">${step.type.toUpperCase()} · ${formatDate(step.startTime)}</p>
        ${
          step.photos[0]?.uri
            ? `<img src="${step.photos[0].uri}" alt="${escapeHtml(step.name)}" />`
            : `<div class="placeholder">No photo</div>`
        }
        <p class="notes">${escapeHtml(step.notes || 'A moment from the journey.')}</p>
      </section>`,
      )
      .join('\n');

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>${escapeHtml(trip.name)} — Atlas Book</title>
<style>
  body { font-family: Georgia, serif; background: #F7F3EC; color: #141210; margin: 0; padding: 24px; }
  h1 { font-size: 42px; color: #1B4D3E; margin-bottom: 8px; }
  .subtitle { color: #6F675A; margin-bottom: 32px; }
  .page { background: #fff; border-radius: 12px; padding: 24px; margin-bottom: 20px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.06); }
  .page-num { color: #C45C26; font-size: 12px; letter-spacing: 0.1em; }
  h2 { margin: 8px 0; }
  .meta { color: #6F675A; font-size: 14px; }
  img { width: 100%; max-height: 320px; object-fit: cover; border-radius: 8px; margin: 16px 0; }
  .placeholder { height: 180px; background: #EFE8DC; border-radius: 8px; display:flex;
                 align-items:center; justify-content:center; color:#9A8F7E; margin: 16px 0; }
  .notes { line-height: 1.5; }
</style>
</head>
<body>
  <h1>${escapeHtml(trip.name)}</h1>
  <p class="subtitle">Printed with Atlas · ${formatDate(trip.startDate)}${
      trip.endDate ? ` – ${formatDate(trip.endDate)}` : ''
    }</p>
  ${pages || '<p>No steps yet — take a trip first.</p>'}
</body>
</html>`;
  }

  async createOrder(input: {
    tripId: string;
    bookType: BookType;
    bookSize: BookSize;
    shippingAddress: ShippingAddress;
  }): Promise<BookOrder> {
    const steps = await stepStorage.getForTrip(input.tripId);
    const pageCount = this.estimatePages(steps.length);
    const price = this.calculatePrice(input.bookType, input.bookSize, pageCount);
    const order: BookOrder = {
      id: generateUUID(),
      tripId: input.tripId,
      ownerUid: LOCAL_USER_ID,
      bookType: input.bookType,
      bookSize: input.bookSize,
      pageCount,
      price,
      shippingAddress: input.shippingAddress,
      status: 'pending',
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };
    await orderStorage.save(order);
    log('BookService: order created', order.id, formatCurrency(price));
    return order;
  }

  async completeDemoCheckout(orderId: string): Promise<BookOrder> {
    const order = await orderStorage.get(orderId);
    if (!order) throw new Error('Order not found');
    const updated: BookOrder = {...order, status: 'processing', updatedAt: nowISO()};
    await orderStorage.save(updated);
    return updated;
  }

  async getOrder(orderId: string): Promise<BookOrder | null> {
    return orderStorage.get(orderId);
  }

  async getOrdersForTrip(tripId: string): Promise<BookOrder[]> {
    return (await orderStorage.getAll()).filter(o => o.tripId === tripId);
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default new BookService();
