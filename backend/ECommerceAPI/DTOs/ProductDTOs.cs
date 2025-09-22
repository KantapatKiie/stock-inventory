using System.ComponentModel.DataAnnotations;

namespace ECommerceAPI.DTOs;

public class CreateProductDto
{
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string Name { get; set; } = null!;

    [Required]
    [StringLength(500)]
    public string Description { get; set; } = null!;

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than 0")]
    public decimal Price { get; set; }

    [Required]
    [Range(0, int.MaxValue, ErrorMessage = "Stock cannot be negative")]
    public int Stock { get; set; }

    [Required]
    [StringLength(50)]
    public string Category { get; set; } = null!;

    public string? ImageUrl { get; set; }
}

public class UpdateProductDto
{
    [StringLength(100, MinimumLength = 1)]
    public string? Name { get; set; }

    [StringLength(500)]
    public string? Description { get; set; }

    [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than 0")]
    public decimal? Price { get; set; }

    [Range(0, int.MaxValue, ErrorMessage = "Stock cannot be negative")]
    public int? Stock { get; set; }

    [StringLength(50)]
    public string? Category { get; set; }

    public string? ImageUrl { get; set; }
}

public class ProductResponseDto
{
    public string Id { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public string Category { get; set; } = null!;
    public string? ImageUrl { get; set; }
    public string ShopName { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
}
