using ECommerceAPI.Models;
using MongoDB.Driver;
using BCrypt.Net;

namespace ECommerceAPI.Services;

public interface IUserService
{
    Task<User?> GetByIdAsync(string id);
    Task<User?> GetByUsernameAsync(string username);
    Task<User> CreateAsync(User user);
    Task<bool> ValidatePasswordAsync(User user, string password);
}

public class UserService : IUserService
{
    private readonly IMongoCollection<User> _users;

    public UserService(MongoDbService mongoDbService)
    {
        _users = mongoDbService.Users;
    }

    public async Task<User?> GetByIdAsync(string id)
    {
        return await _users.Find(u => u.Id == id).FirstOrDefaultAsync();
    }

    public async Task<User?> GetByUsernameAsync(string username)
    {
        return await _users.Find(u => u.Username.ToLower() == username.ToLower()).FirstOrDefaultAsync();
    }

    public async Task<User> CreateAsync(User user)
    {
        // Hash the password before storing
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.PasswordHash);
        
        await _users.InsertOneAsync(user);
        return user;
    }

    public Task<bool> ValidatePasswordAsync(User user, string password)
    {
        var isValid = BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);
        return Task.FromResult(isValid);
    }
}
