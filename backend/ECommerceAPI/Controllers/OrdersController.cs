using ECommerceAPI.Models;
using ECommerceAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ECommerceAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpGet("user")]
    [Authorize(Roles = "User")]
    public async Task<ActionResult<List<Order>>> GetUserOrders()
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var orders = await _orderService.GetUserOrdersAsync(userId);
            return Ok(orders);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to retrieve orders", error = ex.Message });
        }
    }

    [HttpGet("shop")]
    [Authorize(Roles = "OwnerShop")]
    public async Task<ActionResult<List<Order>>> GetShopOrders()
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var orders = await _orderService.GetShopOrdersAsync(userId);
            return Ok(orders);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to retrieve shop orders", error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Order>> GetOrder(string id)
    {
        try
        {
            var order = await _orderService.GetByIdAsync(id);
            if (order == null)
            {
                return NotFound(new { message = "Order not found" });
            }

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            // Check authorization: users can only see their own orders, shop owners can see orders containing their products
            if (userRole == "User" && order.UserId != userId)
            {
                return Forbid("You can only view your own orders");
            }
            else if (userRole == "OwnerShop" && !order.Items.Any(i => i.OwnerId == userId))
            {
                return Forbid("You can only view orders containing your products");
            }

            return Ok(order);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to retrieve order", error = ex.Message });
        }
    }

    [HttpPost]
    [Authorize(Roles = "User")]
    public async Task<ActionResult<Order>> CreateOrder()
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var order = await _orderService.CreateOrderAsync(userId);
            return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, order);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to create order", error = ex.Message });
        }
    }

    [HttpPut("{id}/status")]
    [Authorize(Roles = "OwnerShop")]
    public async Task<ActionResult> UpdateOrderStatus(string id, [FromBody] OrderStatus status)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var order = await _orderService.GetByIdAsync(id);
            if (order == null)
            {
                return NotFound(new { message = "Order not found" });
            }

            // Check if the shop owner has products in this order
            if (!order.Items.Any(i => i.OwnerId == userId))
            {
                return Forbid("You can only update status for orders containing your products");
            }

            var updated = await _orderService.UpdateStatusAsync(id, status);
            if (!updated)
            {
                return StatusCode(500, new { message = "Failed to update order status" });
            }

            return Ok(new { message = "Order status updated successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to update order status", error = ex.Message });
        }
    }

    [HttpGet("sales")]
    [Authorize(Roles = "OwnerShop")]
    public async Task<ActionResult<object>> GetSales([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var totalSales = await _orderService.GetShopSalesAsync(userId, startDate, endDate);
            
            return Ok(new { 
                totalSales = totalSales,
                period = new {
                    startDate = startDate?.ToString("yyyy-MM-dd"),
                    endDate = endDate?.ToString("yyyy-MM-dd")
                }
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to retrieve sales data", error = ex.Message });
        }
    }
}
