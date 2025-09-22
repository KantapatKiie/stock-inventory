using ECommerceAPI.DTOs;
using ECommerceAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ECommerceAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "User")]
public class CartController : ControllerBase
{
    private readonly ICartService _cartService;

    public CartController(ICartService cartService)
    {
        _cartService = cartService;
    }

    [HttpGet]
    public async Task<ActionResult<CartResponseDto>> GetCart()
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var cart = await _cartService.GetUserCartAsync(userId);
            if (cart == null)
            {
                return Ok(new CartResponseDto { Id = "", Items = new List<CartItemDto>(), TotalAmount = 0 });
            }

            var response = new CartResponseDto
            {
                Id = cart.Id!,
                Items = cart.Items.Select(i => new CartItemDto
                {
                    ProductId = i.ProductId,
                    ProductName = i.ProductName,
                    Price = i.Price,
                    Quantity = i.Quantity,
                    ImageUrl = i.ImageUrl
                }).ToList(),
                TotalAmount = cart.Items.Sum(i => i.Price * i.Quantity)
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to retrieve cart", error = ex.Message });
        }
    }

    [HttpPost("add")]
    public async Task<ActionResult> AddToCart(AddToCartDto dto)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            await _cartService.AddToCartAsync(userId, dto.ProductId, dto.Quantity);
            return Ok(new { message = "Item added to cart successfully" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to add item to cart", error = ex.Message });
        }
    }

    [HttpDelete("remove/{productId}")]
    public async Task<ActionResult> RemoveFromCart(string productId)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var removed = await _cartService.RemoveFromCartAsync(userId, productId);
            if (!removed)
            {
                return NotFound(new { message = "Item not found in cart" });
            }

            return Ok(new { message = "Item removed from cart successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to remove item from cart", error = ex.Message });
        }
    }

    [HttpPut("update/{productId}")]
    public async Task<ActionResult> UpdateCartItem(string productId, UpdateCartItemDto dto)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var updated = await _cartService.UpdateQuantityAsync(userId, productId, dto.Quantity);
            if (!updated)
            {
                return NotFound(new { message = "Item not found in cart" });
            }

            return Ok(new { message = "Cart item updated successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to update cart item", error = ex.Message });
        }
    }

    [HttpDelete("clear")]
    public async Task<ActionResult> ClearCart()
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            await _cartService.ClearCartAsync(userId);
            return Ok(new { message = "Cart cleared successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to clear cart", error = ex.Message });
        }
    }
}
