using ECommerceAPI.Models;
using MongoDB.Driver;

namespace ECommerceAPI.Services;

public interface IOrderService
{
    Task<List<Order>> GetUserOrdersAsync(string userId);
    Task<List<Order>> GetShopOrdersAsync(string ownerId);
    Task<Order?> GetByIdAsync(string id);
    Task<Order> CreateOrderAsync(string userId);
    Task<bool> UpdateStatusAsync(string orderId, OrderStatus status);
    Task<decimal> GetShopSalesAsync(string ownerId, DateTime? startDate = null, DateTime? endDate = null);
}

public class OrderService : IOrderService
{
    private readonly IMongoCollection<Order> _orders;
    private readonly ICartService _cartService;
    private readonly IProductService _productService;

    public OrderService(MongoDbService mongoDbService, ICartService cartService, IProductService productService)
    {
        _orders = mongoDbService.Orders;
        _cartService = cartService;
        _productService = productService;
    }

    public async Task<List<Order>> GetUserOrdersAsync(string userId)
    {
        return await _orders.Find(o => o.UserId == userId)
            .SortByDescending(o => o.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<Order>> GetShopOrdersAsync(string ownerId)
    {
        return await _orders.Find(o => o.Items.Any(i => i.OwnerId == ownerId))
            .SortByDescending(o => o.CreatedAt)
            .ToListAsync();
    }

    public async Task<Order?> GetByIdAsync(string id)
    {
        return await _orders.Find(o => o.Id == id).FirstOrDefaultAsync();
    }

    public async Task<Order> CreateOrderAsync(string userId)
    {
        var cart = await _cartService.GetUserCartAsync(userId);
        if (cart == null || !cart.Items.Any())
            throw new InvalidOperationException("Cart is empty");

        // Validate stock availability
        foreach (var item in cart.Items)
        {
            var product = await _productService.GetByIdAsync(item.ProductId);
            if (product == null || product.Stock < item.Quantity)
                throw new InvalidOperationException($"Insufficient stock for product: {item.ProductName}");
        }

        var order = new Order
        {
            UserId = userId,
            Items = cart.Items.Select(i => new OrderItem
            {
                ProductId = i.ProductId,
                ProductName = i.ProductName,
                Price = i.Price,
                Quantity = i.Quantity,
                ShopName = "", // Will be populated from product data
                OwnerId = "" // Will be populated from product data
            }).ToList(),
            TotalAmount = cart.Items.Sum(i => i.Price * i.Quantity)
        };

        // Update order items with shop information
        foreach (var orderItem in order.Items)
        {
            var product = await _productService.GetByIdAsync(orderItem.ProductId);
            if (product != null)
            {
                orderItem.ShopName = product.ShopName;
                orderItem.OwnerId = product.OwnerId;
                
                // Update product stock
                await _productService.UpdateStockAsync(orderItem.ProductId, orderItem.Quantity);
            }
        }

        await _orders.InsertOneAsync(order);
        
        // Clear the cart after successful order
        await _cartService.ClearCartAsync(userId);
        
        return order;
    }

    public async Task<bool> UpdateStatusAsync(string orderId, OrderStatus status)
    {
        var filter = Builders<Order>.Filter.Eq(o => o.Id, orderId);
        var update = Builders<Order>.Update.Set(o => o.Status, status);
        
        var result = await _orders.UpdateOneAsync(filter, update);
        return result.ModifiedCount > 0;
    }

    public async Task<decimal> GetShopSalesAsync(string ownerId, DateTime? startDate = null, DateTime? endDate = null)
    {
        var filterBuilder = Builders<Order>.Filter;
        var filter = filterBuilder.ElemMatch(o => o.Items, i => i.OwnerId == ownerId);

        if (startDate.HasValue)
            filter = filterBuilder.And(filter, filterBuilder.Gte(o => o.CreatedAt, startDate.Value));
        
        if (endDate.HasValue)
            filter = filterBuilder.And(filter, filterBuilder.Lte(o => o.CreatedAt, endDate.Value));

        var orders = await _orders.Find(filter).ToListAsync();
        
        return orders.SelectMany(o => o.Items)
            .Where(i => i.OwnerId == ownerId)
            .Sum(i => i.Price * i.Quantity);
    }
}
