import '../styles/info-page.css';

const SECTIONS = [
  {
    id: 'about',
    title: 'About Us',
    body: [
      'CustoMe is built to make custom apparel ordering clear, practical, and easy to manage from browsing to checkout.',
      'Our goal is to help individuals, teams, events, and growing brands create apparel that feels personal without forcing them through a complicated design process.',
      'The platform focuses on simple product discovery, editable front-and-back customization, saved cart progress, and straightforward order tracking so customers can move from idea to finished product with less friction.',
      'We continue to improve the experience around design editing, preview accuracy, product details, and post-purchase visibility so the full workflow stays understandable for everyday users.',
    ],
  },
  {
    id: 'contact',
    title: 'Contact',
    body: [
      'Reach us for support with design issues, order tracking, payment concerns, cart problems, or product-related questions.',
      'Email: support@custome.app',
      'Hours: Monday to Saturday, 9:00 AM to 7:00 PM',
      'When contacting support, it helps to include your order information, product name, or a short description of the issue so we can respond faster and with the right context.',
      'For customization problems, mention whether the issue happened on the front design, back design, cart preview, payment step, or order screen.',
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy Policy',
    body: [
      'We keep the information needed to manage your account, orders, cart items, and stored customization previews.',
      'This can include account details, product selections, saved design previews, order history, and checkout-related information required to complete purchases and provide support.',
      'Saved order and design data are used to support checkout, fulfillment, edits, preview restoration, and customer support workflows across the platform.',
      'We do not store more information than needed for the service experience, and we use collected data primarily to keep your cart, customization state, and order records consistent between sessions.',
    ],
  },
  {
    id: 'terms',
    title: 'Terms of Service',
    body: [
      'By using the service, you confirm that uploaded images, text, and artwork are permitted for you to use and do not violate the rights of others.',
      'Customers are responsible for reviewing their product details, quantity, selected material, and saved front-and-back design previews before placing an order.',
      'Custom products are processed from the design state saved during cart or checkout confirmation, so the latest stored preview and design content should be treated as the final reference for fulfillment.',
      'We may update product availability, product details, and service functionality over time, and continued use of the platform means you accept those operational changes as part of the service.',
    ],
  },
];

function InfoPage() {
  return (
    <main className="info-page">
      <section className="info-page__content">
        {SECTIONS.map((section) => (
          <article key={section.id} id={section.id} className="info-page__section">
            <h2>{section.title}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </article>
        ))}
      </section>
    </main>
  );
}

export default InfoPage;
