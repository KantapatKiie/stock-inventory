using ECommerceAPI.Models;
using MongoDB.Driver;

namespace ECommerceAPI.Services;

public interface ICartService
{
    Task<Cart?> GetUserCartAsync(string userId);
    Task<Cart> AddToCartAsync(string userId, string productId, int quantity);
    Task<bool> RemoveFromCartAsync(string userId, string productId);
    Task<bool> UpdateQuantityAsync(string userId, string productId, int quantity);
    Task<bool> ClearCartAsync(string userId);
}

public class CartService : ICartService
{
    private readonly IMongoCollection<Cart> _carts;
    private readonly IProductService _productService;

    public CartService(MongoDbService mongoDbService, IProductService productService)
    {
        _carts = mongoDbService.Carts;
        _productService = productService;
    }

    public async Task<Cart?> GetUserCartAsync(string userId)
    {
        return await _carts.Find(c => c.UserId == userId).FirstOrDefaultAsync();
    }

    public async Task<Cart> AddToCartAsync(string userId, string productId, int quantity)
    {
        var product = await _productService.GetByIdAsync(productId);
        if (product == null || product.Stock < quantity)
            throw new InvalidOperationException("Product not available or insufficient stock");

        var cart = await GetUserCartAsync(userId);
        if (cart == null)
        {
            cart = new Cart { UserId = userId };
            await _carts.InsertOneAsync(cart);
        }

        var existingItem = cart.Items.FirstOrDefault(i => i.ProductId == productId);
        if (existingItem != null)
        {
            existingItem.Quantity += quantity;
        }
        else
        {
            cart.Items.Add(new CartItem
            {
                ProductId = productId,
                ProductName = product.Name,
                Price = product.Price,
                Quantity = quantity,
                ImageUrl = product.ImageUrl
            });
        }

        cart.UpdatedAt = DateTime.UtcNow;
        await _carts.ReplaceOneAsync(c => c.Id == cart.Id, cart);
        return cart;
    }

    public async Task<bool> RemoveFromCartAsync(string userId, string productId)
    {
        var cart = await GetUserCartAsync(userId);
        if (cart == null) return false;

        cart.Items.RemoveAll(i => i.ProductId == productId);
        cart.UpdatedAt = DateTime.UtcNow;
        
        var result = await _carts.ReplaceOneAsync(c => c.Id == cart.Id, cart);
        return result.ModifiedCount > 0;
    }

    public async Task<bool> UpdateQuantityAsync(string userId, string productId, int quantity)
    {
        var cart = await GetUserCartAsync(userId);
        if (cart == null) return false;

        var item = cart.Items.FirstOrDefault(i => i.ProductId == productId);
        if (item == null) return false;

        item.Quantity = quantity;
        cart.UpdatedAt = DateTime.UtcNow;
        
        var result = await _carts.ReplaceOneAsync(c => c.Id == cart.Id, cart);
        return result.ModifiedCount > 0;
    }

    public async Task<bool> ClearCartAsync(string userId)
    {
        var result = await _carts.DeleteOneAsync(c => c.UserId == userId);
        return result.DeletedCount > 0;
    }
}
