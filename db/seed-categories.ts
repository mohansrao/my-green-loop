import { db } from './index';
import { contentCategories } from './schema';

const initialCategories = [
    {
        name: 'Climate Action',
        slug: 'climate-action',
        description: 'Articles and resources about climate change, carbon footprint reduction, and environmental activism',
        icon: 'leaf',
        color: '#2d5016',
        order: 1
    },
    {
        name: 'Zero Waste',
        slug: 'zero-waste',
        description: 'Guides for reducing waste, recycling, composting, and living a zero-waste lifestyle',
        icon: 'recycle',
        color: '#059669',
        order: 2
    },
    {
        name: 'Sustainable Fashion',
        slug: 'sustainable-fashion',
        description: 'Ethical clothing, eco-friendly fabrics, and conscious fashion choices',
        icon: 'shirt',
        color: '#7c3aed',
        order: 3
    },
    {
        name: 'Renewable Energy',
        slug: 'renewable-energy',
        description: 'Solar, wind, and other clean energy solutions for homes and businesses',
        icon: 'zap',
        color: '#ea580c',
        order: 4
    },
    {
        name: 'Eco-Products',
        slug: 'eco-products',
        description: 'Reviews and recommendations for sustainable products and green alternatives',
        icon: 'shopping-bag',
        color: '#0891b2',
        order: 5
    },
    {
        name: 'Green Living Tips',
        slug: 'green-living-tips',
        description: 'Practical tips and ideas for sustainable daily living and eco-friendly habits',
        icon: 'lightbulb',
        color: '#eab308',
        order: 6
    },
];

async function seedCategories() {
    try {
        console.log('🌱 Seeding content categories...');

        await db.insert(contentCategories).values(initialCategories);

        console.log('✅ Categories seeded successfully!');
        console.log(`   - ${initialCategories.length} categories created`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding categories:', error);
        process.exit(1);
    }
}

seedCategories();
