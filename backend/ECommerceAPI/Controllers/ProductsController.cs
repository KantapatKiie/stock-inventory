using ECommerceAPI.DTOs;
using ECommerceAPI.Models;
using ECommerceAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ECommerceAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<List<ProductResponseDto>>> GetAvailableProducts()
    {
        try
        {
            var products = await _productService.GetAvailableProductsAsync();
            var response = products.Select(p => new ProductResponseDto
            {
                Id = p.Id!,
                Name = p.Name,
                Description = p.Description,
                Price = p.Price,
                Stock = p.Stock,
                Category = p.Category,
                ImageUrl = p.ImageUrl,
                ShopName = p.ShopName,
                CreatedAt = p.CreatedAt
            }).ToList();

            return Ok(response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to retrieve products", error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProductResponseDto>> GetProduct(string id)
    {
        try
        {
            var product = await _productService.GetByIdAsync(id);
            if (product == null)
            {
                return NotFound(new { message = "Product not found" });
            }

            var response = new ProductResponseDto
            {
                Id = product.Id!,
                Name = product.Name,
                Description = product.Description,
                Price = product.Price,
                Stock = product.Stock,
                Category = product.Category,
                ImageUrl = product.ImageUrl,
                ShopName = product.ShopName,
                CreatedAt = product.CreatedAt
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to retrieve product", error = ex.Message });
        }
    }

    [HttpGet("shop")]
    [Authorize(Roles = "OwnerShop")]
    public async Task<ActionResult<List<ProductResponseDto>>> GetShopProducts()
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var products = await _productService.GetShopProductsAsync(userId);
            var response = products.Select(p => new ProductResponseDto
            {
                Id = p.Id!,
                Name = p.Name,
                Description = p.Description,
                Price = p.Price,
                Stock = p.Stock,
                Category = p.Category,
                ImageUrl = p.ImageUrl,
                ShopName = p.ShopName,
                CreatedAt = p.CreatedAt
            }).ToList();

            return Ok(response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to retrieve shop products", error = ex.Message });
        }
    }

    [HttpPost]
    [Authorize(Roles = "OwnerShop")]
    public async Task<ActionResult<ProductResponseDto>> CreateProduct(CreateProductDto dto)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var shopName = User.FindFirst("ShopName")?.Value;
            
            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(shopName))
            {
                return Unauthorized();
            }

            var product = new Product
            {
                Name = dto.Name,
                Description = dto.Description,
                Price = dto.Price,
                Stock = dto.Stock,
                Category = dto.Category,
                ImageUrl = dto.ImageUrl,
                OwnerId = userId,
                ShopName = shopName
            };

            await _productService.CreateAsync(product);

            var response = new ProductResponseDto
            {
                Id = product.Id!,
                Name = product.Name,
                Description = product.Description,
                Price = product.Price,
                Stock = product.Stock,
                Category = product.Category,
                ImageUrl = product.ImageUrl,
                ShopName = product.ShopName,
                CreatedAt = product.CreatedAt
            };

            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to create product", error = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "OwnerShop")]
    public async Task<ActionResult> UpdateProduct(string id, UpdateProductDto dto)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var existingProduct = await _productService.GetByIdAsync(id);
            if (existingProduct == null)
            {
                return NotFound(new { message = "Product not found" });
            }

            if (existingProduct.OwnerId != userId)
            {
                return Forbid("You can only update your own products");
            }

            // Update only provided fields
            if (!string.IsNullOrEmpty(dto.Name))
                existingProduct.Name = dto.Name;
            if (!string.IsNullOrEmpty(dto.Description))
                existingProduct.Description = dto.Description;
            if (dto.Price.HasValue)
                existingProduct.Price = dto.Price.Value;
            if (dto.Stock.HasValue)
                existingProduct.Stock = dto.Stock.Value;
            if (!string.IsNullOrEmpty(dto.Category))
                existingProduct.Category = dto.Category;
            if (dto.ImageUrl != null)
                existingProduct.ImageUrl = dto.ImageUrl;

            var updated = await _productService.UpdateAsync(id, existingProduct);
            if (!updated)
            {
                return StatusCode(500, new { message = "Failed to update product" });
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to update product", error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "OwnerShop")]
    public async Task<ActionResult> DeleteProduct(string id)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var product = await _productService.GetByIdAsync(id);
            if (product == null)
            {
                return NotFound(new { message = "Product not found" });
            }

            if (product.OwnerId != userId)
            {
                return Forbid("You can only delete your own products");
            }

            var deleted = await _productService.DeleteAsync(id);
            if (!deleted)
            {
                return StatusCode(500, new { message = "Failed to delete product" });
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to delete product", error = ex.Message });
        }
    }
}
