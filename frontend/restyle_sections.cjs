const fs = require('fs');

const cssPath = 'src/index.css';
const homePath = 'src/pages/HomePage.tsx';

// 1. Append CSS to index.css
let css = fs.readFileSync(cssPath, 'utf8');
const newCss = `
/* --- SECCIÓN TOP COMPRADORES --- */
.top-buyers {
    padding: 80px 5%;
    text-align: center;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.section-title {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 10px;
}

.section-desc {
    color: #a0a0a0;
    font-size: 1rem;
    margin-bottom: 60px;
}

.buyers-grid {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
}

.buyer-card {
    background-color: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 16px;
    padding: 30px 20px;
    width: 190px;
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: transform 0.3s ease, border-color 0.3s ease;
}

.buyer-card:hover {
    transform: translateY(-5px);
    border-color: rgba(255, 255, 255, 0.15);
}

.rank {
    background: rgba(255, 255, 255, 0.08);
    color: #a0a0a0;
    padding: 4px 16px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    margin-bottom: 25px;
}

.avatar-container {
    width: 75px;
    height: 75px;
    border-radius: 50%;
    overflow: hidden;
    margin-bottom: 15px;
    background-color: #2a2a2a;
}

.avatar-container img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.username {
    font-size: 1.05rem;
    font-weight: 600;
    margin-bottom: 8px;
    color: #ffffff;
}

.compras-count {
    font-size: 0.85rem;
    color: #a0a0a0;
    display: flex;
    align-items: center;
    gap: 6px;
}

.card-premium {
    width: 230px;
    padding: 40px 20px;
    border-color: #00ea00;
    background: rgba(0, 234, 0, 0.02);
    position: relative;
    transform: scale(1.05);
    box-shadow: 0 0 30px rgba(0, 234, 0, 0.08);
    z-index: 2;
}

.card-premium:hover {
    transform: scale(1.05) translateY(-5px);
    border-color: #00ea00;
}

.crown {
    position: absolute;
    top: -22px;
    color: #00ea00;
    filter: drop-shadow(0 0 10px rgba(0, 234, 0, 0.5));
}

.rank-premium {
    background: rgba(0, 234, 0, 0.15);
    color: #00ea00;
}

.avatar-premium {
    width: 95px;
    height: 95px;
    border: 2px solid #00ea00;
    box-shadow: 0 0 15px rgba(0, 234, 0, 0.2);
}

/* --- SECCIÓN RESEÑAS --- */
.reviews {
    padding: 80px 8%;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    background: linear-gradient(to bottom, transparent, rgba(0, 234, 0, 0.02));
}

.reviews-header {
    margin-bottom: 40px;
}

.reviews-subtitle {
    color: #a0a0a0;
    font-size: 0.85rem;
    letter-spacing: 1px;
    text-transform: uppercase;
    font-weight: 600;
    margin-bottom: 10px;
    display: block;
}

.reviews-title {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 10px;
}

.reviews-desc {
    color: #a0a0a0;
    font-size: 1rem;
}

.reviews-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 20px;
}

.review-card {
    background-color: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 25px;
    transition: all 0.3s ease;
}

.review-card:hover {
    background-color: rgba(255, 255, 255, 0.04);
    border-color: rgba(0, 234, 0, 0.3);
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.review-user-info {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 15px;
}

.review-avatar {
    width: 45px;
    height: 45px;
    border-radius: 50%;
    background-color: #2a2a2a;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.review-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.review-meta {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.review-username {
    font-weight: 600;
    font-size: 1rem;
    color: #ffffff;
}

.review-stars {
    color: #00ea00;
    font-size: 0.75rem;
    display: flex;
    gap: 2px;
}

.review-text {
    color: #a0a0a0;
    font-size: 0.95rem;
    line-height: 1.6;
}

@media (max-width: 950px) {
    .buyers-grid {
        flex-direction: column;
        gap: 40px;
    }
    .card-premium {
        order: -1;
        transform: scale(1);
    }
    .card-premium:hover {
        transform: translateY(-5px);
    }
    .reviews-header {
        text-align: center;
    }
}
`;
if (!css.includes('.top-buyers')) {
    fs.writeFileSync(cssPath, css + '\n' + newCss);
}

// 2. Update HomePage.tsx Content
let home = fs.readFileSync(homePath, 'utf8');

// B. Replace Top Buyers, Reviews, and Products sections with the new logic.
const sectionsRegex = /\{\/\* ═══ TOP BUYERS ═══ \*\/\}[\s\S]*?\{\/\* ═══ FAQ ═══ \*\/\}/;

