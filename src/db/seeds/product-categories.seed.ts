import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { ProductCategoryEntity } from '../../products/entities/product-category.entity';

export default class ProductCategoriesSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const repository = dataSource.getRepository(ProductCategoryEntity);

    const categories = [
      {
        name: 'Electronics',
        description:
          'Smartphones, laptops, tablets, and other electronic devices',
        iconUrl: '📱',
        isActive: true,
      },
      {
        name: 'Fashion & Clothing',
        description: 'Clothes, shoes, accessories, and fashion items',
        iconUrl: '👕',
        isActive: true,
      },
      {
        name: 'Home & Garden',
        description:
          'Furniture, home decor, gardening tools, and household items',
        iconUrl: '🏠',
        isActive: true,
      },
      {
        name: 'Sports & Recreation',
        description: 'Sports equipment, outdoor gear, and recreational items',
        iconUrl: '⚽',
        isActive: true,
      },
      {
        name: 'Books & Media',
        description: 'Books, movies, music, and educational materials',
        iconUrl: '📚',
        isActive: true,
      },
      {
        name: 'Automotive',
        description: 'Cars, motorcycles, parts, and automotive accessories',
        iconUrl: '🚗',
        isActive: true,
      },
      {
        name: 'Health & Beauty',
        description: 'Cosmetics, skincare, health products, and wellness items',
        iconUrl: '💄',
        isActive: true,
      },
      {
        name: 'Toys & Games',
        description:
          'Children toys, board games, video games, and collectibles',
        iconUrl: '🎮',
        isActive: true,
      },
      {
        name: 'Art & Crafts',
        description:
          'Artwork, craft supplies, handmade items, and creative materials',
        iconUrl: '🎨',
        isActive: true,
      },
      {
        name: 'Other',
        description: "Items that don't fit into other categories",
        iconUrl: '📦',
        isActive: true,
      },
    ];

    for (const categoryData of categories) {
      const existingCategory = await repository.findOne({
        where: { name: categoryData.name },
      });

      if (!existingCategory) {
        const category = repository.create(categoryData);
        await repository.save(category);
        console.log(`Created category: ${categoryData.name}`);
      }
    }
  }
}
