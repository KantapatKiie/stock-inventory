using ECommerceAPI.DTOs;
using ECommerceAPI.Models;
using ECommerceAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace ECommerceAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly IJwtService _jwtService;

    public AuthController(IUserService userService, IJwtService jwtService)
    {
        _userService = userService;
        _jwtService = jwtService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterDto dto)
    {
        try
        {
            // Check if user already exists
            var existingUser = await _userService.GetByUsernameAsync(dto.Username);
            if (existingUser != null)
            {
                return BadRequest(new { message = "Username already exists" });
            }

            // Validate shop name for OwnerShop role
            if (dto.Role == UserRole.OwnerShop && string.IsNullOrWhiteSpace(dto.ShopName))
            {
                return BadRequest(new { message = "Shop name is required for OwnerShop role" });
            }

            var user = new User
            {
                Username = dto.Username,
                PasswordHash = dto.Password, // Will be hashed in UserService
                Role = dto.Role,
                ShopName = dto.Role == UserRole.OwnerShop ? dto.ShopName : null
            };

            await _userService.CreateAsync(user);

            var token = _jwtService.GenerateToken(user);

            return Ok(new AuthResponseDto
            {
                Token = token,
                UserId = user.Id!,
                Username = user.Username,
                Role = user.Role,
                ShopName = user.ShopName
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Registration failed", error = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto dto)
    {
        try
        {
            var user = await _userService.GetByUsernameAsync(dto.Username);
            if (user == null)
            {
                return BadRequest(new { message = "Invalid username or password" });
            }

            var isValidPassword = await _userService.ValidatePasswordAsync(user, dto.Password);
            if (!isValidPassword)
            {
                return BadRequest(new { message = "Invalid username or password" });
            }

            var token = _jwtService.GenerateToken(user);

            return Ok(new AuthResponseDto
            {
                Token = token,
                UserId = user.Id!,
                Username = user.Username,
                Role = user.Role,
                ShopName = user.ShopName
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Login failed", error = ex.Message });
        }
    }
}