const newSections = `{/* ═══ TOP BUYERS ═══ */}
      <section className="top-buyers">
          <h2 className="section-title">Top Compradores</h2>
          <p className="section-desc">Nuestros clientes más activos y fieles de la comunidad Diseño Elite</p>

          <div className="buyers-grid">
            {topBuyers.map((b) => (
              <BuyerCard
                key={b.rank}
                rank={b.rank}
                name={b.username}
                purchases={b.products_count}
                avatar={b.avatar}
                tier={
                  b.rank === 1
                    ? 'gold'
                    : b.rank === 2
                      ? 'silver'
                      : b.rank === 3
                        ? 'bronze'
                        : 'normal'
                }
              />
            ))}
          </div>
      </section>

      {/* ═══ REVIEWS ═══ */}
      {feedbacks.length > 0 && (
          <section className="reviews">
              <div className="reviews-header">
                  <span className="reviews-subtitle">Reseñas</span>
                  <h2 className="reviews-title">Lo que dice la comunidad</h2>
                  <p className="reviews-desc">Feedback real de quienes ya usan nuestros sistemas.</p>
              </div>

              <div className="reviews-grid">
                {feedbacks.map((f) => (
                  <FeedbackCard
                    key={f.id}
                    name={f.user?.username || 'Usuario'}
                    avatar={
                      f.user?.avatar ||
                      \`https://ui-avatars.com/api/?name=\${encodeURIComponent(f.user?.username?.charAt(0) || 'U')}&background=0b0c10&color=00ea00&size=50&bold=true\`
                    }
                    text={f.comment}
                    rating={f.rating}
                  />
                ))}
              </div>
          </section>
      )}

      {/* ═══ FAQ ═══ */}`;

home = home.replace(sectionsRegex, newSections);

// C. Replace BuyerCard
const buyerCardRegex = /function BuyerCard\(\{[\s\S]*?\}\) \{[\s\S]*?const tierStyles = \{[\s\S]*?return \([\s\S]*?  \);\n\}/;

const newBuyerCard = `function BuyerCard({
  rank,
  name,
  purchases,
  avatar,
  tier,
}: {
  rank: number;
  name: string;
  purchases: number;
  avatar: string;
  tier: 'gold' | 'silver' | 'bronze' | 'normal';
}) {
  if (tier === 'gold') {
    return (
      <div className="buyer-card card-premium">
        <Crown size={32} className="crown" />
        <span className="rank rank-premium">#{rank}</span>
        <div className="avatar-container avatar-premium">
            <img src={avatar || "https://ui-avatars.com/api/?name=" + encodeURIComponent(name)} alt={name} />
        </div>
        <h3 className="username">{name}</h3>
        <p className="compras-count"><ShoppingBag size={14} className="text-[#ff4757]" /> {purchases} compras</p>
      </div>
    );
  }

  return (
    <div className="buyer-card">
        <span className="rank">#{rank}</span>
        <div className="avatar-container">
            <img src={avatar || "https://ui-avatars.com/api/?name=" + encodeURIComponent(name)} alt={name} />
        </div>
        <h3 className="username">{name}</h3>
        <p className="compras-count"><ShoppingBag size={14} className="text-[#ff4757]" /> {purchases} compras</p>
    </div>
  );
}`;

home = home.replace(buyerCardRegex, newBuyerCard);

// D. Replace FeedbackCard
const feedbackCardRegex = /function FeedbackCard\(\{[\s\S]*?\}\) \{[\s\S]*?return \([\s\S]*?  \);\n\}/;

const newFeedbackCard = `function FeedbackCard({
  name,
  avatar,
  text,
  rating,
  role
}: {
  name: string;
  avatar: string;
  text: string;
  rating: number;
  role?: string;
}) {
  return (
    <div className="review-card">
        <div className="review-user-info">
            <div className="review-avatar">
                <img src={avatar} alt={name} />
            </div>
            <div className="review-meta">
                <span className="review-username">{name}</span>
                <div className="review-stars">
                   {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} fill={i < rating ? "currentColor" : "none"} />
                   ))}
                </div>
            </div>
        </div>
        <p className="review-text">"{text}"</p>
    </div>
  );
}`;

home = home.replace(feedbackCardRegex, newFeedbackCard);

fs.writeFileSync(homePath, home);
console.log('Update finished successfully');
