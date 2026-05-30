const fs = require('fs');
const filePath = 'src/pages/HomePage.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const startPattern = 'function FeedbackCard({';
const endPattern = 'function ProductCard({ product }: { product: Product }) {';

if (content.includes(startPattern) && content.includes(endPattern)) {
    const parts = content.split(startPattern);
    const afterParts = parts[1].split(endPattern);

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
                      <Star key={i} size={12} fill={i < rating ? "currentColor" : "none"} className={i < rating ? "text-[#00ea00]" : "text-[#333]"} />
                   ))}
                </div>
            </div>
        </div>
        <p className="review-text">"{text}"</p>
    </div>
  );
}

`;
    
    content = parts[0] + newFeedbackCard + endPattern + afterParts[1];
    fs.writeFileSync(filePath, content);
    console.log('Fixed FeedbackCard');
} else {
    console.log('Patterns not found');
}
