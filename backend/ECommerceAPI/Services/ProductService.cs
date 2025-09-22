using ECommerceAPI.Models;
using MongoDB.Driver;

namespace ECommerceAPI.Services;

public interface IProductService
{
    Task<List<Product>> GetAvailableProductsAsync();
    Task<List<Product>> GetShopProductsAsync(string ownerId);
    Task<Product?> GetByIdAsync(string id);
    Task<Product> CreateAsync(Product product);
    Task<bool> UpdateAsync(string id, Product product);
    Task<bool> DeleteAsync(string id);
    Task<bool> UpdateStockAsync(string productId, int quantity);
}

public class ProductService : IProductService
{
    private readonly IMongoCollection<Product> _products;

    public ProductService(MongoDbService mongoDbService)
    {
        _products = mongoDbService.Products;
    }

    public async Task<List<Product>> GetAvailableProductsAsync()
    {
        return await _products.Find(p => p.Stock > 0).ToListAsync();
    }

    public async Task<List<Product>> GetShopProductsAsync(string ownerId)
    {
        return await _products.Find(p => p.OwnerId == ownerId).ToListAsync();
    }

    public async Task<Product?> GetByIdAsync(string id)
    {
        return await _products.Find(p => p.Id == id).FirstOrDefaultAsync();
    }

    public async Task<Product> CreateAsync(Product product)
    {
        await _products.InsertOneAsync(product);
        return product;
    }

    public async Task<bool> UpdateAsync(string id, Product product)
    {
        product.UpdatedAt = DateTime.UtcNow;
        var result = await _products.ReplaceOneAsync(p => p.Id == id, product);
        return result.ModifiedCount > 0;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var result = await _products.DeleteOneAsync(p => p.Id == id);
        return result.DeletedCount > 0;
    }

    public async Task<bool> UpdateStockAsync(string productId, int quantity)
    {
        var filter = Builders<Product>.Filter.Eq(p => p.Id, productId);
        var update = Builders<Product>.Update
            .Inc(p => p.Stock, -quantity)
            .Set(p => p.UpdatedAt, DateTime.UtcNow);
        
        var result = await _products.UpdateOneAsync(filter, update);
        return result.ModifiedCount > 0;
    }
}
